import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Info,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import type { ProductImage } from '../../types.ts';

export const ProductGallery: React.FC = () => {
  const { images } = useStore();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Fallback if images empty
  const activeImages: ProductImage[] = images.length > 0 ? images : [
    {
      id: 'img-1',
      url: '/images/hero.jpg',
      caption: 'KitchEase 2-in-1 Dispenser & Sprayer - Studio View',
      alt: 'KitchEase oil dispenser bottle with golden cooking oil and ergonomic lid',
      order: 1,
      isMain: true,
    },
    {
      id: 'img-2',
      url: '/images/spray.jpg',
      caption: 'Micro-Fine Atomized Spray - Press quickly for uniform healthy misting',
      alt: 'Hand spraying fine mist of oil onto fresh food ingredients',
      order: 2,
    },
    {
      id: 'img-3',
      url: '/images/pour.jpg',
      caption: 'Controlled Drip-Free Pour - Tilt to drizzle steady oil into hot pans',
      alt: 'Tilting KitchEase dispenser to pour golden oil smoothly into a hot skillet',
      order: 3,
    },
    {
      id: 'img-4',
      url: '/images/accessories.jpg',
      caption: 'Full Culinary Kit - Dispenser, cleaning brushes, basting brush & gift box',
      alt: 'KitchEase dispenser shown with bottle cleaning brushes and packaging',
      order: 4,
    },
    {
      id: 'img-5',
      url: '/images/kitchen.jpg',
      caption: 'Modern Kitchen Lifestyle - Elegant countertop addition',
      alt: 'KitchEase dispenser resting on kitchen marble counter',
      order: 5,
    },
  ];

  const currentImage = activeImages[selectedIndex] || activeImages[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === activeImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  return (
    <section id="product-gallery" className="py-16 sm:py-24 bg-[#0F0F0F] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
              Interactive Visual Gallery
            </span>
            <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#EAEAEA] tracking-tight">
            Designed for Culinary Perfection
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed font-light">
            Examine every angle, component, and culinary application of the authentic KitchEase 2-in-1 dispenser.
          </p>
        </div>

        {/* Main Gallery Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Stage Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-[#151515] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              {/* Main Image with Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage.id + (isZoomed ? '-zoomed' : '')}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex items-center justify-center cursor-zoom-in overflow-hidden"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || currentImage.caption}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
                    }`}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Nav Buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 shadow-xl text-white hover:bg-[#D4AF37] hover:text-black flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous product image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 shadow-xl text-white hover:bg-[#D4AF37] hover:text-black flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Next product image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Zoom & Fullscreen Controls Top-Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}
                  className="p-2.5 rounded-lg bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 text-white/90 hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4 text-[#D4AF37]" />}
                  <span className="hidden sm:inline font-medium">{isZoomed ? 'Reset' : 'Zoom'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="p-2.5 rounded-lg bg-[#1E1E1E]/90 backdrop-blur-md border border-white/10 text-white/90 hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Open Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden sm:inline font-medium">Fullscreen</span>
                </button>
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#1E1E1E]/95 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="font-medium line-clamp-1">{currentImage.caption}</span>
                </div>
                <span className="text-xs font-semibold text-[#D4AF37] whitespace-nowrap bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                  {selectedIndex + 1} / {activeImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {activeImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#151515] border transition-all p-1.5 cursor-pointer ${
                    selectedIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-md scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Product thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  {img.isMain && (
                    <span className="absolute bottom-1 right-1 bg-[#D4AF37] text-black text-[9px] font-bold px-1 rounded">
                      Main
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Feature Guide (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#151515] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
              <h3 className="font-display text-xl font-normal text-[#EAEAEA]">
                Key Visual Highlights
              </h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Notice the precision engineering demonstrated in these real product images:
              </p>

              <div className="space-y-3 text-xs text-white/80">
                <div
                  onClick={() => setSelectedIndex(0)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-[#D4AF37]/50 transition-colors flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-[#D4AF37] text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Ergonomic Handle &amp; Lever</h4>
                    <p className="text-white/50 mt-0.5 font-light">
                      Balanced center of gravity for one-hand operation without wrist strain.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedIndex(1 % activeImages.length)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-[#D4AF37]/50 transition-colors flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-[#D4AF37] text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Micro-Fine Atomizing Nozzle</h4>
                    <p className="text-white/50 mt-0.5 font-light">
                      Quick press produces a wide, fan-shaped mist cloud without chemical propellants.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedIndex(2 % activeImages.length)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-[#D4AF37]/50 transition-colors flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-[#D4AF37] text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Drip-Free Pouring Spout</h4>
                    <p className="text-white/50 mt-0.5 font-light">
                      Tilt to dispense a steady culinary drizzle; no messy drips down the glass side.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedIndex(3 % activeImages.length)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-[#D4AF37]/50 transition-colors flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-[#D4AF37] text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Included Maintenance Kit</h4>
                    <p className="text-white/50 mt-0.5 font-light">
                      Comes with long bottle cleaning brush, silicone basting brush, and retail packaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Close Fullscreen View"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt || currentImage.caption}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white text-sm text-center font-medium max-w-xl px-4">
              {currentImage.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
