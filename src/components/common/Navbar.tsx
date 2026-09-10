import React, { useState } from 'react';
import { ShoppingBag, User, Shield, Menu, X, ChevronRight, Droplets, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';

interface NavbarProps {
  currentView: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation';
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { quantity, openCart } = useCart();
  const { settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'store') {
      onNavigate('store', sectionId);
    } else if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAccountClick = () => {
    setMobileMenuOpen(false);
    if (user) {
      if (user.role === 'ADMIN') {
        onNavigate('admin');
      } else {
        onNavigate('account');
      }
    } else {
      openAuthModal('login');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      {settings?.announcement && (
        <div className="bg-[#2A4B3C] text-stone-100 py-2 px-4 text-center text-xs tracking-wide font-medium border-b border-[#233F33] flex items-center justify-center gap-2">
          <span className="opacity-95">{settings.announcement}</span>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              onClick={() => onNavigate('store')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#2A4B3C] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                <Droplets className="w-5 h-5 text-amber-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tight text-stone-900">
                  KitchEase
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 -mt-1 font-medium">
                  Smart Kitchenware
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-widest text-stone-600 font-medium">
              <button
                onClick={() => handleNavClick('product-showcase')}
                className="hover:text-[#2A4B3C] transition-colors py-1 cursor-pointer"
              >
                Product
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="hover:text-[#2A4B3C] transition-colors py-1 cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('user-manual')}
                className="hover:text-[#2A4B3C] transition-colors py-1 cursor-pointer"
              >
                Manual
              </button>
              <button
                onClick={() => handleNavClick('faq-section')}
                className="hover:text-[#2A4B3C] transition-colors py-1 cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => handleNavClick('footer-contact')}
                className="hover:text-[#2A4B3C] transition-colors py-1 cursor-pointer"
              >
                Contact
              </button>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* If Admin, show shortcut badge */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-[#2A4B3C] text-white border-[#2A4B3C]'
                      : 'border-emerald-700/30 text-[#2A4B3C] bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Active</span>
                </button>
              )}

              {/* Track Order Button */}
              <button
                id="btn-nav-track-order"
                onClick={() => onNavigate('account', 'track')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-[#2A4B3C] hover:bg-stone-100 transition-colors cursor-pointer"
                title="Track My Order"
              >
                <Truck className="w-4 h-4 text-[#2A4B3C]" />
                <span>Track Order</span>
              </button>

              {/* Account Button */}
              <button
                id="btn-nav-account"
                onClick={handleAccountClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-[#2A4B3C] hover:bg-stone-100 transition-colors cursor-pointer"
                title={user ? `Signed in as ${user.name}` : 'Account Login'}
              >
                <User className="w-4 h-4 text-stone-500" />
                <span className="hidden lg:inline">
                  {user ? (user.role === 'ADMIN' ? 'Admin Portal' : user.name.split(' ')[0]) : 'Account'}
                </span>
              </button>

              {/* Cart Button */}
              <button
                id="btn-nav-cart"
                onClick={openCart}
                className="relative p-2.5 rounded-lg text-stone-700 hover:text-[#2A4B3C] hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {quantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#2A4B3C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse-subtle">
                    {quantity}
                  </span>
                )}
              </button>

              {/* Buy Now CTA */}
              <button
                id="btn-nav-buynow"
                onClick={() => onNavigate('checkout')}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded-lg bg-[#2A4B3C] text-white hover:bg-[#213B2F] transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Buy Now
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-700 hover:text-stone-900 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium uppercase tracking-wider pt-2 text-stone-700">
              <button
                onClick={() => handleNavClick('product-showcase')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                Product
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('user-manual')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                Manual
              </button>
              <button
                onClick={() => handleNavClick('faq-section')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => handleNavClick('footer-contact')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                Contact
              </button>
              <button
                onClick={() => handleNavClick('benefits')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-stone-100 hover:text-[#2A4B3C] cursor-pointer"
              >
                Benefits
              </button>
            </div>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 text-[#2A4B3C] border border-emerald-200 rounded-lg font-medium text-xs uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Owner Admin Dashboard
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('account', 'track');
                }}
                className="flex items-center justify-between px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700 cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2A4B3C]" />
                  <span>Track My Order</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user) {
                    onNavigate('account');
                  } else {
                    openAuthModal('login');
                  }
                }}
                className="flex items-center justify-between px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700 cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2A4B3C]" />
                  <span>{user ? `Account (${user.name})` : 'Account Login'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('checkout');
                }}
                className="w-full py-3 bg-[#2A4B3C] text-white text-center font-bold rounded-lg text-xs uppercase tracking-wider shadow-sm hover:bg-[#213B2F] cursor-pointer"
              >
                Buy Now — Instant Checkout
              </button>

              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-stone-500 hover:text-stone-700 text-center py-1 underline cursor-pointer"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
