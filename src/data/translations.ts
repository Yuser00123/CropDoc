import { SupportedLanguage } from "../types";

export const UI_TEXT: Record<SupportedLanguage, {
  appName: string;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  uploadTitle: string;
  uploadDesc: string;
  uploadButton: string;
  supportedFormats: string;
  trySamples: string;
  loadingTitle: string;
  loadingSubtitle: string;
  changeLanguage: string;
  switchLangNotice: string;
  reanalyzingLang: string;
  previewTitle: string;
  resultsTitle: string;
  notPlantTitle: string;
  notPlantDefault: string;
  uploadAgain: string;
  plantTypeLabel: string;
  diseaseLabel: string;
  confidenceLabel: string;
  severityLabel: string;
  symptomsLabel: string;
  causeLabel: string;
  treatmentLabel: string;
  preventionLabel: string;
  severityMild: string;
  severityModerate: string;
  severitySevere: string;
  healthyStatus: string;
  disclaimer: string;
  printOrSave: string;
  newScan: string;
  serviceBusyError: string;
  retryButton: string;
  poweredByGemini: string;
  poweredByGroq: string;
}> = {
  en: {
    appName: "CropDoc AI",
    badge: "Farmer's Leaf Pathology Assistant",
    heroTitle: "AI-Assisted Crop Health Check",
    heroSubtitle: "Upload a photo of any crop leaf to identify diseases, detect pest damage or nutrient deficiency, and receive clear treatment & prevention steps.",
    uploadTitle: "Upload Leaf Photo",
    uploadDesc: "Drag & drop your leaf photo here, or click to browse from your device",
    uploadButton: "Choose Leaf Photo",
    supportedFormats: "JPEG, PNG or WebP • Maximum 5 MB",
    trySamples: "Or try an instant sample leaf:",
    loadingTitle: "Analyzing your plant...",
    loadingSubtitle: "AI is examining visible leaf patterns, discoloration, and lesions...",
    changeLanguage: "Language / भाषा",
    switchLangNotice: "Switch to Hindi to re-analyze this diagnosis in Hindi",
    reanalyzingLang: "Updating analysis in Hindi...",
    previewTitle: "Uploaded Leaf Preview",
    resultsTitle: "Preliminary Assessment",
    notPlantTitle: "Not a Plant Leaf Detected",
    notPlantDefault: "The uploaded photo does not appear to contain a plant leaf. Please upload a clear, focused photo of a crop or plant leaf.",
    uploadAgain: "Upload Clearer Plant Photo",
    plantTypeLabel: "Plant / Crop Type",
    diseaseLabel: "Possible Condition",
    confidenceLabel: "Model Confidence (Not Accuracy)",
    severityLabel: "Severity Level",
    symptomsLabel: "Observable Symptoms",
    causeLabel: "Likely Cause / Pathogen",
    treatmentLabel: "Actionable Treatment Steps",
    preventionLabel: "Future Prevention Tips",
    severityMild: "Mild",
    severityModerate: "Moderate",
    severitySevere: "Severe",
    healthyStatus: "Healthy Leaf",
    disclaimer: "Agricultural AI guidance. For widespread regional outbreaks, consult your local district Krishi Vigyan Kendra (KVK) or agricultural extension officer.",
    printOrSave: "Save / Print Report",
    newScan: "Diagnose Another Leaf",
    serviceBusyError: "Our AI service is temporarily busy. Please try again in a moment.",
    retryButton: "Try Again",
    poweredByGemini: "Powered by Gemini",
    poweredByGroq: "Powered by Groq (backup)",
  },
  hi: {
    appName: "क्रॉपडॉक AI (CropDoc)",
    badge: "किसान मित्र - पादप रोग विशेषज्ञ",
    heroTitle: "फसल रोग का तुरंत सटीक निदान",
    heroSubtitle: "किसी भी फसल की पत्ती की फोटो अपलोड करें और बीमारी, कीट या पोषक तत्वों की कमी का पता लगाएं। सरल हिंदी में तुरंत उपचार और रोकथाम के उपाय पाएं।",
    uploadTitle: "पत्ती का फोटो अपलोड करें",
    uploadDesc: "पत्ती का फोटो यहाँ खींचें या अपने फ़ोन/कंप्यूटर से चुनने के लिए क्लिक करें",
    uploadButton: "पत्ती की फोटो चुनें",
    supportedFormats: "JPG, JPEG, PNG समर्थित (कैमरा फोटो भी स्वीकार्य)",
    trySamples: "या तुरंत जांचने के लिए नमूना पत्ती चुनें:",
    loadingTitle: "आपके पौधे की जाँच हो रही है...",
    loadingSubtitle: "कृषि रोग विशेषज्ञ पत्ती के ऊतक, धब्बों, फफूंद और लक्षणों का गहराई से विश्लेषण कर रहे हैं...",
    changeLanguage: "भाषा / Language",
    switchLangNotice: "अंग्रेजी में निदान देखने के लिए भाषा बदलें",
    reanalyzingLang: "अंग्रेजी में पुनः विश्लेषण हो रहा है...",
    previewTitle: "अपलोड की गई पत्ती की तस्वीर",
    resultsTitle: "जाँच रिपोर्ट एवं समाधान",
    notPlantTitle: "पौधे या पत्ती की पहचान नहीं हुई",
    notPlantDefault: "अपलोड की गई तस्वीर में पौधे की पत्ती स्पष्ट नहीं दिख रही है। कृपया फसल की पत्ती की साफ़ और रोशनी वाली तस्वीर अपलोड करें।",
    uploadAgain: "साफ़ पत्ती का फोटो अपलोड करें",
    plantTypeLabel: "पौधा / फसल का प्रकार",
    diseaseLabel: "पहचानी गई बीमारी / स्थिति",
    confidenceLabel: "AI का विश्वास (मापी गई सटीकता नहीं)",
    severityLabel: "बीमारी की गंभीरता",
    symptomsLabel: "दिखने वाले लक्षण",
    causeLabel: "संभावित कारण / रोगजनक",
    treatmentLabel: "उपचार के महत्वपूर्ण कदम",
    preventionLabel: "भविष्य की रोकथाम के उपाय",
    severityMild: "हल्का (Mild)",
    severityModerate: "मध्यम (Moderate)",
    severitySevere: "गंभीर (Severe)",
    healthyStatus: "स्वस्थ पत्ती (Healthy)",
    disclaimer: "यह एआई आधारित कृषि सलाह है। बड़े पैमाने पर संक्रमण होने पर अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि प्रसार अधिकारी से भी परामर्श लें।",
    printOrSave: "रिपोर्ट सहेजें / प्रिंट करें",
    newScan: "दूसरी पत्ती की जाँच करें",
    serviceBusyError: "हमारी एआई सेवा वर्तमान में व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।",
    retryButton: "पुनः प्रयास करें",
    poweredByGemini: "जेमिनी द्वारा संचालित (Powered by Gemini)",
    poweredByGroq: "ग्रॉक बैकअप द्वारा संचालित (Powered by Groq)",
  },
};
