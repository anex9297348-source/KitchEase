import React from 'react';
import {
  Droplet,
  Wind,
  RotateCcw,
  Sparkles,
  Layers,
  ChefHat,
  Maximize,
  ShieldCheck,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: Droplet,
      title: 'Controlled Oil Dispensing',
      description:
        'Engineered gravity-flow spout pours a consistent, measured stream without messy drips down the glass neck.',
    },
    {
      icon: Wind,
      title: 'Fine Oil Spray Mist',
      description:
        'Pneumatic micro-atomizing pump creates a wide, ultra-fine mist for even pans and salads without chemical aerosols.',
    },
    {
      icon: RotateCcw,
      title: 'Easy Refilling',
      description:
        'Generous wide-mouth carafe allows pouring oils directly from large containers with zero funnel required.',
    },
    {
      icon: Layers,
      title: 'Reusable Eco Design',
      description:
        'Eliminates single-use non-recyclable propellant cans, saving money and reducing environmental kitchen waste.',
    },
    {
      icon: Sparkles,
      title: 'Easy Cleaning',
      description:
        'All parts twist apart smoothly. The included long bottle brush and silicone basting brush make maintenance effortless.',
    },
    {
      icon: ShieldCheck,
      title: 'Kitchen Friendly Glass',
      description:
        'Crafted with thermal-shock resistant borosilicate glass and BPA-free food-grade contact polymers.',
    },
    {
      icon: Maximize,
      title: 'Compact Ergonomic Grip',
      description:
        'Sturdy handle with thumb-lever lets you spray or pour comfortably with one hand while cooking over hot pans.',
    },
    {
      icon: ChefHat,
      title: 'Multiple Cooking Uses',
      description:
        'Perfect for air fryers, skillet searing, roasting vegetables, dressing salads, grilling, and delicate baking pans.',
    },
  ];

  return (
    <section id="product-features" className="py-16 sm:py-24 bg-[#0F0F0F] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
              Engineered Excellence
            </span>
            <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#EAEAEA] mt-2 tracking-tight">
            Designed for the Modern Kitchen
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed font-light">
            Every millimeter of the KitchEase dispenser is tailored for precision, health, and everyday culinary enjoyment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#151515] border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A] transition-all group shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-normal text-[#EAEAEA] group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
