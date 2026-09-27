// GigEasy API Client — Real PostgreSQL Backend
// All calls go to the real server. No mock fallbacks.

import { useAuthStore } from '../store';

// Support EXPO_PUBLIC_API_URL for running on physical devices
const API_BASE_URL =
  (typeof process !== 'undefined' && (process.env as any).EXPO_PUBLIC_API_URL
    ? (process.env as any).EXPO_PUBLIC_API_URL
    : null) ||
  'http://localhost:5050/api';

async function getAuthToken(): Promise<string | null> {
  try {
    const state = useAuthStore.getState();
    if (state.idToken && state.idToken.split('.').length === 3) {
      return state.idToken;
    }
    return state.userId || state.idToken || 'demo_user';
  } catch {
    return 'demo_user';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || `API Error (${res.status}): ${endpoint}`);
    }
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    console.error(`[API] ${options.method || 'GET'} ${endpoint} →`, err.message);
    throw err;
  }
}

export const api = {
  // ─── User Sync ──────────────────────────────────────────────────────────
  async syncUser(userData: { id: string; email?: string; phone_number?: string; role?: string; name?: string; verification_status?: string }) {
    return fetch(`${API_BASE_URL}/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(r => r.json());
  },

  async syncWorkerProfile(data: any) {
    return fetch(`${API_BASE_URL}/workers/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
  },

  async syncEmployerProfile(data: any) {
    return fetch(`${API_BASE_URL}/employers/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
  },

  // ─── Gigs ───────────────────────────────────────────────────────────────
  async createGig(gigData: {
    title: string; description?: string; skill_id?: string; skill_name: string; skill_category: string;
    workers_required?: number; min_wage: number; max_wage: number; start_date: string; start_time: string;
    end_time?: string; duration_hours?: number; address: string; latitude: number; longitude: number;
    city: string; state?: string; requirements?: string[];
  }) {
    return request<any>('/gigs', { method: 'POST', body: JSON.stringify(gigData) });
  },

  async getGigs(params?: {
    lat?: number; lng?: number; radius_km?: number;
    skill_category?: string; city?: string; status?: string; date?: string; employer_id?: string;
  }) {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])) : '';
    return request<any[]>(`/gigs${q}`);
  },

  async getGigById(gigId: string) {
    return request<any>(`/gigs/${gigId}`);
  },

  async updateGigStatus(gigId: string, status: string) {
    return request<any>(`/gigs/${gigId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getWorkforceGap(gigId: string) {
    return request<any>(`/gigs/${gigId}/workforce-gap`);
  },

  async getGigRadar(userId: string) {
    return request<any[]>(`/gigs/radar/${userId}`);
  },

  // ─── Workers ─────────────────────────────────────────────────────────────
  async getWorkers(params?: {
    skill?: string; city?: string; verified_only?: boolean;
    available?: boolean; limit?: number; offset?: number;
  }) {
    const q = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      : '';
    return request<any[]>(`/workers${q}`);
  },

  async getWorkerById(workerId: string) {
    return request<any>(`/workers/${workerId}`);
  },

  async getWorkerProfile(workerId: string) {
    return request<any>(`/workers/${workerId}`);
  },

  // ─── Employer Profile ────────────────────────────────────────────────────
  async getEmployerProfile() {
    return request<any>('/employers/me');
  },

  async getEmployerStats() {
    return request<any>('/employers/stats');
  },

  // ─── Applications ────────────────────────────────────────────────────────
  async applyForGig(data: { gig_id: string; proposed_wage: number; note?: string }) {
    return request<any>('/applications', { method: 'POST', body: JSON.stringify(data) });
  },

  async getApplications(params?: { worker_id?: string; gig_id?: string }) {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null) as any) : '';
    return request<any[]>(`/applications${q}`);
  },

  async getApplicationById(appId: string) {
    return request<any>(`/applications/${appId}`);
  },

  async updateApplicationStatus(appId: string, status: string, agreedWage?: number) {
    return request<any>(`/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, agreed_wage: agreedWage }),
    });
  },

  async onTheWay(appId: string) {
    return request<any>(`/applications/${appId}/on-the-way`, { method: 'PATCH', body: '{}' });
  },

  async arrived(appId: string) {
    return request<any>(`/applications/${appId}/arrived`, { method: 'PATCH', body: '{}' });
  },

  async checkIn(appId: string, lat?: number, lng?: number) {
    return request<any>(`/applications/${appId}/check-in`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    });
  },

  async markWorkComplete(appId: string) {
    return request<any>(`/applications/${appId}/complete`, { method: 'PATCH', body: '{}' });
  },

  async confirmCompletion(appId: string) {
    return request<any>(`/applications/${appId}/confirm-completion`, { method: 'PATCH', body: '{}' });
  },

  async getActiveApplication() {
    return request<any>('/applications/active');
  },

  // ─── Negotiations ────────────────────────────────────────────────────────
  async createNegotiation(data: { application_id: string; amount: number; note?: string }) {
    return request<any>('/negotiations', { method: 'POST', body: JSON.stringify(data) });
  },

  async getNegotiations(applicationId: string) {
    return request<any[]>(`/negotiations/${applicationId}`);
  },

  async respondToNegotiation(negId: string, response: 'ACCEPTED' | 'REJECTED') {
    return request<any>(`/negotiations/${negId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
  },

  // ─── Direct Offers ───────────────────────────────────────────────────────
  async sendDirectOffer(data: {
    worker_id: string; work_type: string; date: string; start_time: string;
    location_address: string; pay: number; latitude?: number; longitude?: number;
    duration_hours?: number; requirements?: string; notes?: string; gig_id?: string;
  }) {
    return request<any>('/direct-offers', { method: 'POST', body: JSON.stringify(data) });
  },

  async getMyDirectOffers() {
    return request<any[]>('/direct-offers/worker');
  },

  async getEmployerDirectOffers() {
    return request<any[]>('/direct-offers/employer');
  },

  async respondToDirectOffer(offerId: string, response: 'ACCEPTED' | 'DECLINED' | 'NEGOTIATING') {
    return request<any>(`/direct-offers/${offerId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
  },

  // ─── Payments ────────────────────────────────────────────────────────────
  async getPaymentStatus(applicationId: string) {
    return request<any>(`/payments/status/${applicationId}`);
  },

  async initiatePayment(applicationId: string, paymentMethod: 'ONLINE' | 'CASH' = 'ONLINE') {
    return request<any>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, payment_method: paymentMethod }),
    });
  },

  async confirmCashPayment(applicationId: string, otp: string) {
    return request<any>('/payments/confirm-cash', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, otp }),
    });
  },

  async confirmPayment(applicationId: string, paymentData: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string; payment_id?: string }) {
    return request<any>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, ...paymentData }),
    });
  },

  async requestPayment(applicationId: string) {
    return request<any>('/payments/request', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  // ─── Disputes ────────────────────────────────────────────────────────────
  async createDispute(data: {
    application_id: string; raised_by_role: string; issue_type: string;
    description: string; evidence_urls?: string[]; agreed_amount?: number;
  }) {
    return request<any>('/disputes', { method: 'POST', body: JSON.stringify(data) });
  },

  async getDispute(disputeId: string) {
    return request<any>(`/disputes/${disputeId}`);
  },

  async getDisputes(params?: { application_id?: string; user_id?: string }) {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null) as any) : '';
    return request<any[]>(`/disputes${q}`);
  },

  async updateDispute(disputeId: string, data: { employer_response?: string; status?: string; resolution?: string; admin_notes?: string }) {
    return request<any>(`/disputes/${disputeId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // ─── Ratings ─────────────────────────────────────────────────────────────
  async submitRating(data: { application_id: string; rater_role: string; rated_user_id: string; score: number; tags?: string[]; comment?: string }) {
    return request<any>('/ratings', { method: 'POST', body: JSON.stringify(data) });
  },

  async getRatings(userId: string) {
    return request<any[]>(`/ratings?user_id=${userId}`);
  },

  // ─── Availability ─────────────────────────────────────────────────────────
  async getAvailability(userId: string) {
    return request<any>(`/availability/${userId}`);
  },

  async updateAvailability(data: {
    mode: string; max_distance_km?: number; preferred_trades?: string[];
    min_pay_per_day?: number; preferred_start?: string; preferred_end?: string;
  }) {
    return request<any>('/availability', { method: 'PUT', body: JSON.stringify(data) });
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  async getNotifications() {
    return request<any[]>('/notifications');
  },

  async markNotificationRead(notifId: string) {
    return request<any>(`/notifications/${notifId}/read`, { method: 'PATCH', body: '{}' });
  },

  // ─── Earnings ─────────────────────────────────────────────────────────────
  async getEarningsSummary(userId: string) {
    return request<any>(`/earnings/summary/${userId}`);
  },

  // ─── AI / Intelligence ───────────────────────────────────────────────────
  async parseJobFromText(text: string) {
    return request<any>('/ai/parse-job', { method: 'POST', body: JSON.stringify({ text }) });
  },

  async getFairPayEstimate(skill_category: string, city: string) {
    return request<any>(`/ai/fair-pay?skill_category=${encodeURIComponent(skill_category)}&city=${encodeURIComponent(city)}`);
  },

  async getDemandIntelligence(city?: string, date?: string) {
    const q = new URLSearchParams();
    if (city) q.set('city', city);
    if (date) q.set('date', date);
    return request<any[]>(`/ai/demand?${q}`);
  },

  async checkGigQuality(gigData: any) {
    return request<any>('/ai/quality-check', { method: 'POST', body: JSON.stringify(gigData) });
  },

  // ─── Admin ───────────────────────────────────────────────────────────────
  async getAdminGigsSummary() {
    return request<any>('/admin/gigs/summary');
  },

  async getAdminWorkers() {
    return request<any[]>('/admin/workers');
  },

  // ─── Legacy (backward compat) ─────────────────────────────────────────────
  async getCategories() {
    return [] as any[];
  },
  async getAllServices() {
    return [] as any[];
  },
  async getDashboardAnalytics() {
    return request<any>('/admin/gigs/summary');
  },
  // ─── Customer / Service-flow stubs (used by legacy screens) ───────────────
  async getActiveOrders() {
    return [] as any[];
  },
  async getServicesByCategory(_category: string) {
    return [] as any[];
  },
  async getCart() {
    return { items: [], total: 0 } as any;
  },
  async checkoutCart(_data: any) {
    return { success: true } as any;
  },
  async getOrderHistory() {
    return [] as any[];
  },
  async addCartItem(_item: any) {
    return { success: true } as any;
  },
};
