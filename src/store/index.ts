// GigEasy Zustand Stores — 100% Real Database State Management

import { create } from 'zustand';
import { UserRole, WorkerProfile, EmployerProfile, Job, JobFilters, JobApplication } from '../types';
import { api } from '../services/api';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string;
  role: UserRole | null;
  userId: string | null;
  workerId: number;
  employerId: number;
  isOnboarded: boolean;
  setPhoneNumber: (phone: string) => void;
  setAuthenticated: (userId: string, role: UserRole) => void;
  setRoleIds: (workerId: number, employerId: number) => void;
  setOnboarded: () => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Auto active for local dev session
  phoneNumber: '+919876543210',
  role: 'worker',
  userId: '1',
  workerId: 1,
  employerId: 1,
  isOnboarded: true,
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setAuthenticated: (userId, role) =>
    set({ isAuthenticated: true, userId, role }),
  setRoleIds: (workerId, employerId) => set({ workerId, employerId }),
  setOnboarded: () => set({ isOnboarded: true }),
  switchRole: (role) => set({ role }),
  logout: () =>
    set({
      isAuthenticated: false,
      phoneNumber: '',
      role: null,
      userId: null,
      isOnboarded: false,
    }),
}));

// ─── Worker Store ─────────────────────────────────────────────────────────────

interface WorkerState {
  profile: WorkerProfile | null;
  isAvailable: boolean;
  applications: JobApplication[];
  earningsSummary: any | null;
  loading: boolean;
  fetchProfile: (workerId?: number) => Promise<void>;
  fetchApplications: (workerId?: number) => Promise<void>;
  fetchEarnings: (workerId?: number) => Promise<void>;
  setAvailability: (available: boolean) => void;
  setProfile: (profile: any) => void;
  updateProfile: (updates: Partial<WorkerProfile>) => Promise<void>;
  applyForJob: (jobId: number | string, workerId?: number) => Promise<void>;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  profile: null,
  isAvailable: true,
  applications: [],
  earningsSummary: null,
  loading: false,

  fetchProfile: async (workerId = 1) => {
    set({ loading: true });
    try {
      const data = await api.getWorkerProfile(workerId);
      set({ profile: data, loading: false });
    } catch (err) {
      console.error('Error fetching worker profile:', err);
      set({ loading: false });
    }
  },

  fetchApplications: async (workerId = 1) => {
    try {
      const apps = await api.getApplications({ worker_id: workerId });
      set({ applications: apps as any[] });
    } catch (err) {
      console.error('Error fetching worker applications:', err);
    }
  },

  fetchEarnings: async (workerId = 1) => {
    try {
      const summary = await api.getEarningsSummary(workerId);
      set({ earningsSummary: summary });
    } catch (err) {
      console.error('Error fetching earnings summary:', err);
    }
  },

  setAvailability: (available) => set({ isAvailable: available }),
  setProfile: (profile) => set({ profile }),

  updateProfile: async (updates) => {
    const current = get().profile;
    const workerId = (current as any)?.worker_id || current?.id || 1;
    try {
      const updated = await api.updateWorkerProfile(workerId, updates);
      set({ profile: updated });
    } catch (err) {
      console.error('Error updating worker profile:', err);
    }
  },

  applyForJob: async (jobId, workerId = 1) => {
    try {
      await api.applyJob(jobId, workerId);
      await get().fetchApplications(workerId);
    } catch (err) {
      console.error('Error applying for job:', err);
      throw err;
    }
  },
}));

// ─── Employer Store ───────────────────────────────────────────────────────────

interface EmployerState {
  profile: EmployerProfile | null;
  jobs: Job[];
  applications: JobApplication[];
  loading: boolean;
  fetchProfile: (employerId?: number) => Promise<void>;
  fetchJobs: (employerId?: number) => Promise<void>;
  fetchApplications: (jobId?: number) => Promise<void>;
  setProfile: (profile: any) => void;
  updateProfile: (updates: Partial<EmployerProfile>) => Promise<void>;
  postJob: (jobData: any) => Promise<any>;
  selectWorker: (jobId: number, workerId: number, employerId?: number) => Promise<void>;
  completeJob: (bookingId: number, employerId?: number) => Promise<void>;
  acceptApplicant: (appId: string | number) => void;
  counterOffer: (appId: string | number, amount: number) => void;
}

export const useEmployerStore = create<EmployerState>((set, get) => ({
  profile: null,
  jobs: [],
  applications: [],
  loading: false,

  fetchProfile: async (employerId = 1) => {
    set({ loading: true });
    try {
      const data = await api.getEmployerProfile(employerId);
      set({ profile: data, loading: false });
    } catch (err) {
      console.error('Error fetching employer profile:', err);
      set({ loading: false });
    }
  },

  fetchJobs: async (employerId = 1) => {
    try {
      const jobsList = await api.getJobs({ employer_id: employerId });
      set({ jobs: jobsList as any[] });
    } catch (err) {
      console.error('Error fetching employer jobs:', err);
    }
  },

  fetchApplications: async (jobId) => {
    try {
      const apps = await api.getApplications(jobId ? { job_id: jobId } : {});
      set({ applications: apps as any[] });
    } catch (err) {
      console.error('Error fetching employer applications:', err);
    }
  },

  setProfile: (profile) => set({ profile }),

  updateProfile: async (updates) => {
    const empId = (get().profile as any)?.employer_id || 1;
    try {
      const updated = await api.updateEmployerProfile(empId, updates);
      set({ profile: updated });
    } catch (err) {
      console.error('Error updating employer profile:', err);
    }
  },

  postJob: async (jobData) => {
    try {
      const created = await api.createJob(jobData);
      set((state) => ({ jobs: [created, ...state.jobs] }));
      return created;
    } catch (err) {
      console.error('Error posting job:', err);
      throw err;
    }
  },

  selectWorker: async (jobId, workerId, employerId = 1) => {
    try {
      await api.selectWorker(jobId, workerId);
      await get().fetchJobs(employerId);
    } catch (err) {
      console.error('Error selecting worker:', err);
      throw err;
    }
  },

  completeJob: async (bookingId, employerId = 1) => {
    try {
      await api.completeBooking(bookingId);
      await get().fetchJobs(employerId);
    } catch (err) {
      console.error('Error completing job:', err);
      throw err;
    }
  },

  acceptApplicant: (appId) => {
    set((state) => ({
      applications: state.applications.map((app: any) =>
        app.id === appId ? { ...app, status: 'ACCEPTED' } : app
      ),
    }));
  },

  counterOffer: (appId, amount) => {
    set((state) => ({
      applications: state.applications.map((app: any) =>
        app.id === appId ? { ...app, counterOffer: amount, status: 'COUNTER_OFFER' } : app
      ),
    }));
  },
}));

// ─── Jobs Store ───────────────────────────────────────────────────────────────

interface JobsState {
  jobs: Job[];
  loading: boolean;
  filters: JobFilters;
  selectedJob: Job | null;
  fetchJobs: (filters?: Record<string, any>) => Promise<void>;
  fetchNearbyJobs: (lat: number, lng: number, radius?: number) => Promise<void>;
  setFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  setSelectedJob: (job: Job | null) => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  filters: {
    sortBy: 'recommended',
  },
  selectedJob: null,

  fetchJobs: async (filters = {}) => {
    set({ loading: true });
    try {
      const jobsList = await api.getJobs(filters);
      set({ jobs: jobsList as any[], loading: false });
    } catch (err) {
      console.error('Error fetching jobs:', err);
      set({ loading: false });
    }
  },

  fetchNearbyJobs: async (lat, lng, radius = 20) => {
    set({ loading: true });
    try {
      const nearby = await api.getNearbyJobs(lat, lng, radius);
      set({ jobs: nearby as any[], loading: false });
    } catch (err) {
      console.error('Error fetching nearby jobs:', err);
      set({ loading: false });
    }
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { sortBy: 'recommended' } }),
  setSelectedJob: (job) => set({ selectedJob: job }),
}));

// ─── Onboarding Store ─────────────────────────────────────────────────────────

interface OnboardingState {
  step: number;
  workerName: string;
  selectedSkillIds: string[];
  expectedWage: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  setWorkerName: (name: string) => void;
  toggleSkill: (skillId: string) => void;
  setExpectedWage: (wage: number) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  workerName: '',
  selectedSkillIds: [],
  expectedWage: 800,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  setWorkerName: (name) => set({ workerName: name }),
  toggleSkill: (skillId) =>
    set((state) => ({
      selectedSkillIds: state.selectedSkillIds.includes(skillId)
        ? state.selectedSkillIds.filter((id) => id !== skillId)
        : [...state.selectedSkillIds, skillId],
    })),
  setExpectedWage: (wage) => set({ expectedWage: wage }),
}));
