import { create } from 'zustand';
import { UserRole, WorkerProfile, EmployerProfile, Job, JobFilters, JobApplication, VerificationStatus, ApplicationStatus } from '../types';
import { MOCK_JOBS, SEED_EMPLOYER_APPLICATIONS, SEED_WORKER_APPLICATIONS, CURRENT_WORKER } from '../data/mockData';
import { TRANSLATIONS, LanguageCode, TranslationKey } from '../i18n/translations';

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

// ─── Shared Applications Store ────────────────────────────────────────────────
// Single source of truth for ALL applications. Both worker and employer read here.
// This ensures cross-sync: employer accept → worker sees status change immediately.

interface SharedApplicationsState {
  applications: JobApplication[];
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
  payWorker: (appId: string) => void;
  employerCounterOffer: (appId: string, counterWage: number) => void;
  employerAcceptCounter: (appId: string) => void;
  // Selectors
  getWorkerApplications: (workerId: string) => JobApplication[];
  getJobApplications: (jobId: string) => JobApplication[];
  hasApplied: (jobId: string, workerId: string) => boolean;
  getApplication: (appId: string) => JobApplication | undefined;
}

export const useSharedApplicationsStore = create<SharedApplicationsState>((set, get) => ({
  // Seed with demo data for both worker and employer views
  applications: [...SEED_EMPLOYER_APPLICATIONS, ...SEED_WORKER_APPLICATIONS],

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
    set((state) => ({ applications: [newApp, ...state.applications] }));
  },

  checkIn: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'CHECKED_IN' as ApplicationStatus, checkedInAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  markComplete: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'COMPLETED' as ApplicationStatus, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  confirmPaymentReceived: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'PAID' as ApplicationStatus, paymentStatus: 'PAID' as const, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  // Worker initiates counter offer
  workerCounterOffer: (appId, counterWage) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEGOTIATING' as ApplicationStatus,
              currentCounterWage: counterWage,
              counterBy: 'worker',
              negotiations: [
                ...a.negotiations,
                { id: `neg_${Date.now()}`, initiatedBy: 'worker', proposedWage: counterWage, timestamp: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  // Worker accepts employer's counter
  workerAcceptCounter: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'ACCEPTED' as ApplicationStatus, agreedWage: a.currentCounterWage ?? a.proposedWage, currentCounterWage: undefined, counterBy: undefined, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  // Worker declines employer's counter (back to applied)
  workerDeclineCounter: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'REJECTED' as ApplicationStatus, currentCounterWage: undefined, counterBy: undefined, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  acceptApplication: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'ACCEPTED' as ApplicationStatus, agreedWage: a.currentCounterWage ?? a.proposedWage, currentCounterWage: undefined, counterBy: undefined, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  rejectApplication: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'REJECTED' as ApplicationStatus, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  payWorker: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'PAID' as ApplicationStatus, paymentStatus: 'PAID' as const, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  // Employer initiates counter offer
  employerCounterOffer: (appId, counterWage) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEGOTIATING' as ApplicationStatus,
              currentCounterWage: counterWage,
              counterBy: 'employer',
              negotiations: [
                ...a.negotiations,
                { id: `neg_${Date.now()}`, initiatedBy: 'employer', proposedWage: counterWage, timestamp: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  // Employer accepts worker's counter
  employerAcceptCounter: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, status: 'ACCEPTED' as ApplicationStatus, agreedWage: a.currentCounterWage ?? a.proposedWage, currentCounterWage: undefined, counterBy: undefined, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  getWorkerApplications: (workerId) =>
    get().applications.filter((a) => a.workerId === workerId),

  getJobApplications: (jobId) =>
    get().applications.filter((a) => a.jobId === jobId),

  hasApplied: (jobId, workerId) =>
    get().applications.some((a) => a.jobId === jobId && a.workerId === workerId),

  getApplication: (appId) =>
    get().applications.find((a) => a.id === appId),
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
  profile: null,
  isAvailable: true,
  setProfile: (profile) => set({ profile }),
  setAvailability: (available) => set({ isAvailable: available }),
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      return { profile: updated };
    }),
}));

// ─── Employer Store ───────────────────────────────────────────────────────────

interface EmployerState {
  profile: EmployerProfile | null;
  jobs: Job[];
  setProfile: (profile: EmployerProfile) => void;
  updateProfile: (updates: Partial<EmployerProfile>) => void;
  postJob: (jobData: Partial<Job>) => void;
}

export const useEmployerStore = create<EmployerState>((set) => ({
  profile: null,
  jobs: MOCK_JOBS,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      return { profile: updated };
    }),
  postJob: (jobData) =>
    set((state) => {
      const newJob: Job = {
        id: `j_${Date.now()}`,
        employerId: state.profile?.id ?? 'e1',
        employer: state.profile ?? ({} as any),
        title: jobData.title ?? 'General Shift',
        description: jobData.description ?? '',
        skillRequired: jobData.skillRequired ?? MOCK_JOBS[0].skillRequired,
        location: jobData.location ?? MOCK_JOBS[0].location,
        startDate: jobData.startDate ?? '2026-08-25',
        startTime: jobData.startTime ?? '08:00 AM',
        endTime: jobData.endTime ?? '05:00 PM',
        workersRequired: jobData.workersRequired ?? 5,
        workersHired: 0,
        minWage: jobData.minWage ?? 800,
        maxWage: jobData.maxWage ?? 1000,
        requirements: jobData.requirements ?? [],
        status: 'HIRING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { jobs: [newJob, ...state.jobs] };
    }),
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
