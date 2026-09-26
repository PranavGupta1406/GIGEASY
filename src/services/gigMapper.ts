// GigEasy Gig Mapper — Converts API gig rows → local Job type
// Keeps all downstream screens (recommendation engine, cards, map markers) compatible

import { Job, EmployerProfile, Skill, Location } from '../types';

/**
 * Map a raw gig row from the backend API to the frontend Job type.
 * Fields missing from the API are given safe defaults.
 */
export function apiGigToJob(g: any): Job {
  const location: Location = {
    lat: Number(g.latitude) || 28.6139,
    lng: Number(g.longitude) || 77.2090,
    address: g.address || '',
    city: g.city || '',
    state: g.state || '',
  };

  const skill: Skill = {
    id: g.skill_id || g.skill_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
    name: g.skill_name || g.skill_category || 'General',
    category: g.skill_category || 'General',
    icon: categoryToIcon(g.skill_category),
  };

  const employer: EmployerProfile = {
    id: g.employer_id || g.employer_name || 'unknown',
    userId: g.employer_id || '',
    businessName: g.employer_name || 'Employer',
    businessType: 'Employer',
    location,
    contactName: g.employer_name || 'Employer',
    verificationStatus: g.employer_verified === 'VERIFIED' ? 'verified' : 'unverified',
    rating: Number(g.employer_rating) || 4.5,
    totalJobsPosted: 0,
    hiringHistory: [],
    createdAt: g.created_at || new Date().toISOString(),
    updatedAt: g.updated_at || new Date().toISOString(),
  };

  // Derive a compatible status
  const rawStatus: string = g.status || 'PUBLISHED';
  const statusMap: Record<string, Job['status']> = {
    PUBLISHED: 'HIRING',
    APPLICATIONS_OPEN: 'HIRING',
    MATCHING: 'HIRING',
    IN_PROGRESS: 'ACTIVE',
    READY_TO_START: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'CLOSED',
    CLOSED: 'CLOSED',
    FULL: 'FULL',
  };
  const status: Job['status'] = statusMap[rawStatus] ?? 'HIRING';

  return {
    id: g.gig_id || g.id || String(Math.random()),
    employerId: g.employer_id || '',
    employer,
    title: g.title || 'Untitled Gig',
    description: g.description || '',
    skillRequired: skill,
    location,
    startDate: g.start_date || new Date().toISOString().split('T')[0],
    startTime: g.start_time || '09:00',
    endTime: g.end_time || '18:00',
    workersRequired: Number(g.workers_required) || 1,
    workersHired: Number(g.workers_confirmed) || 0,
    minWage: Number(g.min_wage) || 500,
    maxWage: Number(g.max_wage) || 1000,
    requirements: Array.isArray(g.requirements) ? g.requirements : [],
    status,
    distanceKm: g.distanceKm || undefined,
    createdAt: g.created_at || new Date().toISOString(),
    updatedAt: g.updated_at || new Date().toISOString(),
  };
}

function categoryToIcon(category?: string): string {
  const map: Record<string, string> = {
    Construction: 'grid',
    Electrical: 'zap',
    Plumbing: 'droplet',
    Carpentry: 'scissors',
    Painting: 'edit-3',
    Warehouse: 'package',
    Driving: 'navigation',
    Cleaning: 'wind',
    Security: 'shield',
    Hospitality: 'coffee',
    Events: 'calendar',
    Factory: 'cpu',
    Delivery: 'truck',
    Retail: 'shopping-bag',
    Logistics: 'package',
  };
  return map[category || ''] || 'briefcase';
}
