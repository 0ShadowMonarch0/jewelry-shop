import type { 
  Product, 
  Category, 
  Offer, 
  SiteSettings, 
  AdminAuditLog, 
  CustomerInquiry, 
  AdminUser, 
  AdminStats 
} from '../types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    sessionStorage.setItem('aura_token', token);
  } else {
    sessionStorage.removeItem('aura_token');
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window !== 'undefined' && !authToken) {
    authToken = sessionStorage.getItem('aura_token');
  }
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getProducts: (params?: {
    category?: string;
    isHot?: boolean;
    isNewDrop?: boolean;
    isFeatured?: boolean;
    isRestocked?: boolean;
    search?: string;
    sort?: string;
    maxPrice?: number;
    inStockOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    return request<{ products: (Product & { isAvailable: boolean; optimizedUrl?: string; thumbUrl?: string })[]; total: number }>(
      `/api/products?${query.toString()}`
    );
  },

  getProductBySlug: (slug: string) => {
    return request<{ product: Product & { isAvailable: boolean }; related: Product[] }>(
      `/api/products/${slug}`
    );
  },

  getCategories: () => {
    return request<{ categories: Category[] }>('/api/categories');
  },

  getActiveOffers: () => {
    return request<{ offers: Offer[] }>('/api/offers/active');
  },

  getOffers: () => {
    return request<{ offers: Offer[] }>('/api/offers/active');
  },

  getPublicSettings: () => {
    return request<{ settings: SiteSettings }>('/api/settings/public');
  },

  getSettings: () => {
    return request<{ settings: SiteSettings }>('/api/settings/public');
  },

  createInquiry: (data: {
    productId: string;
    productName: string;
    productSku: string;
    productPrice: number;
    productSlug: string;
    productImage?: string;
    instagramHandle: string;
    customerNote?: string;
  }) => {
    return request<{ success: boolean; inquiry: CustomerInquiry }>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Auth
  login: (credentials: { email: string; password: string }) => {
    return request<{ success: boolean; user: AdminUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  getMe: () => {
    return request<{ authenticated: boolean; user?: AdminUser }>('/api/auth/me');
  },

  logout: () => {
    setAuthToken(null);
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  // Admin
  getAdminStats: () => {
    return request<{ stats: AdminStats }>('/api/admin/stats');
  },

  getAdminProducts: () => {
    return request<{ products: Product[] }>('/api/admin/products');
  },

  createProduct: (product: Partial<Product>) => {
    return request<{ success: boolean; product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  updateProduct: (id: string, product: Partial<Product>) => {
    return request<{ success: boolean; product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  updateStock: (id: string, stock: number, isRestockMark?: boolean) => {
    return request<{ success: boolean; product: Product }>(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock, isRestockMark })
    });
  },

  deleteProduct: (id: string, hard: boolean = false) => {
    return request<{ success: boolean; message: string }>(`/api/admin/products/${id}?hard=${hard}`, {
      method: 'DELETE'
    });
  },

  getAdminCategories: () => {
    return request<{ categories: Category[] }>('/api/admin/categories');
  },

  createCategory: (category: Partial<Category>) => {
    return request<{ success: boolean; category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },

  updateCategory: (id: string, category: Partial<Category>) => {
    return request<{ success: boolean; category: Category }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  },

  deleteCategory: (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
  },

  getAdminOffers: () => {
    return request<{ offers: Offer[] }>('/api/admin/offers');
  },

  createOffer: (offer: Partial<Offer>) => {
    return request<{ success: boolean; offer: Offer }>('/api/admin/offers', {
      method: 'POST',
      body: JSON.stringify(offer)
    });
  },

  updateOffer: (id: string, offer: Partial<Offer>) => {
    return request<{ success: boolean; offer: Offer }>(`/api/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer)
    });
  },

  deleteOffer: (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/admin/offers/${id}`, {
      method: 'DELETE'
    });
  },

  getAdminSettings: () => {
    return request<{ settings: SiteSettings }>('/api/admin/settings');
  },

  updateAdminSettings: (settings: Partial<SiteSettings>) => {
    return request<{ success: boolean; settings: SiteSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  getAuditLogs: (limit?: number) => {
    return request<{ auditLogs: AdminAuditLog[] }>(`/api/admin/audit-logs?limit=${limit || 50}`);
  },

  getInquiries: () => {
    return request<{ inquiries: CustomerInquiry[] }>('/api/admin/inquiries');
  },

  updateInquiryStatus: (id: string, status: CustomerInquiry['status']) => {
    return request<{ success: boolean }>(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  uploadMedia: (imageBase64: string, filename?: string, folder?: string) => {
    return request<{
      success: boolean;
      asset: {
        cloudinaryPublicId: string;
        secureUrl: string;
        width: number;
        height: number;
        format: string;
      };
    }>('/api/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename, folder })
    });
  },

  getSupabaseStatus: () => {
    return request<{
      configured: boolean;
      supabaseUrl: string | null;
      schemaFile: string;
      instructions: string;
    }>('/api/admin/supabase/status');
  },

  testSupabase: () => {
    return request<{
      success: boolean;
      message: string;
      tablesDetected?: string[];
    }>('/api/admin/supabase/test', {
      method: 'POST'
    });
  },

  syncToSupabase: () => {
    return request<{
      success: boolean;
      message: string;
      counts?: { categories: number; products: number; offers: number };
    }>('/api/admin/supabase/sync', {
      method: 'POST'
    });
  }
};
