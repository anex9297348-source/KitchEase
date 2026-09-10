import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

interface FinalCTAProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigate }) => {
  const { product } = useStore();
  const price = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-[#2A4B3C] text-white p-8 sm:p-14 lg:p-16 text-center shadow-xl relative overflow-hidden">
          
          {/* Subtle decorative background graphic */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            {/* Tag */}
            <span className="inline-block text-xs uppercase tracking-[0.25em] font-semibold text-amber-200">
              Transform Your Everyday Kitchen
            </span>

            {/* Headline (exact requested copy) */}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
              Make Everyday Cooking Easier.
            </h2>

            {/* Supporting text (exact requested copy) */}
            <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed">
              Bring simple oil control into your kitchen with KitchEase.
            </p>

            {/* Price Pill */}
            <div className="inline-flex items-baseline gap-3 px-5 py-2 rounded-full bg-black/20 backdrop-blur-xs border border-white/10">
              <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                ${price.toFixed(2)}
              </span>
              {originalPrice > price && (
                <span className="text-base text-white/50 line-through font-light">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider ml-1">
                Free Shipping
              </span>
            </div>

            {/* Action Button: BUY NOW (exact requested button label) */}
            <div className="pt-2">
              <button
                id="final-cta-buynow-btn"
                onClick={() => onNavigate('checkout')}
                className="px-10 py-4 rounded-xl bg-white text-[#2A4B3C] hover:bg-stone-100 font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-98 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/80 font-light">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-200" />
                Free Tracked Delivery
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-200" />
                30-Day Money-Back Guarantee
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                1-Year Warranty
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
