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
        <div className="bg-[#151515] text-[#D4AF37] py-2 px-4 text-center text-xs tracking-wide font-medium border-b border-white/10 flex items-center justify-center gap-2">
          <span className="opacity-90">{settings.announcement}</span>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              onClick={() => onNavigate('store')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-sm group-hover:scale-105 group-hover:border-[#D4AF37] transition-all">
                <Droplets className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tight text-[#D4AF37]">
                  KitchEase
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 -mt-1 font-medium">
                  Precision Cooking
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-widest text-white/70">
              <button
                onClick={() => handleNavClick()}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('product-details')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                Product
              </button>
              <button
                onClick={() => handleNavClick('product-features')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('product-gallery')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                Gallery
              </button>
              <button
                onClick={() => handleNavClick('user-manual')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                User Manual
              </button>
              <button
                onClick={() => handleNavClick('customer-reviews')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                Reviews
              </button>
              <button
                onClick={() => handleNavClick('faq-section')}
                className="hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              >
                FAQ
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
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20'
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
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
                title="Track My Order"
              >
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Track Order</span>
              </button>

              {/* Account Button */}
              <button
                id="btn-nav-account"
                onClick={handleAccountClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
                title={user ? `Signed in as ${user.name}` : 'Account Login'}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden lg:inline">
                  {user ? (user.role === 'ADMIN' ? 'Admin Portal' : user.name.split(' ')[0]) : 'Account'}
                </span>
              </button>

              {/* Cart Button */}
              <button
                id="btn-nav-cart"
                onClick={openCart}
                className="relative p-2.5 rounded-lg text-white/80 hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-white/80" />
                {quantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse-subtle">
                    {quantity}
                  </span>
                )}
              </button>

              {/* Buy Now CTA */}
              <button
                id="btn-nav-buynow"
                onClick={() => {
                  if (quantity === 0) {
                    onNavigate('checkout');
                  } else {
                    onNavigate('checkout');
                  }
                }}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-md bg-[#D4AF37] text-black hover:bg-[#E5C158] transition-colors shadow-md active:scale-95 cursor-pointer"
              >
                Buy Now
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/70 hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#151515] border-b border-white/10 px-4 pt-2 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium uppercase tracking-wider pt-2 text-white/80">
              <button
                onClick={() => handleNavClick()}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('product-details')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                Product
              </button>
              <button
                onClick={() => handleNavClick('product-features')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('product-gallery')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                Gallery
              </button>
              <button
                onClick={() => handleNavClick('user-manual')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                User Manual
              </button>
              <button
                onClick={() => handleNavClick('customer-reviews')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                Reviews
              </button>
              <button
                onClick={() => handleNavClick('faq-section')}
                className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-[#D4AF37]"
              >
                FAQ
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="flex items-center justify-between px-3 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg font-medium text-xs uppercase tracking-wider"
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
                className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/90 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Track My Order</span>
                </span>
                <ChevronRight className="w-4 h-4" />
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
                className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/90"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  {user ? `Customer Account (${user.name})` : 'Customer Account Login'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('checkout');
                }}
                className="w-full py-2.5 bg-[#D4AF37] text-black text-center font-bold rounded-lg text-xs uppercase tracking-wider shadow-md hover:bg-[#E5C158]"
              >
                Proceed to Checkout
              </button>

              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-stone-400 hover:text-stone-200 text-center py-1 underline"
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
