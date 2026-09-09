import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  LogOut,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  HelpCircle,
  Heart,
  Truck,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';
import type { Order, OrderStatus } from '../../types.ts';

interface CustomerDashboardProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user, logout, refreshUser, openAuthModal } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist' | 'support'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[#0F0F0F] flex items-center justify-center p-4 text-[#EAEAEA]">
        <div className="bg-[#151515] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <User className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-normal text-[#EAEAEA]">Customer Portal</h2>
          <p className="text-xs text-white/50 font-light">
            Please sign in to view your orders, live delivery tracking, and saved culinary profile.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('store')}
              className="w-full py-2.5 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Return to Store
            </button>
          </div>
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
    <div className="min-h-screen bg-[#0F0F0F] py-8 sm:py-12 text-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Welcome Bar */}
        <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center font-display text-2xl font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                Welcome Back
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#EAEAEA]">
                {user.name}
              </h1>
              <p className="text-xs text-white/50 font-light">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('store')}
              className="px-4 py-2.5 rounded-md border border-white/15 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Shop Store
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('store');
              }}
              className="p-2.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
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
            <div className="bg-[#151515] rounded-3xl p-4 border border-white/10 shadow-2xl space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>My Orders ({orders.length})</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Account Profile</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
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
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
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
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
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
                  <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Order History</h2>
                  <button
                    onClick={fetchOrders}
                    className="text-xs text-[#D4AF37] font-semibold hover:underline cursor-pointer"
                  >
                    Refresh Status
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="p-12 text-center bg-[#151515] rounded-3xl border border-white/10 text-white/50 text-sm font-light">
                    Loading your culinary orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#151515] rounded-3xl p-10 border border-white/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-[#D4AF37] flex items-center justify-center mx-auto border border-white/10">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-lg font-normal text-[#EAEAEA]">
                      No orders placed yet
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mx-auto font-light">
                      Upgrade your kitchen with the KitchEase 2-in-1 oil dispenser. Fast tracked delivery on all orders.
                    </p>
                    <button
                      onClick={() => onNavigate('store')}
                      className="px-6 py-3 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
                    >
                      Shop the KitchEase Dispenser
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-[#151515] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-lg hover:border-white/20 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-[#D4AF37] uppercase">
                              Order ID: {ord.id}
                            </span>
                            <p className="text-xs text-white/50 font-light">
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
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-950/60 text-red-400 border border-red-800'
                                : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        {/* Product info */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-[#1A1A1A] overflow-hidden flex-shrink-0 border border-white/10 p-1 flex items-center justify-center">
                              <img
                                src={ord.productImage || '/images/hero.jpg'}
                                alt={ord.productTitle || ord.productName || 'KitchEase Dispenser'}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-[#EAEAEA]">
                                {ord.productTitle || ord.productName || 'KitchEase Oil Dispenser / Sprayer'}
                              </h4>
                              <p className="text-xs text-white/50 font-light">Quantity: {ord.quantity}</p>
                              <span className="text-xs font-semibold text-[#D4AF37] block mt-1">
                                Total: ${(ord.totalAmount ?? ord.total ?? 0).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-4 py-2.5 rounded-md bg-white/5 border border-white/15 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Track &amp; Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Account Details</h2>

                {profileSuccess && (
                  <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your profile information has been saved successfully.</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-[#121212] text-sm text-white/40 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Saved Delivery Addresses</h2>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {showAddAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-4 animate-in fade-in"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                      Add New Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          placeholder={user.name}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-white/70 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="123 Olive Grove Lane"
                        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">State</label>
                        <input
                          type="text"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">ZIP / Postal</label>
                        <input
                          type="text"
                          required
                          value={addrZip}
                          onChange={(e) => setAddrZip(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#121212] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold cursor-pointer"
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
                        className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/10 relative flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="font-medium text-sm text-[#EAEAEA] block">{addr.fullName}</span>
                          <p className="text-xs text-white/60 font-light">{addr.address}</p>
                          <p className="text-xs text-white/60 font-light">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-xs text-white/40 mt-1">{addr.phone}</p>
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-3">
                          <span className="text-[11px] text-[#D4AF37] font-medium">Standard Shipping</span>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-white/40 hover:text-red-400 text-xs p-1 transition-colors cursor-pointer"
                            title="Remove address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/40 col-span-2 font-light">
                      No saved addresses yet. Add one for rapid 1-click checkout.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: RE-ORDER WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Instant Quick Re-order</h2>
                <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-28 h-28 rounded-2xl bg-[#121212] overflow-hidden flex-shrink-0 border border-white/10 p-2 flex items-center justify-center">
                    <img
                      src="/images/hero.jpg"
                      alt="KitchEase Dispenser"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="font-display text-lg font-normal text-[#EAEAEA]">
                      KitchEase Oil Dispenser / Sprayer
                    </h3>
                    <p className="text-xs text-white/50 font-light">
                      Order an additional unit for avocado oil, vinegar, or as a thoughtful gift for a fellow home chef.
                    </p>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                      <span className="text-xl font-bold text-[#D4AF37]">$29.99</span>
                      <span className="text-xs text-white/30 line-through font-light">$49.99</span>
                      <span className="text-xs text-[#D4AF37] font-semibold">40% OFF</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(1);
                      onNavigate('checkout');
                    }}
                    className="px-6 py-3 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors whitespace-nowrap shadow-lg cursor-pointer"
                  >
                    Quick Order ($29.99)
                  </button>
                </div>
              </div>
            )}

            {/* TAB: HELP & SUPPORT */}
            {activeTab === 'support' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Help &amp; Customer Care</h2>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  We are here to support your cooking journey. If you ever experience issues with misting pressure or have questions regarding maintenance, our culinary specialists respond within 24 hours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-2">
                    <h4 className="font-medium text-sm text-[#EAEAEA]">Order Inquiries</h4>
                    <p className="text-[#D4AF37]">orders@kitchease.com</p>
                    <p className="text-[11px] text-white/40 font-light">Please include your 6-character Order ID</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-2">
                    <h4 className="font-medium text-sm text-[#EAEAEA]">Product Assistance</h4>
                    <p className="text-[#D4AF37]">support@kitchease.com</p>
                    <p className="text-[11px] text-white/40 font-light">Cleaning instructions, nozzles &amp; parts</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('store')}
                    className="px-5 py-2.5 rounded-md border border-[#D4AF37] text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-[#EAEAEA]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase">
                  Tracking Order #{selectedOrder.id}
                </span>
                <h3 className="font-display text-xl font-normal text-[#EAEAEA]">
                  Live Shipment Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Step Tracker */}
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                {/* Connecting background line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-white/10 -z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#D4AF37] transition-all -z-0"
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
                            ? 'bg-[#D4AF37] text-black shadow-md'
                            : 'bg-[#1A1A1A] border-2 border-white/20 text-white/40'
                        } ${isCurrent ? 'ring-4 ring-[#D4AF37]/30 scale-110' : ''}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-semibold tracking-wider mt-2 uppercase ${
                          isCurrent
                            ? 'text-[#D4AF37]'
                            : isCompleted
                            ? 'text-white/80'
                            : 'text-white/40'
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
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs text-[#D4AF37] flex items-center gap-2">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Latest Fulfillment Update:</strong> {selectedOrder.adminNotes}
                </span>
              </div>
            )}

            {/* Item & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-1.5">
                <span className="font-semibold text-white block mb-1">Item Details</span>
                <p className="font-medium text-[#EAEAEA]">
                  {selectedOrder.productTitle || selectedOrder.productName || 'KitchEase Oil Dispenser / Sprayer'}
                </p>
                <p className="text-white/50 font-light">Quantity: {selectedOrder.quantity}</p>
                <p className="font-semibold text-[#D4AF37] mt-1">
                  Total Paid: ${(selectedOrder.totalAmount ?? selectedOrder.total ?? 0).toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-1.5">
                <span className="font-semibold text-white block mb-1">Delivery Destination</span>
                <p className="font-medium text-[#EAEAEA]">{selectedOrder.customerInformation.fullName}</p>
                <p className="text-white/50 font-light">{selectedOrder.customerInformation.address}</p>
                <p className="text-white/50 font-light">
                  {selectedOrder.customerInformation.city}, {selectedOrder.customerInformation.state}{' '}
                  {selectedOrder.customerInformation.postalCode}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
