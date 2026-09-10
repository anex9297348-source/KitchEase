export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  addresses?: UserAddress[];
  wishlist?: string[];
  mustChangePassword?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  caption: string;
  alt: string;
  order: number;
  isMain?: boolean;
}

export interface ProductSpecifications {
  material: string;
  capacity: string;
  dimensions: string;
  weight: string;
  packageContents: string;
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  specifications: ProductSpecifications;
  features: string[];
  images: ProductImage[];
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CustomerInformation {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  id: string;
  userId?: string;
  productId: string;
  productName: string;
  productTitle?: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  shipping: number;
  total: number;
  totalAmount?: number;
  customerInformation: CustomerInformation;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineItem[];
  adminNotes?: string;
}

export interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  verifiedPurchase: boolean;
  image?: string;
}

export interface ManualStep {
  stepNumber: number;
  title: string;
  description: string;
  image?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export type FAQ = FAQItem;

export interface UserManualData {
  id: string;
  title: string;
  steps: ManualStep[];
  dos: string[];
  donts: string[];
  cleaningInstructions: string[];
  careInstructions: string[];
  faqs: FAQItem[];
}

export interface SiteSettings {
  announcement: string;
  supportEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  currencySymbol: string;
  allowGuestCheckout: boolean;
  privacyPolicy?: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  currentStock: number;
  ordersOverTime: { date: string; orders: number; revenue: number }[];
  statusDistribution: { status: OrderStatus; count: number }[];
}
