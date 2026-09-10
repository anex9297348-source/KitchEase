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
  CheckCircle2,
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
    <section id="product-gallery" className="py-20 sm:py-28 bg-[#FAF8F5] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2A4B3C]/10 text-[#2A4B3C] text-xs font-bold uppercase tracking-widest mb-3">
            <span>Authentic Photography</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            Designed for Culinary Perfection
          </h2>
          <p className="mt-4 text-stone-600 text-base leading-relaxed font-light">
            Examine every angle, component, and culinary application of the authentic KitchEase 2-in-1 dispenser.
          </p>
        </div>

        {/* Main Gallery Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Main Stage Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm group">
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
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-102'
                    }`}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Nav Buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-md text-stone-800 hover:bg-[#2A4B3C] hover:text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Previous product image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-md text-stone-800 hover:bg-[#2A4B3C] hover:text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
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
                  className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-stone-200 text-stone-700 hover:text-[#2A4B3C] hover:border-[#2A4B3C] shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4 text-[#2A4B3C]" />}
                  <span className="hidden sm:inline font-medium">{isZoomed ? 'Reset' : 'Zoom'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-stone-200 text-stone-700 hover:text-[#2A4B3C] hover:border-[#2A4B3C] shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Open Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4 text-[#2A4B3C]" />
                  <span className="hidden sm:inline font-medium">Fullscreen</span>
                </button>
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-200/90 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-800">
                  <Info className="w-4 h-4 text-[#2A4B3C] flex-shrink-0" />
                  <span className="font-medium line-clamp-1">{currentImage.caption}</span>
                </div>
                <span className="text-xs font-semibold text-[#2A4B3C] whitespace-nowrap bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-md">
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
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border transition-all p-1.5 cursor-pointer ${
                    selectedIndex === idx
                      ? 'border-[#2A4B3C] ring-2 ring-[#2A4B3C]/30 shadow-md scale-102'
                      : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Product thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  {img.isMain && (
                    <span className="absolute bottom-1 right-1 bg-[#2A4B3C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Feature Guide (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-5">
              <h3 className="font-display text-xl font-normal text-stone-900">
                Key Visual Highlights
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                Notice the precision engineering demonstrated in these real product images:
              </p>

              <div className="space-y-3.5 text-xs text-stone-700">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-[#2A4B3C]" />
                    <span>Heavy-Duty Borosilicate Glass</span>
                  </div>
                  <p className="text-stone-500 text-[11px] font-light leading-relaxed pl-6">
                    Clear, thermal-shock resistant cylinder that will not leach odors or micro-plastics into premium oils.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-[#2A4B3C]" />
                    <span>Sealed Dual-Port Nozzle Head</span>
                  </div>
                  <p className="text-stone-500 text-[11px] font-light leading-relaxed pl-6">
                    Unique dual-action spout isolates the fine atomizer from the drip-free pouring chute to prevent clogging.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-[#2A4B3C]" />
                    <span>Ergonomic Press Trigger</span>
                  </div>
                  <p className="text-stone-500 text-[11px] font-light leading-relaxed pl-6">
                    Contoured for thumb or forefinger actuation, generating optimal pressure with a swift single click.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-[#2A4B3C]" />
                    <span>Full Maintenance Kit Included</span>
                  </div>
                  <p className="text-stone-500 text-[11px] font-light leading-relaxed pl-6">
                    Every order includes soft-bristle cylinder cleaning tools and a silicone basting brush for complete kitchen versatility.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden bg-stone-900/60 rounded-3xl border border-stone-700/60 p-4">
              <img
                src={currentImage.url}
                alt={currentImage.alt || currentImage.caption}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Caption & Navigation in Lightbox */}
            <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white px-2">
              <p className="text-sm font-medium text-stone-200 text-center sm:text-left">
                {currentImage.caption}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs text-stone-400 font-mono">
                  {selectedIndex + 1} / {activeImages.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGallery;
