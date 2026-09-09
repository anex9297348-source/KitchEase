import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const UserManualSection: React.FC = () => {
  const { manual } = useStore();
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = manual?.steps || [];
  const dos = manual?.dos || [];
  const donts = manual?.donts || [];
  const cleaning = manual?.cleaningInstructions || [];
  const care = manual?.careInstructions || [];

  return (
    <section id="user-manual" className="py-16 sm:py-24 bg-[#0F0F0F] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
              Official Guide &amp; Care
            </span>
            <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#EAEAEA] tracking-tight">
            Comprehensive User Manual
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed font-light">
            Simple, step-by-step instructions to ensure flawless misting, optimal longevity, and safe culinary operation.
          </p>
        </div>

        {/* 6 Steps Grid / Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Steps List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
              Operational Steps (1–6)
            </h3>
            {steps.map((st, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  activeStep === idx
                    ? 'bg-[#1E1E1E] border-[#D4AF37] shadow-lg'
                    : 'bg-[#151515] border-white/10 hover:bg-[#1A1A1A] hover:border-white/20'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    activeStep === idx
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {st.stepNumber}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-white">{st.title}</h4>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2 font-light">{st.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Active Step Showcase (7 cols) */}
          <div className="lg:col-span-7">
            {steps[activeStep] && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase rounded">
                    STEP {steps[activeStep].stepNumber} OF {steps.length}
                  </span>
                  <span className="text-xs text-white/40 font-light">
                    KitchEase Precision Manual
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#EAEAEA]">
                  {steps[activeStep].title}
                </h3>

                <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
                  {steps[activeStep].description}
                </p>

                {steps[activeStep].image && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/10">
                    <img
                      src={steps[activeStep].image}
                      alt={steps[activeStep].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DO's and DON'Ts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* DO's */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#121A15] border border-[#234A30] shadow-xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#234A30] flex items-center justify-center text-[#4ADE80]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-normal text-white">Recommended Do's</h3>
            </div>
            <ul className="space-y-3.5">
              {dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/80 font-light">
                  <CheckCircle className="w-4 h-4 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DON'Ts */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1313] border border-[#4A2020] shadow-xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#4A2020] flex items-center justify-center text-[#F87171]">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-normal text-white">Important Don'ts</h3>
            </div>
            <ul className="space-y-3.5">
              {donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/80 font-light">
                  <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cleaning & Care Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
            <h4 className="font-display text-lg font-normal text-[#EAEAEA] mb-4">
              Cleaning Instructions
            </h4>
            <ol className="space-y-3 text-xs sm:text-sm text-white/60 list-decimal list-inside leading-relaxed font-light">
              {cleaning.map((inst, idx) => (
                <li key={idx} className="pl-1">
                  <span>{inst}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
            <h4 className="font-display text-lg font-normal text-[#EAEAEA] mb-4">
              Storage &amp; Care Tips
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-white/60 list-disc list-inside leading-relaxed font-light">
              {care.map((tip, idx) => (
                <li key={idx} className="pl-1">
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
