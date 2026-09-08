import React from "react";
import { motion } from "motion/react";
import {
  PlantDiagnosis,
  SupportedLanguage,
} from "../types";
import { UI_TEXT } from "../data/translations";
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Calendar,
  Languages,
  RotateCcw,
  Printer,
  Sparkles,
  Info,
  Leaf,
  Cpu,
} from "lucide-react";

interface DiagnosisResultViewProps {
  diagnosis: PlantDiagnosis;
  imagePreviewUrl: string;
  language: SupportedLanguage;
  onLanguageToggle: () => void;
  onReset: () => void;
  isReanalyzing: boolean;
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  diagnosis,
  imagePreviewUrl,
  language,
  onLanguageToggle,
  onReset,
  isReanalyzing,
}) => {
  const t = UI_TEXT[language];

  // Severity config
  const sevStr = (diagnosis.severity_level || "").toLowerCase();
  const isSevere = sevStr.includes("severe") || sevStr.includes("गंभीर");
  const isModerate = sevStr.includes("moderate") || sevStr.includes("मध्यम");

  const severityColor = isSevere
    ? {
        border: "border-red-200",
        headerBg: "bg-red-50/90",
        badge: "bg-red-600 text-white",
        text: "text-red-700",
        icon: AlertOctagon,
        bannerBg: "bg-red-100/60 border-red-200 text-red-900",
      }
    : isModerate
    ? {
        border: "border-amber-200",
        headerBg: "bg-amber-50/90",
        badge: "bg-amber-600 text-white",
        text: "text-amber-800",
        icon: AlertTriangle,
        bannerBg: "bg-amber-100/60 border-amber-200 text-amber-900",
      }
    : {
        border: "border-emerald-200",
        headerBg: "bg-emerald-50/90",
        badge: "bg-emerald-700 text-white",
        text: "text-emerald-800",
        icon: CheckCircle2,
        bannerBg: "bg-emerald-100/60 border-emerald-200 text-emerald-900",
      };

  const SeverityIcon = severityColor.icon;

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto space-y-6 pb-16 print:p-0 print:m-0"
    >
      {/* Top Banner with Quick Actions */}
      <section className="p-5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950" aria-label="Assessment limitations">
        <h2 className="font-bold">{language === "hi" ? "प्रारंभिक AI आकलन — पुष्टि किया हुआ निदान नहीं" : "Preliminary AI assessment — not a confirmed diagnosis"}</h2>
        <p className="text-sm mt-2">{language === "hi" ? "विश्वास स्तर AI का अनुमान है, मापी गई सटीकता नहीं। तस्वीर से कई रोग एक जैसे दिख सकते हैं। रसायनों का उपयोग करने से पहले स्थानीय लेबल और कृषि विशेषज्ञ की सलाह लें।" : "Confidence is the model’s opinion, not measured accuracy. Several conditions can look alike in a photo. Check local product labels and consult an agricultural expert before using chemicals."}</p>
        {(diagnosis.confidence_level === "Low" || diagnosis.severity_level === "Severe") && <p className="font-semibold mt-3">{language === "hi" ? "विशेषज्ञ समीक्षा आवश्यक: स्पष्ट तस्वीरें लें और अपने नजदीकी KVK से संपर्क करें।" : "Expert review recommended: take clear photos and contact your nearest KVK before acting on this assessment."}</p>}
        <p className="text-sm mt-3">{language === "hi" ? "विशेषज्ञ को फसल, जिला, लक्षण कब शुरू हुए और किए गए उपचार बताएं। रिपोर्ट सहेज कर साथ ले जाएं।" : "Share your crop, district, when symptoms began, and any treatments already tried. Save this report to take with you."}</p>
        <a href="https://kvk.icar.gov.in/" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 underline font-semibold">{language === "hi" ? "आधिकारिक ICAR KVK पोर्टल खोलें ↗" : "Open the official ICAR KVK portal ↗"}</a>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 print:hidden">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
            <span>{t.newScan}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-stone-700" />
            <span>{t.printOrSave}</span>
          </button>
        </div>

        {/* Quick Language Toggle with explanation */}
        <button
          type="button"
          id="lang-reanalyze-toggle"
          onClick={onLanguageToggle}
          disabled={isReanalyzing}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition-all transform active:scale-95"
        >
          <Languages className="w-4 h-4 text-emerald-200" />
          <span>
            {language === "en" ? "Reassess in हिंदी (Hindi)" : "Reassess in English"}
          </span>
          {isReanalyzing && (
            <span className="w-2 h-2 rounded-full bg-lime-300 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Diagnostic Header Card */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-[0_10px_35px_rgb(26,77,46,0.05)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Uploaded Leaf Image Preview (Requirement: Show preview alongside results) */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-md bg-stone-100 group">
              <img
                src={imagePreviewUrl}
                alt="Analyzed leaf specimen"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/70 backdrop-blur-md text-white border border-white/20">
                {t.previewTitle}
              </div>
            </div>
            <p className="text-[11px] text-stone-700 mt-2 text-center font-medium">
              {language === "hi"
                ? "मूल फसल पत्ती का नमूना"
                : "Uploaded leaf specimen photo"}
            </p>
          </div>

          {/* Primary Diagnosis Summary */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-4">
            <div>
              {/* Plant Type & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{diagnosis.plant_type}</span>
                </span>

                {/* Color-Coded Severity Badge */}
                <span
                  id="severity-badge"
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${severityColor.badge} shadow-sm`}
                >
                  <SeverityIcon className="w-3.5 h-3.5" />
                  <span>
                    {t.severityLabel}: {diagnosis.severity_level}
                  </span>
                </span>

                {/* Confidence Badge */}
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>
                    {t.confidenceLabel}: {diagnosis.confidence_level}
                  </span>
                </span>

                {/* AI Model Indicator (Subtle badge showing which model powered the diagnosis) */}
                {diagnosis.providerLabel && (
                  <span
                    id="ai-provider-badge"
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      diagnosis.fallbackUsed
                        ? "bg-amber-50 text-amber-900 border-amber-200"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    }`}
                    title={
                      diagnosis.fallbackUsed
                        ? `Automatic High-Availability Fallback: ${diagnosis.providerLabel} (${diagnosis.model || "vision model"})`
                        : `Primary Engine: ${diagnosis.providerLabel} (${diagnosis.model || "gemini-3.8-flash"})`
                    }
                  >
                    {diagnosis.fallbackUsed ? (
                      <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                    ) : (
                      <Cpu className="w-3 h-3 text-emerald-600 shrink-0" />
                    )}
                    <span>{diagnosis.providerLabel}</span>
                  </span>
                )}
              </div>

              {/* Disease Name Headline */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight font-['Outfit',sans-serif] mt-1">
                {diagnosis.disease_detected}
              </h2>
            </div>

            {/* Likely Cause Block */}
            <div className={`p-4 rounded-2xl border ${severityColor.bannerBg}`}>
              <div className="flex items-start space-x-2.5">
                <Microscope className="w-4 h-4 mt-0.5 text-emerald-800 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    {t.causeLabel}
                  </h4>
                  <p className="text-sm font-medium mt-0.5 text-stone-900 leading-relaxed">
                    {diagnosis.likely_cause}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Symptoms & Pathology Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Symptoms Observed Card */}
        <div className="lg:col-span-5 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-stone-100 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-950 font-['Outfit',sans-serif]">
                {t.symptomsLabel}
              </h3>
              <p className="text-xs text-stone-700">
                {language === "hi"
                  ? "पत्ती पर दिखाई देने वाले मुख्य लक्षण"
                  : "Visible pathology signs detected on leaf"}
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {diagnosis.symptoms_observed && diagnosis.symptoms_observed.length > 0 ? (
              diagnosis.symptoms_observed.map((symptom, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-[#FAFBF7] border border-stone-100/90 text-sm text-stone-800"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="font-medium leading-relaxed">{symptom}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-stone-700 italic">
                {language === "hi"
                  ? "कोई गंभीर लक्षण नहीं पाया गया"
                  : "No severe abnormal symptoms recorded."}
              </li>
            )}
          </ul>
        </div>

        {/* Actionable Treatment Steps Card */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-stone-100 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-950 font-['Outfit',sans-serif]">
                {t.treatmentLabel}
              </h3>
              <p className="text-xs text-stone-700">
                {language === "hi"
                  ? "किसान तुरंत ये कदम उठाएं"
                  : "Actionable, numbered instructions for farm recovery"}
              </p>
            </div>
          </div>

          <ol className="space-y-3">
            {diagnosis.treatment_steps && diagnosis.treatment_steps.length > 0 ? (
              diagnosis.treatment_steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-sm text-stone-900 transition-all hover:bg-emerald-50/70"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{step}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-stone-700 italic">
                {language === "hi"
                  ? "वर्तमान में किसी विशेष उपचार की आवश्यकता नहीं है"
                  : "No immediate chemical or organic treatment required."}
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* Prevention Tips Card */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-stone-100 mb-4">
          <div className="w-9 h-9 rounded-xl bg-lime-100 text-emerald-900 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-emerald-950 font-['Outfit',sans-serif]">
              {t.preventionLabel}
            </h3>
            <p className="text-xs text-stone-700">
              {language === "hi"
                ? "अगली फसल को रोगमुक्त रखने के उपाय"
                : "Best practices for crop immunity, rotation & protection"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnosis.prevention_tips && diagnosis.prevention_tips.length > 0 ? (
            diagnosis.prevention_tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#FAFBF7] border border-stone-100 text-sm text-stone-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{tip}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-stone-700 italic">
              {language === "hi"
                ? "नियमित फसल चक्र अपनाएं"
                : "Maintain regular crop rotation and soil sanitation."}
            </div>
          )}
        </div>
      </div>

      {/* Medical/Agricultural Disclaimer */}
      <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.disclaimer}</p>
      </div>

      {/* Subtle AI Engine Status & Diagnostics Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-stone-600 print:hidden">
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-stone-700" />
          <span>
            {diagnosis.providerLabel || "Powered by Gemini"}
            {diagnosis.model ? ` (${diagnosis.model})` : ""}
            {diagnosis.fallbackUsed ? " — High Availability Fallback" : " — Primary Vision Engine"}
          </span>
        </div>
        <span className="text-stone-700 font-medium">CropDoc Resilient Diagnostics</span>
      </div>
    </motion.div>
  );
};
