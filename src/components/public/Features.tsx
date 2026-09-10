import React from 'react';
import { Droplets, Sparkles, SlidersHorizontal, Utensils } from 'lucide-react';

export const Features: React.FC = () => {
  const benefits = [
    {
      icon: Droplets,
      title: 'Controlled Pouring',
      description: 'Use the amount you need with better control.',
      detail: 'The gravity-assisted valve delivers a steady, measured drizzle without dripping down the bottle.',
      tag: 'Pour',
    },
    {
      icon: Sparkles,
      title: 'Fine Spray',
      description: 'Spread oil more evenly when spraying is useful.',
      detail: 'Quick-press atomization creates an even micro-mist to coat pans, salads, and air fryers evenly.',
      tag: 'Spray',
    },
    {
      icon: SlidersHorizontal,
      title: 'Easy to Use',
      description: 'Simple design for everyday cooking.',
      detail: 'Comfortable ergonomic grip with single-hand operation. No complicated pumps, cords, or batteries.',
      tag: 'Simple',
    },
    {
      icon: Utensils,
      title: 'Multi-Purpose',
      description: 'Useful for cooking, baking, grilling and more.',
      detail: 'Compatible with all pure cooking oils—from olive and avocado to canola, sesame, and vegetable oils.',
      tag: 'Versatile',
    },
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200/80">
      {/* Anchor alias */}
      <span id="product-features" className="sr-only">Product Benefits</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Everyday Culinary Utility</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            Key Benefits
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            Thoughtful features designed to bring ease, control, and cleanliness to your everyday cooking.
          </p>
        </div>

        {/* 4 Elegant Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white p-7 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-stone-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-[#2A4B3C] group-hover:bg-[#2A4B3C] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/60">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Core Benefit Statement (exact requested copy) */}
                  <h3 className="font-display text-xl font-normal text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-stone-800 text-sm font-medium mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Practical Detail */}
                <p className="text-stone-500 text-xs leading-relaxed font-light pt-3 border-t border-stone-100">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
