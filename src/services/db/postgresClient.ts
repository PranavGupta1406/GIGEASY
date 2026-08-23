// PostgreSQL Database Client & Sync Service for GigEasy
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole, WorkerProfile, EmployerProfile, Job, JobApplication } from '../../types';
import { realtimeSocket } from '../realtime/socketService';

export const POSTGRES_CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
  apiUrl: process.env.EXPO_PUBLIC_POSTGRES_API_URL || 'http://localhost:5000/api',
  wsUrl: process.env.EXPO_PUBLIC_POSTGRES_WS_URL || 'ws://localhost:5000/realtime',
};

export const hasValidSupabase =
  POSTGRES_CONFIG.supabaseUrl &&
  !POSTGRES_CONFIG.supabaseUrl.includes('placeholder') &&
  POSTGRES_CONFIG.supabaseAnonKey &&
  !POSTGRES_CONFIG.supabaseAnonKey.includes('placeholder');

export const supabase: SupabaseClient | null = hasValidSupabase
  ? createClient(POSTGRES_CONFIG.supabaseUrl, POSTGRES_CONFIG.supabaseAnonKey)
  : null;

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${POSTGRES_CONFIG.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface SyncUserData {
  id: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  name?: string;
  kycStatus?: string;
}

export async function syncUserToPostgres(user: SyncUserData): Promise<boolean> {
  const payload = {
    id: user.id,
    email: user.email || '',
    phone_number: user.phoneNumber || '',
    role: user.role.toUpperCase(),
    name: user.name || '',
    verification_status: (user.kycStatus || 'unverified').toUpperCase(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (!error) return true;
    } catch {}
  }

  const result = await apiRequest<{ success: boolean }>('/users/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result?.success ?? true;
}

export async function syncWorkerProfileToPostgres(profile: WorkerProfile): Promise<boolean> {
  const payload = {
    id: profile.id,
    user_id: profile.userId,
    name: profile.name,
    city: profile.location?.city || 'Noida',
    state: profile.location?.state || 'Uttar Pradesh',
    address_text: profile.location?.address || '',
    experience_years: profile.experienceYears,
    expected_daily_wage: profile.expectedDailyWage,
    preferred_radius_km: profile.preferredRadius,
    availability_status: (profile.availabilityStatus || 'available').toUpperCase(),
    languages: profile.languages,
    bio: profile.bio || '',
    trust_score: profile.trustScore,
    verification_status: (profile.verificationStatus || 'unverified').toUpperCase(),
    rating: profile.rating,
    completed_jobs_count: profile.completedJobs,
    skills: profile.skills,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('worker_profiles').upsert(payload, { onConflict: 'id' });
      if (!error) return true;
    } catch {}
  }

  const result = await apiRequest<{ success: boolean }>('/workers/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result?.success ?? true;
}

export async function syncEmployerProfileToPostgres(profile: EmployerProfile): Promise<boolean> {
  const payload = {
    id: profile.id,
    user_id: profile.userId,
    business_name: profile.businessName,
    business_type: profile.businessType,
    contact_name: profile.contactName,
    contact_phone: profile.contactPhone || '',
    contact_email: profile.contactEmail || '',
    city: profile.location?.city || 'Noida',
    state: profile.location?.state || 'Uttar Pradesh',
    address_text: profile.location?.address || '',
    verification_status: (profile.verificationStatus || 'unverified').toUpperCase(),
    rating: profile.rating,
    total_jobs_posted: profile.totalJobsPosted,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('employer_profiles').upsert(payload, { onConflict: 'id' });
      if (!error) return true;
    } catch {}
  }

  const result = await apiRequest<{ success: boolean }>('/employers/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result?.success ?? true;
}

export async function syncJobToPostgres(job: Job): Promise<boolean> {
  const payload = {
    id: job.id,
    employer_id: job.employerId,
    title: job.title,
    description: job.description,
    skill_category: job.skillRequired.category,
    skill_name: job.skillRequired.name,
    city: job.location?.city || 'Noida',
    state: job.location?.state || 'Uttar Pradesh',
    address_text: job.location?.address || '',
    start_date: job.startDate,
    start_time: job.startTime,
    end_time: job.endTime,
    workers_required: job.workersRequired,
    workers_hired: job.workersHired,
    min_wage: job.minWage,
    max_wage: job.maxWage,
    status: job.status,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };

  realtimeSocket.emit('JOB_DISPATCHED', job);

  if (supabase) {
    try {
      const { error } = await supabase.from('jobs').upsert(payload, { onConflict: 'id' });
      if (!error) return true;
    } catch {}
  }

  const result = await apiRequest<{ success: boolean }>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result?.success ?? true;
}

export async function fetchJobsFromPostgres(): Promise<Job[] | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as any;
    } catch {}
  }

  return apiRequest<Job[]>('/jobs');
}

export async function syncApplicationToPostgres(app: JobApplication): Promise<boolean> {
  const payload = {
    id: app.id,
    job_id: app.jobId,
    worker_id: app.workerId,
    proposed_wage: app.proposedWage,
    status: app.status,
    note: app.note || '',
    negotiations: app.negotiations,
    applied_at: app.appliedAt,
    updated_at: app.updatedAt,
  };

  realtimeSocket.emit('APPLICATION_RECEIVED', app);

  if (supabase) {
    try {
      const { error } = await supabase.from('job_applications').upsert(payload, { onConflict: 'id' });
      if (!error) return true;
    } catch {}
  }

  const result = await apiRequest<{ success: boolean }>('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result?.success ?? true;
}
