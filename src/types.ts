export type ConfidenceLevel = "High" | "Medium" | "Low" | string;
export type SeverityLevel = "Mild" | "Moderate" | "Severe" | string;

export interface PlantDiagnosis {
  is_plant_leaf: boolean;
  plant_type: string;
  disease_detected: string;
  confidence_level: ConfidenceLevel;
  symptoms_observed: string[];
  likely_cause: string;
  severity_level: SeverityLevel;
  treatment_steps: string[];
  prevention_tips: string[];
  error_message?: string;
  provider?: "gemini" | "groq" | "mistral" | string;
  model?: string;
  providerLabel?: string;
  fallbackUsed?: boolean;
}

export type SupportedLanguage = "en" | "hi";

export interface SampleLeaf {
  id: string;
  title: string;
  subtitle: string;
  cropName: string;
  imageUrl: string;
  sampleType: "fungal" | "pest" | "healthy" | "nutrient";
}
