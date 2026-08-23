import { create } from 'zustand';
import { UserRole, WorkerProfile, EmployerProfile, Job, JobFilters, JobApplication, VerificationStatus } from '../types';
import { MOCK_JOBS, MOCK_APPLICATIONS, CURRENT_WORKER } from '../data/mockData';
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
  kycStatus: VerificationStatus;
  isOnboarded: boolean;
  setPhoneNumber: (phone: string) => void;
  setAuthenticated: (
    userId: string,
    role: UserRole,
    name?: string,
    email?: string,
    phoneNumber?: string,
    kycStatus?: VerificationStatus
  ) => void;
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
  kycStatus: 'unverified',
  isOnboarded: false,
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setAuthenticated: (userId, role, name = '', email = '', phoneNumber = '', kycStatus = 'unverified') =>
    set({
      isAuthenticated: true,
      userId,
      role,
      name,
      email,
      phoneNumber,
      kycStatus,
    }),
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
      kycStatus: 'unverified',
      isOnboarded: false,
    }),
}));

// ─── Worker Store ─────────────────────────────────────────────────────────────

interface WorkerState {
  profile: WorkerProfile | null;
  isAvailable: boolean;
  applications: JobApplication[];
  setProfile: (profile: WorkerProfile) => void;
  setAvailability: (available: boolean) => void;
  updateProfile: (updates: Partial<WorkerProfile>) => void;
  applyForJob: (jobId: string, proposedWage: number, note?: string) => void;
}

export const useWorkerStore = create<WorkerState>((set) => ({
  profile: null,
  isAvailable: true,
  applications: [],
  setProfile: (profile) => set({ profile }),
  setAvailability: (available) => set({ isAvailable: available }),
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      return { profile: updated };
    }),
  applyForJob: (jobId, proposedWage, note) =>
    set((state) => {
      const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
      const newApp: JobApplication = {
        id: `app_${Date.now()}`,
        jobId,
        job,
        workerId: state.profile?.id ?? 'w1',
        worker: state.profile ?? CURRENT_WORKER,
        proposedWage,
        status: 'APPLIED',
        note,
        negotiations: [],
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { applications: [newApp, ...state.applications] };
    }),
}));

// ─── Employer Store ───────────────────────────────────────────────────────────

interface EmployerState {
  profile: EmployerProfile | null;
  jobs: Job[];
  applications: JobApplication[];
  setProfile: (profile: EmployerProfile) => void;
  updateProfile: (updates: Partial<EmployerProfile>) => void;
  postJob: (jobData: Partial<Job>) => void;
  acceptApplicant: (appId: string) => void;
  counterOffer: (appId: string, wage: number, message?: string) => void;
}

export const useEmployerStore = create<EmployerState>((set) => ({
  profile: null,
  jobs: MOCK_JOBS,
  applications: MOCK_APPLICATIONS,
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
        startDate: jobData.startDate ?? '2026-08-15',
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
  acceptApplicant: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId ? { ...a, status: 'ACCEPTED' as const } : a
      ),
    })),
  counterOffer: (appId, wage, message) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEGOTIATING' as const,
              proposedWage: wage,
            }
          : a
      ),
    })),
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
