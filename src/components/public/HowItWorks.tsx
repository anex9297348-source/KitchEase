import React from 'react';
import { Check } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      stepLabel: 'STEP 1 — FILL',
      title: 'Add your preferred cooking oil.',
      description:
        'Unscrew the wide-mouth dispenser and pour in your chosen oil—olive, avocado, canola, or sesame. The generous opening prevents drips without needing a funnel.',
      image: '/images/pour.jpg',
      alt: 'Pouring oil into wide-mouth KitchEase dispenser bottle',
      highlight: 'Wide opening, zero funnel mess',
    },
    {
      stepLabel: 'STEP 2 — CLOSE',
      title: 'Secure the bottle properly.',
      description:
        'Twist the ergonomic lid clockwise until firmly seated to engage the food-grade airtight silicone seal. This preserves oil freshness and guarantees leak-proof cooking.',
      image: '/images/hero.jpg',
      alt: 'Securing top lid on KitchEase glass bottle',
      highlight: 'Airtight leak-proof seal',
    },
    {
      stepLabel: 'STEP 3 — USE',
      title: 'Spray or pour according to your cooking needs.',
      description:
        'Depress the top lever with a quick, firm motion for a broad, uniform mist cloud, or simply tilt the bottle over your pan for a steady, drip-free culinary pour.',
      image: '/images/oil_spray_action_1788685889614.jpg',
      alt: 'Spraying or pouring oil onto cooking pan',
      highlight: 'Seamless dual-action choice',
    },
    {
      stepLabel: 'STEP 4 — CLEAN',
      title: 'Clean the bottle and nozzle regularly.',
      description:
        'Disassemble the bottle in seconds. Rinse with warm soapy water and use the included custom bottle brush. Flush warm water through the pump to keep the nozzle pristine.',
      image: '/images/accessories.jpg',
      alt: 'KitchEase cleaning brush and maintenance kit',
      highlight: 'Custom bottle brushes included',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Simple Operation</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            Designed for intuitive, clean, and reliable performance every time you step into the kitchen.
          </p>
        </div>

        {/* 4-Step Cards with Image beside/above each step */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-stone-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Step Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-50 border border-stone-100 mb-5">
                  <img
                    src={step.image}
                    alt={step.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-[#2A4B3C] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    0{idx + 1}
                  </span>
                </div>

                {/* Step Label (STEP 1 — FILL, etc.) */}
                <span className="text-xs font-bold text-[#2A4B3C] tracking-widest uppercase block">
                  {step.stepLabel}
                </span>

                {/* Step Title (exact requested copy) */}
                <h3 className="font-display text-lg font-normal text-stone-900 mt-1 mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs font-medium text-[#2A4B3C]">
                <Check className="w-3.5 h-3.5" />
                <span>{step.highlight}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
