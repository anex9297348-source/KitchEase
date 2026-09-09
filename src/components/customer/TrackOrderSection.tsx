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
  DollarSign,
  Printer,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  HelpCircle,
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
  { key: 'PENDING', label: 'Order Placed', icon: ShoppingBag },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Preparing', icon: Clock },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
];

function normalizeStatus(status: OrderStatus): string {
  return String(status).toUpperCase();
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

  const handleTrackOrder = async (idToFetch?: string, emailToFetch?: string) => {
    const targetId = (idToFetch || orderIdInput).trim();
    const targetEmail = (emailToFetch || emailInput).trim();

    if (!targetId) {
      setError('Please enter your Order ID (e.g. ORD-98214).');
      return;
    }

    if (!targetEmail) {
      setError('Please enter the email address used when placing the order.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.trackOrder(targetId, targetEmail);
      setTrackedOrder(res.order);
    } catch (err: any) {
      setTrackedOrder(null);
      setError(
        err.message || 'Unable to find an order matching that ID and email. Please verify your details.'
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
      <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
              <Truck className="w-4 h-4" />
              <span>Real-Time Shipment Lookup</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#EAEAEA]">
              Track My Order
            </h2>
            <p className="text-xs sm:text-sm text-white/50 font-light mt-1 max-w-xl">
              Enter your Order ID and the customer email associated with your purchase to check fulfillment, courier tracking, and estimated delivery status.
            </p>
          </div>

          {trackedOrder && (
            <button
              onClick={handleReset}
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-white/5 border border-white/15 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
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
              <label htmlFor="track-order-id" className="block text-xs font-medium text-white/80 mb-1.5">
                Order ID <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Package className="w-4 h-4" />
                </div>
                <input
                  id="track-order-id"
                  type="text"
                  required
                  placeholder="e.g. ORD-98214"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-[#1A1A1A] text-white font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
              <p className="text-[11px] text-white/40 font-light mt-1">
                Found on your checkout confirmation screen or email receipt.
              </p>
            </div>

            {/* Email Address Input */}
            <div>
              <label htmlFor="track-email" className="block text-xs font-medium text-white/80 mb-1.5">
                Customer Email Address <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="track-email"
                  type="email"
                  required
                  placeholder="e.g. customer@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-[#1A1A1A] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
              <p className="text-[11px] text-white/40 font-light mt-1">
                Must match the email provided at checkout for verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/10 cursor-pointer"
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
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 w-full sm:w-auto">
                <span className="font-light text-[11px]">Quick Fill:</span>
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
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-white/70 hover:text-[#D4AF37] text-[11px] font-mono transition-colors cursor-pointer"
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
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-300">Order Verification Failed</p>
              <p className="text-white/70 font-light leading-relaxed">{error}</p>
              <p className="text-[11px] text-white/40 pt-1">
                Tip: Order IDs usually start with <code className="text-[#D4AF37] font-mono">ORD-</code> followed by 5 digits.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TRACKED ORDER RESULT DISPLAY */}
      {trackedOrder && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Status & Step Progress Banner */}
          <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8">
            {/* Top Bar: Order ID, Date, and Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-bold text-[#D4AF37]">
                    #{trackedOrder.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(trackedOrder.id)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/50 font-light flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                    trackedOrder.status.toUpperCase() === 'DELIVERED'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80'
                      : trackedOrder.status.toUpperCase() === 'CANCELLED'
                      ? 'bg-red-950/70 text-red-300 border-red-800'
                      : trackedOrder.status.toUpperCase() === 'SHIPPED'
                      ? 'bg-sky-950/70 text-sky-300 border-sky-700'
                      : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                  }`}
                >
                  {trackedOrder.status}
                </span>

                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                  <div className="absolute left-6 right-6 top-5 h-1 bg-white/10 -z-0 rounded-full" />

                  {/* Active Gold Filled Rail */}
                  <div
                    className="absolute left-6 top-5 h-1 bg-[#D4AF37] transition-all duration-700 -z-0 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.5)]"
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
                              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                              : 'bg-[#1A1A1A] border-2 border-white/20 text-white/30'
                          } ${isCurrent ? 'ring-4 ring-[#D4AF37]/30 scale-110' : ''}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <span
                          className={`text-[11px] font-semibold tracking-wider mt-2.5 text-center uppercase whitespace-nowrap ${
                            isCurrent
                              ? 'text-[#D4AF37] font-bold'
                              : isCompleted
                              ? 'text-white/90'
                              : 'text-white/30'
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
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  This order was cancelled. If you have questions regarding your refund or cancellation, please contact our support team.
                </span>
              </div>
            )}

            {/* Carrier & Fulfillment Alert (if notes exist) */}
            {trackedOrder.adminNotes && (
              <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#EAEAEA] flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] flex-shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#D4AF37] block text-xs uppercase tracking-wider">
                    Courier &amp; Delivery Update
                  </span>
                  <p className="text-white/80 font-light leading-relaxed">
                    {trackedOrder.adminNotes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid: Order Summary & Shipping Address */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1: Purchased Items & Financial Breakdown (7 cols) */}
            <div className="lg:col-span-7 bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
              <h3 className="font-display text-lg font-normal text-[#EAEAEA] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Items in this Shipment</span>
              </h3>

              {/* Product item card */}
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-[#121212] overflow-hidden flex-shrink-0 border border-white/10 p-1.5 flex items-center justify-center">
                  <img
                    src={trackedOrder.productImage || '/images/hero.jpg'}
                    alt={trackedOrder.productTitle || trackedOrder.productName || 'KitchEase Dispenser'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-[#EAEAEA] truncate">
                    {trackedOrder.productTitle || trackedOrder.productName || 'KitchEase Oil Dispenser / Sprayer'}
                  </h4>
                  <p className="text-xs text-white/50 font-light">
                    2-in-1 Dual Functionality: Micro-Mist Spray &amp; Drip-Free Pour
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-white/60">
                      Qty: <strong className="text-white">{trackedOrder.quantity}</strong>
                    </span>
                    <span className="text-sm font-semibold text-[#D4AF37]">
                      ${(trackedOrder.unitPrice * trackedOrder.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-[#1A1A1A]/60 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-white/60 font-light">
                  <span>Subtotal</span>
                  <span>${(trackedOrder.unitPrice * trackedOrder.quantity).toFixed(2)}</span>
                </div>
                {trackedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-light">
                    <span>Promotional Discount</span>
                    <span>-${trackedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 font-light">
                  <span>Tracked Express Shipping</span>
                  <span className="text-[#D4AF37] font-medium">FREE</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-semibold text-white">
                  <span>Total Amount Paid</span>
                  <span className="text-[#D4AF37] text-base">
                    ${(trackedOrder.totalAmount ?? trackedOrder.total ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Timeline Events Log */}
              {trackedOrder.timeline && trackedOrder.timeline.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Activity &amp; Milestones Log
                  </h4>
                  <div className="space-y-2 border-l-2 border-white/10 pl-4 ml-1">
                    {trackedOrder.timeline.map((item, index) => (
                      <div key={index} className="relative space-y-0.5 pb-2">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            {item.status}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-white/60 font-light leading-relaxed">
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
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                <h3 className="font-display text-lg font-normal text-[#EAEAEA] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>Delivery Destination</span>
                </h3>

                <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-2 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase tracking-wider">Recipient</span>
                    <p className="font-semibold text-white text-sm">
                      {trackedOrder.customerInformation.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-white/40 block text-[10px] uppercase tracking-wider">Shipping Address</span>
                    <p className="text-white/80 font-light">
                      {trackedOrder.customerInformation.address}
                    </p>
                    <p className="text-white/80 font-light">
                      {trackedOrder.customerInformation.city}, {trackedOrder.customerInformation.state}{' '}
                      {trackedOrder.customerInformation.postalCode}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-white/10 space-y-1">
                    <p className="text-white/50 font-light flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-white/40" />
                      <span>{trackedOrder.customerInformation.email}</span>
                    </p>
                    {trackedOrder.customerInformation.phone && (
                      <p className="text-white/50 font-light flex items-center gap-1.5">
                        <span>📞 {trackedOrder.customerInformation.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/60 space-y-1 font-light">
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Free Insured Delivery</span>
                  </div>
                  <p>
                    All KitchEase packages are packaged in high-density foam for zero breakage during transit.
                  </p>
                </div>
              </div>

              {/* Need Assistance Card */}
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-sm text-white">Need Order Assistance?</h4>
                </div>

                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Have questions regarding your delivery, wish to modify an address, or need culinary guidance? Our concierge support team is ready to assist.
                </p>

                <div className="pt-1 flex flex-col gap-2">
                  <a
                    href={`mailto:support@kitchease.com?subject=Inquiry for Order ${trackedOrder.id}&body=Hello KitchEase Team,%0D%0A%0D%0AI would like an update on my order ${trackedOrder.id}.%0D%0ACustomer Name: ${trackedOrder.customerInformation.fullName}%0D%0A`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/15 hover:border-[#D4AF37]/50 text-xs text-white hover:text-[#D4AF37] font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Support Concierge</span>
                  </a>

                  {onNavigateSupport && (
                    <button
                      onClick={onNavigateSupport}
                      className="w-full py-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
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
