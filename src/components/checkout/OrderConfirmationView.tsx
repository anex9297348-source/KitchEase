import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  PackageCheck,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import type { Order } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ order, onNavigate }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2C4A3E', '#C99A46', '#F5DEB3', '#4A7A66'],
      });
    } catch {
      // Safe fallback
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-12 lg:py-20 text-[#EAEAEA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#151515] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8">
          {/* Header checkmark & badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-9 h-9" />
            </div>
            <span className="px-3.5 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider rounded-full inline-block">
              Order {order.status}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[#EAEAEA]">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto font-light">
              We have received your order and sent a confirmation receipt to{' '}
              <strong className="text-white font-medium">{order.customerInformation.email}</strong>.
            </p>
          </div>

          {/* Order Snapshot Card */}
          <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-white/40 block font-light">Order ID</span>
              <span className="font-medium text-[#EAEAEA] font-mono text-sm">{order.id}</span>
            </div>
            <div>
              <span className="text-white/40 block font-light">Date</span>
              <span className="font-medium text-[#EAEAEA]">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-white/40 block font-light">Total Amount</span>
              <span className="font-semibold text-[#D4AF37] text-sm">${(order.totalAmount ?? order.total ?? 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-white/40 block font-light">Payment</span>
              <span className="font-medium text-[#D4AF37]">Verified</span>
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Purchased Product
            </h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1A] border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#121212] overflow-hidden flex-shrink-0 border border-white/10 p-1 flex items-center justify-center">
                  <img
                    src={order.productImage || '/images/hero.jpg'}
                    alt={order.productTitle || order.productName || 'KitchEase Oil Dispenser'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#EAEAEA]">
                    {order.productTitle || order.productName || 'KitchEase Oil Dispenser / Sprayer'}
                  </h4>
                  <p className="text-xs text-white/50 mt-0.5 font-light">Quantity: {order.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-sm text-[#D4AF37]">
                ${(order.totalAmount ?? order.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-1">
              <span className="font-medium text-white flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Customer Details</span>
              </span>
              <p className="font-medium text-[#EAEAEA]">{order.customerInformation.fullName}</p>
              <p className="text-white/50 font-light">{order.customerInformation.email}</p>
              <p className="text-white/50 font-light">{order.customerInformation.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-1">
              <span className="font-medium text-white flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Delivery Address</span>
              </span>
              <p className="font-medium text-[#EAEAEA]">{order.customerInformation.address}</p>
              <p className="text-white/50 font-light">
                {order.customerInformation.city}, {order.customerInformation.state}{' '}
                {order.customerInformation.postalCode}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => onNavigate('account')}
              className="flex-1 py-3.5 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>View &amp; Track in Customer Portal</span>
              <ExternalLink className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => onNavigate('store')}
              className="py-3.5 px-6 rounded-md bg-white/5 border border-white/15 text-[#EAEAEA] font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
