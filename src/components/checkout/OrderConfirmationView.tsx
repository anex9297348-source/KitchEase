import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Truck,
  Copy,
  Check,
  Home,
  ShieldCheck,
  Banknote,
  Search,
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#2A4B3C', '#D4AF37', '#FAF8F5', '#52796F'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const orderId = order.orderId || order.id;

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const total = order.totalAmount ?? order.total ?? 0;
  const cust = order.customerInformation;
  const paymentMethod = order.paymentMethod || 'CASH ON DELIVERY';
  const orderStatus = order.orderStatus || order.status || 'ORDER RECEIVED';

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
              ORDER CONFIRMED ✓
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-normal text-stone-900">
              Thank You for Choosing KitchEase
            </h1>

            <p className="text-sm text-stone-600 max-w-md mx-auto font-light">
              Your order has been recorded successfully. A receipt and confirmation notice has been sent to{' '}
              <strong className="text-stone-900 font-semibold">{cust?.email}</strong>.
            </p>
          </div>

          {/* Key Order Snapshot Cards */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block font-light">Order ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-stone-900 truncate">{orderId}</span>
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
              <span className="text-stone-500 block font-light">Order Status</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-block mt-0.5">
                {orderStatus}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block font-light">Payment Method</span>
              <span className="font-semibold text-stone-800 mt-0.5 block flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-[#2A4B3C]" />
                {paymentMethod}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block font-light">Total Amount</span>
              <span className="font-bold text-[#2A4B3C] text-sm mt-0.5 block">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2A4B3C]" />
              <span>Product Ordered</span>
            </h2>

            <div className="p-4 rounded-2xl border border-stone-200/80 bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-stone-200 p-1 flex items-center justify-center flex-shrink-0">
                  <img
                    src={order.productImage || '/images/hero.jpg'}
                    alt={order.productName || 'Oil Dispenser & Sprayer'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#2A4B3C] block">
                    KitchEase
                  </span>
                  <h3 className="font-medium text-sm text-stone-900">
                    {order.productName || 'Oil Dispenser & Sprayer'}
                  </h3>
                  <span className="text-xs text-stone-500">
                    Quantity: <strong>{order.quantity}</strong> unit{order.quantity > 1 ? 's' : ''} &bull; Free Standard Delivery
                  </span>
                </div>
              </div>

              <span className="font-bold text-stone-900 text-sm">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address Review */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-normal text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2A4B3C]" />
              <span>Delivery Address</span>
            </h2>

            <div className="p-4 rounded-2xl border border-stone-200/80 bg-white text-xs sm:text-sm text-stone-700 space-y-1">
              <strong className="text-stone-900 block font-semibold">
                {order.customerName || cust?.fullName}
              </strong>
              <p className="text-stone-600 font-light">{order.address || cust?.address}</p>
              <p className="text-stone-600 font-light">
                {order.city || cust?.city ? `${order.city || cust?.city}, ` : ''}
                {order.state || cust?.state || ''} {order.pincode || cust?.postalCode || ''}
              </p>
              <p className="text-stone-500 pt-1 font-mono text-xs">
                Phone: {order.phone || cust?.phone}
              </p>
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
                <strong>Order Received:</strong> Your order has been registered in our system and assigned ID <strong>{orderId}</strong>.
              </li>
              <li>
                <strong>Packaging &amp; Inspection:</strong> Our warehouse team will safely box your dispenser within 24 hours.
              </li>
              <li>
                <strong>Doorstep Delivery:</strong> Delivery within 2 to 4 business days. Please pay <strong>${total.toFixed(2)}</strong> via cash or UPI upon delivery.
              </li>
            </ol>
          </div>

          {/* Navigation Action Buttons (Section 7 Requirement):
              "CONTINUE SHOPPING" and "VIEW ORDER STATUS" */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100">
            <button
              id="confirmation-continue-shopping-btn"
              onClick={() => onNavigate('store')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>CONTINUE SHOPPING</span>
            </button>

            <button
              id="confirmation-view-status-btn"
              onClick={() => onNavigate('account')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50 font-semibold text-xs uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#2A4B3C]" />
              <span>VIEW ORDER STATUS</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
