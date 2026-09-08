/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { UploadSection } from "./components/UploadSection";
import { LoadingState } from "./components/LoadingState";
import { DiagnosisResultView } from "./components/DiagnosisResultView";
import { NonPlantErrorCard } from "./components/NonPlantErrorCard";
import { SupportedLanguage, PlantDiagnosis, SampleLeaf } from "./types";
import { processImageFile, fetchImageUrlAsBase64 } from "./utils/imageUtils";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [currentBase64, setCurrentBase64] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [nonPlantDetected, setNonPlantDetected] = useState<boolean>(false);
  const [nonPlantMessage, setNonPlantMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Core diagnosis requester
  const executeDiagnosis = async (
    base64: string,
    mimeType: string,
    targetLang: SupportedLanguage,
    isLanguageSwitch: boolean = false
  ) => {
    if (isLanguageSwitch) {
      setIsReanalyzing(true);
    } else {
      setIsAnalyzing(true);
      setDiagnosis(null);
      setNonPlantDetected(false);
      setNonPlantMessage(null);
    }
    setApiError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          language: targetLang,
        }),
      });

      const rawText = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(rawText);
      } catch {
        // Non-JSON response (e.g. gateway timeout or proxy HTML page)
      }

      if (!res.ok || !json || !json.success) {
        // Log diagnostic error details to browser console for debugging without exposing raw error to UI
        console.error(
          "[CropDoc AI] Diagnosis service unavailable (both Gemini & Groq failed or error occurred):",
          json?.debug || json?.error || `HTTP ${res.status}: ${rawText.slice(0, 100)}`
        );
        throw new Error(
          json?.error ||
            (targetLang === "hi"
              ? "हमारी एआई सेवा वर्तमान में व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
              : "Our AI service is temporarily busy. Please try again in a moment.")
        );
      }

      const data: PlantDiagnosis = json.data;

      // Log AI provider and model info to browser console for demo/debugging verification
      console.log(
        `%c[CropDoc AI] Diagnosis succeeded via ${json.providerLabel || "Gemini"} (${json.model || "gemini-3.8-flash"})`,
        "color: #15803d; font-weight: bold;"
      );
      if (json.fallbackUsed) {
        console.warn(
          `[CropDoc AI] Fallback active: Gemini timed out or had rate-limit error. Groq backup model (${json.model}) successfully handled the analysis.`,
          json.geminiError ? { geminiError: json.geminiError } : ""
        );
      }

      // Check if image is detected as a plant leaf
      if (data.is_plant_leaf === false) {
        setNonPlantDetected(true);
        setNonPlantMessage(data.error_message || null);
        setDiagnosis(null);
      } else {
        setDiagnosis(data);
        setNonPlantDetected(false);
        setNonPlantMessage(null);
      }
    } catch (err: any) {
      console.error("[CropDoc AI] Diagnosis request failed:", err);
      // Ensure user sees clear friendly error message without raw error codes
      setApiError(
        targetLang === "hi"
          ? "हमारी एआई सेवा वर्तमान में व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
          : "Our AI service is temporarily busy. Please try again in a moment."
      );
    } finally {
      setIsAnalyzing(false);
      setIsReanalyzing(false);
    }
  };

  // User selected a file from device
  const handleImageFile = async (file: File) => {
    try {
      setApiError(null);
      const { base64, mimeType, dataUrl } = await processImageFile(file);
      setCurrentBase64(base64);
      setCurrentMimeType(mimeType);
      setPreviewUrl(dataUrl);

      // Trigger analysis immediately upon file upload
      await executeDiagnosis(base64, mimeType, language, false);
    } catch (err: any) {
      console.error("Failed to read image file:", err);
      setApiError("Could not process the selected image file. Please try another.");
    }
  };

  // User selected a sample leaf
  const handleSampleSelected = async (sample: SampleLeaf) => {
    try {
      setApiError(null);
      setPreviewUrl(sample.imageUrl);
      setIsAnalyzing(true);
      setDiagnosis(null);
      setNonPlantDetected(false);

      const { base64, mimeType, dataUrl } = await fetchImageUrlAsBase64(sample.imageUrl);
      setCurrentBase64(base64);
      setCurrentMimeType(mimeType);
      setPreviewUrl(dataUrl);

      await executeDiagnosis(base64, mimeType, language, false);
    } catch (err: any) {
      console.error("Failed to load sample leaf:", err);
      setApiError("Failed to load sample image. Please try uploading your own photo.");
      setIsAnalyzing(false);
    }
  };

  // Language switch handler (re-requests analysis if an image is loaded)
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (newLang === language) return;
    setLanguage(newLang);

    // If an image has already been uploaded/analyzed, re-request in the newly selected language
    if (currentBase64) {
      executeDiagnosis(currentBase64, currentMimeType, newLang, true);
    }
  };

  // Toggle language between en and hi
  const handleToggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    handleLanguageChange(nextLang);
  };

  // Reset to upload screen
  const handleReset = () => {
    setDiagnosis(null);
    setNonPlantDetected(false);
    setNonPlantMessage(null);
    setApiError(null);
    setCurrentBase64(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF5] text-stone-800">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        isAnalyzing={isAnalyzing || isReanalyzing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Friendly AI Service Busy Banner with Retry Button */}
        {apiError && (
          <div className="w-full max-w-2xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgb(217,119,6,0.08)]">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{apiError}</p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {language === "hi"
                    ? "सर्वर लोड या नेटवर्क समस्या के कारण। पुनः प्रयास करने के लिए बटन दबाएं।"
                    : "Automatic high-availability retry is available. Click below to re-submit."}
                </p>
              </div>
            </div>
            {currentBase64 && (
              <button
                type="button"
                id="service-retry-button"
                onClick={() =>
                  executeDiagnosis(currentBase64, currentMimeType, language, false)
                }
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "पुनः प्रयास करें" : "Try Again"}</span>
              </button>
            )}
          </div>
        )}

        {/* View 1: Loading State */}
        {isAnalyzing && (
          <LoadingState
            language={language}
            imagePreviewUrl={previewUrl}
          />
        )}

        {/* View 2: Non-Plant Friendly Error Card */}
        {!isAnalyzing && nonPlantDetected && (
          <NonPlantErrorCard
            language={language}
            errorMessage={nonPlantMessage || undefined}
            imagePreviewUrl={previewUrl}
            onReset={handleReset}
          />
        )}

        {/* View 3: Diagnosis Results */}
        {!isAnalyzing && diagnosis && previewUrl && (
          <DiagnosisResultView
            diagnosis={diagnosis}
            imagePreviewUrl={previewUrl}
            language={language}
            onLanguageToggle={handleToggleLanguage}
            onReset={handleReset}
            isReanalyzing={isReanalyzing}
          />
        )}

        {/* View 4: Upload & Sample Leaves (Default View) */}
        {!isAnalyzing && !diagnosis && !nonPlantDetected && (
          <UploadSection
            language={language}
            onImageSelected={handleImageFile}
            onSampleSelected={handleSampleSelected}
            selectedPreviewUrl={previewUrl}
            onClearSelection={handleReset}
            onStartDiagnosis={() => {
              if (currentBase64) {
                executeDiagnosis(currentBase64, currentMimeType, language, false);
              }
            }}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/80 bg-white/60 py-6 text-center text-xs text-stone-700 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            CropDoc AI &copy; {new Date().getFullYear()} &bull;{" "}
            {language === "hi"
              ? "किसानों के लिए निःशुल्क पादप रोग निदान"
              : "Empowering Farmers with Smart Plant Pathology"}
          </p>
          <div className="flex items-center space-x-3 text-emerald-800 font-semibold">
            <span>Powered by Gemini with Groq &amp; Mistral Pixtral Fallback</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
