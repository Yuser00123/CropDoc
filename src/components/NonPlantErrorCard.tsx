import React from "react";
import { motion } from "motion/react";
import { AlertCircle, Upload, ArrowLeft } from "lucide-react";
import { SupportedLanguage } from "../types";
import { UI_TEXT } from "../data/translations";

interface NonPlantErrorCardProps {
  language: SupportedLanguage;
  errorMessage?: string;
  imagePreviewUrl?: string | null;
  onReset: () => void;
}

export const NonPlantErrorCard: React.FC<NonPlantErrorCardProps> = ({
  language,
  errorMessage,
  imagePreviewUrl,
  onReset,
}) => {
  const t = UI_TEXT[language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-[0_10px_35px_rgb(217,119,6,0.08)] text-center relative overflow-hidden"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
        <AlertCircle className="w-8 h-8" strokeWidth={2.2} />
      </div>

      <h3 className="text-2xl font-bold text-amber-950 mb-2 font-['Outfit',sans-serif]">
        {t.notPlantTitle}
      </h3>

      <p className="text-amber-900/90 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
        {errorMessage || t.notPlantDefault}
      </p>

      {/* Uploaded image preview */}
      {imagePreviewUrl && (
        <div className="inline-block relative mb-6">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm bg-stone-100">
            <img
              src={imagePreviewUrl}
              alt="Uploaded non-plant preview"
              className="w-full h-full object-cover grayscale opacity-90"
            />
          </div>
          <span className="block mt-1.5 text-xs text-amber-800 font-medium">
            {t.previewTitle}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          id="upload-again-btn"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/15 flex items-center justify-center space-x-2 transition-all transform active:scale-95 whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadAgain}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-amber-100/60 text-stone-700 border border-amber-200 font-semibold text-sm flex items-center justify-center space-x-2 transition-all whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "hi" ? "वापस जाएं" : "Go Back"}</span>
        </button>
      </div>
    </motion.div>
  );
};
