// GigEasy Utility Functions & Helpers — Pure Database-Driven Layer

import { Skill, EmployerProfile, WorkerProfile, Job, JobApplication } from '../types';

export const MOCK_SKILLS: Skill[] = [];
export const MOCK_EMPLOYERS: EmployerProfile[] = [];
export const MOCK_JOBS: Job[] = [];
export const MOCK_WORKERS: WorkerProfile[] = [];
export const CURRENT_WORKER: WorkerProfile = {} as any;
export const CURRENT_EMPLOYER: EmployerProfile = {} as any;
export const MOCK_APPLICATIONS: JobApplication[] = [];
export const WORKER_APPLICATIONS: JobApplication[] = [];

export function formatWage(amount: number): string {
  if (!amount && amount !== 0) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Today';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDistance(km: number): string {
  if (!km) return '0 km away';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: '#D97706',
    APPLIED: '#2563EB',
    UNDER_REVIEW: '#D97706',
    NEGOTIATING: '#7C3AED',
    ACCEPTED: '#16A34A',
    CONFIRMED: '#16A34A',
    COMPLETED: '#059669',
    REJECTED: '#DC2626',
    WITHDRAWN: '#64748B',
    EXPIRED: '#64748B',
    OPEN: '#FA4616',
    HIRING: '#FA4616',
    FULL: '#16A34A',
    ACTIVE: '#7C3AED',
    PUBLISHED: '#2563EB',
    CANCELLED: '#DC2626',
    CLOSED: '#64748B',
  };
  return map[status] ?? '#64748B';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    APPLIED: 'Applied',
    UNDER_REVIEW: 'In Review',
    NEGOTIATING: 'Counter-Offer',
    ACCEPTED: 'Hired',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    REJECTED: 'Declined',
    WITHDRAWN: 'Withdrawn',
    EXPIRED: 'Expired',
    OPEN: 'Hiring',
    HIRING: 'Hiring',
    FULL: 'Staffed',
    ACTIVE: 'Active Shift',
    PUBLISHED: 'Open',
    CANCELLED: 'Cancelled',
    CLOSED: 'Completed',
  };
  return map[status] ?? status;
}

export function getTrustColor(score: number): string {
  if (score >= 85) return '#16A34A';
  if (score >= 70) return '#65A30D';
  if (score >= 50) return '#D97706';
  return '#DC2626';
}
