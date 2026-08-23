// GigEasy API Client — 100% Real PostgreSQL Backend Integration

const API_BASE_URL = 'http://localhost:5050/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || `API Error (${res.status}): ${url}`);
    }
    return json.data as T;
  } catch (err: any) {
    console.error(`[API Call Failed] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // ─── Marketplace Services ───────────────────────────────────────────
  async getCategories() {
    return request<any[]>('/services/categories');
  },
  async getServicesByCategory(categoryId: string | number) {
    return request<any[]>(`/services?category_id=${categoryId}`);
  },
  async getAllServices() {
    return request<any[]>('/services');
  },

  // ─── Cart ───────────────────────────────────────────────────────────
  async getCart() {
    return request<any>('/cart');
  },
  async addCartItem(itemData: any) {
    return request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
  async updateCartItem(itemId: string | number, updates: any) {
    return request<any>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async removeCartItem(itemId: string | number) {
    return request<any>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // ─── Orders ─────────────────────────────────────────────────────────
  async checkoutCart(orderData: any) {
    return request<any>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  async getActiveOrders() {
    return request<any[]>('/orders/active');
  },
  async getOrderHistory() {
    return request<any[]>('/orders/history');
  },

  // ─── Bookings ───────────────────────────────────────────────────────
  async getBookings(params?: { worker_id?: any; employer_id?: any }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>(`/bookings${query}`);
  },
  async getBookingById(id: string | number) {
    return request<any>(`/bookings/${id}`);
  },
  async completeBooking(id: string | number) {
    return request<any>(`/bookings/${id}/complete`, {
      method: 'PUT',
    });
  },

  // ─── Workers ────────────────────────────────────────────────────────
  async getWorkerProfile(id: string | number) {
    return request<any>(`/workers/${id}`);
  },
  async createWorkerProfile(profileData: any) {
    return request<any>('/workers', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
  async updateWorkerProfile(id: string | number, updates: any) {
    return request<any>(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async searchWorkers(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/workers${query}`);
  },
  async getTopRatedWorkers() {
    return request<any[]>('/workers/top-rated');
  },
  async getWorkerHistory(id: string | number) {
    return request<any>(`/workers/${id}/history`);
  },

  // ─── Employers ──────────────────────────────────────────────────────
  async getEmployerProfile(id: string | number) {
    return request<any>(`/employers/${id}`);
  },
  async createEmployerProfile(employerData: any) {
    return request<any>('/employers', {
      method: 'POST',
      body: JSON.stringify(employerData),
    });
  },
  async updateEmployerProfile(id: string | number, updates: any) {
    return request<any>(`/employers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async getEmployerHistory(id: string | number) {
    return request<any>(`/employers/${id}/history`);
  },

  // ─── Earnings ───────────────────────────────────────────────────────
  async getEarningsSummary(worker_id: string | number) {
    return request<any>(`/earnings/summary/${worker_id}`);
  },
  async getDailyEarnings(worker_id: string | number) {
    return request<any[]>(`/earnings/daily/${worker_id}`);
  },
  async getMonthlyEarnings(worker_id: string | number) {
    return request<any[]>(`/earnings/monthly/${worker_id}`);
  },

  // ─── Ratings ────────────────────────────────────────────────────────
  async addRating(ratingData: { job_id: number; worker_id: number; employer_id: number; rating: number; review?: string }) {
    return request<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },
  async getRatings(params?: { worker_id?: any; job_id?: any }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>(`/ratings${query}`);
  },

  // ─── KYC ────────────────────────────────────────────────────────────
  async getKYCStatus(user_id: string | number) {
    return request<any>(`/kyc/${user_id}`);
  },
  async updateKYCStatus(user_id: string | number, updates: any) {
    return request<any>(`/kyc/${user_id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // ─── Analytics ──────────────────────────────────────────────────────
  async getDashboardAnalytics() {
    return request<any>('/analytics/dashboard');
  },
};
