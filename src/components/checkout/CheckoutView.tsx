import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
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
  const { quantity, updateQuantity, subtotal, savings, clearCart } = useCart();
  const { product, images } = useStore();
  const { user } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '');

  // Payment simulation
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');

  // Promo code
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // Errors & Loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ensure minimum quantity 1 if user navigates straight here
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
      setExtraDiscount(5.0); // Extra $5 off
    } else if (code === 'KITCHEN20') {
      setAppliedCoupon(code);
      setExtraDiscount(10.0); // Extra $10 off
    } else {
      setCouponError('Invalid coupon code. Try "CHEF10" for $5 off.');
    }
  };

  const finalTotal = Math.max(0, Math.round((subtotal - extraDiscount) * 100) / 100);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please complete all required contact and shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.createOrder({
        quantity: activeQty,
        discount: extraDiscount,
        customerInformation: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim() || 'NY',
          postalCode: postalCode.trim(),
        },
      });

      clearCart();
      onOrderPlaced(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainImg = images.find((i) => i.isMain)?.url || images[0]?.url || '/images/hero.jpg';
  const unitPrice = product?.price || 29.99;

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-10 lg:py-16 text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] hover:text-[#E5C158] mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Checkout Forms (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h1 className="font-display text-2xl font-normal text-[#EAEAEA]">
                  Secure Express Checkout
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
                {/* 1. Customer Information */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                    1. Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                    2. Shipping Address
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="1482 Culinary Ave, Apt 4B"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="New York"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="NY"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Postal / ZIP *
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="10001"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Selection */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                    3. Payment Method
                  </h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'card'
                          ? 'border-[#D4AF37] bg-white/5'
                          : 'border-white/10 bg-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Credit or Debit Card
                          </p>
                          <p className="text-[11px] text-white/50 font-light">
                            Instant secure authorization (Demo Sandbox)
                          </p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center p-0.5">
                        {paymentMethod === 'card' && (
                          <div className="w-full h-full bg-[#D4AF37] rounded-full" />
                        )}
                      </div>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-3 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-[11px] font-medium text-white/60 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-white/15 bg-[#1A1A1A] text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-white/60 mb-1">
                              Expiry
                            </label>
                            <input
                              type="text"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              className="w-full px-3 py-2 rounded-md border border-white/15 bg-[#1A1A1A] text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-white/60 mb-1">
                              CVC
                            </label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full px-3 py-2 rounded-md border border-white/15 bg-[#1A1A1A] text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'cod'
                          ? 'border-[#D4AF37] bg-white/5'
                          : 'border-white/10 bg-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#D4AF37]" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Cash on Delivery / Direct Pay
                          </p>
                          <p className="text-[11px] text-white/50 font-light">
                            Pay upon delivery to the courier
                          </p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center p-0.5">
                        {paymentMethod === 'cod' && (
                          <div className="w-full h-full bg-[#D4AF37] rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  id="checkout-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#E5C158] transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>
                    {isSubmitting ? 'Securing Your Order...' : `Place Order • $${finalTotal.toFixed(2)}`}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#151515] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
              <h2 className="font-display text-lg font-normal text-[#EAEAEA] pb-3 border-b border-white/10">
                Order Summary
              </h2>

              {/* Product preview */}
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-[#1A1A1A] overflow-hidden flex-shrink-0 border border-white/10 p-1 flex items-center justify-center">
                  <img
                    src={mainImg}
                    alt="KitchEase Dispenser"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-[#EAEAEA]">
                    {product?.name || 'KitchEase Oil Dispenser / Sprayer'}
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5 font-light">
                    Quantity: {activeQty}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-semibold text-sm text-[#EAEAEA]">
                      ${(unitPrice * activeQty).toFixed(2)}
                    </span>
                    <span className="text-xs text-white/30 line-through font-light">
                      ${((product?.originalPrice || 49.99) * activeQty).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo code input */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. CHEF10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase tracking-wider rounded-lg border border-white/15 bg-[#1A1A1A] text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-[#D4AF37] font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coupon "{appliedCoupon}" applied (-${extraDiscount.toFixed(2)})</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 font-medium mt-1.5">
                    {couponError}
                  </p>
                )}
              </form>

              {/* Pricing breakdown */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between text-white/60 font-light">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-[#D4AF37] font-medium">
                    <span>Storewide Promotional Discount</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                {extraDiscount > 0 && (
                  <div className="flex justify-between text-[#D4AF37] font-medium">
                    <span>Coupon Savings</span>
                    <span>-${extraDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 font-light">
                  <span>Tracked Express Shipping</span>
                  <span className="font-semibold text-[#D4AF37]">FREE</span>
                </div>
                <div className="flex justify-between text-base font-medium text-[#EAEAEA] pt-3 border-t border-white/10">
                  <span>Total Due</span>
                  <span className="text-[#D4AF37] font-semibold">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 space-y-2 text-xs text-[#D4AF37]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>30-Day Happiness Guarantee</span>
                </div>
                <p className="text-[11px] text-white/60 font-light">
                  Try your KitchEase dispenser risk-free in your kitchen. If you are not delighted, return it for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
