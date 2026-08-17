// GigEasy Mock Data Layer — Zero Emojis, Clean Vector Icon Identifiers

import {
  WorkerProfile,
  EmployerProfile,
  Job,
  JobApplication,
  Skill,
} from '../types';

// ─── Skills (Vector Icon Names) ─────────────────────────────────────────────

export const MOCK_SKILLS: Skill[] = [
  { id: 's1', name: 'Warehouse Helper', category: 'Warehouse', icon: 'package' },
  { id: 's2', name: 'Electrician', category: 'Electrical', icon: 'zap' },
  { id: 's3', name: 'Plumber', category: 'Plumbing', icon: 'tool' },
  { id: 's4', name: 'Carpenter', category: 'Carpentry', icon: 'scissors' },
  { id: 's5', name: 'Painter', category: 'Painting', icon: 'edit-3' },
  { id: 's6', name: 'Construction Worker', category: 'Construction', icon: 'tool' },
  { id: 's7', name: 'Driver', category: 'Driving', icon: 'truck' },
  { id: 's8', name: 'Cleaner', category: 'Cleaning', icon: 'check-circle' },
  { id: 's9', name: 'Security Guard', category: 'Security', icon: 'shield' },
  { id: 's10', name: 'Delivery Person', category: 'Delivery', icon: 'navigation' },
  { id: 's11', name: 'Event Crew', category: 'Events', icon: 'calendar' },
  { id: 's12', name: 'Factory Worker', category: 'Factory', icon: 'cpu' },
  { id: 's13', name: 'General Helper', category: 'Helper', icon: 'user' },
  { id: 's14', name: 'Hospitality Staff', category: 'Hospitality', icon: 'coffee' },
  { id: 's15', name: 'Mason', category: 'Construction', icon: 'grid' },
];

// ─── Employers ───────────────────────────────────────────────────────────────

export const MOCK_EMPLOYERS: EmployerProfile[] = [
  {
    id: 'e1',
    userId: 'u_e1',
    businessName: 'Bharat Logistics Pvt Ltd',
    businessType: 'Logistics & Warehousing',
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Sector 62, NSEZ',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    contactName: 'Amit Sharma',
    description: 'Premier regional logistics company operating modern fulfilment warehouses across NCR.',
    verificationStatus: 'verified',
    rating: 4.8,
    totalJobsPosted: 48,
    hiringHistory: [],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e2',
    userId: 'u_e2',
    businessName: 'Shree Constructions',
    businessType: 'Construction & Contracting',
    location: {
      lat: 28.5355,
      lng: 77.391,
      address: 'Sector 18, Vasundhara',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
    },
    contactName: 'Rajesh Verma',
    verificationStatus: 'verified',
    rating: 4.6,
    totalJobsPosted: 22,
    hiringHistory: [],
    createdAt: '2025-03-20T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e3',
    userId: 'u_e3',
    businessName: 'Grand Palace Banquets',
    businessType: 'Events & Hospitality',
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
    },
    contactName: 'Sunita Kapoor',
    verificationStatus: 'verified',
    rating: 4.9,
    totalJobsPosted: 35,
    hiringHistory: [],
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e4',
    userId: 'u_e4',
    businessName: 'TechnoFab Industries',
    businessType: 'Manufacturing',
    location: {
      lat: 28.4089,
      lng: 77.3178,
      address: 'IMT Manesar',
      city: 'Gurugram',
      state: 'Haryana',
    },
    contactName: 'Vivek Malhotra',
    verificationStatus: 'verified',
    rating: 4.4,
    totalJobsPosted: 17,
    hiringHistory: [],
    createdAt: '2025-05-08T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
];

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    employerId: 'e1',
    employer: MOCK_EMPLOYERS[0],
    title: 'Warehouse Loading Helper',
    description:
      'Need experienced loading and package handlers for morning logistics shift. Work involves handling parcel inventory and staging for dispatch. Steel toe shoes recommended.',
    skillRequired: MOCK_SKILLS[0],
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Sector 62, NSEZ',
      city: 'Noida',
      state: 'Uttar Pradesh',
    },
    startDate: '2026-08-15',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    workersRequired: 15,
    workersHired: 8,
    minWage: 850,
    maxWage: 1000,
    requirements: ['Physical stamina', 'Punctual arrival', 'Package handling experience'],
    status: 'HIRING',
    distanceKm: 2.4,
    createdAt: '2026-08-13T06:00:00Z',
    updatedAt: '2026-08-13T06:00:00Z',
  },
  {
    id: 'j2',
    employerId: 'e2',
    employer: MOCK_EMPLOYERS[1],
    title: 'Construction Site Helper',
    description:
      'Site helpers required for residential framing project. Tasks include material movement, staging, and supporting masons.',
    skillRequired: MOCK_SKILLS[5],
    location: {
      lat: 28.5355,
      lng: 77.391,
      address: 'Sector 18, Vasundhara',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
    },
    startDate: '2026-08-14',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    workersRequired: 5,
    workersHired: 4,
    minWage: 750,
    maxWage: 850,
    requirements: ['Hard hat compliance', 'Prior site work preferred'],
    status: 'HIRING',
    distanceKm: 1.8,
    createdAt: '2026-08-12T08:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'j3',
    employerId: 'e3',
    employer: MOCK_EMPLOYERS[2],
    title: 'Event Setup Crew',
    description:
      'Corporate banquet setup crew needed for lighting, stage arrangement, and banquet service. Smart presentation mandatory.',
    skillRequired: MOCK_SKILLS[10],
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
    },
    startDate: '2026-08-16',
    startTime: '10:00 AM',
    endTime: '08:00 PM',
    workersRequired: 20,
    workersHired: 12,
    minWage: 1000,
    maxWage: 1200,
    requirements: ['Presentable attire', 'Team coordination', 'Hindi/English'],
    status: 'HIRING',
    distanceKm: 4.2,
    createdAt: '2026-08-11T10:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'j4',
    employerId: 'e1',
    employer: MOCK_EMPLOYERS[0],
    title: 'Industrial Electrician',
    description:
      'Certified electrician needed for warehouse distribution board wiring and 3-phase connection testing.',
    skillRequired: MOCK_SKILLS[1],
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Sector 63, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
    },
    startDate: '2026-08-15',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    workersRequired: 3,
    workersHired: 1,
    minWage: 1300,
    maxWage: 1500,
    requirements: ['3+ years industrial wiring', 'Own multimeter & basic tools'],
    status: 'HIRING',
    distanceKm: 3.1,
    createdAt: '2026-08-13T07:00:00Z',
    updatedAt: '2026-08-13T07:00:00Z',
  },
];

// ─── Workers ─────────────────────────────────────────────────────────────────

export const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: 'w1',
    userId: 'u_w1',
    name: 'Ravi Kumar',
    phoneNumber: '+91 98765 43210',
    location: {
      lat: 28.62,
      lng: 77.22,
      address: 'Sector 15',
      city: 'Noida',
      state: 'Uttar Pradesh',
    },
    skills: [MOCK_SKILLS[1], MOCK_SKILLS[5]],
    experienceYears: 6,
    expectedDailyWage: 1100,
    availabilityStatus: 'available',
    preferredRadius: 15,
    languages: ['Hindi', 'English'],
    bio: 'Experienced industrial electrician and site technician. Safety certified with 40+ completed gigs.',
    trustScore: 94,
    trustLabel: 'Excellent',
    verificationStatus: 'verified',
    rating: 4.9,
    completedJobs: 47,
    workHistory: [
      {
        id: 'wh1',
        jobTitle: 'Warehouse Electrician',
        employerName: 'Bharat Logistics',
        wage: 1200,
        date: '2026-08-12',
        rating: 5,
        status: 'completed',
      },
      {
        id: 'wh2',
        jobTitle: 'Factory Wiring Setup',
        employerName: 'TechnoFab Industries',
        wage: 1000,
        date: '2026-08-08',
        rating: 5,
        status: 'completed',
      },
    ],
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'w2',
    userId: 'u_w2',
    name: 'Sunita Devi',
    phoneNumber: '+91 87654 32109',
    location: {
      lat: 28.58,
      lng: 77.31,
      address: 'Vasundhara',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
    },
    skills: [MOCK_SKILLS[7], MOCK_SKILLS[10]],
    experienceYears: 4,
    expectedDailyWage: 850,
    availabilityStatus: 'available',
    preferredRadius: 10,
    languages: ['Hindi'],
    trustScore: 88,
    trustLabel: 'Good',
    verificationStatus: 'verified',
    rating: 4.7,
    completedJobs: 29,
    workHistory: [],
    createdAt: '2025-06-20T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'w3',
    userId: 'u_w3',
    name: 'Mohd. Salim',
    phoneNumber: '+91 76543 21098',
    location: {
      lat: 28.59,
      lng: 77.26,
      address: 'Jamia Nagar',
      city: 'New Delhi',
      state: 'Delhi',
    },
    skills: [MOCK_SKILLS[2], MOCK_SKILLS[3]],
    experienceYears: 8,
    expectedDailyWage: 950,
    availabilityStatus: 'available',
    preferredRadius: 20,
    languages: ['Hindi', 'English'],
    trustScore: 82,
    trustLabel: 'Good',
    verificationStatus: 'verified',
    rating: 4.5,
    completedJobs: 62,
    workHistory: [],
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
];

export const CURRENT_WORKER: WorkerProfile = MOCK_WORKERS[0];
export const CURRENT_EMPLOYER: EmployerProfile = MOCK_EMPLOYERS[0];

// ─── Applications ────────────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: 'a1',
    jobId: 'j1',
    job: MOCK_JOBS[0],
    workerId: 'w2',
    worker: MOCK_WORKERS[1],
    proposedWage: 900,
    status: 'APPLIED',
    negotiations: [],
    appliedAt: '2026-08-13T10:00:00Z',
    updatedAt: '2026-08-13T10:00:00Z',
  },
  {
    id: 'a2',
    jobId: 'j1',
    job: MOCK_JOBS[0],
    workerId: 'w3',
    worker: MOCK_WORKERS[2],
    proposedWage: 1000,
    status: 'NEGOTIATING',
    negotiations: [],
    appliedAt: '2026-08-13T07:30:00Z',
    updatedAt: '2026-08-13T09:00:00Z',
  },
];

export const WORKER_APPLICATIONS: JobApplication[] = [
  {
    id: 'wa1',
    jobId: 'j1',
    job: MOCK_JOBS[0],
    workerId: 'w1',
    worker: MOCK_WORKERS[0],
    proposedWage: 950,
    status: 'UNDER_REVIEW',
    negotiations: [],
    appliedAt: '2026-08-13T10:30:00Z',
    updatedAt: '2026-08-13T10:30:00Z',
  },
  {
    id: 'wa2',
    jobId: 'j4',
    job: MOCK_JOBS[3],
    workerId: 'w1',
    worker: MOCK_WORKERS[0],
    proposedWage: 1400,
    status: 'ACCEPTED',
    negotiations: [],
    appliedAt: '2026-08-13T06:30:00Z',
    updatedAt: '2026-08-13T11:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatWage(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    APPLIED: '#2563EB',
    UNDER_REVIEW: '#D97706',
    NEGOTIATING: '#7C3AED',
    ACCEPTED: '#16A34A',
    CONFIRMED: '#16A34A',
    COMPLETED: '#059669',
    REJECTED: '#DC2626',
    WITHDRAWN: '#64748B',
    EXPIRED: '#64748B',
    HIRING: '#FA4616',
    FULL: '#16A34A',
    ACTIVE: '#7C3AED',
    PUBLISHED: '#2563EB',
    CANCELLED: '#DC2626',
  };
  return map[status] ?? '#64748B';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    APPLIED: 'Applied',
    UNDER_REVIEW: 'In Review',
    NEGOTIATING: 'Counter-Offer',
    ACCEPTED: 'Hired',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    REJECTED: 'Declined',
    WITHDRAWN: 'Withdrawn',
    EXPIRED: 'Expired',
    HIRING: 'Hiring',
    FULL: 'Staffed',
    ACTIVE: 'Active Shift',
    PUBLISHED: 'Open',
    CANCELLED: 'Cancelled',
  };
  return map[status] ?? status;
}

export function getTrustColor(score: number): string {
  if (score >= 85) return '#16A34A';
  if (score >= 70) return '#65A30D';
  if (score >= 50) return '#D97706';
  return '#DC2626';
}
