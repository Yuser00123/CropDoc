import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Enable JSON body parsing for base64 image data
  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "CropDoc AI" });
  });

  // Lazy initialize Google Gen AI
  let genAI: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }
      genAI = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return genAI;
  }

  // Helper to normalize diagnosis data into consistent schema
  function normalizeDiagnosis(raw: any) {
    return {
      is_plant_leaf: typeof raw.is_plant_leaf === "boolean" ? raw.is_plant_leaf : true,
      plant_type: typeof raw.plant_type === "string" && raw.plant_type.trim() ? raw.plant_type.trim() : "Crop Specimen",
      disease_detected: typeof raw.disease_detected === "string" && raw.disease_detected.trim() ? raw.disease_detected.trim() : "Plant Condition",
      confidence_level: typeof raw.confidence_level === "string" && raw.confidence_level.trim() ? raw.confidence_level.trim() : "Medium",
      symptoms_observed: Array.isArray(raw.symptoms_observed) ? raw.symptoms_observed.map(String) : [],
      likely_cause: typeof raw.likely_cause === "string" && raw.likely_cause.trim() ? raw.likely_cause.trim() : "Environmental factors or unconfirmed pathogen",
      severity_level: typeof raw.severity_level === "string" && raw.severity_level.trim() ? raw.severity_level.trim() : "Moderate",
      treatment_steps: Array.isArray(raw.treatment_steps) ? raw.treatment_steps.map(String) : [],
      prevention_tips: Array.isArray(raw.prevention_tips) ? raw.prevention_tips.map(String) : [],
      error_message: typeof raw.error_message === "string" && raw.error_message.trim() ? raw.error_message.trim() : undefined,
    };
  }

  // Call Gemini vision with 10s timeout
  async function callGeminiVision(
    ai: GoogleGenAI,
    rawBase64: string,
    mimeType: string,
    systemPrompt: string
  ): Promise<{ parsed: any; model: string }> {
    const timeoutMs = 10000;
    const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash"];

    let lastError: any = null;

    for (const model of candidateModels) {
      let timeoutHandle: NodeJS.Timeout | null = null;
      try {
        const requestPromise = ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: rawBase64,
                  mimeType,
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                is_plant_leaf: {
                  type: Type.BOOLEAN,
                  description: "True if the image clearly depicts a plant or leaf, false otherwise.",
                },
                plant_type: {
                  type: Type.STRING,
                  description: "The name of the plant or crop.",
                },
                disease_detected: {
                  type: Type.STRING,
                  description: "The disease, pest issue, nutrient deficiency, or 'Healthy'.",
                },
                confidence_level: {
                  type: Type.STRING,
                  description: "Confidence: 'High', 'Medium', or 'Low'.",
                },
                symptoms_observed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of observable visual symptoms on the leaf.",
                },
                likely_cause: {
                  type: Type.STRING,
                  description: "Likely underlying cause or pathogen.",
                },
                severity_level: {
                  type: Type.STRING,
                  description: "Severity: 'Mild', 'Moderate', or 'Severe'.",
                },
                treatment_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Actionable, numbered treatment steps.",
                },
                prevention_tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Prevention recommendations.",
                },
                error_message: {
                  type: Type.STRING,
                  description: "Friendly error explanation if not a plant leaf.",
                },
              },
              required: [
                "is_plant_leaf",
                "plant_type",
                "disease_detected",
                "confidence_level",
                "symptoms_observed",
                "likely_cause",
                "severity_level",
                "treatment_steps",
                "prevention_tips",
              ],
            },
          },
        });

        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => {
            const timeoutErr: any = new Error("Gemini API call timed out after 10 seconds.");
            timeoutErr.code = "ETIMEDOUT";
            timeoutErr.status = 504;
            reject(timeoutErr);
          }, timeoutMs);
        });

        const response: any = await Promise.race([requestPromise, timeoutPromise]);
        const rawText = response.text || "{}";
        const cleanJson = rawText.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
        const parsed = JSON.parse(cleanJson);
        return { parsed, model };
      } catch (err: any) {
        lastError = err;
        console.warn(`[CropDoc AI] Gemini model '${model}' attempt failed or timed out:`, err?.message || err);
        // If timed out, break immediately to trigger Groq fallback as required
        if (err?.code === "ETIMEDOUT" || (err?.message && err.message.includes("timed out"))) {
          throw err;
        }
      } finally {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
      }
    }

    throw lastError || new Error("Gemini models failed to generate response.");
  }

  // Call Groq Vision API via Chat Completions endpoint
  async function callGroqVision(
    rawBase64: string,
    mimeType: string,
    systemPrompt: string
  ): Promise<{ parsed: any; model: string }> {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    // Candidate vision models on Groq:
    // Prioritizing llama-4-scout and llama-4-maverick as requested,
    // with reliable fallthrough to live and tested vision models.
    const groqModels = [
      "llama-4-scout",
      "llama-4-maverick",
      "qwen/qwen3.8-27b",
      "qwen/qwen3.6-27b",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "meta-llama/llama-4-maverick-17b-128e-instruct",
    ];

    let lastError: any = null;

    for (const model of groqModels) {
      try {
        console.log(`[CropDoc AI] Trying Groq vision model '${model}'...`);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `${systemPrompt}\n\nCRITICAL REQUIREMENT: You MUST output ONLY a valid JSON object adhering to this schema:
{
  "is_plant_leaf": true or false,
  "plant_type": "string",
  "disease_detected": "string",
  "confidence_level": "High" | "Medium" | "Low",
  "symptoms_observed": ["string"],
  "likely_cause": "string",
  "severity_level": "Mild" | "Moderate" | "Severe",
  "treatment_steps": ["string"],
  "prevention_tips": ["string"],
  "error_message": "string"
}
Do NOT include markdown formatting or extra text.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${rawBase64}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`[CropDoc AI] Groq model '${model}' status ${response.status}: ${errorBody.slice(0, 120)}`);
          lastError = new Error(`Groq model '${model}' failed (${response.status}): ${errorBody}`);
          // Continue to next candidate model smoothly
          continue;
        }

        const resJson = await response.json();
        const content = resJson.choices?.[0]?.message?.content || "{}";
        const cleanJson = content.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
        const parsed = JSON.parse(cleanJson);
        return { parsed, model };
      } catch (err: any) {
        console.warn(`[CropDoc AI] Groq model '${model}' error:`, err?.message || err);
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error("All Groq vision models failed or were unavailable.");
  }

  // Call Mistral (Pixtral) Vision API via Chat Completions endpoint
  async function callMistralVision(
    rawBase64: string,
    mimeType: string,
    systemPrompt: string
  ): Promise<{ parsed: any; model: string }> {
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      throw new Error("MISTRAL_API_KEY is not configured.");
    }

    // Candidate Pixtral vision models on Mistral AI
    const mistralModels = [
      "pixtral-12b-2409",
      "pixtral-12b-latest",
      "pixtral-large-latest",
      "mistral-small-latest",
    ];

    let lastError: any = null;

    for (const model of mistralModels) {
      try {
        console.log(`[CropDoc AI] Trying Mistral vision model '${model}'...`);
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mistralApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `${systemPrompt}\n\nCRITICAL REQUIREMENT: You MUST output ONLY a valid JSON object adhering to this schema:
{
  "is_plant_leaf": true or false,
  "plant_type": "string",
  "disease_detected": "string",
  "confidence_level": "High" | "Medium" | "Low",
  "symptoms_observed": ["string"],
  "likely_cause": "string",
  "severity_level": "Mild" | "Moderate" | "Severe",
  "treatment_steps": ["string"],
  "prevention_tips": ["string"],
  "error_message": "string"
}
Do NOT include markdown formatting or extra text.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${rawBase64}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`[CropDoc AI] Mistral model '${model}' status ${response.status}: ${errorBody.slice(0, 120)}`);
          lastError = new Error(`Mistral model '${model}' failed (${response.status}): ${errorBody}`);
          // Continue to next candidate model smoothly
          continue;
        }

        const resJson = await response.json();
        const content = resJson.choices?.[0]?.message?.content || "{}";
        const cleanJson = content.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
        const parsed = JSON.parse(cleanJson);
        return { parsed, model };
      } catch (err: any) {
        console.warn(`[CropDoc AI] Mistral model '${model}' error:`, err?.message || err);
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error("All Mistral vision models failed or were unavailable.");
  }

  // Plant disease diagnosis API endpoint with Gemini -> Groq -> Mistral (Pixtral) fallback chain
  app.post("/api/diagnose", async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = "image/jpeg",
        language = "en",
        simulateFallback = false,
        simulateMistral = false,
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          error: "Missing imageBase64 data in request.",
        });
      }

      // Clean base64 string if it contains data URI header
      const rawBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

      const isHindi = language === "hi" || language === "hindi";
      const targetLanguage = isHindi ? "Hindi (हिंदी)" : "English";

      const systemPrompt = `You are an expert agricultural pathologist, agronomist, and plant doctor diagnosing crop diseases for farmers.
Your job is to closely inspect the provided image of a plant leaf and determine if it shows any signs of fungal infection, bacterial blight, viral mosaic, pest infestation, nutrient deficiencies (nitrogen, potassium, iron, magnesium, etc.), or if it is healthy.

CRITICAL INSTRUCTIONS:
1. FIRST: Verify whether the image actually depicts a plant, leaf, crop, or botanical specimen.
   - If the image does NOT contain a plant or leaf (for example: a human, face, car, animal, furniture, landscape without clear plant, or completely indecipherable blur), set "is_plant_leaf" to false.
   - When "is_plant_leaf" is false, set "error_message" to a friendly, polite message in ${targetLanguage} explaining that the photo does not appear to be a plant leaf and asking the user to upload a clear, well-lit photo of a plant leaf. You may populate placeholder values for other fields.
2. If the image IS a plant or leaf, set "is_plant_leaf" to true.
3. Diagnose the exact plant type and condition:
   - Identify the plant_type (e.g. "Tomato", "Wheat", "Rice / Paddy", "Corn / Maize", "Cotton", "Potato", etc.).
   - Identify disease_detected (e.g. "Early Blight", "Yellow Leaf Curl Virus", "Powdery Mildew", "Bacterial Leaf Streak", "Nitrogen Deficiency", or "Healthy Leaf").
   - Determine confidence_level: "High", "Medium", or "Low".
   - List observable symptoms_observed (concentric rings, chlorosis, necrotic spots, curling edges, etc.).
   - Explain likely_cause (the specific fungal spore, insect vector, environmental moisture, soil condition, or pathogen).
   - Set severity_level: "Mild", "Moderate", or "Severe" (or "Mild" if healthy).
   - Provide treatment_steps: numbered actionable steps that an everyday farmer can execute (including organic remedies like neem oil spray, cultural practices like trimming infected foliage, irrigation management, and recommended approved chemical/biological treatments).
   - Provide prevention_tips: clear agricultural best practices (crop rotation, resistant varieties, soil testing, spacing, drip irrigation).
4. LANGUAGE REQUIREMENT:
   All output text MUST be in ${targetLanguage}.
   ${isHindi ? "All diagnosis details, symptoms, causes, treatment steps, and prevention tips must be in clear, easy-to-understand Hindi (देवनागरी लिपि) suitable for Indian farmers." : "Use clear, practical terminology that farmers can easily understand and act upon."}
5. OUTPUT FORMAT:
   Return ONLY a valid JSON object adhering strictly to the JSON schema. Do not enclose in markdown ticks or preamble.`;

      let diagnosisResult: any = null;
      let providerUsed: "gemini" | "groq" | "mistral" = "gemini";
      let modelUsed: string = "gemini-3.8-flash";
      let providerLabel: string = "Powered by Gemini";
      let fallbackUsed = false;
      let geminiErrorMessage: string | null = null;
      let groqErrorMessage: string | null = null;
      let mistralErrorMessage: string | null = null;

      // STEP 1: Attempt Gemini API first (unless simulateFallback or simulateMistral is explicitly requested for testing)
      if (!simulateFallback && !simulateMistral) {
        try {
          console.log("[CropDoc AI] Requesting plant diagnosis from primary vision engine (Gemini, 10s timeout)...");
          const ai = getGenAI();
          const { parsed: geminiRaw, model } = await callGeminiVision(ai, rawBase64, mimeType, systemPrompt);
          diagnosisResult = normalizeDiagnosis(geminiRaw);
          providerUsed = "gemini";
          modelUsed = model;
          providerLabel = "Powered by Gemini";
          fallbackUsed = false;
          console.log(`[CropDoc AI] Primary diagnosis succeeded with Gemini (${model}).`);
        } catch (geminiErr: any) {
          geminiErrorMessage = geminiErr?.message || String(geminiErr);
          console.warn("[CropDoc AI] Gemini primary call failed or timed out:", geminiErrorMessage);
        }
      } else {
        geminiErrorMessage = simulateMistral
          ? "Simulated primary failure for Mistral fallback testing."
          : "Simulated primary failure for Groq fallback testing.";
        console.log(`[CropDoc AI] Test flag active (${simulateMistral ? "simulateMistral" : "simulateFallback"}). Skipping primary Gemini.`);
      }

      // STEP 2: If Gemini failed, timed out, or had an error, fallback to Groq API (unless simulateMistral is active)
      if (!diagnosisResult && !simulateMistral) {
        console.log("[CropDoc AI] Attempting fallback request using Groq vision API...");
        try {
          const { parsed, model } = await callGroqVision(rawBase64, mimeType, systemPrompt);
          diagnosisResult = normalizeDiagnosis(parsed);
          providerUsed = "groq";
          modelUsed = model;
          providerLabel = "Powered by Groq (backup)";
          fallbackUsed = true;
          console.log(`[CropDoc AI] Fallback diagnosis succeeded with Groq model (${model}).`);
        } catch (groqErr: any) {
          groqErrorMessage = groqErr?.message || String(groqErr);
          console.error("[CropDoc AI] Groq fallback attempt failed:", groqErrorMessage);
        }
      } else if (simulateMistral) {
        groqErrorMessage = "Simulated Groq failure for Mistral fallback testing.";
      }

      // STEP 3: If both Gemini and Groq failed (or simulateMistral is active), fallback to Mistral (Pixtral)
      if (!diagnosisResult) {
        console.log("[CropDoc AI] Attempting tertiary fallback request using Mistral (Pixtral) vision API...");
        try {
          const { parsed, model } = await callMistralVision(rawBase64, mimeType, systemPrompt);
          diagnosisResult = normalizeDiagnosis(parsed);
          providerUsed = "mistral";
          modelUsed = model;
          providerLabel = "Powered by Mistral (backup)";
          fallbackUsed = true;
          console.log(`[CropDoc AI] Fallback diagnosis succeeded with Mistral model (${model}).`);
        } catch (mistralErr: any) {
          mistralErrorMessage = mistralErr?.message || String(mistralErr);
          console.error("[CropDoc AI] Mistral fallback attempt also failed:", mistralErrorMessage);
        }
      }

      // If any of Gemini, Groq, or Mistral succeeded, return normalized response
      if (diagnosisResult) {
        diagnosisResult.provider = providerUsed;
        diagnosisResult.model = modelUsed;
        diagnosisResult.providerLabel = providerLabel;
        diagnosisResult.fallbackUsed = fallbackUsed;

        return res.json({
          success: true,
          data: diagnosisResult,
          provider: providerUsed,
          model: modelUsed,
          providerLabel,
          fallbackUsed,
          language,
          geminiError: geminiErrorMessage,
          groqError: groqErrorMessage,
        });
      }

      // STEP 4: If all AI providers failed, return friendly error without raw stack traces
      console.error("[CropDoc AI] All AI vision engines (Gemini, Groq, Mistral) failed to process the request.");
      return res.status(503).json({
        success: false,
        error: "Our AI service is temporarily busy. Please try again in a moment.",
        debug: {
          gemini: geminiErrorMessage,
          groq: groqErrorMessage,
          mistral: mistralErrorMessage,
        },
      });
    } catch (err: any) {
      console.error("[CropDoc AI] Unexpected server error during diagnosis:", err);
      return res.status(500).json({
        success: false,
        error: "Our AI service is temporarily busy. Please try again in a moment.",
        debug: {
          message: err?.message,
        },
      });
    }
  });

  // Serve static files from public folder
  app.use(express.static(path.join(process.cwd(), "public")));

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CropDoc AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
