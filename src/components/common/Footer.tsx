import React from 'react';
import { Droplets, Mail, Truck, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

interface FooterProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const supportEmail = settings?.supportEmail || 'support@kitchease.com';

  return (
    <footer className="bg-[#1C201D] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: KitchEase branding & Short description (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2A4B3C] text-white flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="font-display text-2xl font-normal text-white tracking-tight">
                KitchEase
              </span>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed font-light max-w-md">
              A smart 2-in-1 oil bottle engineered for controlled pouring and easy spraying—designed to make everyday cooking simpler, healthier, and cleaner.
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                Customer Support:
              </span>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 text-sm text-amber-200 hover:text-white font-medium transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('store', 'product-showcase')}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer font-light"
                >
                  Product
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'how-it-works')}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer font-light"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'user-manual')}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer font-light"
                >
                  Manual
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'faq-section')}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer font-light"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="text-amber-200 hover:text-white transition-colors cursor-pointer font-medium"
                >
                  Buy Now &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Order Tracking & Trust Note (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em]">
              Order Assistance
            </h4>
            
            {/* Simple Order Tracking Link Card */}
            <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Looking for your package?
              </span>
              <p className="text-xs text-stone-400 font-light">
                Track your active delivery status with your Order ID and contact email.
              </p>
              <button
                id="footer-track-order-btn"
                onClick={() => onNavigate('account')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 hover:text-white transition-colors pt-1 cursor-pointer"
              >
                <span>Track My Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust Note */}
            <div className="pt-2 text-xs text-stone-400 font-light flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2A4B3C] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Trust Note:</strong> Honest culinary craftsmanship. No chemical propellants, zero aerosols—pure food-grade borosilicate glass for everyday home cooking.
              </span>
            </div>

          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-light gap-3">
          <p>© {new Date().getFullYear()} KitchEase. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Free Tracked Domestic Shipping</span>
            <span>•</span>
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
