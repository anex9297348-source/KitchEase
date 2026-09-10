import type {
  User,
  Product,
  ProductImage,
  Order,
  Review,
  UserManualData,
  SiteSettings,
  DashboardStats,
  OrderStatus,
} from '../types.ts';

const TOKEN_KEY = 'kitchease_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async adminLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async changeAdminPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string; user: User; token: string }> {
    const res = await request<{ success: boolean; message: string; user: User; token: string }>(
      '/api/admin/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getPrivacyPolicy(): Promise<{ privacyPolicy: string }> {
    return request<{ privacyPolicy: string }>('/api/privacy-policy');
  },

  async register(
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(name: string, phone?: string): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone }),
    });
  },

  async addAddress(address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault?: boolean;
  }) {
    return request<{ address: any }>('/api/auth/address', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  async deleteAddress(id: string) {
    return request<{ success: boolean }>(`/api/auth/address/${id}`, {
      method: 'DELETE',
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Public Store Data
  async getProduct(): Promise<{ product: Product }> {
    return request<{ product: Product }>('/api/product');
  },

  async getImages(): Promise<{ images: ProductImage[] }> {
    return request<{ images: ProductImage[] }>('/api/images');
  },

  async getManual(): Promise<{ manual: UserManualData }> {
    return request<{ manual: UserManualData }>('/api/manual');
  },

  async getReviews(): Promise<{ reviews: Review[] }> {
    return request<{ reviews: Review[] }>('/api/reviews');
  },

  async submitReview(review: {
    userName: string;
    userEmail?: string;
    rating: number;
    title?: string;
    comment: string;
    image?: string;
  }): Promise<{ review: Review }> {
    return request<{ review: Review }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  async getSettings(): Promise<{ settings: SiteSettings }> {
    return request<{ settings: SiteSettings }>('/api/settings');
  },

  // Orders
  async createOrder(orderData: {
    quantity: number;
    discount?: number;
    promoCode?: string;
    paymentMethod?: string;
    customerInformation: {
      fullName: string;
      email?: string;
      phone: string;
      address?: string;
      houseBuilding?: string;
      streetArea?: string;
      city: string;
      state: string;
      pincode?: string;
      postalCode?: string;
    };
  }): Promise<{ order: Order }> {
    return request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(): Promise<{ orders: Order[] }> {
    return request<{ orders: Order[] }>('/api/orders/mine');
  },

  async getOrderById(id: string, emailOrPhone?: string): Promise<{ order: Order }> {
    const query = emailOrPhone
      ? emailOrPhone.includes('@')
        ? `?email=${encodeURIComponent(emailOrPhone)}`
        : `?phone=${encodeURIComponent(emailOrPhone)}`
      : '';
    return request<{ order: Order }>(`/api/orders/${id}${query}`);
  },

  async trackOrder(orderId: string, emailOrPhone: string): Promise<{ order: Order }> {
    const isEmail = emailOrPhone.includes('@');
    const payload = isEmail
      ? { orderId, email: emailOrPhone }
      : { orderId, phone: emailOrPhone };
    return request<{ order: Order }>('/api/orders/track', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Admin APIs (strictly requires ADMIN role)
  async getAdminStats(): Promise<{ stats: DashboardStats }> {
    return request<{ stats: DashboardStats }>('/api/admin/stats');
  },

  async getAdminOrders(status?: string, search?: string): Promise<{ orders: Order[] }> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    return request<{ orders: Order[] }>(`/api/admin/orders?${params.toString()}`);
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },

  async getAdminCustomers(): Promise<{ customers: (User & { orderCount: number; totalSpent: number })[] }> {
    return request<{ customers: (User & { orderCount: number; totalSpent: number })[] }>('/api/admin/customers');
  },

  async updateProduct(updates: Partial<Product>): Promise<{ product: Product }> {
    return request<{ product: Product }>('/api/admin/product', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async addProductImage(image: Partial<ProductImage>): Promise<{ image: ProductImage }> {
    return request<{ image: ProductImage }>('/api/admin/images', {
      method: 'POST',
      body: JSON.stringify(image),
    });
  },

  async reorderProductImages(orderedIds: string[]): Promise<{ images: ProductImage[] }> {
    return request<{ images: ProductImage[] }>('/api/admin/images/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    });
  },

  async updateProductImage(id: string, updates: Partial<ProductImage>): Promise<{ image: ProductImage }> {
    return request<{ image: ProductImage }>(`/api/admin/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProductImage(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/images/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadImage(payload: {
    base64Data: string;
    filename?: string;
    targetSlot?: 'hero' | 'spray' | 'pour' | 'accessories' | 'kitchen';
    caption?: string;
    alt?: string;
    isMain?: boolean;
  }): Promise<{ success: boolean; image: ProductImage; url: string }> {
    return request<{ success: boolean; image: ProductImage; url: string }>('/api/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async uploadBatchImages(images: Array<{
    base64Data: string;
    filename?: string;
    targetSlot?: string;
    caption?: string;
    alt?: string;
  }>): Promise<{ success: boolean; images: ProductImage[] }> {
    return request<{ success: boolean; images: ProductImage[] }>('/api/admin/upload-batch-images', {
      method: 'POST',
      body: JSON.stringify({ images }),
    });
  },

  async updateManual(manual: Partial<UserManualData>): Promise<{ manual: UserManualData }> {
    return request<{ manual: UserManualData }>('/api/admin/manual', {
      method: 'PUT',
      body: JSON.stringify(manual),
    });
  },

  async getAdminReviews(): Promise<{ reviews: Review[] }> {
    return request<{ reviews: Review[] }>('/api/admin/reviews');
  },

  async updateReviewStatus(id: string, isApproved: boolean): Promise<{ review: Review }> {
    return request<{ review: Review }>(`/api/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved }),
    });
  },

  async deleteReview(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{ settings: SiteSettings }> {
    return request<{ settings: SiteSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
