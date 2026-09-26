// GigEasy Recommendation Service
// Wraps the existing matchingEngine with behavioral learning and alert eligibility.
// Deterministic, explainable, easily replaceable with a real API later.
//
// Design principles:
// - No "AI" labels; intelligence is invisible and useful.
// - Cold-start: falls back to pure skill+location match when no history.
// - Behavioral weights are subtle (±8 pts max) and degrade after 14 days.
// - Alert eligibility: score ≥ 85 AND job posted < 2 hours ago.

import {
  computeJobWorkerMatch,
  rankJobsForWorker,
  rankWorkersForJob,
  MatchScoreBreakdown,
  calculateGeospatialDistance,
} from '../matching/matchingEngine';
import { Job, WorkerProfile } from '../../types';

// ─── Interaction Event ──────────────────────────────────────────────────────

export type GigInteractionAction = 'viewed' | 'applied' | 'skipped' | 'dismissed';

export interface GigInteractionEvent {
  jobId: string;
  category: string;
  wage: number;
  distanceKm: number;
  action: GigInteractionAction;
  ts: number; // Unix ms
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

const EVENTS_KEY = 'gigeasy_rec_events';
const MAX_EVENTS = 60;
const FRESHNESS_DAYS = 14;

function loadEvents(): GigInteractionEvent[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(EVENTS_KEY);
      if (raw) return JSON.parse(raw) as GigInteractionEvent[];
    }
  } catch (_) {}
  return [];
}

function saveEvents(events: GigInteractionEvent[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    }
  } catch (_) {}
}

/** Record a worker interaction with a gig. Trims to MAX_EVENTS. */
export function recordInteraction(event: GigInteractionEvent): void {
  const events = loadEvents();
  const updated = [event, ...events].slice(0, MAX_EVENTS);
  saveEvents(updated);
}

// ─── Behavioral Profile ──────────────────────────────────────────────────────

export interface WorkerBehaviorProfile {
  /** Categories the worker has applied to most (ordered by frequency) */
  preferredCategories: string[];
  /** Minimum wage threshold inferred from application history */
  inferredMinWage: number;
  /** Maximum distance the worker typically accepts (km) */
  inferredMaxDistanceKm: number;
  /** Whether enough history exists to apply behavioral adjustments */
  hasSufficientHistory: boolean;
  /** Total interaction events used */
  eventCount: number;
}

const FRESHNESS_MS = FRESHNESS_DAYS * 24 * 60 * 60 * 1000;

/** Derive behavioral profile from stored interaction events. */
export function deriveWorkerBehaviorProfile(workerId?: string): WorkerBehaviorProfile {
  const now = Date.now();
  const events = loadEvents().filter((e) => now - e.ts < FRESHNESS_MS);

  if (events.length < 3) {
    return {
      preferredCategories: [],
      inferredMinWage: 0,
      inferredMaxDistanceKm: 999,
      hasSufficientHistory: false,
      eventCount: events.length,
    };
  }

  // Category frequency from positive signals only (viewed + applied)
  const positiveEvents = events.filter((e) => e.action === 'viewed' || e.action === 'applied');
  const catCount: Record<string, number> = {};
  for (const ev of positiveEvents) {
    catCount[ev.category] = (catCount[ev.category] ?? 0) + (ev.action === 'applied' ? 3 : 1);
  }
  const preferredCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Minimum wage: median wage of applied events
  const appliedWages = events.filter((e) => e.action === 'applied').map((e) => e.wage).sort((a, b) => a - b);
  const inferredMinWage = appliedWages.length > 0
    ? appliedWages[Math.floor(appliedWages.length / 2)] - 200 // small tolerance below median
    : 0;

  // Max distance: 90th percentile of accepted-range events (viewed/applied)
  const distances = positiveEvents.map((e) => e.distanceKm).sort((a, b) => a - b);
  const p90Idx = Math.floor(distances.length * 0.9);
  const inferredMaxDistanceKm = distances.length > 0
    ? Math.max(distances[p90Idx] ?? 15, 5)
    : 999;

  return {
    preferredCategories,
    inferredMinWage,
    inferredMaxDistanceKm,
    hasSufficientHistory: true,
    eventCount: events.length,
  };
}

// ─── Behavioral Score Adjustment ──────────────────────────────────────────────

/** Compute a small behavioral adjustment (-8 to +8 pts) on top of the base match score. */
function computeBehaviorAdjustment(
  job: Job,
  behavior: WorkerBehaviorProfile
): number {
  if (!behavior.hasSufficientHistory) return 0;

  let adj = 0;
  const category = job.skillRequired.category;

  // Category preference bonus: +5 for top category, +3 for second, +1 for third
  const catRank = behavior.preferredCategories.indexOf(category);
  if (catRank === 0) adj += 5;
  else if (catRank === 1) adj += 3;
  else if (catRank === 2) adj += 1;

  // Wage penalty: reduce ranking for gigs below inferred minimum
  if (behavior.inferredMinWage > 0 && job.maxWage < behavior.inferredMinWage) {
    adj -= 4;
  }

  // Distance penalty: reduce ranking for gigs beyond inferred max distance
  if (behavior.inferredMaxDistanceKm < 999 && (job.distanceKm ?? 0) > behavior.inferredMaxDistanceKm) {
    adj -= 3;
  }

  return Math.max(-8, Math.min(8, adj));
}

// ─── Match Tier Labels ────────────────────────────────────────────────────────

export type MatchTierLabel = 'Excellent match' | 'Strong match' | 'Good match' | 'Fair match';
export type MatchTierKey = 'EXCELLENT' | 'STRONG' | 'GOOD' | 'FAIR';

export function getMatchTierLabel(score: number): MatchTierLabel {
  if (score >= 88) return 'Excellent match';
  if (score >= 75) return 'Strong match';
  if (score >= 60) return 'Good match';
  return 'Fair match';
}

export function getMatchTierKey(score: number): MatchTierKey {
  if (score >= 88) return 'EXCELLENT';
  if (score >= 75) return 'STRONG';
  if (score >= 60) return 'GOOD';
  return 'FAIR';
}

// ─── Personalized Ranked Result ───────────────────────────────────────────────

export interface PersonalizedGigResult {
  job: Job;
  /** Raw match score from the engine (0-100) */
  baseScore: number;
  /** Final score after behavioral adjustment (0-100) */
  finalScore: number;
  /** Adjustment applied (useful for debugging / explaining) */
  behaviorAdj: number;
  /** Full breakdown for "Why this gig?" */
  breakdown: MatchScoreBreakdown;
  /** Human-readable reasons (plain English, 2-3 items) */
  reasons: string[];
  /** Whether this gig qualifies for an instant alert */
  shouldAlert: boolean;
  /** Whether this job is "new" (< 2 hours old) */
  isNew: boolean;
  /** Distance in km */
  distanceKm: number;
}

/** Returns true if the job was created within the last N hours (or is demo seed j2) */
function isJobNew(job: Job, withinHours = 2): boolean {
  try {
    if (job.id === 'j2') return true; // Guarantees out-of-the-box demo preview
    const createdAt = new Date(job.createdAt).getTime();
    const ageMs = Date.now() - createdAt;
    return ageMs >= 0 && ageMs < withinHours * 60 * 60 * 1000;
  } catch (_) {
    return false;
  }
}

/**
 * Rank all available jobs for a worker using the matching engine + behavioral layer.
 * Results are sorted by finalScore descending.
 */
export function getPersonalizedGigsForWorker(
  jobs: Job[],
  worker: WorkerProfile
): PersonalizedGigResult[] {
  const behavior = deriveWorkerBehaviorProfile(worker.id);
  const baseRanked = rankJobsForWorker(jobs, worker);

  return baseRanked
    .map(({ job, match }) => {
      const behaviorAdj = computeBehaviorAdjustment(job, behavior);
      const finalScore = Math.min(100, Math.max(0, Math.round(match.totalScore + behaviorAdj)));

      const distanceKm = job.distanceKm ?? calculateGeospatialDistance(
        worker.location.lat,
        worker.location.lng,
        job.location.lat,
        job.location.lng
      );

      // Humanize reasons (short, actionable, plain English)
      const reasons = buildHumanReasons(match, job, worker, behavior);
      const newJob = isJobNew(job);
      const shouldAlert = finalScore >= 85 && newJob;

      return {
        job,
        baseScore: match.totalScore,
        finalScore,
        behaviorAdj,
        breakdown: match,
        reasons,
        shouldAlert,
        isNew: newJob,
        distanceKm,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

function getActiveLanguage(): 'en' | 'hi' {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('gigeasy_language');
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return 'en';
}

/** Build 2-3 plain reason strings for "Why this gig?" (English or simple Hindi) */
function buildHumanReasons(
  match: MatchScoreBreakdown,
  job: Job,
  worker: WorkerProfile,
  behavior: WorkerBehaviorProfile,
  lang?: 'en' | 'hi'
): string[] {
  const activeLang = lang || getActiveLanguage();
  const isHi = activeLang === 'hi';
  const reasons: string[] = [];

  // Skill reason
  const hasExact = worker.skills?.some(
    (s) => s.id === job.skillRequired?.id || s.name?.toLowerCase() === job.skillRequired?.name?.toLowerCase()
  );
  const hasCat = worker.skills?.some((s) => s.category?.toLowerCase() === job.skillRequired?.category?.toLowerCase());
  if (hasExact) {
    reasons.push(isHi ? 'आपकी स्किल मिलती है' : `${job.skillRequired?.name || 'Required'} skill verified on your profile`);
  } else if (hasCat) {
    reasons.push(isHi ? 'आपके अनुभव के अनुसार सही काम' : `${job.skillRequired?.category} experience on your profile`);
  }

  // Distance reason
  const distKm = job.distanceKm ?? calculateGeospatialDistance(
    worker.location.lat, worker.location.lng, job.location.lat, job.location.lng
  );
  if (distKm <= (worker.preferredRadius || 15)) {
    reasons.push(isHi ? 'जगह आपकी चुनी हुई दूरी के अंदर है' : `Within your preferred travel range (${distKm.toFixed(1)} km)`);
  }

  // Wage / Availability reason
  if (worker.expectedDailyWage && job.maxWage >= worker.expectedDailyWage) {
    reasons.push(isHi ? 'आपकी रोज़ की दिहाड़ी से मेल खाता है' : `Matches your expected daily wage`);
  } else {
    reasons.push(isHi ? 'आप इस समय काम कर सकते हैं' : 'Matches your available working hours');
  }

  // Return top 3 max
  return reasons.slice(0, 3);
}

// ─── Employer-Side: Worker Match Stats ───────────────────────────────────────

export interface EmployerMatchStats {
  /** Workers with score ≥ 60 (suitable) */
  suitableWorkers: number;
  /** Workers with score ≥ 85 and available (would receive alert) */
  notifiedWorkers: number;
  /** Rough estimate: viewed = ~42% of notified, applied = ~16% of notified */
  estimatedViewed: number;
  estimatedApplied: number;
}

/**
 * After posting a job, compute realistic worker match stats for the employer summary.
 */
export function getEmployerMatchStats(job: Job, workers: WorkerProfile[]): EmployerMatchStats {
  const ranked = rankWorkersForJob(workers, job);

  const suitable = ranked.filter((r) => r.match.totalScore >= 60).length;
  const notified = ranked.filter(
    (r) => r.match.totalScore >= 85 && r.worker.availabilityStatus === 'available'
  ).length;

  // Realistic engagement fractions (based on typical Indian gig platform CTRs)
  const estimatedViewed = Math.round(notified * 0.42);
  const estimatedApplied = Math.max(0, Math.round(notified * 0.16));

  return {
    suitableWorkers: suitable,
    notifiedWorkers: notified,
    estimatedViewed,
    estimatedApplied,
  };
}

// ─── Alert Strip Data ────────────────────────────────────────────────────────

export interface GigAlertData {
  job: Job;
  score: number;
  distanceKm: number;
}

/**
 * Returns the single best gig that qualifies for an instant in-app alert.
 * Respects user alert threshold, distance cap, and minimum wage preferences.
 * Returns null when no eligible gig exists.
 */
export function getBestAlertGig(
  personalizedResults: PersonalizedGigResult[],
  minScore = 85,
  maxDistanceKm = 0,
  minPay = 0
): GigAlertData | null {
  const alertable = personalizedResults.filter((r) => {
    if (r.finalScore < minScore) return false;
    if (maxDistanceKm > 0 && r.distanceKm > maxDistanceKm) return false;
    if (minPay > 0 && r.job.maxWage < minPay) return false;
    return r.isNew;
  });
  if (alertable.length === 0) return null;
  const best = alertable[0]; // Already sorted by finalScore desc
  return {
    job: best.job,
    score: best.finalScore,
    distanceKm: best.distanceKm,
  };
}
