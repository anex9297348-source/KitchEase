import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface HeroProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { product, images } = useStore();
  const { addToCart } = useCart();

  const heroImage = images.find((img) => img.isMain)?.url || '/images/hero.jpg';
  const price = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;
  const discount = product?.discount || 40;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-[#0F0F0F]">
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#2A2A2A] to-[#121212] rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Tagline Badge with Gold Accent Line */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#D4AF37]" />
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">
                Professional Series &bull; 2-in-1 Essential
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#EAEAEA] tracking-tight leading-[1.08]">
              Smarter Oil. <br />
              <span className="italic text-[#F5F5DC]">Better Cooking.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed font-light">
              Control every drop with the KitchEase dual-action dispenser. Seamlessly switch between micro-fine atomized misting and a smooth, drip-free culinary pour.
            </p>

            {/* Price block & discount badge */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-display text-[#D4AF37] font-semibold tracking-tight">
                  ${price.toFixed(2)}
                </span>
                <span className="text-lg sm:text-xl text-white/40 line-through font-light">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                Save {discount}%
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 pl-2 border-l border-white/10">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  ))}
                </div>
                <span className="font-semibold text-white/90 ml-1">4.9 / 5</span>
                <span className="text-white/40">(340+ Reviews)</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-buynow-btn"
                onClick={() => onNavigate('checkout')}
                className="px-7 py-3.5 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-all shadow-lg active:scale-98 flex items-center gap-2 cursor-pointer"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-addcart-btn"
                onClick={() => addToCart(1)}
                className="px-6 py-3.5 rounded-md border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] font-medium text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('product-details');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-3.5 text-xs text-white/50 font-medium hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                View Product Details &darr;
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-light text-white/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Easy to Use</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Reusable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Food Grade</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Product Image Presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product Frame Card */}
              <div className="relative bg-[#151515] rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 overflow-hidden group">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] flex items-center justify-center">
                  <img
                    src={heroImage}
                    alt="KitchEase 2-in-1 Oil Dispenser & Sprayer"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Floating Action Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#1E1E1E]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">Patented Dual Valve</p>
                      <p className="text-xs font-semibold text-[#EAEAEA]">Spray Atomizer &amp; Pour Spout</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                  </div>
                </div>

                {/* Sub-features snippet below hero image */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] uppercase text-white/50 font-medium tracking-wider">Material</span>
                    <span className="font-semibold text-[#EAEAEA]">Borosilicate Glass</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] uppercase text-white/50 font-medium tracking-wider">Capacity</span>
                    <span className="font-semibold text-[#EAEAEA]">470 ml / 16 oz</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
