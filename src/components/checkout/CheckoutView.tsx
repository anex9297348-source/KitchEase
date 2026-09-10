import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Plus,
  Minus,
  Lock,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Order } from '../../types.ts';

interface CheckoutViewProps {
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack, onOrderPlaced }) => {
  const { quantity, updateQuantity, subtotal, clearCart } = useCart();
  const { product, images } = useStore();
  const { user } = useAuth();

  // Form State - strictly collecting required fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.postalCode || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');

  // Promo code
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // Errors & Loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ensure minimum quantity of 1
  const activeQty = quantity <= 0 ? 1 : quantity;

  useEffect(() => {
    if (quantity <= 0) {
      updateQuantity(1);
    }
  }, [quantity, updateQuantity]);

  // Handle coupon apply
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CHEF10' || code === 'SAVE10') {
      setAppliedCoupon(code);
      setExtraDiscount(5.0);
    } else if (code === 'KITCHEN20') {
      setAppliedCoupon(code);
      setExtraDiscount(10.0);
    } else {
      setCouponError('Invalid promo code. Try "CHEF10" for $5 off.');
    }
  };

  const finalTotal = Math.max(0, Math.round((subtotal - extraDiscount) * 100) / 100);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Friendly validation for required fields
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage('Please provide a valid phone number for delivery updates.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter your complete delivery street address.');
      return;
    }
    if (!pincode.trim()) {
      setErrorMessage('Please enter your Pincode / Postal Code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order via existing backend API
      const res = await api.createOrder({
        quantity: activeQty,
        discount: extraDiscount,
        customerInformation: {
          fullName: fullName.trim(),
          email: user?.email || `${fullName.toLowerCase().replace(/\s+/g, '.') || 'order'}@example.com`,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim() || 'Domestic City',
          state: state.trim() || 'NY',
          postalCode: pincode.trim(),
        },
      });

      clearCart();
      onOrderPlaced(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place your order. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainImg = images.find((i) => i.isMain)?.url || images[0]?.url || '/images/hero.jpg';
  const unitPrice = product?.price || 29.99;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 lg:py-16 text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#2A4B3C] mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-stone-900">
            Checkout &amp; Order
          </h1>
          <p className="text-sm text-stone-600 font-light mt-1">
            Complete your delivery details below to receive your KitchEase dispenser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Delivery Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
              <h2 className="font-display text-xl font-normal text-stone-900 mb-6 flex items-center justify-between">
                <span>1. Delivery Information</span>
                <span className="text-xs font-sans text-stone-400 font-normal">All fields required</span>
              </h2>

              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-light mt-1 block">
                    Used strictly for courier tracking &amp; delivery notifications.
                  </span>
                </div>

                {/* Full Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="House/Apartment number, Street name, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Pincode / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      City / Region
                    </label>
                    <input
                      type="text"
                      placeholder="City or Town"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button on mobile */}
                <div className="pt-4 lg:hidden">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl bg-[#2A4B3C] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Processing Order...' : `Place Order — $${finalTotal.toFixed(2)}`}
                  </button>
                </div>

              </form>
            </div>

            {/* Delivery & Security Note */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Free Tracked Standard Delivery (2-4 Business Days)
                </strong>
                <p className="text-stone-500 font-light mt-0.5">
                  Your order is carefully packaged and shipped with full courier tracking. You will receive an SMS and email receipt as soon as dispatch occurs.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="font-display text-xl font-normal text-stone-900">
                2. Order Summary
              </h2>

              {/* Product Info & Quantity Controls */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60">
                <div className="w-20 h-20 rounded-xl bg-white border border-stone-200 p-2 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={mainImg}
                    alt={product?.name || 'KitchEase Oil Dispenser'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-stone-900 truncate">
                    {product?.name || 'KitchEase Oil Dispenser & Sprayer'}
                  </h3>
                  <span className="text-xs text-stone-500 block">470ml Borosilicate Glass</span>
                  
                  {/* Quantity adjustment */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(Math.max(1, activeQty - 1))}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-800">
                        {activeQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(activeQty + 1)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-stone-900 text-sm">
                      ${(unitPrice * activeQty).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo code box */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. CHEF10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-200 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <span className="text-[11px] text-emerald-700 font-medium block mt-1.5">
                    ✓ Promo "{appliedCoupon}" applied (-${extraDiscount.toFixed(2)})
                  </span>
                )}
                {couponError && (
                  <span className="text-[11px] text-red-600 block mt-1.5">{couponError}</span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal ({activeQty} unit{activeQty > 1 ? 's' : ''})</span>
                  <span>${(unitPrice * activeQty).toFixed(2)}</span>
                </div>

                {extraDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Special Promo Discount</span>
                    <span>-${extraDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Shipping &amp; Handling</span>
                  <span className="text-emerald-700 font-semibold uppercase text-xs">Free</span>
                </div>

                <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-xl font-display text-[#2A4B3C]">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden lg:block pt-2">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-[#2A4B3C] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing Order...' : `Place Order — $${finalTotal.toFixed(2)}`}</span>
                </button>
              </div>

              {/* Guarantee badge */}
              <div className="text-center pt-2 text-[11px] text-stone-500 font-light flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                <span>30-Day Money-Back Guarantee Included</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
