import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  Truck,
  Copy,
  Check,
  Home,
  ShieldCheck,
} from 'lucide-react';
import type { Order } from '../../types.ts';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ order, onNavigate }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#2A4B3C', '#E2A93B', '#FAF8F5', '#52796F'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const total = order.totalAmount ?? order.total ?? 0;
  const cust = order.customerInformation;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 lg:py-20 text-stone-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md space-y-8">
          
          {/* Header checkmark & Thank You */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-[#2A4B3C]" />
            </div>

            <span className="px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider rounded-full inline-block">
              Order Confirmed &bull; {order.status.toUpperCase()}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-normal text-stone-900">
              Thank You for Your Order!
            </h1>

            <p className="text-sm text-stone-600 max-w-md mx-auto font-light">
              We have received your order and sent a receipt and confirmation email to{' '}
              <strong className="text-stone-900 font-semibold">{cust.email}</strong>.
            </p>
          </div>

          {/* Key Order Snapshot */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block font-light">Order ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-stone-900 truncate">{order.id}</span>
                <button
                  onClick={copyOrderId}
                  className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-stone-500 block font-light">Order Date</span>
              <span className="font-semibold text-stone-800 mt-0.5 block">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block font-light">Total Amount</span>
              <span className="font-bold text-[#2A4B3C] text-sm mt-0.5 block">
                ${total.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block font-light">Shipping</span>
              <span className="font-semibold text-emerald-700 mt-0.5 block">
                Free Standard Tracked
              </span>
            </div>
          </div>

          {/* Ordered Item Summary */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2A4B3C]" />
              <span>Summary of Ordered Items</span>
            </h2>

            <div className="p-4 rounded-2xl border border-stone-200/80 bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-stone-200 p-1 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/hero.jpg"
                    alt="KitchEase 2-in-1 Dispenser"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-stone-900">
                    KitchEase 2-in-1 Oil Dispenser &amp; Sprayer
                  </h3>
                  <span className="text-xs text-stone-500">
                    470ml Borosilicate Glass &bull; Quantity: <strong>{order.quantity}</strong>
                  </span>
                </div>
              </div>

              <span className="font-bold text-stone-900 text-sm">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2A4B3C]" />
              <span>Delivery Address</span>
            </h2>

            <div className="p-4 rounded-2xl border border-stone-200/80 bg-white text-xs sm:text-sm text-stone-700 space-y-1">
              <strong className="text-stone-900 block font-semibold">{cust.fullName}</strong>
              <p className="text-stone-600 font-light">{cust.address}</p>
              <p className="text-stone-600 font-light">
                {cust.city ? `${cust.city}, ` : ''}{cust.state || ''} {cust.postalCode}
              </p>
              <p className="text-stone-500 pt-1 font-mono text-xs">Phone: {cust.phone}</p>
            </div>
          </div>

          {/* Friendly Message Explaining Next Steps */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-2">
            <strong className="block font-semibold text-amber-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-800" />
              What Happens Next?
            </strong>
            <ol className="list-decimal list-inside space-y-1 text-amber-900/80 font-light pl-1">
              <li>
                <strong>Fulfillment:</strong> Your order will be inspected and packed securely within 24 hours.
              </li>
              <li>
                <strong>Dispatch &amp; Tracking:</strong> As soon as your parcel is handed over to the courier, we will update your order tracking.
              </li>
              <li>
                <strong>Delivery:</strong> Expect arrival at your doorstep in 2 to 4 business days.
              </li>
            </ol>
          </div>

          {/* Navigation Action Buttons: "Back to Home" & "Track My Order" */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100">
            <button
              id="confirmation-back-home-btn"
              onClick={() => onNavigate('store')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <button
              onClick={() => onNavigate('account')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50 font-semibold text-xs uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-[#2A4B3C]" />
              <span>Track My Order</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
