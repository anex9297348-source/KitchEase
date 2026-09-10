import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  Printer,
  RotateCcw,
  ShieldCheck,
  Copy,
  Check,
  Loader2,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Order, OrderStatus } from '../../types.ts';

interface TrackOrderSectionProps {
  initialOrderId?: string;
  defaultEmail?: string;
  recentOrders?: Order[];
  onSelectOrder?: (order: Order) => void;
  onNavigateSupport?: () => void;
}

const MILESTONES: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'ORDER RECEIVED', label: 'Order Received', icon: ShoppingBag },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing', icon: Clock },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT FOR DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
];

function normalizeStatus(status: OrderStatus): string {
  const s = String(status || '').toUpperCase();
  if (s === 'PENDING' || s === 'NEW') return 'ORDER RECEIVED';
  return s;
}

function getMilestoneIndex(status: OrderStatus): number {
  const norm = normalizeStatus(status);
  if (norm === 'CANCELLED') return -1;
  const idx = MILESTONES.findIndex((m) => m.key === norm);
  return idx >= 0 ? idx : 0;
}

export const TrackOrderSection: React.FC<TrackOrderSectionProps> = ({
  initialOrderId = '',
  defaultEmail = '',
  recentOrders = [],
  onNavigateSupport,
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Update emailInput if defaultEmail loads later
  useEffect(() => {
    if (defaultEmail && !emailInput) {
      setEmailInput(defaultEmail);
    }
  }, [defaultEmail]);

  // If initialOrderId changes, auto-fetch if email is present
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      if (emailInput) {
        handleTrackOrder(initialOrderId, emailInput);
      }
    }
  }, [initialOrderId]);

  const handleTrackOrder = async (idToFetch?: string, emailOrPhoneToFetch?: string) => {
    const targetId = (idToFetch || orderIdInput).trim();
    const targetVerification = (emailOrPhoneToFetch || emailInput).trim();

    if (!targetId) {
      setError('Please enter your Order ID (e.g. KE-2026-000123).');
      return;
    }

    if (!targetVerification) {
      setError('Please enter the customer email address or phone number used during checkout.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.trackOrder(targetId, targetVerification);
      setTrackedOrder(res.order);
    } catch (err: any) {
      setTrackedOrder(null);
      setError(
        err.message || 'Unable to find an order matching that ID and email/phone. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    setTrackedOrder(null);
    setError(null);
    setOrderIdInput('');
  };

  const milestoneIndex = trackedOrder ? getMilestoneIndex(trackedOrder.status) : 0;
  const isCancelled = trackedOrder ? normalizeStatus(trackedOrder.status) === 'CANCELLED' : false;

  return (
    <div className="space-y-8">
      {/* Header & Search Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2A4B3C] mb-1">
              <Truck className="w-4 h-4" />
              <span>Real-Time Shipment Lookup</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-stone-900">
              Track My Order
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-1 max-w-xl">
              Enter your Order ID and the customer email or phone number associated with your purchase to check fulfillment, courier tracking, and estimated delivery status.
            </p>
          </div>

          {trackedOrder && (
            <button
              onClick={handleReset}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Track Different Order</span>
            </button>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order ID Input */}
            <div>
              <label htmlFor="track-order-id" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Order ID <span className="text-[#2A4B3C]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Package className="w-4 h-4" />
                </div>
                <input
                  id="track-order-id"
                  type="text"
                  required
                  placeholder="e.g. KE-2026-000123"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-stone-500 font-light mt-1">
                Found on your checkout confirmation screen or receipt.
              </p>
            </div>

            {/* Email Address or Phone Input */}
            <div>
              <label htmlFor="track-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Customer Email or Phone <span className="text-[#2A4B3C]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="track-email"
                  type="text"
                  required
                  placeholder="e.g. sarah@example.com or +1 555-019-2834"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-stone-500 font-light mt-1">
                Must match the email or phone provided at checkout.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching Status...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Fetch Order Status</span>
                </>
              )}
            </button>

            {/* Quick Suggestions from recent orders if present */}
            {recentOrders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 w-full sm:w-auto">
                <span className="font-medium text-[11px]">Quick Select:</span>
                {recentOrders.slice(0, 2).map((ro) => (
                  <button
                    key={ro.id}
                    type="button"
                    onClick={() => {
                      setOrderIdInput(ro.id);
                      if (ro.customerInformation?.email) {
                        setEmailInput(ro.customerInformation.email);
                      }
                      handleTrackOrder(ro.id, ro.customerInformation?.email || emailInput);
                    }}
                    className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 hover:border-stone-400 text-stone-700 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    {ro.id} ({ro.status})
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-900">Order Verification Note</p>
              <p className="text-red-700 font-light leading-relaxed">{error}</p>
              <p className="text-[11px] text-red-600 pt-1">
                Tip: Order IDs look like <code className="bg-red-100 px-1 py-0.5 rounded font-mono">ORD-98214</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TRACKED ORDER RESULT DISPLAY */}
      {trackedOrder && (
        <div className="space-y-6">
          {/* Main Status & Step Progress Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-8">
            {/* Top Bar: Order ID, Date, and Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-bold text-stone-900">
                    #{trackedOrder.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(trackedOrder.id)}
                    className="p-1.5 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-stone-500 font-light flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Placed on{' '}
                    {new Date(trackedOrder.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(trackedOrder.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${
                    trackedOrder.status.toUpperCase() === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : trackedOrder.status.toUpperCase() === 'CANCELLED'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : trackedOrder.status.toUpperCase() === 'SHIPPED'
                      ? 'bg-sky-50 text-sky-800 border-sky-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  {trackedOrder.status}
                </span>

                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Print Order Receipt"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Step Milestones Progress Bar (if not cancelled) */}
            {!isCancelled ? (
              <div className="py-2">
                <div className="relative flex items-center justify-between">
                  {/* Background Track Line */}
                  <div className="absolute left-6 right-6 top-5 h-1 bg-stone-200 -z-0 rounded-full" />

                  {/* Active Green Rail */}
                  <div
                    className="absolute left-6 top-5 h-1 bg-[#2A4B3C] transition-all duration-700 -z-0 rounded-full"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, (milestoneIndex / (MILESTONES.length - 1)) * 100)
                      )}%`,
                    }}
                  />

                  {MILESTONES.map((step, idx) => {
                    const isCompleted = milestoneIndex >= idx;
                    const isCurrent = milestoneIndex === idx;
                    const IconComponent = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-[#2A4B3C] text-white shadow-sm font-bold'
                              : 'bg-stone-100 border-2 border-stone-300 text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-[#2A4B3C]/20 scale-105' : ''}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <span
                          className={`text-[11px] font-semibold tracking-wider mt-2.5 text-center uppercase whitespace-nowrap ${
                            isCurrent
                              ? 'text-[#2A4B3C] font-bold'
                              : isCompleted
                              ? 'text-stone-800'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  This order was cancelled. If you have questions regarding your refund, please contact our support team.
                </span>
              </div>
            )}

            {/* Carrier & Fulfillment Alert (if notes exist) */}
            {trackedOrder.adminNotes && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 flex-shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold text-amber-950 block text-xs uppercase tracking-wider">
                    Courier &amp; Delivery Note
                  </span>
                  <p className="text-amber-900/90 font-light leading-relaxed">
                    {trackedOrder.adminNotes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid: Order Summary & Shipping Address */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1: Purchased Items & Financial Breakdown (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <h3 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#2A4B3C]" />
                <span>Items in this Shipment</span>
              </h3>

              {/* Product item card */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-stone-200 p-1.5 flex items-center justify-center">
                  <img
                    src={trackedOrder.productImage || '/images/hero.jpg'}
                    alt={trackedOrder.productTitle || trackedOrder.productName || 'KitchEase Dispenser'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-stone-900 truncate">
                    {trackedOrder.productTitle || trackedOrder.productName || 'KitchEase Oil Dispenser & Sprayer'}
                  </h4>
                  <p className="text-xs text-stone-500 font-light">
                    2-in-1 Dual Functionality: Micro-Mist Spray &amp; Drip-Free Pour
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-600">
                      Qty: <strong className="text-stone-900">{trackedOrder.quantity}</strong>
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      ${(trackedOrder.unitPrice * trackedOrder.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 font-light">
                  <span>Subtotal</span>
                  <span>${(trackedOrder.unitPrice * trackedOrder.quantity).toFixed(2)}</span>
                </div>
                {trackedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promotional Discount</span>
                    <span>-${trackedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 font-light">
                  <span>Tracked Standard Shipping</span>
                  <span className="text-emerald-700 font-semibold uppercase text-[11px]">FREE</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Amount Paid</span>
                  <span className="text-[#2A4B3C] text-base">
                    ${(trackedOrder.totalAmount ?? trackedOrder.total ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Timeline Events Log */}
              {trackedOrder.timeline && trackedOrder.timeline.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Activity &amp; Milestones Log
                  </h4>
                  <div className="space-y-3 border-l-2 border-stone-200 pl-4 ml-1">
                    {trackedOrder.timeline.map((item, index) => (
                      <div key={index} className="relative space-y-0.5 pb-2">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2A4B3C]" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                            {item.status}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-stone-600 font-light leading-relaxed">
                            {item.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Shipping Destination & Customer Support (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Shipping Address Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2A4B3C]" />
                    <span>Delivery Destination</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#2A4B3C]/10 text-[#2A4B3C] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#2A4B3C]/20">
                    <Lock className="w-3 h-3" />
                    <span>Privacy Masked</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Recipient</span>
                    <p className="font-semibold text-stone-900 text-sm">
                      {trackedOrder.customerInformation.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Shipping Address</span>
                    <p className="text-stone-700 font-light font-mono text-xs">
                      {trackedOrder.customerInformation.address}
                    </p>
                    <p className="text-stone-700 font-light">
                      {trackedOrder.customerInformation.city}, {trackedOrder.customerInformation.state}{' '}
                      <span className="font-mono">{trackedOrder.customerInformation.postalCode}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <p className="text-stone-600 font-light flex items-center gap-1.5 font-mono text-xs">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trackedOrder.customerInformation.email}</span>
                    </p>
                    {trackedOrder.customerInformation.phone && (
                      <p className="text-stone-600 font-light flex items-center gap-1.5 font-mono text-xs">
                        <span>📞 {trackedOrder.customerInformation.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200">
                    <p className="text-[10px] text-stone-400 flex items-center gap-1.5 leading-tight">
                      <Lock className="w-3 h-3 text-[#2A4B3C] flex-shrink-0" />
                      <span>Full address and phone number are automatically masked to safeguard customer privacy.</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] text-stone-600 space-y-1 font-light">
                  <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2A4B3C]" />
                    <span>Free Insured Delivery</span>
                  </div>
                  <p>
                    All KitchEase dispensers are packaged securely in molded protective cushioning for zero transit damage.
                  </p>
                </div>
              </div>

              {/* Need Assistance Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-[#2A4B3C]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-sm text-stone-900">Need Order Assistance?</h4>
                </div>

                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Have questions about your delivery or need to update your address? Our support team is here to help.
                </p>

                <div className="pt-1 flex flex-col gap-2">
                  <a
                    href={`mailto:support@kitchease.com?subject=Inquiry for Order ${trackedOrder.id}&body=Hello KitchEase Team,%0D%0A%0D%0AI would like an update on my order ${trackedOrder.id}.%0D%0ACustomer Name: ${trackedOrder.customerInformation.fullName}%0D%0A`}
                    className="w-full py-3 px-4 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200 text-xs text-stone-800 font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Support</span>
                  </a>

                  {onNavigateSupport && (
                    <button
                      onClick={onNavigateSupport}
                      className="w-full py-2 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      View FAQ &amp; Manual
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderSection;
