import React from 'react';
import { ChefHat, Sliders, Sparkles, ShoppingCart, Check } from 'lucide-react';

export const WhyKitchEase: React.FC = () => {
  const cards = [
    {
      icon: ChefHat,
      title: 'Designed for Everyday Cooking',
      description:
        'Crafted specifically for routine home meals—from crisping air-fried vegetables and pan-searing proteins to lightly misting baking sheets and fresh salads.',
      truthFact: 'Real utility across stovetops, air fryers, and grills',
    },
    {
      icon: Sliders,
      title: 'Simple to Use',
      description:
        'No batteries, no charging cords, and no complex assembly. Fill with your preferred cooking oil and either press for mist or tilt for a smooth pour.',
      truthFact: 'Purely mechanical pneumatic and gravity action',
    },
    {
      icon: Sparkles,
      title: 'Practical Kitchen Design',
      description:
        'Clear borosilicate glass shows remaining volume at a glance, with a wide-mouth carafe for spill-free refilling and an anti-drip rim to protect your counters.',
      truthFact: 'Thermal-resistant glass and food-safe components',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Ordering',
      description:
        'Streamlined, distraction-free checkout with free tracked domestic shipping, immediate receipt dispatch, and a 30-day money-back satisfaction policy.',
      truthFact: 'Fast 2-4 business day tracked delivery',
    },
  ];

  return (
    <section id="why-kitchease" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Built on Trust &amp; Utility</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            Why KitchEase
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            We focus strictly on practical design, honest craftsmanship, and a dependable customer experience.
          </p>
        </div>

        {/* 4 Trust Cards (exact requested card titles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-stone-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-[#2A4B3C] group-hover:bg-[#2A4B3C] group-hover:text-white transition-colors mb-5">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-display text-xl font-normal text-stone-900 mb-3">
                    {card.title}
                  </h3>

                  <p className="text-stone-600 text-sm leading-relaxed font-light mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-[#2A4B3C] font-medium">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{card.truthFact}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
