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
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delivery Failed'
  | 'RTO Initiated'
  | 'RTO in Transit'
  | 'RTO Delivered'
  | 'Cancelled'
  | 'Order Received'
  | 'New'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT'
  | 'RTO_DELIVERED'
  | 'CANCELLED'
  | 'ORDER RECEIVED'
  | 'NEW';

export type PaymentMethodType = 'COD' | 'ONLINE' | 'CASH ON DELIVERY' | 'ONLINE PAYMENT';

export type PaymentStatusType =
  | 'COD_PENDING'
  | 'COD_COLLECTED'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'COD / PAYMENT PENDING'
  | 'PENDING'
  | 'PAID (VERIFIED ON DELIVERY)'
  | 'CANCELLED';

export type SettlementStatusType =
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'SETTLED'
  | 'RECONCILIATION_REQUIRED';

export type ShipmentStatusType =
  | 'NOT_ASSIGNED'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT'
  | 'RTO_DELIVERED'
  | 'RETURNED';

export interface OrderTimelineItem {
  status: OrderStatus | string;
  timestamp: string;
  note?: string;
  actor?: string;
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
  orderId?: string;
  userId?: string;
  productId: string;
  productName: string;
  productTitle?: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  discount: number;
  shipping: number;
  deliveryCharge?: number;
  total: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentAmount?: number;
  paymentCollectedAt?: string;
  paymentCollectedBy?: string;
  settlementStatus?: SettlementStatusType | string;
  settlementAmount?: number;
  settlementDate?: string;
  settlementReference?: string;
  settlementNotes?: string;
  settlementRecordedBy?: string;
  shippingProvider?: string;
  courierName?: string;
  trackingNumber?: string;
  shipmentStatus?: ShipmentStatusType | string;
  shippedAt?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  customerInformation: CustomerInformation;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineItem[];
  adminNotes?: string;
}

export interface PaymentSummary {
  totalCodOrders: number;
  codPendingCollectionAmount: number;
  codPendingCollectionCount: number;
  codCollectedAmount: number;
  codCollectedCount: number;
  codSettlementPendingAmount: number;
  codSettlementPendingCount: number;
  codSettledAmount: number;
  codSettledCount: number;
  codReconciliationRequiredAmount: number;
  codReconciliationRequiredCount: number;
  totalOnlineOrders: number;
  totalOnlineRevenue: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  orderId: string;
  adminUserId: string;
  adminUserName?: string;
  timestamp: string;
  details?: any;
  note?: string;
}

export interface RecordSettlementPayload {
  settlementAmount: number;
  settlementDate?: string;
  settlementReference: string;
  courierName?: string;
  notes?: string;
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
