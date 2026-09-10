import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Plus,
  Trash2,
  HelpCircle,
  Heart,
  Truck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';
import type { Order, OrderStatus } from '../../types.ts';
import { TrackOrderSection } from './TrackOrderSection.tsx';

interface CustomerDashboardProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation', sectionId?: string) => void;
  initialTab?: 'orders' | 'track' | 'profile' | 'addresses' | 'wishlist' | 'support';
  initialTrackOrderId?: string;
}

const STATUS_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  initialTab = 'orders',
  initialTrackOrderId = '',
}) => {
  const { user, logout, refreshUser, openAuthModal } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'track' | 'profile' | 'addresses' | 'wishlist' | 'support'>(
    initialTab
  );
  const [trackOrderId, setTrackOrderId] = useState<string>(initialTrackOrderId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialTrackOrderId) {
      setTrackOrderId(initialTrackOrderId);
    }
  }, [initialTrackOrderId]);

  // Profile Edit Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.getMyOrders();
      setOrders(res.orders);
    } catch (err) {
      console.error('Failed to fetch customer orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // If user is not logged in: display the Track My Order portal directly!
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16 text-stone-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Top Welcome & Sign In Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2A4B3C]/10 text-[#2A4B3C] flex items-center justify-center flex-shrink-0">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#2A4B3C] block">
                  Self-Service Order Lookup
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-normal text-stone-900">
                  Track My Order
                </h1>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Input your Order ID and customer email to check real-time fulfillment and delivery status.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                id="btn-guest-signin"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2.5 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                Sign In to Account
              </button>
              <button
                onClick={() => onNavigate('store')}
                className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-100 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Back to Store
              </button>
            </div>
          </div>

          {/* Real-Time Tracking Form Component */}
          <TrackOrderSection
            initialOrderId={trackOrderId}
            defaultEmail=""
            onNavigateSupport={() => onNavigate('store', 'faq-section')}
          />
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await api.updateProfile(name, phone);
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addAddress({
        fullName: addrName || user.name,
        phone: addrPhone || user.phone || '',
        address: addrStreet,
        city: addrCity,
        state: addrState,
        postalCode: addrZip,
      });
      await refreshUser();
      setShowAddAddress(false);
      setAddrStreet('');
      setAddrCity('');
      setAddrZip('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(id);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIndex = (st: OrderStatus) => {
    if (st === 'CANCELLED') return -1;
    return STATUS_STEPS.indexOf(st);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Welcome Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2A4B3C] text-white flex items-center justify-center font-display text-2xl font-bold shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#2A4B3C]">
                Customer Account
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-stone-900">
                {user.name}
              </h1>
              <p className="text-xs text-stone-500 font-light">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('store')}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-100 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Shop Store
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('store');
              }}
              className="p-2.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>My Orders ({orders.length})</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="tab-btn-track-order"
                onClick={() => setActiveTab('track')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Track My Order</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Saved Addresses</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>Re-order Dispenser</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-[#2A4B3C] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help &amp; Support</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content Area (9 cols) */}
          <div className="lg:col-span-9">
            {/* TAB: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-normal text-stone-900">Order History</h2>
                  <button
                    onClick={fetchOrders}
                    className="text-xs text-[#2A4B3C] font-semibold hover:underline cursor-pointer"
                  >
                    Refresh Orders
                  </button>
                </div>

                {/* Quick Banner to Track My Order */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2A4B3C]/10 text-[#2A4B3C] flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-900">Looking for another order or guest purchase?</p>
                      <p className="text-[11px] text-stone-500 font-light">Enter an Order ID and customer email to get real-time tracking.</p>
                    </div>
                  </div>
                  <button
                    id="btn-goto-track-order"
                    onClick={() => setActiveTab('track')}
                    className="px-3.5 py-2 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-xs"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/90 text-stone-400 text-sm font-light">
                    Loading your culinary orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-stone-200/90 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-lg font-normal text-stone-900">
                      No orders placed yet
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto font-light">
                      Upgrade your kitchen with the KitchEase 2-in-1 oil dispenser. Free tracked delivery on all orders.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => onNavigate('store')}
                        className="px-6 py-3 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-colors cursor-pointer"
                      >
                        Shop KitchEase Dispenser
                      </button>
                      <button
                        onClick={() => setActiveTab('track')}
                        className="px-6 py-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors cursor-pointer"
                      >
                        Track an Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:border-stone-300 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-[#2A4B3C] font-semibold uppercase">
                              Order ID: {ord.id}
                            </span>
                            <p className="text-xs text-stone-500 font-light">
                              Placed on {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider self-start sm:self-auto ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        {/* Product info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] overflow-hidden flex-shrink-0 border border-stone-200 p-1 flex items-center justify-center">
                              <img
                                src={ord.productImage || '/images/hero.jpg'}
                                alt={ord.productTitle || ord.productName || 'KitchEase Dispenser'}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-stone-900">
                                {ord.productTitle || ord.productName || 'KitchEase Oil Dispenser & Sprayer'}
                              </h4>
                              <p className="text-xs text-stone-500 font-light">
                                Qty: {ord.quantity} • Total: ${(ord.totalAmount ?? ord.total ?? 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setTrackOrderId(ord.id);
                                setActiveTab('track');
                              }}
                              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5 text-[#2A4B3C]" />
                              <span>Track Status</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-4 py-2 rounded-xl bg-[#2A4B3C] hover:bg-[#213B2F] text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TRACK MY ORDER */}
            {activeTab === 'track' && (
              <TrackOrderSection
                initialOrderId={trackOrderId}
                defaultEmail={user.email}
                recentOrders={orders}
                onSelectOrder={(ord) => {
                  setSelectedOrder(ord);
                }}
                onNavigateSupport={() => onNavigate('store', 'faq-section')}
              />
            )}

            {/* TAB: ACCOUNT PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
                <h2 className="font-display text-xl font-normal text-stone-900">Personal Information</h2>
                
                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm focus:border-[#2A4B3C] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm cursor-not-allowed"
                    />
                    <span className="text-[11px] text-stone-400 font-light mt-0.5 block">Email address cannot be changed.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm focus:border-[#2A4B3C] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#2A4B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#213B2F] transition-colors cursor-pointer shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-normal text-stone-900">Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddAddress ? 'Cancel' : 'Add Address'}</span>
                  </button>
                </div>

                {showAddAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-4"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2A4B3C]">
                      Add New Delivery Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          placeholder={user.name}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="123 Olive Grove Lane"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">State</label>
                        <input
                          type="text"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">ZIP / Postal</label>
                        <input
                          type="text"
                          required
                          value={addrZip}
                          onChange={(e) => setAddrZip(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:border-[#2A4B3C] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[#2A4B3C] text-white text-xs font-bold cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 relative flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-sm text-stone-900 block">{addr.fullName}</span>
                          <p className="text-xs text-stone-600 font-light">{addr.address}</p>
                          <p className="text-xs text-stone-600 font-light">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          {addr.phone && <p className="text-xs text-stone-400 mt-1">{addr.phone}</p>}
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-stone-200/80 mt-3">
                          <span className="text-[11px] text-[#2A4B3C] font-semibold">Standard Shipping</span>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-stone-400 hover:text-red-600 text-xs p-1 transition-colors cursor-pointer"
                            title="Remove address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 col-span-2 font-light">
                      No saved addresses yet. Add one for rapid checkout.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: RE-ORDER WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
                <h2 className="font-display text-xl font-normal text-stone-900">Instant Quick Re-order</h2>
                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-28 h-28 rounded-2xl bg-white overflow-hidden flex-shrink-0 border border-stone-200 p-2 flex items-center justify-center">
                    <img
                      src="/images/hero.jpg"
                      alt="KitchEase Dispenser"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="font-display text-lg font-normal text-stone-900">
                      KitchEase Oil Dispenser &amp; Sprayer
                    </h3>
                    <p className="text-xs text-stone-500 font-light">
                      Order an additional unit for avocado oil, vinegar, or as a thoughtful gift for a fellow home chef.
                    </p>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                      <span className="text-xl font-bold text-stone-900">$29.99</span>
                      <span className="text-xs text-stone-400 line-through font-light">$49.99</span>
                      <span className="text-xs text-[#2A4B3C] font-semibold">40% OFF</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(1);
                      onNavigate('checkout');
                    }}
                    className="px-6 py-3 rounded-xl bg-[#2A4B3C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#213B2F] transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    Quick Order ($29.99)
                  </button>
                </div>
              </div>
            )}

            {/* TAB: HELP & SUPPORT */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
                <h2 className="font-display text-xl font-normal text-stone-900">Help &amp; Customer Care</h2>
                <p className="text-xs text-stone-500 leading-relaxed font-light">
                  We are here to support your cooking journey. If you ever have questions regarding maintenance or nozzle care, our culinary specialists respond promptly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                    <h4 className="font-semibold text-sm text-stone-900">Order Inquiries</h4>
                    <p className="text-[#2A4B3C] font-medium">orders@kitchease.com</p>
                    <p className="text-[11px] text-stone-400 font-light">Please include your Order ID</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                    <h4 className="font-semibold text-sm text-stone-900">Product Assistance</h4>
                    <p className="text-[#2A4B3C] font-medium">support@kitchease.com</p>
                    <p className="text-[11px] text-stone-400 font-light">Cleaning instructions, nozzles &amp; parts</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('store', 'faq-section')}
                    className="px-5 py-2.5 rounded-xl border border-[#2A4B3C] text-[#2A4B3C] text-xs font-semibold hover:bg-[#2A4B3C] hover:text-white transition-colors cursor-pointer"
                  >
                    Browse Complete FAQ &amp; Manual
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details & Visual Progress Tracker Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono text-[#2A4B3C] uppercase font-semibold">
                  Tracking Order #{selectedOrder.id}
                </span>
                <h3 className="font-display text-xl font-normal text-stone-900">
                  Live Shipment Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Step Tracker */}
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                {/* Connecting background line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#2A4B3C] transition-all -z-0"
                  style={{
                    width: `${Math.max(
                      0,
                      (getStatusIndex(selectedOrder.status) / (STATUS_STEPS.length - 1)) * 100
                    )}%`,
                  }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getStatusIndex(selectedOrder.status);
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isCompleted
                            ? 'bg-[#2A4B3C] text-white shadow-xs'
                            : 'bg-stone-100 border-2 border-stone-300 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-[#2A4B3C]/20 scale-105' : ''}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-semibold tracking-wider mt-2 uppercase ${
                          isCurrent
                            ? 'text-[#2A4B3C] font-bold'
                            : isCompleted
                            ? 'text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current status note */}
            {selectedOrder.adminNotes && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                <Truck className="w-4 h-4 flex-shrink-0 text-amber-800" />
                <span>
                  <strong>Latest Fulfillment Update:</strong> {selectedOrder.adminNotes}
                </span>
              </div>
            )}

            {/* Item & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                <span className="font-semibold text-stone-900 block mb-1">Item Details</span>
                <p className="font-medium text-stone-800">
                  {selectedOrder.productTitle || selectedOrder.productName || 'KitchEase Oil Dispenser & Sprayer'}
                </p>
                <p className="text-stone-500 font-light">Quantity: {selectedOrder.quantity}</p>
                <p className="font-bold text-[#2A4B3C] mt-1">
                  Total Paid: ${(selectedOrder.totalAmount ?? selectedOrder.total ?? 0).toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5">
                <span className="font-semibold text-stone-900 block mb-1">Delivery Destination</span>
                <p className="font-medium text-stone-800">{selectedOrder.customerInformation.fullName}</p>
                <p className="text-stone-500 font-light">{selectedOrder.customerInformation.address}</p>
                <p className="text-stone-500 font-light">
                  {selectedOrder.customerInformation.city}, {selectedOrder.customerInformation.state}{' '}
                  {selectedOrder.customerInformation.postalCode}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2A4B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#213B2F] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
