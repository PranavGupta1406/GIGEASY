// GigEasy Domain Types — SIH 26089 Cooperative Gig Services Platform

export type UserRole = 'worker' | 'employer' | 'customer' | 'cooperative_admin';

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
  | 'HIRED'
  | 'CONFIRMED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'WORK_SUBMITTED'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export type BookingStatus =
  | 'REQUESTED'
  | 'AI_TRIAGE'
  | 'WORKER_SEARCH'
  | 'WORKER_ASSIGNED'
  | 'WORKER_EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'DISPUTED';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface PaymentRecord {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  employerId: string;
  employerName: string;
  amount: number;
  method: 'UPI' | 'QR_CODE' | 'RAZORPAY' | 'CARD' | 'NET_BANKING' | 'CASH';
  transactionId: string;
  upiId?: string;
  paidAt: string;
  status: 'SUCCESS' | 'PROCESSING' | 'FAILED';
  // Cooperative payment breakdown
  breakdown?: PaymentBreakdown;
}

export interface PaymentBreakdown {
  totalAmount: number;
  workerEarning: number;        // What the worker receives
  cooperativeContribution: number; // To cooperative fund
  welfareContribution: number;  // To welfare/insurance pool
  platformFee: number;          // GigEasy platform fee
  workerEarningPct: number;     // e.g. 82
  cooperativePct: number;       // e.g. 8
  welfarePct: number;           // e.g. 5
  platformFeePct: number;       // e.g. 5
}

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
  'Retail',
  'Logistics',
  'Helper',
  'Farming',
  // Household & Community Service categories
  'Domestic Help',
  'Caregiving',
  'Appliance Repair',
  'Gardening',
  'Pest Control',
] as const;

export type SkillCategory = string;

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string; // Feather icon name
}

// ─── Location ───────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  zone?: string; // e.g. "Zone 3 - South Delhi"
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Certification ──────────────────────────────────────────────────────────

export interface WorkerCertification {
  id: string;
  name: string;
  issuedBy: string;       // e.g. "NSDC", "ITI Noida", "Delhi Skill Authority"
  issueDate: string;      // ISO date
  expiryDate?: string;    // ISO date (optional)
  verified: boolean;
  documentUrl?: string;
  skillCategory: SkillCategory;
}

// ─── Worker Welfare & Insurance ─────────────────────────────────────────────

export type InsuranceStatus = 'active' | 'expired' | 'pending' | 'not_enrolled';
export type WelfareSchemeStatus = 'active' | 'inactive' | 'applied' | 'not_applied';

export interface InsurancePolicy {
  policyNumber: string;
  provider: string;         // e.g. "Pradhan Mantri Suraksha Bima Yojana"
  type: 'accidental' | 'health' | 'life' | 'disability';
  coverageAmount: number;   // INR
  premiumPerMonth: number;  // INR (deducted from welfare pool)
  status: InsuranceStatus;
  startDate: string;
  expiryDate: string;
  claimable: boolean;
}

export interface WelfareScheme {
  id: string;
  name: string;
  description: string;
  monthlyBenefit?: number;  // INR
  status: WelfareSchemeStatus;
  enrolledDate?: string;
}

export interface WorkerWelfare {
  workerId: string;
  insurance: InsurancePolicy[];
  welfareSchemes: WelfareScheme[];
  emergencyFundBalance: number;   // INR available from cooperative emergency fund
  trainingCredits: number;        // Hours of free training available
  completedTrainings: string[];   // Training course names completed
  totalContributed: number;       // Total contributed to welfare pool from earnings
  cooperativeContributed: number; // Total cooperative match contribution
}

// ─── Cooperative Society ─────────────────────────────────────────────────────

export type CooperativeType =
  | 'labour_cooperative'
  | 'service_cooperative'
  | 'worker_producer'
  | 'multi_service';

export interface CooperativeSociety {
  id: string;
  name: string;
  registrationNumber: string;
  type: CooperativeType;
  federationId?: string;
  district: string;
  state: string;
  address: string;
  contactName: string;
  contactPhone: string;
  memberCount: number;
  activeWorkers: number;
  servicesOffered: SkillCategory[];
  verificationStatus: VerificationStatus;
  rating: number;
  totalJobsCompleted: number;
  establishedYear: number;
  logo?: string;
  description: string;
  zones: string[];  // Service zones this cooperative covers
}

// ─── Federation ─────────────────────────────────────────────────────────────

export interface Federation {
  id: string;
  name: string;
  state: string;
  societies: string[];       // Cooperative society IDs
  contactName: string;
  contactPhone: string;
  totalWorkers: number;
  totalSocieties: number;
  servicesOffered: SkillCategory[];
  description: string;
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
  certifications?: WorkerCertification[];
  experienceYears: number;
  availabilityStatus: AvailabilityStatus;
  preferredRadius: number; // km
  languages: string[];
  bio?: string;
  trustScore: number; // 0–100
  trustLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  verificationStatus: VerificationStatus;
  aadhaarVerified?: boolean;
  rating: number; // 1–5
  completedJobs: number;
  activeJobsCount?: number;        // Current active/ongoing jobs
  weeklyEarnings?: number;         // This week's earnings (INR)
  monthlyEarnings?: number;        // This month's earnings (INR)
  totalLifetimeEarnings?: number;
  workHistory: WorkHistoryItem[];
  distanceKm?: number;
  cooperativeId?: string;          // Cooperative society membership
  cooperativeName?: string;
  cooperativeMemberSince?: string; // ISO date
  welfare?: WorkerWelfare;
  primaryTrade?: string;
  expectedDailyWage?: number;
  preferredLocations?: string[];
  preferredCategories?: string[];
  cooperativeVerified?: boolean;
  skillVerified?: boolean;
  insuranceActive?: boolean;
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
  serviceCategory?: SkillCategory;
}

// ─── Employer / Customer ─────────────────────────────────────────────────────

export interface EmployerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  logo?: string;
  location: Location;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
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

// ─── Service Request (Customer → Cooperative flow) ──────────────────────────

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  location: Location;
  serviceCategory: SkillCategory;
  serviceTitle: string;
  description: string;
  urgency: UrgencyLevel;
  preferredDate?: string;         // ISO date — if scheduled
  preferredTimeSlot?: string;     // e.g. "10:00 AM - 12:00 PM"
  photoUrls?: string[];
  // AI triage results
  aiClassification?: AIServiceClassification;
  // Booking
  status: BookingStatus;
  assignedWorkerId?: string;
  assignedWorker?: WorkerProfile;
  estimatedArrivalMins?: number;
  estimatedPrice?: ServicePriceEstimate;
  finalAmount?: number;
  paymentBreakdown?: PaymentBreakdown;
  rating?: TwoSidedRating;
  createdAt: string;
  updatedAt: string;
}

export interface AIServiceClassification {
  serviceType: SkillCategory;
  suggestedSkills: string[];
  urgencyLevel: UrgencyLevel;
  estimatedDurationHours: number;
  requiredParts?: string[];
  confidence: number;   // 0-1
  reasoning: string;    // Human-readable AI note
}

export interface ServicePriceEstimate {
  basePrice: number;
  complexityMultiplier: number;
  durationEstimateHours: number;
  materialsCost?: number;
  travelCost?: number;
  totalEstimate: number;
  rangeMin: number;
  rangeMax: number;
  breakdown: PaymentBreakdown;
}

// ─── Job (B2B, preserved) ────────────────────────────────────────────────────

export interface Job {
  id: string;
  employerId: string;
  employer: EmployerProfile;
  title: string;
  description: string;
  skillRequired: Skill;
  location: Location;
  startDate: string;
  startTime: string;
  endTime: string;
  workersRequired: number;
  workersHired: number;
  minWage: number;
  maxWage: number;
  requirements: string[];
  status: JobStatus;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Application (B2B) ───────────────────────────────────────────────────────

export interface JobApplication {
  id: string;
  jobId: string;
  job: Job;
  workerId: string;
  worker: WorkerProfile;
  proposedWage: number;
  agreedWage?: number;
  status: ApplicationStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
  negotiations: NegotiationStep[];
  currentCounterWage?: number;
  counterBy?: 'worker' | 'employer';
  appliedAt: string;
  checkedInAt?: string;
  completedAt?: string;
  paidAt?: string;
  updatedAt: string;
}

export interface NegotiationStep {
  id: string;
  initiatedBy: 'worker' | 'employer';
  proposedWage: number;
  message?: string;
  timestamp: string;
}

// ─── FairWork Allocation ─────────────────────────────────────────────────────

export interface FairWorkScore {
  // Core match scores (inherited)
  totalScore: number;         // 0–100 overall
  skillScore: number;         // 0–35
  distanceScore: number;      // 0–25
  wageScore: number;          // 0–20
  trustScore: number;         // 0–10 (reduced to make room for fairness)
  experienceScore: number;    // 0–5
  // FairWork-specific scores
  fairnessScore: number;      // 0–5: penalize over-utilized workers
  utilizationBonus: number;   // 0–5: reward under-utilized workers
  // Totals & meta
  matchTier: 'EXCELLENT' | 'STRONG' | 'GOOD' | 'FAIR';
  reasons: string[];
  fairnessNote: string;       // e.g. "Under-utilized: only 2 jobs this week"
  workloadStatus: 'under_utilized' | 'normal' | 'near_capacity' | 'over_utilized';
  weeklyJobCount: number;
  isRecommendedByFairWork: boolean;
}

// ─── Demand Forecasting ──────────────────────────────────────────────────────

export interface DemandForecast {
  id: string;
  zone: string;               // e.g. "Zone 3 - South Delhi"
  serviceCategory: SkillCategory;
  forecastPeriod: 'today' | 'tomorrow' | 'this_week' | 'next_week';
  predictedDemand: number;    // Estimated number of service requests
  currentWorkers: number;     // Available workers for this service in zone
  historicalAverage: number;  // Baseline average
  changePercent: number;      // e.g. +31 for 31% increase
  trend: 'up' | 'down' | 'stable';
  shortage: number;           // Workers short (positive = shortage, negative = surplus)
  recommendedAction: string;  // e.g. "Deploy 5 additional plumbers from Zone 2"
  confidence: number;         // 0–1
  generatedAt: string;
}

export interface SkillGapAlert {
  id: string;
  serviceCategory: SkillCategory;
  zone: string;
  currentCertifiedWorkers: number;
  requiredWorkers: number;
  gap: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trainingRecommendation: string;
  estimatedTrainingWeeks: number;
}

export interface TrainingRecommendation {
  id: string;
  skillCategory: SkillCategory;
  courseName: string;
  provider: string;            // e.g. "ITI Delhi", "NSDC"
  durationWeeks: number;
  targetWorkers: number;       // How many workers should be trained
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  estimatedCost?: number;      // Per worker, INR
}

// ─── Two-Sided Rating ────────────────────────────────────────────────────────

export interface TwoSidedRating {
  id: string;
  serviceRequestId?: string;
  jobApplicationId?: string;
  // Customer rates worker
  customerRating?: {
    quality: number;        // 1–5
    punctuality: number;    // 1–5
    professionalism: number; // 1–5
    value: number;          // 1–5
    overall: number;        // 1–5
    feedback?: string;
    ratedAt: string;
  };
  // Worker rates customer
  workerRating?: {
    paymentReliability: number;  // 1–5
    behavior: number;            // 1–5
    jobAccuracy: number;         // 1–5
    safety: number;              // 1–5
    overall: number;             // 1–5
    feedback?: string;
    ratedAt: string;
  };
}

export interface Rating {
  id: string;
  jobId: string;
  ratedBy: 'worker' | 'employer' | 'customer';
  ratedUserId: string;
  overall: number;
  punctuality?: number;
  behaviour?: number;
  workQuality?: number;
  feedback?: string;
  createdAt: string;
}

// ─── Dispute ────────────────────────────────────────────────────────────────

export type DisputeType =
  | 'payment_not_received'
  | 'work_quality'
  | 'worker_no_show'
  | 'safety_concern'
  | 'harassment'
  | 'fraud'
  | 'other';

export type DisputeStatus =
  | 'filed'
  | 'under_review'
  | 'evidence_requested'
  | 'resolution_proposed'
  | 'resolved'
  | 'escalated';

export interface Dispute {
  id: string;
  serviceRequestId?: string;
  jobApplicationId?: string;
  raisedBy: 'worker' | 'customer' | 'employer';
  raisedByUserId: string;
  againstUserId: string;
  type: DisputeType;
  description: string;
  evidence?: string[];      // Photo URLs or document URLs
  status: DisputeStatus;
  resolution?: string;
  cooperativeAdminNote?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
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
  sortBy?: 'recommended' | 'nearest' | 'highest_paying' | 'latest' | 'best_rated' | 'fairwork';
}

export interface ServiceRequestFilters {
  category?: SkillCategory;
  urgency?: UrgencyLevel;
  maxDistanceKm?: number;
  date?: string;
  verified?: boolean;
}

// ─── Real-Time Opportunity Network Models ───────────────────────────────────

export type WorkerAvailabilityMode = 'NOW' | 'SCHEDULED' | 'OFF';

export interface WorkerScheduledWindow {
  date: string; // ISO date or "today"
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "06:00 PM"
}

export interface WorkerAvailabilityModel {
  mode: WorkerAvailabilityMode;
  scheduledWindow?: WorkerScheduledWindow;
  preferredRadiusKm: number;
  preferredTrades: string[];
  updatedAt: string;
}

export interface WorkerReliabilityMetrics {
  completionRate: number; // e.g. 98 (%)
  punctualityRate: number; // e.g. 99 (%)
  cancellationRate: number; // e.g. 1.2 (%)
  repeatHireRate: number; // e.g. 42 (%)
  verifiedStatus: VerificationStatus;
  totalCompletedGigs: number;
  averageRating: number;
  disputeCount: number;
}

export interface EmployerReliabilityMetrics {
  onTimePaymentRate: number; // e.g. 98 (%)
  cancellationRate: number; // e.g. 1.5 (%)
  averageRating: number;
  totalCompletedGigs: number;
  repeatWorkerRate: number; // e.g. 54 (%)
  disputeFreeRecord: boolean;
  verifiedStatus: VerificationStatus;
}

export interface WorkforceGap {
  jobId: string;
  workersRequired: number;
  workersHired: number;
  workersRemaining: number;
  applicantsCount: number;
  availableWorkerPool: number;
  fillPercentage: number;
  status: 'OPEN' | 'URGENT' | 'FINAL_SPOT' | 'FILLED';
}

export type DemandIntensity = 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW';

export interface GigPulseTradeDemand {
  trade: string;
  category: string;
  intensity: DemandIntensity;
  openPositions: number;
  area: string; // e.g. "Sector 62, Noida"
  timeWindow: string; // e.g. "Today · Morning"
  averageWage: number;
  hiringVelocity: 'FAST' | 'STEADY';
}

export interface DemandPredictionSignal {
  id: string;
  trade: string;
  area: string;
  projectedDemand: DemandIntensity;
  openPositionsEstimate: number;
  timeframe: string; // e.g. "Tomorrow 8:00 AM"
  actionableText: string;
  suggestedAction: 'SET_AVAILABLE' | 'VIEW_GIGS';
}

export interface FairPayEstimate {
  category: string;
  locationCity: string;
  recommendedMinWage: number;
  recommendedMaxWage: number;
  typicalWage: number;
  areaBenchmark: number;
  demandMultiplier: number;
  currency: 'INR';
  guidanceText: string;
}

export interface CryptographicProof {
  hash: string; // SHA-256 hex digest
  algorithm: 'SHA-256';
  anchoredAt: string; // ISO timestamp
  issuerPublicKeyOrDid: string;
  verificationUrl: string;
  isImmutable: boolean;
}

export interface CredentialRecord {
  id: string;
  workerId: string;
  workerName: string;
  title: string;
  trade: string;
  issuer: string;
  issuedAt: string;
  proof: CryptographicProof;
  status: 'VERIFIED' | 'REVOKED';
}

