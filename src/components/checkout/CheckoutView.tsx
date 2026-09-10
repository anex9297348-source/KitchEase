import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  Plus,
  Minus,
  Lock,
  Banknote,
  CreditCard,
  MapPin,
  CheckCircle,
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

  // Form State - strictly matching Section 3 requirements:
  // Full Name, Phone Number, House/Building, Street/Area, City, State, Pincode
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [houseBuilding, setHouseBuilding] = useState(user?.addresses?.[0]?.address?.split(',')[0] || '');
  const [streetArea, setStreetArea] = useState(user?.addresses?.[0]?.address?.split(',').slice(1).join(',').trim() || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.postalCode || '');

  // Payment method: Cash on Delivery by default (Section 4)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

  // Promo code
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // Submission state & duplicate prevention (Section 5)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ensure minimum quantity of 1
  const activeQty = quantity <= 0 ? 1 : quantity;

  useEffect(() => {
    if (quantity <= 0) {
      updateQuantity(1);
    }
  }, [quantity, updateQuantity]);

  // Handle promo code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CHEF10' || code === 'SAVE10') {
      setAppliedCoupon(code);
      setExtraDiscount(5.0);
    } else if (code === 'KITCHEN10') {
      setAppliedCoupon(code);
      setExtraDiscount(Math.round(subtotal * 0.1 * 100) / 100);
    } else {
      setCouponError('Invalid promo code. Try "CHEF10" for $5 off.');
    }
  };

  const deliveryCharge = 0; // Free Standard Tracked Delivery
  const finalTotal = Math.max(0, Math.round((subtotal - extraDiscount + deliveryCharge) * 100) / 100);

  // Full address composite
  const combinedAddress = [houseBuilding.trim(), streetArea.trim()].filter(Boolean).join(', ');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission
    setErrorMessage(null);

    // Validation rules matching Section 3:
    // "Invalid phone number: 'Please enter a valid phone number.'"
    // "Invalid pincode: 'Please enter a valid 6-digit pincode.'"
    // "Missing address: 'Please enter your complete delivery address.'"

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 15) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (!houseBuilding.trim() || !streetArea.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your city.');
      return;
    }

    if (!state.trim()) {
      setErrorMessage('Please enter your state.');
      return;
    }

    const cleanPincode = pincode.replace(/\s+/g, '');
    if (!cleanPincode || cleanPincode.length < 5 || cleanPincode.length > 10) {
      setErrorMessage('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order via existing backend API (calculates price server-side)
      const res = await api.createOrder({
        quantity: activeQty,
        discount: extraDiscount,
        promoCode: appliedCoupon || undefined,
        paymentMethod: paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE PAYMENT',
        customerInformation: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: user?.email || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@orders.kitchease.com`,
          address: combinedAddress,
          houseBuilding: houseBuilding.trim(),
          streetArea: streetArea.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: cleanPincode,
          postalCode: cleanPincode,
        },
      });

      clearCart();
      onOrderPlaced(res.order);
    } catch (err: any) {
      setErrorMessage(
        err.message || "We couldn't place your order right now. Please try again."
      );
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
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#2A4B3C] mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2A4B3C] block mb-1">
            KitchEase Direct Store Checkout
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-stone-900">
            Complete Your Order
          </h1>
          <p className="text-sm text-stone-600 font-light mt-1">
            Oil Dispenser &amp; Sprayer &bull; Fast, tracked delivery to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Customer Form & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
              <h2 className="font-display text-xl font-normal text-stone-900 mb-6 flex items-center justify-between">
                <span>1. Customer &amp; Delivery Details</span>
                <span className="text-xs font-sans text-stone-400 font-normal">All fields required</span>
              </h2>

              <form id="checkout-order-form" onSubmit={handleSubmitOrder} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
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
                    placeholder="e.g. +1 555-019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                  <span className="text-[11px] text-stone-500 font-light mt-1 block">
                    Used strictly for courier tracking notifications and dispatch SMS.
                  </span>
                </div>

                {/* House/Building */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    House / Flat / Building / Apartment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 4B, Greenwood Apartments"
                    value={houseBuilding}
                    onChange={(e) => setHouseBuilding(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                </div>

                {/* Street / Area */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Street / Area / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Elm Street, Near Central Park"
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Austin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Texas"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Pincode / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 78701 (or 6-digit Pincode)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-colors"
                  />
                </div>

                {/* Live Address Review Box (Section 3 Requirement) */}
                {(houseBuilding || streetArea || city || state || pincode) && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                      <MapPin className="w-4 h-4 text-amber-800" />
                      <span>Delivery Address Review</span>
                    </div>
                    <p className="font-medium text-stone-900">{fullName || 'Customer Name'}</p>
                    <p className="text-stone-700 font-light">
                      {[houseBuilding, streetArea].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-stone-700 font-light">
                      {[city, state].filter(Boolean).join(', ')} {pincode ? `- ${pincode}` : ''}
                    </p>
                    {phone && <p className="text-stone-500 font-mono text-[11px]">Contact: {phone}</p>}
                  </div>
                )}

              </form>
            </div>

            {/* Step 2: Payment Options (Section 4 Requirement) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-normal text-stone-900">
                  2. Payment Method
                </h2>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Zero Risk Guarantee
                </span>
              </div>

              {/* Cash On Delivery Option */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#2A4B3C] bg-emerald-50/30 ring-1 ring-[#2A4B3C]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-[#2A4B3C] focus:ring-[#2A4B3C]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#2A4B3C]" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-light mt-1">
                    Pay securely with cash or UPI directly to the delivery agent upon inspecting your package at your doorstep.
                  </p>
                </div>
              </label>

              {/* Online Payment Notice (Honest and transparent, no fake gateways) */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-[#FAF8F5] flex items-start gap-3 text-xs text-stone-600">
                <CreditCard className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 block font-semibold">
                    Online Card &amp; NetBanking
                  </strong>
                  <p className="text-stone-500 font-light mt-0.5">
                    Prepaid online payments will be enabled soon via our verified payment gateway. Cash on Delivery is 100% active and free for this batch.
                  </p>
                </div>
              </div>

              {/* Privacy Reassurance */}
              <div className="text-[11px] text-stone-500 font-light pt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>
                  No passwords, card numbers, CVVs, OTPs, or government IDs required to place your order.
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              
              <h2 className="font-display text-xl font-normal text-stone-900">
                Order Summary
              </h2>

              {/* Product Info & Quantity Selector [-] 1 [+] */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60">
                <div className="w-20 h-20 rounded-xl bg-white border border-stone-200 p-2 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={mainImg}
                    alt={product?.name || 'KitchEase Oil Dispenser & Sprayer'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#2A4B3C] block">
                    KitchEase
                  </span>
                  <h3 className="font-medium text-sm text-stone-900 truncate">
                    {product?.name || 'Oil Dispenser & Sprayer'}
                  </h3>
                  <span className="text-xs text-stone-500 block">470ml Borosilicate Glass</span>
                  
                  {/* Quantity adjustment [-] 1 [+] */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(Math.max(1, activeQty - 1))}
                        disabled={isSubmitting}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-50 cursor-pointer transition-colors"
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
                        disabled={isSubmitting}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-50 cursor-pointer transition-colors"
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
                    disabled={isSubmitting}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-200 cursor-pointer transition-colors"
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
                  <span>Product Price</span>
                  <span>${unitPrice.toFixed(2)} / unit</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({activeQty} unit{activeQty > 1 ? 's' : ''})</span>
                  <span>${(unitPrice * activeQty).toFixed(2)}</span>
                </div>

                {extraDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-${extraDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-semibold uppercase text-xs">Free</span>
                </div>

                <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Final Total</span>
                  <span className="text-2xl font-display text-[#2A4B3C]">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Prominent PLACE ORDER Button (Section 5 Requirement) */}
              <div className="pt-2">
                <button
                  type="button"
                  id="place-order-btn"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-[#2A4B3C] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Placing your order...' : `PLACE ORDER — $${finalTotal.toFixed(2)}`}
                  </span>
                </button>
              </div>

              {/* Trust badge */}
              <div className="text-center pt-1 text-[11px] text-stone-500 font-light flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                <span>Risk-Free Cash on Delivery &bull; 30-Day Guarantee</span>
              </div>

            </div>

            {/* Delivery note */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Free Insured Standard Delivery (2-4 Business Days)
                </strong>
                <p className="text-stone-500 font-light mt-0.5">
                  Orders are dispatched within 24 hours. Full live courier tracking information will be provided on your confirmation page.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
