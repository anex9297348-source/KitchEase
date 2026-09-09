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
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151515] shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300 text-[#EAEAEA]">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-display text-lg font-normal text-[#EAEAEA]">Your Culinary Cart</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {quantity > 0 ? (
              <div className="bg-[#1E1E1E] rounded-2xl p-4 border border-white/10 shadow-lg space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#121212] overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                    <img
                      src={mainImg}
                      alt={product?.name || 'KitchEase Dispenser'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-[#EAEAEA]">
                        {product?.name || 'KitchEase Oil Dispenser / Sprayer'}
                      </h3>
                      <p className="text-[11px] text-white/50 mt-0.5 font-light">
                        2-in-1 Dual Action (470ml Glass Carafe)
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-semibold text-sm text-[#EAEAEA]">${unitPrice.toFixed(2)}</span>
                      <span className="text-xs text-white/30 line-through font-light">${originalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity adjustments & delete */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center border border-white/15 rounded-md bg-[#151515]">
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="p-1.5 text-white/60 hover:bg-white/10 rounded-l transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="p-1.5 text-white/60 hover:bg-white/10 rounded-r transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-white/40 block font-light">Item Total</span>
                    <span className="font-semibold text-sm text-[#EAEAEA]">
                      ${(unitPrice * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={removeItem}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-lg font-normal text-[#EAEAEA]">Your cart is empty</h3>
                <p className="text-xs text-white/50 max-w-xs mx-auto font-light">
                  Add the KitchEase 2-in-1 dispenser to your cart and start cooking smarter today.
                </p>
                <button
                  onClick={() => {
                    updateQuantity(1);
                  }}
                  className="px-5 py-2.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer"
                >
                  Add 1 Dispenser ($29.99)
                </button>
              </div>
            )}

            {quantity > 0 && (
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 space-y-2 text-xs text-[#D4AF37]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free Express Shipping Applied</span>
                </div>
                <p className="text-[11px] text-white/60 font-light">
                  Your order qualifies for complimentary tracked delivery and 30-day money-back guarantee.
                </p>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {quantity > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#181818] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/60 font-light">
                  <span>Subtotal ({quantity} {quantity === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-[#D4AF37] font-medium">
                    <span>Promotional Savings (40% OFF)</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 font-light">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#D4AF37]">FREE</span>
                </div>
                <div className="flex justify-between text-base font-medium text-[#EAEAEA] pt-2 border-t border-white/10">
                  <span>Total Amount</span>
                  <span className="text-[#D4AF37] font-semibold">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={() => {
                  closeCart();
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
