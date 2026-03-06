// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    me: "/api/v1/auth/me",
    verify: "/api/v1/auth/verify",
    refresh: "/api/v1/auth/refresh",
  },
  products: {
    list: "/api/v1/products",
    detail: (id: number) => `/api/v1/products/${id}`,
    create: "/api/v1/products",
    update: (id: number) => `/api/v1/products/${id}`,
    delete: (id: number) => `/api/v1/products/${id}`,
    priceHistory: (productId: number, variantId?: number) => {
      const base = `/api/v1/admin/products/${productId}/price-history`;
      return variantId ? `${base}?variant_id=${variantId}` : base;
    },
  },
  categories: {
    list: "/api/v1/categories",
    detail: (id: number) => `/api/v1/categories/${id}`,
    create: "/api/v1/categories",
    update: (id: number) => `/api/v1/categories/${id}`,
    delete: (id: number) => `/api/v1/categories/${id}`,
  },
  tags: {
    list: "/api/v1/tags",
    detail: (id: number) => `/api/v1/tags/${id}`,
    create: "/api/v1/tags",
    update: (id: number) => `/api/v1/tags/${id}`,
    delete: (id: number) => `/api/v1/tags/${id}`,
  },
  quotes: {
    list: "/api/v1/admin/quotes/all",
    detail: (id: number) => `/api/v1/admin/quotes/${id}`,
    update: (id: number) => `/api/v1/admin/quotes/${id}`,
    updateItemPrice: (quoteId: number, itemId: number) =>
      `/api/v1/admin/quotes/${quoteId}/items/${itemId}/price`,
    updateItemGst: (quoteId: number, itemId: number) =>
      `/api/v1/admin/quotes/${quoteId}/items/${itemId}/gst`,
    pdf: (id: number, download?: boolean) =>
      `/api/v1/admin/quotes/${id}/pdf${download ? "?download=true" : ""}`,
  },
  orders: {
    list: "/api/v1/admin/orders/all",
    detail: (id: number) => `/api/v1/admin/orders/${id}`,
    update: (id: number) => `/api/v1/admin/orders/${id}`,
    invoice: (id: number, download?: boolean) =>
      `/api/v1/admin/orders/${id}/invoice${download ? "?download=true" : ""}`,
  },
  shipping: {
    list: "/api/v1/shipping",
    create: "/api/v1/shipping",
    update: (id: number) => `/api/v1/shipping/${id}`,
    delete: (id: number) => `/api/v1/shipping/${id}`,
  },
  customers: {
    list: "/api/v1/admin/users",
    detail: (id: number) => `/api/v1/admin/users/${id}`,
    create: "/api/v1/admin/users",
    update: (id: number) => `/api/v1/admin/users/${id}`,
    delete: (id: number) => `/api/v1/admin/users/${id}`,
  },
  dashboard: {
    stats: "/api/v1/admin/dashboard/stats",
  },
} as const;

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
