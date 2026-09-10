import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';

interface CartDrawerProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { isCartOpen, closeCart, quantity, updateQuantity, removeItem, subtotal, savings } = useCart();
  const { product, images } = useStore();

  if (!isCartOpen) return null;

  const mainImg = images.find((i) => i.isMain)?.url || images[0]?.url || '/images/hero.jpg';
  const unitPrice = product?.price || 29.99;
  const originalPrice = product?.originalPrice || 49.99;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300 text-stone-900">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#2A4B3C]" />
              <h2 className="font-display text-lg font-normal text-stone-900">Your Cart</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {quantity > 0 ? (
              <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#FAF8F5] overflow-hidden flex-shrink-0 border border-stone-200 flex items-center justify-center">
                    <img
                      src={mainImg}
                      alt={product?.name || 'KitchEase Dispenser'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-stone-900">
                        {product?.name || 'KitchEase Oil Dispenser & Sprayer'}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-light">
                        2-in-1 Dual Action (470ml Borosilicate Glass)
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-sm text-stone-900">${unitPrice.toFixed(2)}</span>
                      <span className="text-xs text-stone-400 line-through font-light">${originalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity adjustments & delete */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50">
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-l-xl transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-r-xl transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block font-light">Subtotal</span>
                    <span className="font-bold text-sm text-stone-900">
                      ${(unitPrice * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={removeItem}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-lg font-normal text-stone-900">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto font-light">
                  Add the KitchEase 2-in-1 dispenser to your cart and start cooking simpler and cleaner today.
                </p>
                <button
                  onClick={() => {
                    updateQuantity(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2A4B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#213B2F] cursor-pointer shadow-sm"
                >
                  Add 1 Dispenser ($29.99)
                </button>
              </div>
            )}

            {quantity > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                  <span>Free Tracked Shipping Qualified</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 font-light">
                  Complimentary domestic express delivery with shock-absorbing protective foam packaging.
                </p>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {quantity > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600 font-light">
                  <span>Items ({quantity})</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promotional Savings (40% OFF)</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 font-light">
                  <span>Domestic Tracked Shipping</span>
                  <span className="font-semibold text-emerald-700 uppercase text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-base font-medium text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span className="text-[#2A4B3C] font-bold">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={() => {
                  closeCart();
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
