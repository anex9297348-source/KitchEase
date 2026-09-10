import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface HeroProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { product, images, reviews } = useStore();
  const { addToCart } = useCart();

  const heroImage = images.find((img) => img.isMain)?.url || images[0]?.url || '/images/hero.jpg';
  const price = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;
  const discount = product?.discount || 40;

  // Real review average only if reviews exist
  const approvedReviews = reviews.filter((r) => r.isApproved);
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : null;

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-20 lg:pb-28 bg-[#FAF8F5] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Subtle Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/90 text-stone-700 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#2A4B3C]" />
              <span>Original 2-in-1 Oil Bottle</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-900 tracking-tight leading-[1.12]">
              Cook Smarter. <br />
              <span className="italic text-[#2A4B3C]">Use Less Oil.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-light">
              One smart bottle for controlled pouring and easy spraying—designed to make everyday cooking simpler.
            </p>

            {/* Price & Savings Pill */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-display text-stone-900 font-bold tracking-tight">
                  ${price.toFixed(2)}
                </span>
                {originalPrice > price && (
                  <span className="text-lg sm:text-xl text-stone-400 line-through font-light">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {discount > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  Save {discount}%
                </span>
              )}

              <span className="text-xs text-stone-500 font-medium hidden sm:inline-block">
                Free standard shipping
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-buynow-btn"
                onClick={() => onNavigate('checkout')}
                className="px-8 py-4 rounded-xl bg-[#2A4B3C] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer min-w-[160px]"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-addcart-btn"
                onClick={() => addToCart(1)}
                className="px-6 py-4 rounded-xl border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-100 font-semibold text-sm transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-stone-600" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Small Trust Line */}
            <div className="pt-1 flex items-center gap-2 text-xs text-stone-500 font-medium tracking-wide">
              <span>Simple</span>
              <span className="text-stone-300">•</span>
              <span>Practical</span>
              <span className="text-stone-300">•</span>
              <span>Made for Everyday Cooking</span>
            </div>

            {/* Key Quick Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2A4B3C] flex-shrink-0" />
                <span>Borosilicate glass</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2A4B3C] flex-shrink-0" />
                <span>Dual spray & pour</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2A4B3C] flex-shrink-0" />
                <span>BPA-free & reusable</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: High Quality Product Presentation Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-3xl bg-white p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-stone-200/80">
              {/* Product Visual Container */}
              <div className="relative aspect-[4/3] sm:aspect-[1/1] max-h-[500px] w-full rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center group">
                <img
                  src={heroImage}
                  alt="KitchEase 2-in-1 Oil Dispenser and Sprayer with clear borosilicate glass bottle"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                />

                {/* Floating Feature Tags */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl px-3 py-2 shadow-sm text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    Dual Function
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Spray Mist &amp; Drip-Free Pour
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl px-3 py-2 shadow-sm text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    Food Grade
                  </span>
                  <span className="text-xs font-bold text-[#2A4B3C]">
                    470ml Borosilicate Glass
                  </span>
                </div>
              </div>

              {/* Quick thumb switcher preview below hero */}
              <div className="mt-4 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                  30-Day Money-Back Guarantee
                </span>
                <button
                  onClick={() => onNavigate('store', 'product-showcase')}
                  className="text-[#2A4B3C] font-semibold hover:underline cursor-pointer"
                >
                  View full specs &rarr;
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
