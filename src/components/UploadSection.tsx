import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  UploadCloud,
  FileImage,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Sun,
  CameraOff,
} from "lucide-react";
import { SupportedLanguage, SampleLeaf } from "../types";
import { UI_TEXT } from "../data/translations";
import { SAMPLE_LEAVES } from "../data/sampleLeaves";

interface UploadSectionProps {
  language: SupportedLanguage;
  onImageSelected: (file: File) => void;
  onSampleSelected: (sample: SampleLeaf) => void;
  selectedPreviewUrl: string | null;
  onClearSelection: () => void;
  onStartDiagnosis: () => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  language,
  onImageSelected,
  onSampleSelected,
  selectedPreviewUrl,
  onClearSelection,
  onStartDiagnosis,
  isAnalyzing,
}) => {
  const t = UI_TEXT[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Intro */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === "hi" ? "कृषि पैथोलॉजी विशेषज्ञ" : "Agricultural Pathology Assistant"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-950 tracking-tight font-['Outfit',sans-serif]">
          {t.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-[0_12px_40px_rgb(26,77,46,0.04)] p-6 sm:p-8 transition-all">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id="leaf-file-input"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {selectedPreviewUrl ? (
          /* Preview State before starting or re-starting diagnosis */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FAFBF7] border border-emerald-100"
          >
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-sm shrink-0 group">
              <img
                src={selectedPreviewUrl}
                alt="Selected plant leaf preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onClearSelection}
                disabled={isAnalyzing}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{language === "hi" ? "फोटो तैयार है" : "Image Ready for Analysis"}</span>
                </span>
                <h3 className="text-xl font-bold text-emerald-950 font-['Outfit',sans-serif]">
                  {language === "hi" ? "रोग विश्लेषण प्रारंभ करें" : "Ready for a Preliminary Assessment"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                  {language === "hi"
                    ? "जेमिनी एआई पत्ती के फफूंद, कीड़े, धब्बे और पोषक तत्वों की कमी की जांच करेगा।"
                    : "AI will assess visible leaf symptoms and suggest possible causes, not a confirmed diagnosis."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  id="start-diagnosis-btn"
                  onClick={onStartDiagnosis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/15 flex items-center space-x-2 transition-all transform active:scale-95 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{language === "hi" ? "निदान शुरू करें" : "Assess Leaf Health"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isAnalyzing}
                  className="px-4 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  {language === "hi" ? "दूसरी तस्वीर चुनें" : "Change Photo"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Dropzone & Browse Button */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-emerald-500 bg-emerald-50/70 scale-[0.99]"
                : "border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/30"
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <UploadCloud className="w-8 h-8 text-emerald-700" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 mb-1 font-['Outfit',sans-serif]">
              {t.uploadTitle}
            </h3>
            <p className="text-sm text-stone-700 max-w-md mx-auto mb-5 leading-relaxed">
              {t.uploadDesc}
            </p>

            <button
              type="button"
              id="choose-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/15 inline-flex items-center space-x-2 transition-all transform active:scale-95 whitespace-nowrap"
            >
              <FileImage className="w-4 h-4 text-emerald-200" />
              <span>{t.uploadButton}</span>
            </button>

            <p className="text-xs text-stone-700 mt-4">
              {t.supportedFormats}
            </p>

            {/* Note: File upload only, no live camera feature as instructed */}
            <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] text-stone-700 bg-stone-100/70 px-3 py-1 rounded-full border border-stone-200">
              <CameraOff className="w-3 h-3 text-stone-700" />
              <span>
                {language === "hi"
                  ? "डिवाइस से फ़ाइल अपलोड समर्थित (लाइव कैमरा बंद है)"
                  : "Device photo file upload supported (no live camera)"}
              </span>
            </div>
          </div>
        )}

        {/* Farmer Photo Tips */}
        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {language === "hi"
                ? "प्राकृतिक रोशनी में पत्ती के धब्बों की साफ़ फोटो लें"
                : "Capture in good natural daylight with clear focus on spots"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === "hi"
                ? "एक समय में एक पत्ती का स्पष्ट फोटो अपलोड करें"
                : "Upload a single leaf photo showing top and margins"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Tap Samples for Instant Testing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
            {t.trySamples}
          </h4>
          <span className="text-xs text-stone-700 font-medium">
            {language === "hi" ? "1-क्लिक परीक्षण" : "1-Click Quick Test"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_LEAVES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              id={`sample-${sample.id}`}
              onClick={() => onSampleSelected(sample)}
              disabled={isAnalyzing}
              className="text-left rounded-2xl bg-white/80 hover:bg-white border border-stone-200 p-2.5 transition-all hover:shadow-md hover:border-emerald-300 group flex flex-col justify-between"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-stone-100">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 line-clamp-1 group-hover:text-emerald-700">
                  {sample.title}
                </p>
                <p className="text-[10px] text-stone-700 line-clamp-1">
                  {sample.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
