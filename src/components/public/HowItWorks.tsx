import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Fill with Your Favorite Oil',
      subtitle: 'STEP 1: FILL',
      description:
        'Unscrew the wide-mouth lid and pour up to 470ml of olive, avocado, or sesame oil directly into the glass carafe.',
      image: '/images/pour.jpg',
      highlight: 'Wide opening, zero funnel mess',
    },
    {
      number: '02',
      title: 'Secure the Hermetic Seal',
      subtitle: 'STEP 2: CLOSE',
      description:
        'Twist the ergonomic pump lid clockwise until snug. The internal silicone seal locks in freshness and creates airtight pressure.',
      image: '/images/hero.jpg',
      highlight: 'Airtight leak-proof gasket',
    },
    {
      number: '03',
      title: 'Press the Ergonomic Lever',
      subtitle: 'STEP 3: PRESS / PUMP',
      description:
        'Place your thumb on the top button. A rapid, decisive push pressurizes the mechanical chamber instantly without batteries.',
      image: '/images/accessories.jpg',
      highlight: 'Smooth pneumatic piston',
    },
    {
      number: '04',
      title: 'Spray Mist or Pour Smoothly',
      subtitle: 'STEP 4: SPRAY OR DISPENSE',
      description:
        'Depress fully for an ultra-fine atomized mist, or simply tilt the carafe over your hot pan for a steady, drip-free pour.',
      image: '/images/spray.jpg',
      highlight: 'Instant dual-action choice',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#0F0F0F] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
              Effortless Simplicity
            </span>
            <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#EAEAEA] mt-2 tracking-tight">
            How It Works in 4 Easy Steps
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed font-light">
            From refilling to misting and pouring, KitchEase is intuitive and crafted for everyday cooking rhythm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#151515] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A] transition-all group"
            >
              <div>
                {/* Step Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-5">
                  <img
                    src={step.image}
                    alt={step.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#D4AF37] text-black text-xs font-bold px-2.5 py-1 rounded">
                    {step.number}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase block">
                  {step.subtitle}
                </span>
                <h3 className="font-display text-lg font-normal text-[#EAEAEA] mt-1">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-white/50 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37]">
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
