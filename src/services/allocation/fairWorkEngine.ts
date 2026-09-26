// GigEasy FairWork Allocation Engine
// Optimizes BOTH customer satisfaction AND worker/cooperative welfare.
// Avoids assigning all jobs to the same high-rated/nearby workers.
// Balances: workload, utilization, fair opportunity, earnings, skill, distance, urgency.

import { Job, WorkerProfile, FairWorkScore, UrgencyLevel } from '../../types';

// Haversine geospatial distance calculation in Kilometers
export function calculateGeospatialDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface WorkerUtilizationProfile {
  workerId: string;
  activeJobsCount: number;
  weeklyJobCount: number;
  weeklyEarnings: number;
  lastJobCompletedAt?: string;
  isOnBreak?: boolean;
}

/**
 * FairWork Allocation Engine
 * 
 * Scoring weights (total = 100):
 * - Skill compatibility: 30 pts
 * - Distance: 20 pts
 * - Trust & reliability: 12 pts
 * - Experience: 5 pts
 * - Wage compatibility: 13 pts (for job listings)
 * - FairWork fairness: 10 pts (under-utilized workers get bonus)
 * - Utilization balance: 10 pts (busy workers get penalty)
 * 
 * This ensures fair distribution across the cooperative while maintaining quality.
 */
export function computeFairWorkScore(
  job: { location: { lat: number; lng: number }; skillRequired: { id: string; name: string; category: string }; maxWage?: number; distanceKm?: number },
  worker: WorkerProfile,
  urgency: UrgencyLevel = 'medium'
): FairWorkScore {
  const reasons: string[] = [];

  // ── 1. Skill Compatibility (30 pts max) ───────────────────────────────────
  let skillScore = 0;
  const hasExactSkill = worker.skills.some(
    (s) => s.id === job.skillRequired.id || s.name === job.skillRequired.name
  );
  const hasSameCategory = worker.skills.some(
    (s) => s.category === job.skillRequired.category
  );
  const hasCertification = worker.certifications?.some(
    (c) => c.skillCategory === job.skillRequired.category && c.verified
  );

  if (hasExactSkill && hasCertification) {
    skillScore = 30;
    reasons.push('Exact skill match with verified certification');
  } else if (hasExactSkill) {
    skillScore = 26;
    reasons.push('Exact skill match');
  } else if (hasSameCategory && hasCertification) {
    skillScore = 22;
    reasons.push('Related skill with certification');
  } else if (hasSameCategory) {
    skillScore = 18;
    reasons.push('Related category experience');
  } else {
    skillScore = 8;
  }

  // ── 2. Distance Score (20 pts max) ─────────────────────────────────────────
  const distanceKm =
    job.distanceKm ??
    calculateGeospatialDistance(
      worker.location.lat,
      worker.location.lng,
      job.location.lat,
      job.location.lng
    );

  let distanceScore = 0;
  if (distanceKm <= 2) {
    distanceScore = 20;
    reasons.push('Under 2 km from site');
  } else if (distanceKm <= 5) {
    distanceScore = 16;
    reasons.push('Within 5 km');
  } else if (distanceKm <= worker.preferredRadius) {
    distanceScore = 11;
  } else {
    distanceScore = Math.max(1, 20 - distanceKm * 1.2);
  }

  // Emergency jobs heavily weight distance — closest worker wins
  if (urgency === 'emergency' && distanceKm <= 3) {
    distanceScore = 20;
    reasons.push('Closest available for emergency');
  }

  // ── 3. Trust & Reliability (12 pts max) ────────────────────────────────────
  let trustScore = 0;
  if (worker.verificationStatus === 'verified') trustScore += 4;
  if (worker.aadhaarVerified) trustScore += 2;
  const ratingWeight = Math.min(4, ((worker.rating - 3) / 2) * 4);
  const trustIndexWeight = Math.min(2, (worker.trustScore / 100) * 2);
  trustScore = Math.round(Math.min(12, trustScore + ratingWeight + trustIndexWeight));

  if (worker.trustScore >= 85) reasons.push('Top-rated trusted worker');
  if (worker.aadhaarVerified) reasons.push('Aadhaar verified');

  // ── 4. Experience Score (5 pts max) ────────────────────────────────────────
  const experienceScore = Math.min(5, Math.round(worker.experienceYears * 0.6));
  if (worker.experienceYears >= 5) {
    reasons.push(`${worker.experienceYears}+ years experience`);
  }

  // ── 5. Wage Compatibility (13 pts max) ────────────────────────────────────
  let wageScore = 13; // Default — assume compatible
  if (job.maxWage && job.maxWage >= 1200) {
    reasons.push('Above-market wage');
  }

  // ── 6. FairWork Fairness Score (10 pts max) ────────────────────────────────
  // Under-utilized workers get a bonus to ensure equitable distribution
  const weeklyJobCount = worker.activeJobsCount ?? 0;
  const activeJobs = worker.activeJobsCount ?? 0;

  let fairnessScore = 0;
  let fairnessNote = '';
  let workloadStatus: FairWorkScore['workloadStatus'] = 'normal';

  if (activeJobs === 0 && weeklyJobCount <= 2) {
    fairnessScore = 10;
    workloadStatus = 'under_utilized';
    fairnessNote = 'Under-utilized: Prioritized for fair opportunity';
    reasons.push('Under-utilized — FairWork priority');
  } else if (activeJobs === 0 && weeklyJobCount <= 5) {
    fairnessScore = 7;
    workloadStatus = 'normal';
    fairnessNote = 'Normal workload — fair allocation';
  } else if (activeJobs === 1 && weeklyJobCount <= 8) {
    fairnessScore = 4;
    workloadStatus = 'normal';
    fairnessNote = 'Moderate workload';
  } else if (activeJobs >= 2) {
    fairnessScore = 1;
    workloadStatus = 'near_capacity';
    fairnessNote = 'Near capacity — prefer other workers for fair distribution';
  }

  // ── 7. Utilization Balance (10 pts max) ────────────────────────────────────
  // Penalize over-utilized workers, bonus for under-utilized
  let utilizationBonus = 0;
  if (activeJobs === 0) {
    utilizationBonus = 10;
  } else if (activeJobs === 1) {
    utilizationBonus = 6;
  } else if (activeJobs === 2) {
    utilizationBonus = 2;
  } else {
    utilizationBonus = 0; // Over-utilized
    workloadStatus = 'over_utilized';
    fairnessNote = 'Over-utilized — FairWork deprioritized to balance cooperative workload';
  }

  // ── Total Score ───────────────────────────────────────────────────────────
  const totalScore = Math.min(
    100,
    Math.round(skillScore + distanceScore + wageScore + trustScore + experienceScore + fairnessScore + utilizationBonus)
  );

  let matchTier: FairWorkScore['matchTier'] = 'FAIR';
  if (totalScore >= 88) matchTier = 'EXCELLENT';
  else if (totalScore >= 72) matchTier = 'STRONG';
  else if (totalScore >= 56) matchTier = 'GOOD';

  // FairWork recommended = under-utilized + skill match
  const isRecommendedByFairWork = fairnessScore >= 7 && skillScore >= 18;

  return {
    totalScore,
    skillScore,
    distanceScore,
    wageScore,
    trustScore,
    experienceScore,
    fairnessScore,
    utilizationBonus,
    matchTier,
    reasons,
    fairnessNote,
    workloadStatus,
    weeklyJobCount,
    isRecommendedByFairWork,
  };
}

/**
 * Rank workers for a service request using FairWork allocation.
 * For emergency requests, proximity is heavily weighted over fairness.
 */
export function rankWorkersWithFairWork(
  workers: WorkerProfile[],
  job: { location: { lat: number; lng: number }; skillRequired: { id: string; name: string; category: string }; maxWage?: number; distanceKm?: number },
  urgency: UrgencyLevel = 'medium'
): { worker: WorkerProfile; score: FairWorkScore }[] {
  return workers
    .filter((w) => w.availabilityStatus !== 'unavailable')
    .map((worker) => ({
      worker,
      score: computeFairWorkScore(job, worker, urgency),
    }))
    .sort((a, b) => {
      // For emergency: sort purely by distance first, then score
      if (urgency === 'emergency') {
        const distA = calculateGeospatialDistance(
          a.worker.location.lat, a.worker.location.lng,
          job.location.lat, job.location.lng
        );
        const distB = calculateGeospatialDistance(
          b.worker.location.lat, b.worker.location.lng,
          job.location.lat, job.location.lng
        );
        if (Math.abs(distA - distB) > 1.5) return distA - distB;
      }
      return b.score.totalScore - a.score.totalScore;
    });
}

/**
 * Generate a human-readable explanation of why a worker was recommended.
 */
export function generateAllocationExplanation(score: FairWorkScore, workerName: string): string {
  const lines: string[] = [];

  if (score.matchTier === 'EXCELLENT') {
    lines.push(`${workerName} is an excellent match for this service.`);
  } else if (score.matchTier === 'STRONG') {
    lines.push(`${workerName} is a strong fit for this service.`);
  } else {
    lines.push(`${workerName} is a good option for this service.`);
  }

  if (score.isRecommendedByFairWork) {
    lines.push('✓ FairWork recommended: under-utilized cooperative member given priority.');
  }

  if (score.reasons.length > 0) {
    lines.push(`Why matched: ${score.reasons.slice(0, 3).join(' · ')}`);
  }

  if (score.fairnessNote) {
    lines.push(`Workload: ${score.fairnessNote}`);
  }

  return lines.join('\n');
}

/**
 * Calculate cooperative utilization analytics.
 */
export interface CooperativeUtilizationReport {
  totalWorkers: number;
  availableWorkers: number;
  activeWorkers: number;
  overUtilizedWorkers: number;    // active jobs >= 3
  underUtilizedWorkers: number;   // 0 active jobs + < 3 jobs this week
  utilizationRate: number;         // percentage
  fairnessIndex: number;           // 0–100, higher = more equitable distribution
  recommendations: string[];
}

export function analyzeCooperativeUtilization(workers: WorkerProfile[]): CooperativeUtilizationReport {
  const available = workers.filter((w) => w.availabilityStatus === 'available');
  const active = workers.filter((w) => (w.activeJobsCount ?? 0) > 0);
  const overUtilized = workers.filter((w) => (w.activeJobsCount ?? 0) >= 3);
  const underUtilized = workers.filter(
    (w) => (w.activeJobsCount ?? 0) === 0 && w.availabilityStatus === 'available'
  );

  const utilizationRate = workers.length > 0
    ? Math.round((active.length / workers.length) * 100)
    : 0;

  // Fairness index: 100 = perfectly equal distribution, 0 = one worker has all jobs
  const jobCounts = workers.map((w) => w.activeJobsCount ?? 0);
  const avgJobs = jobCounts.reduce((s, c) => s + c, 0) / (workers.length || 1);
  const variance = jobCounts.reduce((s, c) => s + Math.pow(c - avgJobs, 2), 0) / (workers.length || 1);
  const fairnessIndex = Math.max(0, Math.round(100 - variance * 10));

  const recommendations: string[] = [];
  if (underUtilized.length > 3) {
    recommendations.push(`${underUtilized.length} workers available but not assigned — consider proactive outreach.`);
  }
  if (overUtilized.length > 0) {
    recommendations.push(`${overUtilized.length} workers are over-utilized. Redistribute upcoming jobs.`);
  }
  if (fairnessIndex < 60) {
    recommendations.push('Job distribution is unequal. FairWork engine recommends rebalancing.');
  }

  return {
    totalWorkers: workers.length,
    availableWorkers: available.length,
    activeWorkers: active.length,
    overUtilizedWorkers: overUtilized.length,
    underUtilizedWorkers: underUtilized.length,
    utilizationRate,
    fairnessIndex,
    recommendations,
  };
}
