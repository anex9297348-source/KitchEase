import React, { useState } from 'react';
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface ProductDetailsProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onNavigate }) => {
  const { product, images, reviews } = useStore();
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [addedNotification, setAddedNotification] = useState<boolean>(false);

  const price = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;
  const discount = product?.discount || 40;

  // Genuine reviews only
  const approvedReviews = reviews.filter((r) => r.isApproved);
  const hasRealReviews = approvedReviews.length > 0;
  const avgRating = hasRealReviews
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : null;

  const currentImg = images[activeImageIndex] || images[0] || {
    url: '/images/hero.jpg',
    caption: 'KitchEase Oil Dispenser & Sprayer',
    alt: 'Product image',
  };

  const handleAddToCart = () => {
    addToCart(selectedQty);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(selectedQty);
    onNavigate('checkout');
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="product-showcase" className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
      {/* Invisible anchor for backward compatibility */}
      <span id="product-details" className="sr-only">Product Details</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Professional Product Gallery & Lightbox */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm overflow-hidden flex items-center justify-center group">
              <img
                src={currentImg.url}
                alt={currentImg.alt || 'KitchEase Oil Dispenser & Sprayer'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Genuine Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                  Save {discount}%
                </div>
              )}

              {/* Lightbox Zoom Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 text-stone-700 hover:text-stone-900 hover:bg-white shadow-sm transition-all cursor-pointer"
                title="View full image in zoom lightbox"
                aria-label="Enlarge image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Next/Prev overlay buttons for easy navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900 shadow-sm transition-all sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900 shadow-sm transition-all sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Caption pill */}
              {currentImg.caption && (
                <div className="absolute bottom-3 left-4 right-4 text-center">
                  <span className="inline-block bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] text-stone-600 font-medium border border-stone-200/60 truncate max-w-[90%]">
                    {currentImg.caption}
                  </span>
                </div>
              )}
            </div>

            {/* 5-7 Image Thumbnails with Active Ring */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF8F5] border-2 p-1 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#2A4B3C] shadow-sm ring-2 ring-[#2A4B3C]/20 scale-105'
                      : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                  aria-label={`Select product image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Product thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: E-commerce Product Details & Purchasing */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Authentic Rating */}
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2A4B3C]">
                Single-Product Store Edition
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-normal text-stone-900 mt-1 tracking-tight">
                {product?.name || 'KitchEase Oil Dispenser & Sprayer'}
              </h1>

              {/* Real reviews only */}
              {hasRealReviews && avgRating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800">{avgRating} out of 5</span>
                  <button
                    onClick={() => onNavigate('store', 'customer-reviews')}
                    className="text-xs text-stone-500 hover:text-[#2A4B3C] underline cursor-pointer"
                  >
                    ({approvedReviews.length} verified customer {approvedReviews.length === 1 ? 'review' : 'reviews'})
                  </button>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-display text-stone-900 font-bold">
                  ${price.toFixed(2)}
                </span>
                {originalPrice > price && (
                  <span className="text-xl text-stone-400 line-through font-light">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase">
                    Save {discount}%
                  </span>
                )}
              </div>

              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock &amp; Ready to Ship
              </span>
            </div>

            {/* Short Product Description */}
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
              {product?.description ||
                'The practical 2-in-1 kitchen oil dispenser engineered with food-grade thermal borosilicate glass and dual mechanical flow control. Effortlessly toggle between an ultra-fine atomized mist for air fryers and a controlled drizzle for pans.'}
            </p>

            {/* Key Benefits Bullet List */}
            <div className="space-y-2.5 py-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Key Benefits:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>Dual mode: fine spray &amp; smooth pour</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>Durable 470ml borosilicate glass</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>Wide mouth for spill-free refilling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>100% BPA-free, reusable &amp; eco-friendly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>Cleaning brush &amp; silicone basting brush included</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
                  <span>Zero aerosol or chemical propellants</span>
                </li>
              </ul>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-stone-800">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() => setSelectedQty(selectedQty + 1)}
                    className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  Total: <strong className="text-stone-800 font-semibold">${(price * selectedQty).toFixed(2)}</strong>
                </span>
              </div>

              {/* Buttons: Large BUY NOW & Add to Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  id="product-buynow-btn"
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-xl bg-[#2A4B3C] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>BUY NOW</span>
                </button>

                <button
                  id="product-addcart-btn"
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-xl border-2 border-stone-300 text-stone-800 hover:border-stone-400 hover:bg-stone-100 font-bold text-sm uppercase tracking-wider transition-all shadow-2xs active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#2A4B3C]" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Added Feedback Toast */}
              {addedNotification && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700" />
                    Added {selectedQty} item(s) to your cart!
                  </span>
                  <button
                    onClick={() => onNavigate('checkout')}
                    className="underline text-emerald-900 hover:text-emerald-700 font-bold"
                  >
                    Checkout Now &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center text-xs text-stone-600">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60">
                <Truck className="w-4 h-4 text-[#2A4B3C] mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">Free Shipping</span>
                <span className="text-[11px] text-stone-500">2-4 Business Days</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60">
                <RotateCcw className="w-4 h-4 text-[#2A4B3C] mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">30-Day Returns</span>
                <span className="text-[11px] text-stone-500">Money-Back Guarantee</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60">
                <ShieldCheck className="w-4 h-4 text-[#2A4B3C] mx-auto mb-1" />
                <span className="font-semibold block text-stone-800">1-Year Warranty</span>
                <span className="text-[11px] text-stone-500">Manufacturer Assured</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 transition-colors z-10 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Lightbox Image Viewport */}
            <div className="relative aspect-square max-h-[70vh] flex items-center justify-center">
              <img
                src={currentImg.url}
                alt={currentImg.alt || 'KitchEase Oil Dispenser detail zoom'}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-stone-800 hover:bg-white shadow-md cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-stone-800 hover:bg-white shadow-md cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption & Thumbnail bar */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
              <p className="font-medium text-center sm:text-left">{currentImg.caption}</p>
              <div className="flex gap-1.5">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border ${
                      activeImageIndex === idx ? 'border-[#2A4B3C] ring-1 ring-[#2A4B3C]' : 'border-stone-200 opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
