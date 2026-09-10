import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { StoreProvider } from './context/StoreContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { Hero } from './components/public/Hero.tsx';
import { ProductDetails } from './components/public/ProductDetails.tsx';
import { Features } from './components/public/Features.tsx';
import { ProductDemo } from './components/public/ProductDemo.tsx';
import { HowItWorks } from './components/public/HowItWorks.tsx';
import { ProductGallery } from './components/public/ProductGallery.tsx';
import { UserManualSection } from './components/public/UserManualSection.tsx';
import { WhyKitchEase } from './components/public/WhyKitchEase.tsx';
import { FAQSection } from './components/public/FAQSection.tsx';
import { FinalCTA } from './components/public/FinalCTA.tsx';
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
  const [accountInitialTab, setAccountInitialTab] = useState<'orders' | 'track' | 'profile' | 'addresses' | 'wishlist' | 'support'>('orders');
  const [accountInitialOrderId, setAccountInitialOrderId] = useState<string | undefined>(undefined);

  // Sync with window.location hash for clean routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('admin')) {
        setCurrentView('admin');
      } else if (hash.startsWith('track') || hash.startsWith('account/track')) {
        setCurrentView('account');
        setAccountInitialTab('track');
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
    if (view === 'account') {
      if (sectionId === 'track' || sectionId === 'track-order') {
        setAccountInitialTab('track');
        window.location.hash = 'account/track';
      } else {
        window.location.hash = 'account';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'store') {
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
    setAccountInitialOrderId(order.id);
    setCurrentView('confirmation');
    window.location.hash = 'confirmation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#2A4B3C] selection:text-white font-sans antialiased">
      {/* Sticky Global Navigation */}
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      {/* View Switcher */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            {/* 1. Hero & Trust Strip */}
            <Hero onNavigate={navigateTo} />

            {/* 2. Product Details & Purchase Section */}
            <ProductDetails onNavigate={navigateTo} />

            {/* 3. Benefit Highlights */}
            <Features />

            {/* 4. Interactive Demo / Dual Function Showcase */}
            <ProductDemo />

            {/* 5. How It Works */}
            <HowItWorks />

            {/* 6. Real Product Gallery with Lightbox */}
            <ProductGallery />

            {/* 7. Complete User Manual & Maintenance Guide */}
            <UserManualSection />

            {/* 8. Why KitchEase */}
            <WhyKitchEase />

            {/* 9. FAQ Accordion */}
            <FAQSection />

            {/* 10. Final CTA Section */}
            <FinalCTA onNavigate={navigateTo} />
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
          <CustomerDashboard
            onNavigate={navigateTo}
            initialTab={accountInitialTab}
            initialTrackOrderId={accountInitialOrderId}
          />
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
