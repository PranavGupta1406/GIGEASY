// GigEasy Domain Types

export type UserRole = 'worker' | 'employer';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type JobStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'HIRING'
  | 'FULL'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export type AvailabilityStatus = 'available' | 'unavailable' | 'busy';

// ─── Skills ─────────────────────────────────────────────────────────────────

export const SKILL_CATEGORIES = [
  'Construction',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Painting',
  'Warehouse',
  'Driving',
  'Cleaning',
  'Security',
  'Hospitality',
  'Events',
  'Factory',
  'Delivery',
  'Helper',
  'Farming',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string; // emoji or icon name
}

// ─── Location ───────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Worker ─────────────────────────────────────────────────────────────────

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  profilePhoto?: string;
  phoneNumber: string;
  location: Location;
  skills: Skill[];
  experienceYears: number;
  expectedDailyWage: number;
  availabilityStatus: AvailabilityStatus;
  preferredRadius: number; // km
  languages: string[];
  bio?: string;
  trustScore: number; // 0–100
  trustLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  verificationStatus: VerificationStatus;
  rating: number; // 1–5
  completedJobs: number;
  workHistory: WorkHistoryItem[];
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistoryItem {
  id: string;
  jobTitle: string;
  employerName: string;
  wage: number;
  date: string;
  rating: number;
  status: 'completed' | 'cancelled';
}

// ─── Employer ───────────────────────────────────────────────────────────────

export interface EmployerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  logo?: string;
  location: Location;
  contactName: string;
  description?: string;
  verificationStatus: VerificationStatus;
  rating: number;
  totalJobsPosted: number;
  hiringHistory: HiringHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HiringHistoryItem {
  id: string;
  jobTitle: string;
  workersHired: number;
  date: string;
  status: JobStatus;
}

// ─── Job ────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  employerId: string;
  employer: EmployerProfile;
  title: string;
  description: string;
  skillRequired: Skill;
  location: Location;
  startDate: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  workersRequired: number;
  workersHired: number;
  minWage: number;
  maxWage: number;
  requirements: string[];
  status: JobStatus;
  distanceKm?: number; // computed for worker
  createdAt: string;
  updatedAt: string;
}

// ─── Application ────────────────────────────────────────────────────────────

export interface JobApplication {
  id: string;
  jobId: string;
  job: Job;
  workerId: string;
  worker: WorkerProfile;
  proposedWage: number;
  status: ApplicationStatus;
  note?: string;
  negotiations: NegotiationStep[];
  appliedAt: string;
  updatedAt: string;
}

export interface NegotiationStep {
  id: string;
  initiatedBy: 'worker' | 'employer';
  proposedWage: number;
  message?: string;
  timestamp: string;
}

// ─── Rating ─────────────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  jobId: string;
  ratedBy: 'worker' | 'employer';
  ratedUserId: string;
  overall: number;
  punctuality?: number;
  behaviour?: number;
  workQuality?: number;
  feedback?: string;
  createdAt: string;
}

// ─── Notification ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface JobFilters {
  maxDistanceKm?: number;
  minWage?: number;
  maxWage?: number;
  skillId?: string;
  date?: string;
  verifiedOnly?: boolean;
  sortBy?: 'recommended' | 'nearest' | 'highest_paying' | 'latest' | 'best_rated';
}
