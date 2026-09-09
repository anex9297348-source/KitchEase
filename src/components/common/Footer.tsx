import React from 'react';
import { Droplets, ShieldCheck, Truck, RefreshCw, Mail, Phone, Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface FooterProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const { openAuthModal, user } = useAuth();

  return (
    <footer className="bg-[#0B0B0B] text-white/70 pt-16 pb-12 border-t border-white/10">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-[#121212] border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">Fast Free Shipping</h4>
              <p className="text-xs text-white/50 font-light">Direct tracked delivery on every order</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">30-Day Guarantee</h4>
              <p className="text-xs text-white/50 font-light">100% money-back satisfaction promise</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">BPA-Free &amp; Food-Safe</h4>
              <p className="text-xs text-white/50 font-light">Certified high borosilicate thermal glass</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">Dedicated Support</h4>
              <p className="text-xs text-white/50 font-light">{settings?.supportEmail || 'support@kitchease.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-normal text-white tracking-tight">KitchEase</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-sm font-light">
              Smarter Oil. Better Cooking. Elevating home cooking with precision 2-in-1 oil dispensing and micro-atomized misting technology.
            </p>
            <div className="pt-2 text-xs text-white/40 space-y-1 font-light">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{settings?.supportEmail || 'support@kitchease.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{settings?.supportPhone || '+1 (800) 548-2432'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-[0.2em] mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('store')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'product-details')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  Product Details
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'user-manual')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  User Manual
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'faq-section')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'customer-reviews')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-[0.2em] mb-4">Customer Portal</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    if (user) onNavigate('account');
                    else openAuthModal('login');
                  }}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (user) onNavigate('account');
                    else openAuthModal('login');
                  }}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  Track My Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store', 'faq-section')}
                  className="text-white/60 hover:text-[#D4AF37] transition-colors cursor-pointer font-light"
                >
                  Help &amp; FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[#D4AF37] hover:text-[#E5C158] transition-colors cursor-pointer font-medium flex items-center gap-1.5 pt-1"
                >
                  <span>Owner Admin Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-[0.2em] mb-4">Legal &amp; Policies</h5>
            <ul className="space-y-2.5 text-sm text-white/50 font-light">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Shipping Information</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">30-Day Return Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-light">
          <p>© {new Date().getFullYear()} KitchEase. All rights reserved. Single-Product Culinary Innovation.</p>
          <div className="flex items-center gap-4">
            <span>Secure 256-Bit SSL Checkout</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" /> for culinary lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
