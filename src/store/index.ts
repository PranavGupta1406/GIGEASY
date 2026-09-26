import { create } from 'zustand';
import {
  UserRole, WorkerProfile, EmployerProfile, Job, JobFilters, JobApplication,
  VerificationStatus, ApplicationStatus, PaymentRecord,
  ServiceRequest, CooperativeSociety, Federation, DemandForecast,
  SkillGapAlert, TrainingRecommendation, Dispute, BookingStatus,
  WorkerWelfare, DisputeType, DisputeStatus, TwoSidedRating,
  WorkerAvailabilityModel, WorkerAvailabilityMode, WorkerScheduledWindow, WorkforceGap,
} from '../types';
import {
  MOCK_JOBS, SEED_EMPLOYER_APPLICATIONS, SEED_WORKER_APPLICATIONS,
  CURRENT_WORKER, CURRENT_EMPLOYER,
  COOPERATIVE_SOCIETIES, FEDERATION, DEMAND_FORECASTS, SKILL_GAP_ALERTS,
  TRAINING_RECOMMENDATIONS, DEMO_SERVICE_REQUESTS, MOCK_WORKERS,
  COOP_DASHBOARD_STATS, MOCK_WORKER_WELFARES, MOCK_DISPUTES, formatPaymentBreakdown, formatWage,
} from '../data/mockData';
import { TRANSLATIONS, LanguageCode, TranslationKey, getLocalizedStatus, getLocalizedCategory, getLocalizedNotification } from '../i18n/translations';
import { gigRadarService } from '../services/radar/gigRadarService';
import { realtimeSocket } from '../services/realtime/socketService';

export { getLocalizedStatus, getLocalizedCategory, getLocalizedNotification };

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
  t: (key: TranslationKey | string) => string;
}

const initialLanguage = safeGetStorage<LanguageCode>('gigeasy_language', 'en');

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: initialLanguage,
  setLanguage: (lang) => {
    safeSetStorage('gigeasy_language', lang);
    set({ language: lang });
  },
  toggleLanguage: () =>
    set((state) => {
      const next = state.language === 'en' ? 'hi' : 'en';
      safeSetStorage('gigeasy_language', next);
      return { language: next };
    }),
  t: (key) => {
    const lang = get().language;
    const dict = TRANSLATIONS[lang] as any;
    const fallback = TRANSLATIONS.en as any;
    return dict?.[key] ?? fallback?.[key] ?? String(key);
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

// ─── Real-Time In-App Notification Store ──────────────────────────────────────
// Synchronizes events across workers and employers.
// Supports slide-in active toasts, notification drawer, and persistent log.

export type AppNotificationType =
  | 'GIG_ALERT'
  | 'APPLICATION_RECEIVED'
  | 'HIRED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COUNTER_OFFER'
  | 'CHECK_IN'
  | 'WORK_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'DIRECT_OFFER';

export interface AppNotification {
  id: string;
  targetRole: 'worker' | 'employer' | 'all';
  type: AppNotificationType;
  title: string;
  message: string;
  data?: {
    jobId?: string;
    applicationId?: string;
    workerId?: string;
    amount?: number;
    wage?: number;
    // Gig alert rich metadata (used by GigAlertOverlay)
    location?: string;
    city?: string;
    distanceKm?: number;
    time?: string;
    category?: string;
    spotsRequired?: number;
    spotsHired?: number;
    matchScore?: number;
    matchReason?: string;
  };
  timestamp: string;
  read: boolean;
}

interface AppNotificationState {
  notifications: AppNotification[];
  activeToast: AppNotification | null;
  notify: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role?: 'worker' | 'employer') => void;
  clearAll: () => void;
  getUnreadCount: (role: 'worker' | 'employer') => number;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_init_1',
    targetRole: 'worker',
    type: 'GIG_ALERT',
    title: 'Construction Site Helper',
    message: '₹1,200/day · Noida · 4.2 km · 98% match',
    data: {
      jobId: 'j2',
      wage: 1200,
      location: 'Sector 62, Noida',
      city: 'Noida',
      distanceKm: 4.2,
      time: '10:00 AM',
      category: 'Construction',
      spotsRequired: 8,
      spotsHired: 0,
      matchScore: 98,
      matchReason: 'Nearby + matches your skills',
    },
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif_init_2',
    targetRole: 'employer',
    type: 'APPLICATION_RECEIVED',
    title: 'New Applicant: Ramesh Kumar',
    message: 'Applied for Warehouse Loading Helper',
    data: { jobId: 'j1' },
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read: false,
  },
];

const storedNotifications = safeGetStorage<AppNotification[]>('gigeasy_notifications', INITIAL_NOTIFICATIONS);
// On fresh session, surface the first unread GIG_ALERT as the initial toast
const initialActiveToast = storedNotifications.find(
  (n) => n.type === 'GIG_ALERT' && n.targetRole === 'worker' && !n.read
) ?? null;

export const useAppNotificationStore = create<AppNotificationState>((set, get) => ({
  notifications: storedNotifications,
  activeToast: initialActiveToast,

  notify: (n) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...get().notifications].slice(0, 50);
    set({ notifications: updated, activeToast: newNotif });
    safeSetStorage('gigeasy_notifications', updated);
  },

  dismissToast: () => set({ activeToast: null }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );
      safeSetStorage('gigeasy_notifications', updated);
      return { notifications: updated };
    }),

  markAllAsRead: (role) =>
    set((state) => {
      const updated = state.notifications.map((item) =>
        !role || item.targetRole === role || item.targetRole === 'all'
          ? { ...item, read: true }
          : item
      );
      safeSetStorage('gigeasy_notifications', updated);
      return { notifications: updated };
    }),

  clearAll: () => {
    set({ notifications: [], activeToast: null });
    safeSetStorage('gigeasy_notifications', []);
  },

  getUnreadCount: (role) => {
    return get().notifications.filter(
      (n) => !n.read && (n.targetRole === role || n.targetRole === 'all')
    ).length;
  },
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
    // Atomic Overbooking & Duplicate Guard
    const already = get().applications.find(
      (a) => a.jobId === jobId && a.workerId === worker.id
    );
    if (already) return; // Duplicate guard

    const targetJob = useEmployerStore.getState().jobs.find((j) => j.id === jobId) ?? job;
    const hired = targetJob.workersHired || 0;
    const required = targetJob.workersRequired || 1;
    if (hired >= required) {
      console.warn('Overbooking prevented: Job is already filled.');
      return;
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      job: targetJob,
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

    // Cross-role alert: notify employer
    useAppNotificationStore.getState().notify({
      targetRole: 'employer',
      type: 'APPLICATION_RECEIVED',
      title: `New Applicant: ${worker.name}`,
      message: `Applied for ${targetJob.title} · Proposed ${formatWage(wage)}/day`,
      data: { jobId, applicationId: newApp.id, workerId: worker.id },
    });

    realtimeSocket.emit('APPLICATION_RECEIVED', newApp);
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

    // Cross-role alert: notify employer
    const targetApp = get().applications.find((a) => a.id === appId);
    if (targetApp) {
      useAppNotificationStore.getState().notify({
        targetRole: 'employer',
        type: 'CHECK_IN',
        title: 'Worker Checked In 📍',
        message: `${targetApp.worker.name} is on shift for ${targetApp.job.title}`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id },
      });
    }
  },

  markComplete: (appId) => {
    const targetApp = get().applications.find((a) => a.id === appId);
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

    // Cross-role alert: notify employer
    if (targetApp) {
      useAppNotificationStore.getState().notify({
        targetRole: 'employer',
        type: 'WORK_COMPLETED',
        title: 'Work Completed ✅',
        message: `${targetApp.worker.name} marked shift complete for ${targetApp.job.title}. Release payment to complete escrow.`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id },
      });
    }
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

    // Cross-role alert: notify employer
    const targetApp = get().applications.find((a) => a.id === appId);
    if (targetApp) {
      useAppNotificationStore.getState().notify({
        targetRole: 'employer',
        type: 'COUNTER_OFFER',
        title: `${targetApp.worker.name} Countered Wage`,
        message: `Requested ${formatWage(counterWage)}/day for ${targetApp.job.title}`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id, wage: counterWage },
      });
    }
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
    if (!targetApp) return;

    // Check if job already filled to prevent overbooking
    const currentJob = useEmployerStore.getState().jobs.find((j) => j.id === targetApp.jobId) ?? targetApp.job;
    const hired = currentJob.workersHired || 0;
    const required = currentJob.workersRequired || 1;
    if (hired >= required) {
      console.warn('Overbooking prevented: Job is already filled.');
      return;
    }

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

    useEmployerStore.getState().incrementHiredCount?.(targetApp.jobId);
    useAppNotificationStore.getState().notify({
      targetRole: 'worker',
      type: 'HIRED',
      title: "You're Hired! 🎉",
      message: `${targetApp.job.employer.businessName} accepted your application for ${targetApp.job.title}`,
      data: { jobId: targetApp.jobId, applicationId: targetApp.id },
    });

    realtimeSocket.emit('WORKER_HIRED', targetApp);
  },

  rejectApplication: (appId) => {
    const targetApp = get().applications.find((a) => a.id === appId);
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

    // Cross-role alert: notify worker
    if (targetApp) {
      useAppNotificationStore.getState().notify({
        targetRole: 'worker',
        type: 'APPLICATION_RECEIVED',
        title: 'Application Update',
        message: `${targetApp.job.employer.businessName} reviewed your application for ${targetApp.job.title}`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id },
      });
    }
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

    // Live sync: increase worker's actual earnings in real time
    useWorkerStore.getState().addEarnings?.(amount);

    // Cross-role alert: notify worker
    useAppNotificationStore.getState().notify({
      targetRole: 'worker',
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received! 💰',
      message: `${formatWage(amount)} credited to your cooperative escrow account for ${app.job.title}`,
      data: { jobId: app.jobId, applicationId: app.id, amount },
    });
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
    // Live sync: increase worker's actual earnings in real time
    useWorkerStore.getState().addEarnings?.(paymentData.amount);

    // Cross-role alert: notify worker
    useAppNotificationStore.getState().notify({
      targetRole: 'worker',
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received! 💰',
      message: `${formatWage(paymentData.amount)} credited via ${paymentData.method} for ${paymentData.jobTitle}`,
      data: { jobId: paymentData.jobId, applicationId: paymentData.applicationId, amount: paymentData.amount },
    });

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

    // Cross-role alert: notify worker
    const targetApp = get().applications.find((a) => a.id === appId);
    if (targetApp) {
      useAppNotificationStore.getState().notify({
        targetRole: 'worker',
        type: 'COUNTER_OFFER',
        title: 'Counter Offer: ' + formatWage(counterWage) + '/day',
        message: `${targetApp.job.employer.businessName} proposed a new wage for ${targetApp.job.title}`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id, wage: counterWage },
      });
    }
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
      useAppNotificationStore.getState().notify({
        targetRole: 'worker',
        type: 'HIRED',
        title: 'Wage Agreement Confirmed! 🎉',
        message: `${targetApp.job.employer.businessName} accepted your counter offer for ${targetApp.job.title}`,
        data: { jobId: targetApp.jobId, applicationId: targetApp.id },
      });
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
  availability: WorkerAvailabilityModel;
  setProfile: (profile: WorkerProfile) => void;
  setAvailability: (available: boolean) => void;
  setAvailabilityMode: (mode: WorkerAvailabilityMode, window?: WorkerScheduledWindow) => void;
  setPreferredRadius: (radiusKm: number) => void;
  setPreferredTrades: (trades: string[]) => void;
  updateProfile: (updates: Partial<WorkerProfile>) => void;
  addEarnings: (amount: number) => void;
}

const initialAvailability: WorkerAvailabilityModel = safeGetStorage<WorkerAvailabilityModel>(
  'gigeasy_worker_availability',
  {
    mode: 'NOW',
    scheduledWindow: {
      date: 'Today',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
    },
    preferredRadiusKm: 8,
    preferredTrades: ['Electrical', 'Warehouse', 'Plumbing'],
    updatedAt: new Date().toISOString(),
  }
);

export const useWorkerStore = create<WorkerState>((set, get) => ({
  profile: safeGetStorage<WorkerProfile>('gigeasy_worker_profile', CURRENT_WORKER),
  isAvailable: initialAvailability.mode !== 'OFF',
  availability: initialAvailability,
  setProfile: (profile) => {
    set({ profile });
    safeSetStorage('gigeasy_worker_profile', profile);
  },
  setAvailability: (available) => {
    set((state) => {
      const newMode = available ? 'NOW' : 'OFF';
      const updatedAvail = { ...state.availability, mode: newMode as WorkerAvailabilityMode, updatedAt: new Date().toISOString() };
      safeSetStorage('gigeasy_worker_availability', updatedAvail);
      return { isAvailable: available, availability: updatedAvail };
    });
  },
  setAvailabilityMode: (mode, window) => {
    set((state) => {
      const updatedAvail: WorkerAvailabilityModel = {
        ...state.availability,
        mode,
        scheduledWindow: window ?? state.availability.scheduledWindow,
        updatedAt: new Date().toISOString(),
      };
      safeSetStorage('gigeasy_worker_availability', updatedAvail);
      return { isAvailable: mode !== 'OFF', availability: updatedAvail };
    });
  },
  setPreferredRadius: (radiusKm) => {
    set((state) => {
      const updatedAvail = { ...state.availability, preferredRadiusKm: radiusKm, updatedAt: new Date().toISOString() };
      safeSetStorage('gigeasy_worker_availability', updatedAvail);
      return { availability: updatedAvail };
    });
  },
  setPreferredTrades: (trades) => {
    set((state) => {
      const updatedAvail = { ...state.availability, preferredTrades: trades, updatedAt: new Date().toISOString() };
      safeSetStorage('gigeasy_worker_availability', updatedAvail);
      return { availability: updatedAvail };
    });
  },
  updateProfile: (updates) =>
    set((state) => {
      const updated = state.profile ? { ...state.profile, ...updates } : null;
      safeSetStorage('gigeasy_worker_profile', updated);
      return { profile: updated };
    }),
  addEarnings: (amount) =>
    set((state) => {
      if (!state.profile) return state;
      const weeklyEarnings = (state.profile.weeklyEarnings || 0) + amount;
      const monthlyEarnings = (state.profile.monthlyEarnings || 0) + amount;
      const totalLifetimeEarnings = (state.profile.totalLifetimeEarnings || 0) + amount;
      const completedJobs = (state.profile.completedJobs || 0) + 1;
      const updated: WorkerProfile = {
        ...state.profile,
        weeklyEarnings,
        monthlyEarnings,
        totalLifetimeEarnings,
        completedJobs,
      };
      safeSetStorage('gigeasy_worker_profile', updated);
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
  getWorkforceGap: (jobId: string) => WorkforceGap;
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
  getWorkforceGap: (jobId: string): WorkforceGap => {
    const job = get().jobs.find((j) => j.id === jobId);
    const req = job?.workersRequired ?? 1;
    const hired = job?.workersHired ?? 0;
    const remaining = Math.max(0, req - hired);
    const apps = useSharedApplicationsStore.getState().getJobApplications(jobId);
    const pct = Math.min(100, Math.round((hired / req) * 100));
    let status: WorkforceGap['status'] = 'OPEN';
    if (remaining === 0) status = 'FILLED';
    else if (remaining === 1) status = 'FINAL_SPOT';
    else if (remaining >= Math.ceil(req * 0.5)) status = 'URGENT';
    return {
      jobId,
      workersRequired: req,
      workersHired: hired,
      workersRemaining: remaining,
      applicantsCount: apps.length,
      availableWorkerPool: 6,
      fillPercentage: pct,
      status,
    };
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

    // Evaluate against active worker using Gig Radar
    const currentWorker = useWorkerStore.getState().profile ?? CURRENT_WORKER;
    const workerAvail = useWorkerStore.getState().availability;
    const radarMatch = gigRadarService.evaluateGigMatch(newJob, currentWorker, workerAvail);

    // Cross-role alert: notify workers (rich metadata for GigAlertOverlay)
    useAppNotificationStore.getState().notify({
      targetRole: 'worker',
      type: 'GIG_ALERT',
      title: newJob.title,
      message: `${formatWage(newJob.maxWage)}/day · ${newJob.location.city} · ${radarMatch.totalScore}% match`,
      data: {
        jobId: newJob.id,
        wage: newJob.maxWage,
        location: newJob.location.address || newJob.location.city,
        distanceKm: radarMatch.distanceKm,
        time: newJob.startTime,
        category: newJob.skillRequired?.category ?? '',
        spotsRequired: newJob.workersRequired,
        spotsHired: newJob.workersHired ?? 0,
        matchScore: radarMatch.totalScore,
        matchReason: radarMatch.conciseSummary,
      },
    });

    realtimeSocket.emit('JOB_DISPATCHED', newJob);

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

// ─── Cooperative Store ────────────────────────────────────────────────────────

interface CooperativeState {
  cooperatives: CooperativeSociety[];
  selectedCooperativeId: string;
  federation: Federation;
  stats: typeof COOP_DASHBOARD_STATS;
  setSelectedCooperativeId: (id: string) => void;
  getSelectedCooperative: () => CooperativeSociety | undefined;
  updateStats: (partial: Partial<typeof COOP_DASHBOARD_STATS>) => void;
}

export const useCooperativeStore = create<CooperativeState>((set, get) => ({
  cooperatives: safeGetStorage('gigeasy_cooperatives', COOPERATIVE_SOCIETIES),
  selectedCooperativeId: 'coop_1',
  federation: FEDERATION,
  stats: safeGetStorage('gigeasy_coop_stats', COOP_DASHBOARD_STATS),
  setSelectedCooperativeId: (id) => set({ selectedCooperativeId: id }),
  getSelectedCooperative: () =>
    get().cooperatives.find((c) => c.id === get().selectedCooperativeId) || get().cooperatives[0],
  updateStats: (partial) =>
    set((state) => {
      const updated = { ...state.stats, ...partial };
      safeSetStorage('gigeasy_coop_stats', updated);
      return { stats: updated };
    }),
}));

// ─── Service Request (Household Booking) Store ───────────────────────────────

interface ServiceRequestState {
  requests: ServiceRequest[];
  activeRequestId: string | null;
  createRequest: (data: Partial<ServiceRequest>) => ServiceRequest;
  updateRequestStatus: (id: string, status: BookingStatus, extra?: Partial<ServiceRequest>) => void;
  assignWorker: (id: string, workerId: string, estimatedArrivalMins?: number) => void;
  getRequestById: (id: string) => ServiceRequest | undefined;
  setActiveRequestId: (id: string | null) => void;
}

export const useServiceRequestStore = create<ServiceRequestState>((set, get) => ({
  requests: safeGetStorage('gigeasy_service_requests', DEMO_SERVICE_REQUESTS),
  activeRequestId: 'sr1',
  createRequest: (data) => {
    const newRequest: ServiceRequest = {
      id: `sr_${Date.now()}`,
      customerId: data.customerId || 'cust_1',
      customerName: data.customerName || 'Demo Customer',
      customerPhone: data.customerPhone || '+91 98765 00000',
      location: data.location || {
        lat: 28.62,
        lng: 77.22,
        address: 'Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zone: 'Zone 6 - Noida',
      },
      serviceCategory: data.serviceCategory || 'Plumbing',
      serviceTitle: data.serviceTitle || 'Household Service',
      description: data.description || '',
      urgency: data.urgency || 'medium',
      aiClassification: data.aiClassification,
      status: data.status || 'REQUESTED',
      estimatedPrice: data.estimatedPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const updated = [newRequest, ...get().requests];
    set({ requests: updated, activeRequestId: newRequest.id });
    safeSetStorage('gigeasy_service_requests', updated);
    return newRequest;
  },
  updateRequestStatus: (id, status, extra) => {
    const updated = get().requests.map((r) =>
      r.id === id ? { ...r, status, ...extra, updatedAt: new Date().toISOString() } : r
    );
    set({ requests: updated });
    safeSetStorage('gigeasy_service_requests', updated);
  },
  assignWorker: (id, workerId, estimatedArrivalMins = 20) => {
    const worker = MOCK_WORKERS.find((w) => w.id === workerId);
    const updated = get().requests.map((r) =>
      r.id === id
        ? {
            ...r,
            assignedWorkerId: workerId,
            assignedWorker: worker,
            status: 'WORKER_ASSIGNED' as BookingStatus,
            estimatedArrivalMins,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    set({ requests: updated });
    safeSetStorage('gigeasy_service_requests', updated);
  },
  getRequestById: (id) => get().requests.find((r) => r.id === id),
  setActiveRequestId: (id) => set({ activeRequestId: id }),
}));

// ─── Demand Forecast Store ────────────────────────────────────────────────────

interface DemandForecastState {
  forecasts: DemandForecast[];
  skillGaps: SkillGapAlert[];
  trainingRecommendations: TrainingRecommendation[];
  selectedZone: string | null;
  setSelectedZone: (zone: string | null) => void;
  addForecast: (forecast: DemandForecast) => void;
}

export const useDemandForecastStore = create<DemandForecastState>((set) => ({
  forecasts: DEMAND_FORECASTS,
  skillGaps: SKILL_GAP_ALERTS,
  trainingRecommendations: TRAINING_RECOMMENDATIONS,
  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  addForecast: (forecast) =>
    set((state) => ({ forecasts: [forecast, ...state.forecasts] })),
}));

// ─── Welfare Store ────────────────────────────────────────────────────────────

interface WelfareState {
  workerWelfare: Record<string, WorkerWelfare>;
  getWorkerWelfare: (workerId: string) => WorkerWelfare;
  enrollInScheme: (workerId: string, schemeId: string) => void;
  requestEmergencyFund: (workerId: string, amount: number, reason: string) => boolean;
  enrollInTraining: (workerId: string, courseName: string, credits: number) => boolean;
}

export const useWelfareStore = create<WelfareState>((set, get) => ({
  workerWelfare: safeGetStorage('gigeasy_worker_welfare', MOCK_WORKER_WELFARES),
  getWorkerWelfare: (workerId: string) => {
    const welfare = get().workerWelfare[workerId];
    if (welfare) return welfare;
    // Default fallback
    return (
      MOCK_WORKER_WELFARES['w1'] || {
        workerId,
        insurance: [],
        welfareSchemes: [],
        emergencyFundBalance: 5000,
        trainingCredits: 10,
        completedTrainings: [],
        totalContributed: 5000,
        cooperativeContributed: 3000,
      }
    );
  },
  enrollInScheme: (workerId: string, schemeId: string) => {
    const current = get().getWorkerWelfare(workerId);
    const updatedSchemes = current.welfareSchemes.map((s) =>
      s.id === schemeId ? { ...s, status: 'active' as const, enrolledDate: new Date().toISOString() } : s
    );
    const updatedWelfare = {
      ...get().workerWelfare,
      [workerId]: { ...current, welfareSchemes: updatedSchemes },
    };
    set({ workerWelfare: updatedWelfare });
    safeSetStorage('gigeasy_worker_welfare', updatedWelfare);
  },
  requestEmergencyFund: (workerId: string, amount: number) => {
    const current = get().getWorkerWelfare(workerId);
    if (current.emergencyFundBalance < amount) return false;
    const updatedWelfare = {
      ...get().workerWelfare,
      [workerId]: {
        ...current,
        emergencyFundBalance: current.emergencyFundBalance - amount,
      },
    };
    set({ workerWelfare: updatedWelfare });
    safeSetStorage('gigeasy_worker_welfare', updatedWelfare);
    return true;
  },
  enrollInTraining: (workerId: string, courseName: string, credits: number) => {
    const current = get().getWorkerWelfare(workerId);
    if (current.trainingCredits < credits) return false;
    const updatedWelfare = {
      ...get().workerWelfare,
      [workerId]: {
        ...current,
        trainingCredits: current.trainingCredits - credits,
        completedTrainings: [...current.completedTrainings, courseName],
      },
    };
    set({ workerWelfare: updatedWelfare });
    safeSetStorage('gigeasy_worker_welfare', updatedWelfare);
    return true;
  },
}));

// ─── Dispute Store ────────────────────────────────────────────────────────────

interface DisputeState {
  disputes: Dispute[];
  fileDispute: (disputeData: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Dispute;
  resolveDispute: (disputeId: string, resolution: string, note?: string) => void;
  getDisputesByUserId: (userId: string) => Dispute[];
  getDisputeById: (id: string) => Dispute | undefined;
}

export const useDisputeStore = create<DisputeState>((set, get) => ({
  disputes: safeGetStorage('gigeasy_disputes', MOCK_DISPUTES),
  fileDispute: (data) => {
    const newDispute: Dispute = {
      id: `disp_${Date.now()}`,
      status: 'filed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const updated = [newDispute, ...get().disputes];
    set({ disputes: updated });
    safeSetStorage('gigeasy_disputes', updated);
    return newDispute;
  },
  resolveDispute: (disputeId, resolution, note) => {
    const updated = get().disputes.map((d) =>
      d.id === disputeId
        ? {
            ...d,
            status: 'resolved' as const,
            resolution,
            cooperativeAdminNote: note || d.cooperativeAdminNote,
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : d
    );
    set({ disputes: updated });
    safeSetStorage('gigeasy_disputes', updated);
  },
  getDisputesByUserId: (userId) =>
    get().disputes.filter((d) => d.raisedByUserId === userId || d.againstUserId === userId),
  getDisputeById: (id) => get().disputes.find((d) => d.id === id),
}));

// ─── Recommendation Preferences Store ────────────────────────────────────────
// Lightweight store for gig alert preferences and interaction events.
// Persisted via localStorage — same pattern as all other stores.

import {
  GigInteractionEvent,
  recordInteraction as _recordInteraction,
} from '../services/recommendation/recommendationService';

export interface RecommendationPreferences {
  /** Whether to show the in-app instant gig alert strip */
  alertsEnabled: boolean;
  /** Minimum match score (0-100) that triggers an alert */
  minAlertScore: number;
  /** Maximum distance preference override (0 = use worker profile default) */
  maxDistanceKm: number;
  /** Minimum pay preference override (0 = use worker profile default) */
  minPayPerDay: number;
}

interface RecommendationState {
  preferences: RecommendationPreferences;
  setAlertsEnabled: (enabled: boolean) => void;
  setMinAlertScore: (score: number) => void;
  setMaxDistanceKm: (km: number) => void;
  setMinPayPerDay: (pay: number) => void;
  recordGigInteraction: (event: GigInteractionEvent) => void;
}

const DEFAULT_REC_PREFS: RecommendationPreferences = {
  alertsEnabled: true,
  minAlertScore: 85,
  maxDistanceKm: 0,
  minPayPerDay: 0,
};

export const useRecommendationStore = create<RecommendationState>((set) => ({
  preferences: safeGetStorage<RecommendationPreferences>('gigeasy_rec_prefs', DEFAULT_REC_PREFS),

  setAlertsEnabled: (enabled) =>
    set((state) => {
      const updated = { ...state.preferences, alertsEnabled: enabled };
      safeSetStorage('gigeasy_rec_prefs', updated);
      return { preferences: updated };
    }),

  setMinAlertScore: (score) =>
    set((state) => {
      const updated = { ...state.preferences, minAlertScore: score };
      safeSetStorage('gigeasy_rec_prefs', updated);
      return { preferences: updated };
    }),

  setMaxDistanceKm: (km) =>
    set((state) => {
      const updated = { ...state.preferences, maxDistanceKm: km };
      safeSetStorage('gigeasy_rec_prefs', updated);
      return { preferences: updated };
    }),

  setMinPayPerDay: (pay) =>
    set((state) => {
      const updated = { ...state.preferences, minPayPerDay: pay };
      safeSetStorage('gigeasy_rec_prefs', updated);
      return { preferences: updated };
    }),

  recordGigInteraction: (event) => {
    _recordInteraction(event);
    // No state mutation needed — events live in localStorage via the service
  },
}));
