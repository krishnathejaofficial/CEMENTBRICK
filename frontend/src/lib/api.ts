// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: false,
})

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('brickyard_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('brickyard_token')
      localStorage.removeItem('brickyard_user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

// ── Products ──────────────────────────────────
export const productsApi = {
  list: (params?: any) => api.get('/api/products', { params }),
  get: (slug: string) => api.get(`/api/products/${slug}`),
  create: (data: any) => api.post('/api/products', data),
  update: (id: string, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
}

// ── Categories ────────────────────────────────
export const categoriesApi = {
  list: () => api.get('/api/categories'),
  create: (data: any) => api.post('/api/categories', data),
  update: (id: string, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
}

// ── Pricing ───────────────────────────────────
export const pricingApi = {
  estimate: (data: {
    items: { productId: string; quantity: number }[]
    delivery: { lat?: number; lng?: number; pincode: string; line1?: string; city?: string }
    options?: { includeLabour?: boolean; includeLabourFood?: boolean }
  }) => api.post('/api/pricing/estimate', data),
}

// ── Orders ────────────────────────────────────
export const ordersApi = {
  create: (data: any) => api.post('/api/orders', data),
  myOrders: () => api.get('/api/orders/my'),
  track: (orderNumber: string) => api.get(`/api/orders/track/${orderNumber}`),
  // Admin
  list: (params?: any) => api.get('/api/orders', { params }),
  updateStatus: (id: string, data: { status: string; note?: string }) =>
    api.patch(`/api/orders/${id}/status`, data),
}

// ── Zones ─────────────────────────────────────
export const zonesApi = {
  list: () => api.get('/api/zones'),
  create: (data: any) => api.post('/api/zones', data),
  update: (id: string, data: any) => api.put(`/api/zones/${id}`, data),
  delete: (id: string) => api.delete(`/api/zones/${id}`),
}

// ── Vehicles ──────────────────────────────────
export const vehiclesApi = {
  list: () => api.get('/api/vehicles'),
  create: (data: any) => api.post('/api/vehicles', data),
  update: (id: string, data: any) => api.put(`/api/vehicles/${id}`, data),
}

// ── Labour ────────────────────────────────────
export const labourApi = {
  get: () => api.get('/api/labour'),
  update: (data: any) => api.put('/api/labour', data),
}

// ── Admin ─────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get('/api/admin/dashboard'),
  salesReport: (params?: any) => api.get('/api/admin/reports/sales', { params }),
  customers: () => api.get('/api/admin/customers'),
}

// ── Config ────────────────────────────────────
export const configApi = {
  public: () => api.get('/api/config/public'),
  get: () => api.get('/api/config'),
  update: (data: any) => api.put('/api/config', data),
}

// ── Payments ──────────────────────────────────
export const paymentsApi = {
  createOrder: (orderId: string) => api.post('/api/payments/create-order', { orderId }),
  verify: (data: any) => api.post('/api/payments/verify', data),
}

export default api
