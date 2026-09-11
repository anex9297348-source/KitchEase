import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Image as ImageIcon,
  BookOpen,
  MessageSquare,
  Settings as SettingsIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Edit2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  LogOut,
  ChevronRight,
  Eye,
  Save,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Lock,
  Key,
  AlertTriangle,
  Check,
  X,
  MapPin,
  Download,
  ArrowUpDown,
  FileSpreadsheet,
  Banknote,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';
import { PhotoUploaderModal } from '../common/PhotoUploaderModal.tsx';
import { PaymentsDashboard } from './PaymentsDashboard.tsx';
import { CODSettlementModal } from './CODSettlementModal.tsx';
import { OrderPaymentDetailsModal } from './OrderPaymentDetailsModal.tsx';
import type {
  Order,
  OrderStatus,
  DashboardStats,
  User as UserType,
  ProductImage,
  FAQ,
  Review,
} from '../../types.ts';

interface AdminDashboardProps {
  onNavigate: (view: 'store' | 'admin' | 'account' | 'checkout' | 'confirmation') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin, logout, openAuthModal, login, adminLogin, changeAdminPassword } = useAuth();
  const { product, images, manual, reviews, settings, refreshAll } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'payments' | 'customers' | 'product' | 'images' | 'manual' | 'reviews' | 'settings'
  >('overview');
  const [codSettlementOrder, setCodSettlementOrder] = useState<Order | null>(null);
  const [orderDossierOrder, setOrderDossierOrder] = useState<Order | null>(null);

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderSort, setOrderSort] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PROCESSING');
  const [statusNote, setStatusNote] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('');
  const [courierTracking, setCourierTracking] = useState<string>('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Customers
  const [customers, setCustomers] = useState<(UserType & { orderCount: number; totalSpent: number })[]>([]);

  // Product Form
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState(29.99);
  const [productOrigPrice, setProductOrigPrice] = useState(49.99);
  const [productDiscount, setProductDiscount] = useState(40);
  const [productStock, setProductStock] = useState(135);
  const [specsMaterial, setSpecsMaterial] = useState('');
  const [specsCapacity, setSpecsCapacity] = useState('');
  const [specsDimensions, setSpecsDimensions] = useState('');
  const [specsWeight, setSpecsWeight] = useState('');
  const [specsPackage, setSpecsPackage] = useState('');
  const [productSaveSuccess, setProductSaveSuccess] = useState(false);

  // Images Form
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [newImgAlt, setNewImgAlt] = useState('');
  const [showAddImage, setShowAddImage] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  // Manual Form
  const [manualTitle, setManualTitle] = useState('');
  const [manualSteps, setManualSteps] = useState<any[]>([]);
  const [manualDos, setManualDos] = useState<string[]>([]);
  const [manualDonts, setManualDonts] = useState<string[]>([]);
  const [manualFaqs, setManualFaqs] = useState<FAQ[]>([]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // Reviews
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);

  // Settings
  const [announcement, setAnnouncement] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Admin login fallback state - never pre-fill credentials in client code
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forced Password Change Workflow State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Check if admin is required to change their temporary initial password
  useEffect(() => {
    if (isAdmin && user?.mustChangePassword) {
      setShowChangePasswordModal(true);
    }
  }, [isAdmin, user?.mustChangePassword]);

  // Initialize data
  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadOrders();
      loadCustomers();
      loadReviews();
    }
  }, [isAdmin, statusFilter, orderSearch]);

  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setProductDesc(product.description);
      setProductPrice(product.price);
      setProductOrigPrice(product.originalPrice);
      setProductDiscount(product.discount);
      setProductStock(product.stock);
      setSpecsMaterial(product.specifications.material || '');
      setSpecsCapacity(product.specifications.capacity || '');
      setSpecsDimensions(product.specifications.dimensions || '');
      setSpecsWeight(product.specifications.weight || '');
      setSpecsPackage(product.specifications.packageContents || '');
    }
    if (manual) {
      setManualTitle(manual.title);
      setManualSteps(manual.steps || []);
      setManualDos(manual.dos || []);
      setManualDonts(manual.donts || []);
      setManualFaqs(manual.faqs || []);
    }
    if (settings) {
      setAnnouncement(settings.announcement || '');
      setSupportEmail(settings.supportEmail || '');
      setSupportPhone(settings.supportPhone || '');
    }
  }, [product, manual, settings]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.getAdminStats();
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.getAdminOrders(statusFilter, orderSearch);
      setAdminOrders(res.orders);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.getAdminCustomers();
      setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.getAdminReviews();
      setAdminReviews(res.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Admin Login with Server-Side Verification
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const loggedUser = await adminLogin(adminEmail, adminPass);
      if (loggedUser.role !== 'ADMIN') {
        setLoginError('Access denied: Account does not possess Store Owner privileges.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials. Access restricted.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Forced or Voluntary Admin Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === '9297348') {
      setPasswordChangeError('You cannot reuse the default temporary setup password. Please select a unique, strong password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirmation password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      setPasswordChangeSuccess(res.message || 'Administrator password successfully secured!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordChangeSuccess(null);
      }, 1800);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Failed to update administrator password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] bg-[#0F0F0F] flex items-center justify-center p-4 text-[#EAEAEA]">
        <div className="bg-[#151515] rounded-3xl p-8 border border-white/10 shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto mb-2 shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl font-normal text-[#EAEAEA]">
              Owner Admin Portal
            </h2>
            <p className="text-xs text-white/50 font-light">
              Server-authoritative portal for KitchEase store operations, inventory management, and customer order processing.
            </p>
          </div>

          {/* Zero-Trust Security Gateway Notice */}
          <div className="p-3.5 bg-[#1A1A1A] rounded-2xl border border-white/10 text-xs text-white/70 space-y-1.5">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Store Owner Area</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Customer personal details (full address, phone number, order history) are protected by PBKDF2 encryption and strict server-side authorization. Normal customer accounts cannot access this portal.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Store Owner Email / Username</label>
              <input
                type="text"
                required
                placeholder="admin@kitchease.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Admin Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <button
            onClick={() => onNavigate('store')}
            className="w-full text-center text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            ← Return to Public Storefront
          </button>
        </div>
      </div>
    );
  }

  // Sorting and filtering orders
  const sortedAndFilteredOrders = React.useMemo(() => {
    return [...adminOrders].sort((a, b) => {
      if (orderSort === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (orderSort === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (orderSort === 'amount-desc') {
        return (b.totalAmount ?? b.total ?? 0) - (a.totalAmount ?? a.total ?? 0);
      }
      if (orderSort === 'amount-asc') {
        return (a.totalAmount ?? a.total ?? 0) - (b.totalAmount ?? b.total ?? 0);
      }
      return 0;
    });
  }, [adminOrders, orderSort]);

  // CSV Export feature
  const handleExportCSV = () => {
    if (sortedAndFilteredOrders.length === 0) return;
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Full Address',
      'City',
      'State',
      'Postal Code',
      'Product Name',
      'Quantity',
      'Unit Price',
      'Subtotal',
      'Discount',
      'Shipping',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Admin Notes',
    ];

    const rows = sortedAndFilteredOrders.map((ord) => [
      `"${(ord.orderId || ord.id).replace(/"/g, '""')}"`,
      `"${new Date(ord.createdAt).toISOString()}"`,
      `"${(ord.customerName || ord.customerInformation?.fullName || '').replace(/"/g, '""')}"`,
      `"${(ord.phone || ord.customerInformation?.phone || '').replace(/"/g, '""')}"`,
      `"${(ord.customerInformation?.email || '').replace(/"/g, '""')}"`,
      `"${(ord.address || ord.customerInformation?.address || '').replace(/"/g, '""')}"`,
      `"${(ord.city || ord.customerInformation?.city || '').replace(/"/g, '""')}"`,
      `"${(ord.state || ord.customerInformation?.state || '').replace(/"/g, '""')}"`,
      `"${(ord.pincode || ord.customerInformation?.postalCode || '').replace(/"/g, '""')}"`,
      `"${(ord.productName || 'Oil Dispenser & Sprayer').replace(/"/g, '""')}"`,
      ord.quantity,
      (ord.unitPrice || 29.99).toFixed(2),
      (ord.subtotal || 0).toFixed(2),
      (ord.discount || 0).toFixed(2),
      (ord.shipping || ord.deliveryCharge || 0).toFixed(2),
      (ord.totalAmount ?? ord.total ?? 0).toFixed(2),
      `"${(ord.paymentMethod || 'CASH ON DELIVERY').replace(/"/g, '""')}"`,
      `"${(ord.paymentStatus || 'COD / PENDING').replace(/"/g, '""')}"`,
      `"${(ord.orderStatus || ord.status || '').replace(/"/g, '""')}"`,
      `"${(ord.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kitchease-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Update order status handler
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingOrderStatus(true);
    try {
      const parts: string[] = [];
      if (courierName.trim()) parts.push(`Courier: ${courierName.trim()}`);
      if (courierTracking.trim()) parts.push(`Tracking #: ${courierTracking.trim()}`);
      if (statusNote.trim()) parts.push(statusNote.trim());
      const finalNote = parts.join(' | ');

      const res = await api.updateOrderStatus(selectedOrder.id, newStatus, finalNote || undefined);
      setSelectedOrder(res.order);
      await loadOrders();
      await loadStats();
      setStatusNote('');
      setCourierName('');
      setCourierTracking('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  // Product save handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProduct({
        name: productName,
        description: productDesc,
        price: Number(productPrice),
        originalPrice: Number(productOrigPrice),
        discount: Number(productDiscount),
        stock: Number(productStock),
        specifications: {
          material: specsMaterial,
          capacity: specsCapacity,
          dimensions: specsDimensions,
          weight: specsWeight,
          packageContents: specsPackage,
        },
      });
      await refreshAll();
      setProductSaveSuccess(true);
      setTimeout(() => setProductSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Image actions
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) return;
    try {
      await api.addProductImage({
        url: newImgUrl.trim(),
        caption: newImgCaption.trim() || 'KitchEase Product Perspective',
        alt: newImgAlt.trim() || 'KitchEase Oil Dispenser',
        isMain: images.length === 0,
      });
      await refreshAll();
      setShowAddImage(false);
      setNewImgUrl('');
      setNewImgCaption('');
      setNewImgAlt('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetMainImage = async (id: string) => {
    try {
      await api.updateProductImage(id, { isMain: true });
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (images.length <= 1) {
      alert('Cannot delete the only product image.');
      return;
    }
    try {
      await api.deleteProductImage(id);
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const newArr = [...images];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(newIdx, 0, moved);
    try {
      await api.reorderProductImages(newArr.map((i) => i.id));
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Manual save handler
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateManual({
        title: manualTitle,
        steps: manualSteps,
        dos: manualDos,
        donts: manualDonts,
        faqs: manualFaqs,
      });
      await refreshAll();
      setManualSaveSuccess(true);
      setTimeout(() => setManualSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Add FAQ handler
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const newFaqItem: FAQ = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
    };
    setManualFaqs([...manualFaqs, newFaqItem]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleDeleteFaq = (id: string) => {
    setManualFaqs(manualFaqs.filter((f) => f.id !== id));
  };

  // Reviews handlers
  const handleToggleReviewStatus = async (id: string, current: boolean) => {
    try {
      await api.updateReviewStatus(id, !current);
      await loadReviews();
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await api.deleteReview(id);
      await loadReviews();
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Settings save handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        announcement,
        supportEmail,
        supportPhone,
      });
      await refreshAll();
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Status breakdown chart data
  const statusChartData = stats
    ? [
        { name: 'Pending', count: stats.pendingOrders, fill: '#EAB308' },
        { name: 'Processing', count: stats.processingOrders, fill: '#3B82F6' },
        { name: 'Shipped', count: stats.shippedOrders, fill: '#8B5CF6' },
        { name: 'Delivered', count: stats.deliveredOrders, fill: '#2C4A3E' },
        { name: 'Cancelled', count: stats.cancelledOrders, fill: '#EF4444' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-6 sm:py-8 text-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Owner Header */}
        <div className="bg-[#151515] text-[#EAEAEA] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-display font-bold shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Store Management Console
                </span>
                <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-[10px] uppercase font-bold text-black">
                  Owner Level
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight mt-0.5 text-[#EAEAEA]">
                KitchEase Operations
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-4 py-2.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => onNavigate('store')}
              className="px-4 py-2.5 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('store');
              }}
              className="p-2.5 rounded-md bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer"
              title="Sign out of Owner Console"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Forced Password Change Notice Banner */}
        {user?.mustChangePassword && (
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-bold text-amber-100">Mandatory Security Upgrade: Change Initial Password</p>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Your store owner account is currently using the initial setup password. For customer data privacy, you must update your password before leaving this session.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-md"
            >
              Set New Password Now
            </button>
          </div>
        )}

        {/* Mandatory / Voluntary Admin Password Change Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#151515] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              {!user?.mustChangePassword && (
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto mb-1 shadow-sm">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-normal text-white">
                  {user?.mustChangePassword ? 'Security Upgrade Required' : 'Update Admin Password'}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {user?.mustChangePassword
                    ? 'Your administrator account was activated using the initial setup code. Set a new private password (minimum 8 characters) to secure store access.'
                    : 'Rotate your administrator credentials to maintain customer privacy and store security.'}
                </p>
              </div>

              {passwordChangeError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">New Password (min 8 characters)</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-md disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isChangingPassword ? 'Securing Account...' : 'Set New Admin Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Dashboard Layout: Sidebar + Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Admin Sidebar Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-[#151515] rounded-3xl p-4 border border-white/10 shadow-2xl space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview &amp; Stats</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders ({stats?.totalOrders || adminOrders.length})</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Payments &amp; COD</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Customers ({customers.length})</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('product')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'product'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Product &amp; Pricing</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('images')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'images'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Gallery Images ({images.length})</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Manual &amp; FAQs</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Review Moderation</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Store Settings</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Stage (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* SUB-VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="bg-[#151515] p-5 rounded-3xl border border-white/10 shadow-lg">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block">
                      Total Orders
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-normal text-white mt-1 block">
                      {stats?.totalOrders ?? 0}
                    </span>
                    <span className="text-[11px] text-[#D4AF37] font-medium mt-1 block">
                      {stats?.todayOrders ?? 0} placed today
                    </span>
                  </div>

                  <div className="bg-[#151515] p-5 rounded-3xl border border-white/10 shadow-lg">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block">
                      Total Revenue
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-normal text-white mt-1 block">
                      ${stats ? stats.totalRevenue.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-[11px] text-[#D4AF37] font-medium mt-1 block">
                      Gross order value
                    </span>
                  </div>

                  <div className="bg-[#151515] p-5 rounded-3xl border border-white/10 shadow-lg">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block">
                      Inventory Stock
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-normal text-white mt-1 block">
                      {stats?.currentStock ?? 135}
                    </span>
                    <span className="text-[11px] text-white/40 font-light mt-1 block">
                      KitchEase units left
                    </span>
                  </div>

                  <div className="bg-[#151515] p-5 rounded-3xl border border-white/10 shadow-lg">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block">
                      Active In-Transit
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-normal text-white mt-1 block">
                      {(stats?.processingOrders || 0) + (stats?.shippedOrders || 0)}
                    </span>
                    <span className="text-[11px] text-[#D4AF37] font-medium mt-1 block">
                      Fulfillment pipeline
                    </span>
                  </div>
                </div>

                {/* Status Breakdown Bar & Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Count Card */}
                  <div className="bg-[#151515] p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
                    <h3 className="font-display text-lg font-normal text-[#EAEAEA]">
                      Order Pipeline Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusChartData}>
                          <XAxis dataKey="name" stroke="#666" fontSize={11} />
                          <YAxis stroke="#666" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A1A1A',
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Status Checklist Metrics */}
                  <div className="bg-[#151515] p-6 rounded-3xl border border-white/10 shadow-lg space-y-3">
                    <h3 className="font-display text-lg font-normal text-[#EAEAEA]">
                      Fulfillment Status Overview
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40">
                        <span className="font-medium text-amber-300">Pending Confirmation</span>
                        <span className="font-bold text-amber-200 text-sm">
                          {stats?.pendingOrders ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-950/30 border border-blue-800/40">
                        <span className="font-medium text-blue-300">Processing &amp; Boxing</span>
                        <span className="font-bold text-blue-200 text-sm">
                          {stats?.processingOrders ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                        <span className="font-medium text-purple-300">Shipped with Courier</span>
                        <span className="font-bold text-purple-200 text-sm">
                          {stats?.shippedOrders ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
                        <span className="font-medium text-emerald-300">Delivered Successfully</span>
                        <span className="font-bold text-emerald-200 text-sm">
                          {stats?.deliveredOrders ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: ORDER MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-normal text-[#EAEAEA]">
                      Order Management
                    </h2>
                    <p className="text-xs text-white/50 mt-0.5">
                      Showing {sortedAndFilteredOrders.length} order{sortedAndFilteredOrders.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  {/* Search, Sort, Filter, and Export controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search orders, names, IDs..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs rounded-md border border-white/15 bg-[#1A1A1A] text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none w-44 sm:w-52"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-md border border-white/15 bg-[#1A1A1A] font-medium text-white/80 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ORDER RECEIVED">Order Received (New)</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT FOR DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                      value={orderSort}
                      onChange={(e) => setOrderSort(e.target.value as any)}
                      className="px-3 py-1.5 text-xs rounded-md border border-white/15 bg-[#1A1A1A] font-medium text-white/80 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                      title="Sort Orders"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="amount-desc">Amount: High to Low</option>
                      <option value="amount-asc">Amount: Low to High</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      disabled={sortedAndFilteredOrders.length === 0}
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Export filtered orders to CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Orders Table - matching Section 9 requirements */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Product</th>
                        <th className="py-3 px-3 text-center">Qty</th>
                        <th className="py-3 px-3">Total</th>
                        <th className="py-3 px-3">Payment Status</th>
                        <th className="py-3 px-3">Order Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#EAEAEA]">
                      {sortedAndFilteredOrders.map((ord) => {
                        const ordId = ord.orderId || ord.id;
                        const statusUpper = (ord.orderStatus || ord.status || '').toUpperCase();
                        const payStatus = ord.paymentStatus || (ord.paymentMethod === 'CASH ON DELIVERY' ? 'COD / PENDING' : 'PENDING');
                        return (
                          <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                              {ordId}
                            </td>
                            <td className="py-3.5 px-3 text-white/50 whitespace-nowrap">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <p className="font-medium text-white truncate max-w-[180px]">
                                {ord.productName || 'Oil Dispenser & Sprayer'}
                              </p>
                              <p className="text-[11px] text-white/40">
                                {ord.customerName || ord.customerInformation.fullName}
                              </p>
                            </td>
                            <td className="py-3.5 px-3 text-center font-medium text-white/80">
                              {ord.quantity}
                            </td>
                            <td className="py-3.5 px-3 font-medium text-[#D4AF37] whitespace-nowrap">
                              ${(ord.totalAmount ?? ord.total ?? 0).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    payStatus.includes('PAID') || payStatus.includes('COLLECTED')
                                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                      : payStatus.includes('CANCELLED')
                                      ? 'bg-stone-800 text-stone-400 border border-stone-700'
                                      : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                  }`}
                                >
                                  {payStatus}
                                </span>
                                {ord.settlementStatus && (
                                  <span
                                    className={`block text-[9px] font-semibold uppercase tracking-wider ${
                                      ord.settlementStatus === 'SETTLED'
                                        ? 'text-emerald-400'
                                        : ord.settlementStatus === 'RECONCILIATION_REQUIRED'
                                        ? 'text-red-400'
                                        : ord.settlementStatus === 'COD_COLLECTED'
                                        ? 'text-blue-400'
                                        : 'text-stone-400'
                                    }`}
                                  >
                                    {ord.settlementStatus.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  statusUpper === 'DELIVERED'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                    : statusUpper === 'CANCELLED'
                                    ? 'bg-red-950/60 text-red-400 border border-red-800'
                                    : statusUpper === 'SHIPPED' || statusUpper === 'OUT FOR DELIVERY'
                                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800'
                                    : statusUpper === 'PROCESSING' || statusUpper === 'CONFIRMED'
                                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                                    : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {ord.orderStatus || ord.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(ord);
                                    setNewStatus(ord.orderStatus || ord.status);
                                    setStatusNote(ord.adminNotes || '');
                                    setCourierName(ord.courierName || '');
                                    setCourierTracking(ord.trackingNumber || '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-md bg-[#D4AF37] text-black text-[11px] font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer transition-colors"
                                >
                                  VIEW
                                </button>
                                <button
                                  onClick={() => setOrderDossierOrder(ord)}
                                  className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                  title="Payment & Fulfillment Dossier"
                                >
                                  <Banknote className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`/api/shipping/label/${encodeURIComponent(ord.trackingNumber || ord.orderId || ord.id)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                  title="Print Courier Shipping Label"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {sortedAndFilteredOrders.length === 0 && (
                    <div className="py-12 text-center text-white/40 text-xs">
                      No orders found matching criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW: PAYMENTS & COD SETTLEMENT */}
            {activeTab === 'payments' && (
              <PaymentsDashboard
                orders={adminOrders}
                onRefreshOrders={loadOrders}
              />
            )}

            {/* SUB-VIEW 3: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Customer Directory</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Orders</th>
                        <th className="py-3 px-3">Total Spend</th>
                        <th className="py-3 px-3">Member Since</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#EAEAEA]">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-medium text-white">{c.name}</td>
                          <td className="py-3 px-3 text-white/60">{c.email}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                c.role === 'ADMIN'
                                  ? 'bg-[#D4AF37] text-black'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {c.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-white/80">{c.orderCount || 0}</td>
                          <td className="py-3 px-3 font-medium text-[#D4AF37]">
                            ${(c.totalSpent || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-white/50">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: PRODUCT MANAGEMENT */}
            {activeTab === 'product' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-display text-xl font-normal text-[#EAEAEA]">
                    Product Details &amp; Pricing
                  </h2>
                  {productSaveSuccess && (
                    <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Changes saved to store!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Stock Quantity (Remaining)
                      </label>
                      <input
                        type="number"
                        required
                        value={productStock}
                        onChange={(e) => setProductStock(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productPrice}
                        onChange={(e) => setProductPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productOrigPrice}
                        onChange={(e) => setProductOrigPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        required
                        value={productDiscount}
                        onChange={(e) => setProductDiscount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h3 className="font-display text-sm font-normal text-white uppercase tracking-wider">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">
                          Material
                        </label>
                        <input
                          type="text"
                          value={specsMaterial}
                          onChange={(e) => setSpecsMaterial(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">
                          Capacity
                        </label>
                        <input
                          type="text"
                          value={specsCapacity}
                          onChange={(e) => setSpecsCapacity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={specsDimensions}
                          onChange={(e) => setSpecsDimensions(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-white/70 mb-1">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={specsWeight}
                          onChange={(e) => setSpecsWeight(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-white/70 mb-1">
                          Package Contents
                        </label>
                        <input
                          type="text"
                          value={specsPackage}
                          onChange={(e) => setSpecsPackage(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Product Updates</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-VIEW 5: PRODUCT IMAGES */}
            {activeTab === 'images' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h2 className="font-display text-xl font-normal text-[#EAEAEA]">
                      Product Gallery Assets
                    </h2>
                    <p className="text-xs text-white/50 font-light">
                      Manage visual perspectives, reorder, assign main image, or upload new visuals.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setUploaderOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer transition-colors shadow-md"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Real Photos</span>
                    </button>
                    <button
                      onClick={() => setShowAddImage(!showAddImage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Image URL</span>
                    </button>
                  </div>
                </div>

                {showAddImage && (
                  <form
                    onSubmit={handleAddImage}
                    className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-3"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Add New Product Visual
                    </h3>
                    <div>
                      <label className="block text-[11px] font-medium text-white/70 mb-1">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={newImgUrl}
                        onChange={(e) => setNewImgUrl(e.target.value)}
                        placeholder="https://... or /images/custom.jpg"
                        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#151515] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-white/70 mb-1">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={newImgCaption}
                        onChange={(e) => setNewImgCaption(e.target.value)}
                        placeholder="e.g. Side angle view with measuring indicators"
                        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#151515] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-white/70 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={newImgAlt}
                        onChange={(e) => setNewImgAlt(e.target.value)}
                        placeholder="Accessibility description"
                        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#151515] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddImage(false)}
                        className="px-3 py-1.5 text-xs text-white/50 hover:text-white cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer"
                      >
                        Add to Gallery
                      </button>
                    </div>
                  </form>
                )}

                {/* Images List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 flex gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10 p-1">
                          <img
                            src={img.url}
                            alt={img.alt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="max-w-[180px]">
                          <p className="text-xs font-medium text-white line-clamp-1">{img.caption}</p>
                          <span className="text-[10px] text-white/40 block">Position #{idx + 1}</span>
                          {img.isMain && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#D4AF37] text-black text-[9px] font-bold uppercase">
                              Main Image
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 hover:bg-white/10 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveImage(idx, 'down')}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 hover:bg-white/10 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {!img.isMain && (
                            <button
                              onClick={() => handleSetMainImage(img.id)}
                              className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="text-white/40 hover:text-red-400 cursor-pointer p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <PhotoUploaderModal
                  isOpen={uploaderOpen}
                  onClose={() => setUploaderOpen(false)}
                />
              </div>
            )}

            {/* SUB-VIEW 6: USER MANUAL & FAQS */}
            {activeTab === 'manual' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h2 className="font-display text-xl font-normal text-[#EAEAEA]">
                      User Manual &amp; FAQs Management
                    </h2>
                    <p className="text-xs text-white/50 font-light">
                      Live content editing for customer guides, operating steps, and FAQ answers.
                    </p>
                  </div>
                  {manualSaveSuccess && (
                    <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Manual Saved!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveManual} className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Manual Title
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Operational Steps */}
                  <div className="space-y-3">
                    <h3 className="font-display text-sm font-normal text-white uppercase tracking-wider">
                      Steps 1–6 Content
                    </h3>
                    <div className="space-y-3">
                      {manualSteps.map((st, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#1A1A1A] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#D4AF37]">
                              Step {st.stepNumber}: {st.title}
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={st.description}
                            onChange={(e) => {
                              const updated = [...manualSteps];
                              updated[idx].description = e.target.value;
                              setManualSteps(updated);
                            }}
                            className="w-full p-2 text-xs bg-[#151515] rounded-lg border border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Manager */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h3 className="font-display text-sm font-normal text-white uppercase tracking-wider">
                      Manage FAQs
                    </h3>

                    {/* Add new FAQ */}
                    <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-white block">Add New FAQ</span>
                      <input
                        type="text"
                        placeholder="Question..."
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#151515] rounded-lg border border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="Answer..."
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#151515] rounded-lg border border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="px-4 py-1.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer"
                      >
                        + Add FAQ Item
                      </button>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3">
                      {manualFaqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="p-3.5 rounded-2xl bg-[#1A1A1A] border border-white/10 flex justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-xs text-white">{faq.question}</p>
                            <p className="text-[11px] text-white/60 font-light">{faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="text-white/40 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    Save Manual &amp; FAQs
                  </button>
                </form>
              </div>
            )}

            {/* SUB-VIEW 7: REVIEW MODERATION */}
            {activeTab === 'reviews' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Customer Reviews Moderation</h2>
                <div className="space-y-4">
                  {adminReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-white">{rev.userName}</span>
                          <span className="text-[#D4AF37] font-bold text-xs">★ {rev.rating}/5</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rev.isApproved
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {rev.isApproved ? 'Approved (Public)' : 'Hidden (Pending)'}
                          </span>
                        </div>
                        <p className="font-medium text-xs text-white/90">{rev.title}</p>
                        <p className="text-xs text-white/60 italic font-light">"{rev.comment}"</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleReviewStatus(rev.id, rev.isApproved)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                            rev.isApproved
                              ? 'bg-white/10 text-white hover:bg-white/15'
                              : 'bg-[#D4AF37] text-black hover:bg-[#E5C158]'
                          }`}
                        >
                          {rev.isApproved ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-2 text-white/40 hover:text-red-400 rounded-lg cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 8: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-display text-xl font-normal text-[#EAEAEA]">Store Global Settings</h2>
                  {settingsSaveSuccess && (
                    <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Settings updated!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Store Announcement Banner
                    </label>
                    <input
                      type="text"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      placeholder="e.g. Free Tracked Shipping Worldwide — Limited Batch Remaining"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Customer Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">
                      Customer Support Phone
                    </label>
                    <input
                      type="tel"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details & Status Update Modal (Sections 10 & 11) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl space-y-6 text-[#EAEAEA] my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                  Admin Order Inspector
                </span>
                <h3 className="font-display text-lg font-normal text-white">
                  Order #{selectedOrder.orderId || selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/40 hover:text-white text-xs font-bold cursor-pointer p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* SECTION 10: CUSTOMER DETAILS & DELIVERY ADDRESS */}
            <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Customer Details &amp; Delivery Address
                </h4>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  Authorized Admin View
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px]">Customer Name</span>
                  <span className="font-medium text-white">
                    {selectedOrder.customerName || selectedOrder.customerInformation.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-white/40 block text-[11px]">Phone Number</span>
                  <span className="font-mono text-white">
                    {selectedOrder.phone || selectedOrder.customerInformation.phone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-white/40 block text-[11px]">Full Delivery Address</span>
                  <p className="font-medium text-white/90">
                    {selectedOrder.address || selectedOrder.customerInformation.address}
                  </p>
                </div>

                <div>
                  <span className="text-white/40 block text-[11px]">City &amp; State</span>
                  <span className="text-white/80">
                    {selectedOrder.city || selectedOrder.customerInformation.city},{' '}
                    {selectedOrder.state || selectedOrder.customerInformation.state}
                  </span>
                </div>

                <div>
                  <span className="text-white/40 block text-[11px]">Pincode / Postal Code</span>
                  <span className="font-mono font-bold text-white">
                    {selectedOrder.pincode || selectedOrder.customerInformation.postalCode}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS & PAYMENT BREAKDOWN */}
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-white/60">
                <span>Product</span>
                <span className="font-medium text-white">
                  {selectedOrder.productName || 'Oil Dispenser & Sprayer'}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Quantity</span>
                <span className="font-medium text-white">{selectedOrder.quantity} item(s)</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Payment Method</span>
                <span className="font-medium text-white">
                  {selectedOrder.paymentMethod || 'CASH ON DELIVERY'}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Payment Status</span>
                <span className="font-bold text-[#D4AF37]">
                  {selectedOrder.paymentStatus || 'COD / PAYMENT PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Order Total</span>
                <span className="text-[#D4AF37]">
                  ${(selectedOrder.totalAmount ?? selectedOrder.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* COD & COURIER SETTLEMENT RECONCILIATION DOSSIER */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  <span>Doorstep Collection &amp; Remittance</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedOrder.settlementStatus === 'SETTLED'
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                    : selectedOrder.settlementStatus === 'RECONCILIATION_REQUIRED'
                    ? 'bg-red-950/70 text-red-400 border border-red-800'
                    : 'bg-white/10 text-stone-300'
                }`}>
                  {selectedOrder.settlementStatus?.replace(/_/g, ' ') || 'PENDING COLLECTION'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-300 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Courier Partner:</span>
                  <span className="font-semibold text-white">{selectedOrder.courierName || 'Standard Express'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Waybill / Tracking:</span>
                  <span className="font-mono text-white">{selectedOrder.trackingNumber || 'Not assigned'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setOrderDossierOrder(ord);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Full Audit &amp; Settlement Dossier</span>
                </button>

                <a
                  href={`/api/shipping/label/${encodeURIComponent(selectedOrder.trackingNumber || selectedOrder.orderId || selectedOrder.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print Label &amp; Slip</span>
                </a>

                {selectedOrder.paymentStatus === 'COD_COLLECTED' && selectedOrder.settlementStatus !== 'SETTLED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      setCodSettlementOrder(ord);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Mark Settled
                  </button>
                )}
              </div>
            </div>

            {/* ORDER TIMELINE HISTORY (AUDIT TRAIL) */}
            {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/5 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                  Order Status Audit History ({selectedOrder.timeline.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#151515] border border-white/5 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-white/50">
                        <span className="font-bold text-[#D4AF37] uppercase">{item.status}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      {item.note && <p className="text-white/80 font-light">{item.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 11: UPDATE ORDER STATUS & COURIER DISPATCH */}
            <div className="space-y-3.5 pt-2 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block">
                Update Order Status &amp; Courier Dispatch
              </span>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  New Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs font-medium focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="ORDER RECEIVED">Order Received (New)</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="OUT FOR DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Courier Partner (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FedEx, Blue Dart, Delhivery"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Courier Tracking # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRK-892471934"
                    value={courierTracking}
                    onChange={(e) => setCourierTracking(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Dispatch / Customer Tracking Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched from fulfillment warehouse. Expected delivery in 48 hours."
                  className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 text-xs font-medium text-white/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingOrderStatus}
                className="px-6 py-2.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] cursor-pointer transition-colors disabled:opacity-50"
              >
                {updatingOrderStatus ? 'Updating...' : 'Save & Publish Status'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Global Modals for COD Settlement & Dossier */}
      <CODSettlementModal
        order={codSettlementOrder}
        isOpen={!!codSettlementOrder}
        onClose={() => setCodSettlementOrder(null)}
        onSuccess={(_updated) => {
          loadOrders();
          loadStats();
        }}
      />

      <OrderPaymentDetailsModal
        order={orderDossierOrder}
        isOpen={!!orderDossierOrder}
        onClose={() => setOrderDossierOrder(null)}
        onRefresh={() => {
          loadOrders();
          loadStats();
        }}
        onOpenSettlement={(ord) => {
          setOrderDossierOrder(null);
          setCodSettlementOrder(ord);
        }}
      />
    </div>
  );
};
