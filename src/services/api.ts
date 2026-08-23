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
  // ─── Skills ─────────────────────────────────────────────────────────
  async getSkills() {
    return request<any[]>('/skills');
  },
  async addSkill(skill_name: string) {
    return request<any>('/skills', {
      method: 'POST',
      body: JSON.stringify({ skill_name }),
    });
  },

  // ─── Jobs ───────────────────────────────────────────────────────────
  async getJobs(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/jobs${query}`);
  },
  async getJobById(id: string | number) {
    return request<any>(`/jobs/${id}`);
  },
  async getNearbyJobs(lat: number, lng: number, radius = 20) {
    return request<any[]>(`/jobs/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`);
  },
  async createJob(jobData: any) {
    return request<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },
  async updateJob(id: string | number, updates: any) {
    return request<any>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteJob(id: string | number) {
    return request<any>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // ─── Applications ───────────────────────────────────────────────────
  async getApplications(params?: { job_id?: any; worker_id?: any }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>(`/applications${query}`);
  },
  async applyJob(job_id: number | string, worker_id: number | string) {
    return request<any>('/applications', {
      method: 'POST',
      body: JSON.stringify({ job_id: Number(job_id), worker_id: Number(worker_id) }),
    });
  },
  async selectWorker(job_id: number | string, worker_id: number | string, employer_id: number | string) {
    return request<any>('/applications/select-worker', {
      method: 'POST',
      body: JSON.stringify({
        job_id: Number(job_id),
        worker_id: Number(worker_id),
        employer_id: Number(employer_id),
      }),
    });
  },
  async acceptApplication(application_id: number | string) {
    return request<any>(`/applications/${application_id}/accept`, {
      method: 'PUT',
    });
  },
  async rejectApplication(application_id: number | string) {
    return request<any>(`/applications/${application_id}/reject`, {
      method: 'PUT',
    });
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
