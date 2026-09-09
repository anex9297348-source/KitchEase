import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { Hero } from './components/public/Hero.tsx';
import { ProductGallery } from './components/public/ProductGallery.tsx';
import { ProductDetails } from './components/public/ProductDetails.tsx';
import { Features } from './components/public/Features.tsx';
import { HowItWorks } from './components/public/HowItWorks.tsx';
import { UserManualSection } from './components/public/UserManualSection.tsx';
import { ReviewsSection } from './components/public/ReviewsSection.tsx';
import { FAQSection } from './components/public/FAQSection.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { CheckoutView } from './components/checkout/CheckoutView.tsx';
import { OrderConfirmationView } from './components/checkout/OrderConfirmationView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import type { Order } from './types.ts';

type AppView = 'store' | 'admin' | 'account' | 'checkout' | 'confirmation';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('store');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync with window.location hash for clean routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('admin')) {
        setCurrentView('admin');
      } else if (hash.startsWith('account')) {
        setCurrentView('account');
      } else if (hash.startsWith('checkout')) {
        setCurrentView('checkout');
      } else if (hash.startsWith('confirmation')) {
        setCurrentView('confirmation');
      } else {
        setCurrentView('store');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: AppView, sectionId?: string) => {
    setCurrentView(view);
    if (view === 'store') {
      window.location.hash = '';
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('confirmation');
    window.location.hash = 'confirmation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#EAEAEA] selection:bg-[#D4AF37] selection:text-black font-sans antialiased">
      {/* Sticky Global Navigation */}
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      {/* View Switcher */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            <Hero onNavigate={navigateTo} />
            <ProductDetails onNavigate={navigateTo} />
            <Features />
            <HowItWorks />
            <ProductGallery />
            <UserManualSection />
            <ReviewsSection />
            <FAQSection />
          </>
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onBack={() => navigateTo('store')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentView === 'confirmation' && confirmedOrder && (
          <OrderConfirmationView
            order={confirmedOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'account' && (
          <CustomerDashboard onNavigate={navigateTo} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onNavigate={navigateTo} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Cart Slideout Drawer */}
      <CartDrawer onNavigate={navigateTo} />

      {/* Global Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
