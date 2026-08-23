import { create } from 'zustand';
import { UserRole, WorkerProfile, EmployerProfile, Job, JobFilters, JobApplication, VerificationStatus, ApplicationStatus, PaymentRecord } from '../types';
import { MOCK_JOBS, SEED_EMPLOYER_APPLICATIONS, SEED_WORKER_APPLICATIONS, CURRENT_WORKER, CURRENT_EMPLOYER } from '../data/mockData';
import { TRANSLATIONS, LanguageCode, TranslationKey } from '../i18n/translations';

// ─── LocalStorage Persistence Helpers for Presentation Demo ──────────────────

const safeGetStorage = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    }
  } catch (e) {
    // fallback gracefully
  }
  return fallback;
};

const safeSetStorage = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    // fallback gracefully
  }
};

// ─── Language Store ───────────────────────────────────────────────────────────

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'hi' : 'en' })),
  t: (key) => {
    const lang = get().language;
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? String(key);
  },
}));

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  email: string;
  name: string;
  phoneNumber: string;
  role: UserRole | null;
  userId: string | null;
  firebaseUid: string | null;
  idToken: string | null;
  authProvider: string | null;
  kycStatus: VerificationStatus;
  isOnboarded: boolean;
  setPhoneNumber: (phone: string) => void;
  setAuthenticated: (
    userId: string,
    role: UserRole,
    name?: string,
    email?: string,
    phoneNumber?: string,
    kycStatus?: VerificationStatus,
    firebaseUid?: string,
    idToken?: string
  ) => void;
  setFirebaseSession: (session: {
    uid: string;
    token?: string;
    phoneNumber?: string;
    email?: string;
    name?: string;
    role?: UserRole;
  }) => void;
  setOnboarded: () => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  email: '',
  name: '',
  phoneNumber: '',
  role: null,
  userId: null,
  firebaseUid: null,
  idToken: null,
  authProvider: null,
  kycStatus: 'unverified',
  isOnboarded: false,
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setAuthenticated: (
    userId,
    role,
    name = '',
    email = '',
    phoneNumber = '',
    kycStatus = 'unverified',
    firebaseUid = '',
    idToken = ''
  ) =>
    set({
      isAuthenticated: true,
      userId,
      role,
      name,
      email,
      phoneNumber,
      kycStatus,
      firebaseUid: firebaseUid || userId,
      idToken: idToken || null,
    }),
  setFirebaseSession: ({ uid, token, phoneNumber, email, name, role }) =>
    set((state) => ({
      isAuthenticated: true,
      userId: uid,
      firebaseUid: uid,
      idToken: token || state.idToken,
      phoneNumber: phoneNumber || state.phoneNumber,
      email: email || state.email,
      name: name || state.name,
      role: role || state.role || 'worker',
    })),
  setOnboarded: () => set({ isOnboarded: true }),
  switchRole: (role) => set({ role }),
  logout: () =>
    set({
      isAuthenticated: false,
      email: '',
      name: '',
      phoneNumber: '',
      role: null,
      userId: null,
      firebaseUid: null,
      idToken: null,
      authProvider: null,
      kycStatus: 'unverified',
      isOnboarded: false,
    }),
}));

// ─── Shared Applications & Payment Store ──────────────────────────────────────
// Single source of truth for ALL applications and payments across both roles.

interface SharedApplicationsState {
  applications: JobApplication[];
  payments: PaymentRecord[];
  // Worker actions
  applyForJob: (jobId: string, wage: number, worker: WorkerProfile, job: Job) => void;
  checkIn: (appId: string) => void;
  markComplete: (appId: string) => void;
  confirmPaymentReceived: (appId: string) => void;
  workerCounterOffer: (appId: string, counterWage: number) => void;
  workerAcceptCounter: (appId: string) => void;
  workerDeclineCounter: (appId: string) => void;
  // Employer actions
  acceptApplication: (appId: string) => void;
  rejectApplication: (appId: string) => void;
  confirmCompletion: (appId: string) => void;
  payWorker: (appId: string) => void;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'paidAt'>) => PaymentRecord;
  employerCounterOffer: (appId: string, counterWage: number) => void;
  employerAcceptCounter: (appId: string) => void;
  // Selectors
  getWorkerApplications: (workerId: string) => JobApplication[];
  getJobApplications: (jobId: string) => JobApplication[];
  hasApplied: (jobId: string, workerId: string) => boolean;
  getApplication: (appId: string) => JobApplication | undefined;
  getPaymentsByWorker: (workerId: string) => PaymentRecord[];
  getPaymentsByEmployer: (employerId: string) => PaymentRecord[];
}

const initialApplications = safeGetStorage<JobApplication[]>(
  'gigeasy_applications',
  [...SEED_EMPLOYER_APPLICATIONS, ...SEED_WORKER_APPLICATIONS]
);

const initialPayments = safeGetStorage<PaymentRecord[]>('gigeasy_payments', []);

export const useSharedApplicationsStore = create<SharedApplicationsState>((set, get) => ({
  applications: initialApplications,
  payments: initialPayments,

  applyForJob: (jobId, wage, worker, job) => {
    const already = get().applications.find(
      (a) => a.jobId === jobId && a.workerId === worker.id
    );
    if (already) return; // Duplicate guard

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      job,
      workerId: worker.id,
      worker,
      proposedWage: wage,
      status: 'APPLIED',
      paymentStatus: 'PENDING',
      negotiations: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newApp, ...get().applications];
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  checkIn: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'IN_PROGRESS' as ApplicationStatus,
            checkedInAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  markComplete: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'COMPLETED' as ApplicationStatus,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  confirmCompletion: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'PAYMENT_PENDING' as ApplicationStatus,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  confirmPaymentReceived: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'PAID' as ApplicationStatus,
            paymentStatus: 'PAID' as const,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  // Worker initiates counter offer
  workerCounterOffer: (appId, counterWage) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'NEGOTIATING' as ApplicationStatus,
            currentCounterWage: counterWage,
            counterBy: 'worker' as const,
            negotiations: [
              ...a.negotiations,
              { id: `neg_${Date.now()}`, initiatedBy: 'worker' as const, proposedWage: counterWage, timestamp: new Date().toISOString() },
            ],
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  // Worker accepts employer's counter
  workerAcceptCounter: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'ACCEPTED' as ApplicationStatus,
            agreedWage: a.currentCounterWage ?? a.proposedWage,
            currentCounterWage: undefined,
            counterBy: undefined,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  // Worker declines employer's counter
  workerDeclineCounter: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'REJECTED' as ApplicationStatus,
            currentCounterWage: undefined,
            counterBy: undefined,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  acceptApplication: (appId) => {
    const targetApp = get().applications.find((a) => a.id === appId);
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'ACCEPTED' as ApplicationStatus,
            agreedWage: a.currentCounterWage ?? a.proposedWage,
            currentCounterWage: undefined,
            counterBy: undefined,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
    if (targetApp) {
      useEmployerStore.getState().incrementHiredCount?.(targetApp.jobId);
    }
  },

  rejectApplication: (appId) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'REJECTED' as ApplicationStatus,
            currentCounterWage: undefined,
            counterBy: undefined,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  payWorker: (appId) => {
    const app = get().applications.find((a) => a.id === appId);
    if (!app) return;
    const amount = app.agreedWage ?? app.proposedWage;
    const txId = `PAY_GIG_${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      applicationId: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      workerId: app.workerId,
      workerName: app.worker.name,
      employerId: app.job.employerId,
      employerName: app.job.employer.businessName,
      amount,
      method: 'UPI',
      transactionId: txId,
      upiId: 'gigeasy.escrow@icici',
      paidAt: new Date().toISOString(),
      status: 'SUCCESS',
    };

    const updatedApps = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'PAID' as ApplicationStatus,
            paymentStatus: 'PAID' as const,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    const updatedPayments = [newPayment, ...get().payments];
    set({ applications: updatedApps, payments: updatedPayments });
    safeSetStorage('gigeasy_applications', updatedApps);
    safeSetStorage('gigeasy_payments', updatedPayments);
  },

  recordPayment: (paymentData) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      paidAt: new Date().toISOString(),
    };

    const updatedApps = get().applications.map((a) =>
      a.id === paymentData.applicationId
        ? {
            ...a,
            status: 'PAID' as ApplicationStatus,
            paymentStatus: 'PAID' as const,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    const updatedPayments = [newPayment, ...get().payments];
    set({ applications: updatedApps, payments: updatedPayments });
    safeSetStorage('gigeasy_applications', updatedApps);
    safeSetStorage('gigeasy_payments', updatedPayments);

    return newPayment;
  },

  // Employer initiates counter offer
  employerCounterOffer: (appId, counterWage) => {
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'NEGOTIATING' as ApplicationStatus,
            currentCounterWage: counterWage,
            counterBy: 'employer' as const,
            negotiations: [
              ...a.negotiations,
              { id: `neg_${Date.now()}`, initiatedBy: 'employer' as const, proposedWage: counterWage, timestamp: new Date().toISOString() },
            ],
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
  },

  // Employer accepts worker's counter
  employerAcceptCounter: (appId) => {
    const targetApp = get().applications.find((a) => a.id === appId);
    const updated = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: 'ACCEPTED' as ApplicationStatus,
            agreedWage: a.currentCounterWage ?? a.proposedWage,
            currentCounterWage: undefined,
            counterBy: undefined,
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications: updated });
    safeSetStorage('gigeasy_applications', updated);
    if (targetApp) {
      useEmployerStore.getState().incrementHiredCount?.(targetApp.jobId);
    }
  },

  getWorkerApplications: (workerId) =>
    get().applications.filter((a) => a.workerId === workerId),

  getJobApplications: (jobId) =>
    get().applications.filter((a) => a.jobId === jobId),

  hasApplied: (jobId, workerId) =>
    get().applications.some((a) => a.jobId === jobId && a.workerId === workerId),

  getApplication: (appId) =>
    get().applications.find((a) => a.id === appId),

  getPaymentsByWorker: (workerId) =>
    get().payments.filter((p) => p.workerId === workerId),

  getPaymentsByEmployer: (employerId) =>
    get().payments.filter((p) => p.employerId === employerId),
}));

// ─── Worker Store ─────────────────────────────────────────────────────────────

interface WorkerState {
  profile: WorkerProfile | null;
  isAvailable: boolean;
  setProfile: (profile: WorkerProfile) => void;
  setAvailability: (available: boolean) => void;
  updateProfile: (updates: Partial<WorkerProfile>) => void;
}

export const useWorkerStore = create<WorkerState>((set) => ({
  profile: CURRENT_WORKER,
  isAvailable: true,
  setProfile: (profile) => set({ profile }),
  setAvailability: (available) => set({ isAvailable: available }),
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      return { profile: updated };
    }),
}));

// ─── Employer & Unified Jobs Store ────────────────────────────────────────────

interface EmployerState {
  profile: EmployerProfile | null;
  jobs: Job[];
  setProfile: (profile: EmployerProfile) => void;
  updateProfile: (updates: Partial<EmployerProfile>) => void;
  incrementHiredCount: (jobId: string) => void;
  postJob: (jobData: Partial<Job>) => Job;
  getJobById: (jobId: string) => Job | undefined;
}

const initialJobs = safeGetStorage<Job[]>('gigeasy_jobs', MOCK_JOBS);

export const useEmployerStore = create<EmployerState>((set, get) => ({
  profile: CURRENT_EMPLOYER,
  jobs: initialJobs,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      return { profile: updated };
    }),
  incrementHiredCount: (jobId: string) => {
    const updatedJobs = get().jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            workersHired: Math.min((j.workersHired || 0) + 1, j.workersRequired || 1),
            status: ((j.workersHired || 0) + 1 >= (j.workersRequired || 1) ? 'FULL' : j.status) as any,
          }
        : j
    );
    set({ jobs: updatedJobs });
    safeSetStorage('gigeasy_jobs', updatedJobs);
  },
  postJob: (jobData) => {
    const activeProfile = get().profile ?? CURRENT_EMPLOYER;
    const newJob: Job = {
      id: `j_${Date.now()}`,
      employerId: activeProfile.id,
      employer: activeProfile,
      title: jobData.title ?? 'Warehouse Loader',
      description: jobData.description ?? 'Immediate requirement for reliable daily shift workers.',
      skillRequired: jobData.skillRequired ?? {
        id: 's_warehouse_loader',
        name: jobData.title ?? 'Warehouse Loader',
        category: 'Warehouse',
        icon: 'package',
      },
      location: jobData.location ?? {
        lat: 28.6139,
        lng: 77.209,
        address: 'Sector 62, NSEZ',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      startDate: jobData.startDate ?? '2026-08-25',
      startTime: jobData.startTime ?? '09:00 AM',
      endTime: jobData.endTime ?? '06:00 PM',
      workersRequired: jobData.workersRequired ?? 2,
      workersHired: 0,
      minWage: jobData.minWage ?? 1000,
      maxWage: jobData.maxWage ?? 1000,
      requirements: jobData.requirements ?? ['Aadhaar Card', 'Physical Fitness', 'Punctuality'],
      status: 'HIRING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedJobs = [newJob, ...get().jobs];
    set({ jobs: updatedJobs });
    safeSetStorage('gigeasy_jobs', updatedJobs);
    return newJob;
  },
  getJobById: (jobId) => get().jobs.find((j) => j.id === jobId),
}));

// ─── Jobs Store ───────────────────────────────────────────────────────────────

interface JobsState {
  filters: JobFilters;
  selectedJob: Job | null;
  setFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  setSelectedJob: (job: Job | null) => void;
}

export const useJobsStore = create<JobsState>((set) => ({
  filters: {
    sortBy: 'recommended',
  },
  selectedJob: null,
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
  setStep: (step: number) => void;
  nextStep: () => void;
  setWorkerName: (name: string) => void;
  toggleSkill: (skillId: string) => void;
  clearSkills: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  workerName: '',
  selectedSkillIds: [],
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  setWorkerName: (name) => set({ workerName: name }),
  toggleSkill: (skillId) =>
    set((state) => ({
      selectedSkillIds: state.selectedSkillIds.includes(skillId)
        ? state.selectedSkillIds.filter((id) => id !== skillId)
        : [...state.selectedSkillIds, skillId],
    })),
  clearSkills: () => set({ selectedSkillIds: [] }),
}));
