import React, { useState } from 'react';
import { ShoppingBag, Check, Plus, Minus, Truck, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useCart } from '../../context/CartContext.tsx';

interface ProductDetailsProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onNavigate }) => {
  const { product, images } = useStore();
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedNotification, setAddedNotification] = useState<boolean>(false);

  const price = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;
  const discount = product?.discount || 40;
  const stock = product?.stock || 135;

  const currentImg = images[activeImageIndex] || images[0] || {
    url: '/images/hero.jpg',
    caption: 'KitchEase Oil Dispenser / Sprayer',
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

  return (
    <section id="product-details" className="py-16 sm:py-24 bg-[#0F0F0F] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Product Imagery Viewport */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-[#151515] rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
              <img
                src={currentImg.url}
                alt={currentImg.alt || 'KitchEase Oil Dispenser'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider shadow-md">
                Save {discount}% Today
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-5 gap-2.5">
              {images.slice(0, 5).map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-[#151515] border p-1 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/25'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Thumb ${idx}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information, Pricing, Quantity & Purchasing */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-8 bg-[#D4AF37]" />
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">
                  Authentic Kitchenware
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#EAEAEA] mt-1 tracking-tight">
                {product?.name || 'KitchEase Oil Dispenser / Sprayer'}
              </h2>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 p-4 rounded-xl bg-[#151515] border border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-display text-[#D4AF37] font-semibold">
                  ${price.toFixed(2)}
                </span>
                <span className="text-xl text-white/40 line-through font-light">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-sm border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                {discount}% OFF
              </span>
              <span className="text-xs text-white/50 ml-auto font-light">
                Free Worldwide Shipping
              </span>
            </div>

            {/* Description */}
            <p className="text-white/65 text-sm sm:text-base leading-relaxed font-light">
              {product?.description}
            </p>

            {/* Stock Notification */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#D4AF37] bg-[#1A1A1A] px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
              <span>
                High Demand: Only <strong className="text-white font-bold">{stock} units</strong> remaining at this special promotional price.
              </span>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Quantity:
                </span>
                <div className="flex items-center border border-white/20 bg-[#151515] rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setSelectedQty((prev) => Math.max(1, prev - 1))}
                    className="p-2.5 text-white/70 hover:bg-white/10 hover:text-[#D4AF37] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() => setSelectedQty((prev) => Math.min(20, prev + 1))}
                    className="p-2.5 text-white/70 hover:bg-white/10 hover:text-[#D4AF37] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-white/50">
                  Subtotal: <strong className="text-[#D4AF37]">${(price * selectedQty).toFixed(2)}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="product-add-cart-btn"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-md bg-white/5 border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>{addedNotification ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                <button
                  id="product-buynow-btn"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-black" />
                  <span>Instant Checkout</span>
                </button>
              </div>

              {addedNotification && (
                <div className="p-3 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>{selectedQty} item(s) added to cart. Free shipping applied!</span>
                </div>
              )}
            </div>

            {/* Product Specifications Grid */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product?.specifications &&
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-white/50 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-white/90 mt-0.5">{val}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-white/60">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
                <Truck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>2-4 Day Tracked Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
                <RefreshCw className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
