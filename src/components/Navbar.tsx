import React from "react";
import { Sprout, Languages, Sparkles } from "lucide-react";
import { SupportedLanguage } from "../types";
import { UI_TEXT } from "../data/translations";

interface NavbarProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isAnalyzing,
}) => {
  const t = UI_TEXT[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFBF7]/90 backdrop-blur-md border-b border-stone-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 transition-transform hover:scale-105">
            <Sprout className="w-6 h-6 text-emerald-200" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-emerald-950 font-['Outfit',sans-serif]">
                CropDoc <span className="text-emerald-600 font-bold">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                Gemini 3 Vision
              </span>
            </div>
            <p className="text-xs text-stone-700 font-medium hidden sm:block">
              {t.badge}
            </p>
          </div>
        </div>

        {/* Right Controls: Language Toggle Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 shadow-inner">
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => onLanguageChange("en")}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                language === "en"
                  ? "bg-white text-emerald-900 shadow-sm border border-stone-200/70"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <span>English</span>
            </button>
            <button
              type="button"
              id="lang-btn-hi"
              onClick={() => onLanguageChange("hi")}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                language === "hi"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>हिंदी (Hindi)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
