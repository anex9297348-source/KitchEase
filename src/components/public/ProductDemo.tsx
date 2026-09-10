import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoStep {
  id: string;
  stepName: string;
  label: string;
  description: string;
  image: string;
  tip: string;
}

export const ProductDemo: React.FC = () => {
  const steps: DemoStep[] = [
    {
      id: 'fill',
      stepName: 'FILL',
      label: '1. Fill the Glass Carafe',
      description: 'Twist open the wide-mouth bottle and pour in up to 470ml of your preferred culinary oil. No funnel required.',
      image: '/images/pour.jpg',
      tip: 'Works with olive, avocado, canola, and sesame oils.',
    },
    {
      id: 'close',
      stepName: 'CLOSE',
      label: '2. Secure the Top Seal',
      description: 'Fasten the top ergonomic lid clockwise until firmly seated against the leak-proof food-grade silicone gasket.',
      image: '/images/accessories.jpg',
      tip: 'Silicone seal prevents drips and preserves freshness.',
    },
    {
      id: 'action',
      stepName: 'SPRAY / POUR',
      label: '3. Spray or Pour on Demand',
      description: 'Depress the top lever briskly for an atomized mist cloud, or simply tilt the bottle over your pan for a controlled gravity pour.',
      image: '/images/oil_spray_action_1788685889614.jpg',
      tip: 'Dual mechanical channels require no battery or aerosols.',
    },
    {
      id: 'cook',
      stepName: 'COOK',
      label: '4. Enjoy Smarter Cooking',
      description: 'Evenly coat hot skillets, air fryer baskets, roasted vegetables, and fresh salads with precision control.',
      image: '/images/kitchen.jpg',
      tip: 'Even coverage helps you use just the right amount of oil.',
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Auto-advance loop when "playing"
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % steps.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const currentStep = steps[activeStepIndex];

  return (
    <section id="product-demo" className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Demonstration</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            See How KitchEase Works
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            A simple, intuitive four-stage flow designed for effortless everyday meal preparation.
          </p>
        </div>

        {/* Structure Stepper Navigation (FILL → CLOSE → SPRAY/POUR → COOK) */}
        <div className="flex items-center justify-center max-w-3xl mx-auto mb-8 px-2">
          <div className="grid grid-cols-4 w-full gap-2 sm:gap-4">
            {steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStepIndex(idx);
                  }}
                  className={`py-3 px-2 sm:px-4 rounded-xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2A4B3C] text-white border-[#2A4B3C] shadow-sm'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80">
                    Stage {idx + 1}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold truncate mt-0.5">
                    {step.stepName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Polished Interactive Video Demonstration Area */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#FAF8F5] border border-stone-200 p-4 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Visual Screen / Video Player Stage */}
            <div className="md:col-span-7 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900 border border-stone-300/60 shadow-inner group">
              <img
                src={currentStep.image}
                alt={currentStep.label}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700"
              />

              {/* Video Overlay Tint & Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-5">
                {/* Top Bar: Badge & Mute simulation */}
                <div className="flex items-center justify-between">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                    Step {activeStepIndex + 1} of 4: {currentStep.stepName}
                  </span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Center: Play/Pause Button */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-white/90 text-stone-900 hover:bg-white hover:scale-105 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    aria-label={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                </div>

                {/* Bottom Bar: Progress timeline & duration */}
                <div className="space-y-1.5">
                  <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2A4B3C] h-full transition-all duration-300"
                      style={{ width: `${((activeStepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/80">
                    <span>{isPlaying ? 'Auto-Demonstration Playing' : 'Click Play or Select Stage'}</span>
                    <span>0:0{activeStepIndex + 1} / 0:04</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Step Description & Practical Tip */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs uppercase tracking-wider font-bold text-[#2A4B3C]">
                Stage {activeStepIndex + 1}
              </span>
              <h3 className="font-display text-2xl font-normal text-stone-900">
                {currentStep.label}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-light">
                {currentStep.description}
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-semibold text-stone-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2A4B3C]" />
                  Pro Tip:
                </span>
                <p className="text-stone-500 font-light">{currentStep.tip}</p>
              </div>

              {/* Step selector controls */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setActiveStepIndex((prev) => (prev - 1 + steps.length) % steps.length)}
                  className="px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  &larr; Previous
                </button>
                <button
                  onClick={() => setActiveStepIndex((prev) => (prev + 1) % steps.length)}
                  className="px-3 py-2 rounded-lg bg-[#2A4B3C] text-white text-xs font-semibold hover:bg-[#213B2F] cursor-pointer"
                >
                  Next Stage &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
