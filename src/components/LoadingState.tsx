import React from "react";
import { motion } from "motion/react";
import { Loader2, Sparkles, Stethoscope, Microscope } from "lucide-react";
import { SupportedLanguage } from "../types";
import { UI_TEXT } from "../data/translations";

interface LoadingStateProps {
  language: SupportedLanguage;
  imagePreviewUrl?: string | null;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  language,
  imagePreviewUrl,
}) => {
  const t = UI_TEXT[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto my-8 p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-[0_12px_40px_rgb(26,77,46,0.06)] text-center relative overflow-hidden"
    >
      {/* Decorative organic top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-600 rounded-b-full opacity-80" />

      {/* Uploaded image preview during analysis */}
      {imagePreviewUrl && (
        <div className="relative w-36 h-36 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-md">
          <img
            src={imagePreviewUrl}
            alt="Leaf being analyzed"
            className="w-full h-full object-cover"
          />
          {/* Scanning sweep laser line */}
          <motion.div
            className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399]"
            animate={{
              top: ["0%", "95%", "0%"],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="absolute inset-0 bg-emerald-950/15 pointer-events-none" />
        </div>
      )}

      {/* Main Spinner */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mb-5 relative">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center text-[10px] text-emerald-950 font-bold shadow-sm">
          <Sparkles className="w-3 h-3 text-emerald-900" />
        </span>
      </div>

      <h3 className="text-2xl font-bold text-emerald-950 mb-2 font-['Outfit',sans-serif]">
        {t.loadingTitle}
      </h3>
      <p className="text-stone-700 text-sm max-w-md mx-auto mb-6 leading-relaxed">
        {t.loadingSubtitle}
      </p>

      {/* Progress chips */}
      <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-stone-100">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
          <Microscope className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === "hi" ? "ऊतक स्कैनिंग" : "Tissue Diagnostics"}</span>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === "hi" ? "रोगजनक पहचान" : "Pathogen Identification"}</span>
        </div>
      </div>
    </motion.div>
  );
};
