// GigEasy Marketplace Matching Engine
// Computes multi-factor compatibility scores (0–100%) between Workers and Gigs

import { Job, WorkerProfile } from '../../types';

export interface MatchScoreBreakdown {
  totalScore: number; // 0–100
  skillScore: number; // 0–35
  distanceScore: number; // 0–25
  wageScore: number; // 0–20
  trustScore: number; // 0–15
  experienceScore: number; // 0–5
  matchTier: 'EXCELLENT' | 'STRONG' | 'GOOD' | 'FAIR';
  reasons: string[];
}

// Haversine geospatial distance calculation in Kilometers
export function calculateGeospatialDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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

/**
 * Multi-Factor Matching Algorithm:
 * 1. Skill Match (35% weight): Exact match or adjacent domain compatibility.
 * 2. Distance Decay (25% weight): Proximity to job site with worker preferred radius penalty.
 * 3. Wage Overlap (20% weight): Worker expected wage vs Job min/max wage budget.
 * 4. Trust & Reliability (15% weight): Worker verified status, ratings, and historical completion.
 * 5. Experience (5% weight): Years of verified work in category.
 */
export function computeJobWorkerMatch(
  job: Job,
  worker: WorkerProfile
): MatchScoreBreakdown {
  const reasons: string[] = [];

  // 1. Skill Match (35 pts max)
  let skillScore = 0;
  const hasExactSkill = worker.skills.some((s) => s.id === job.skillRequired.id || s.name === job.skillRequired.name);
  const hasSameCategory = worker.skills.some((s) => s.category === job.skillRequired.category);

  if (hasExactSkill) {
    skillScore = 35;
    reasons.push('Exact skill match');
  } else if (hasSameCategory) {
    skillScore = 24;
    reasons.push('Related category experience');
  } else {
    skillScore = 10;
  }

  // 2. Distance Score (25 pts max)
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
    distanceScore = 25;
    reasons.push('Under 2 km from work site');
  } else if (distanceKm <= 5) {
    distanceScore = 20;
    reasons.push('Within 5 km radius');
  } else if (distanceKm <= worker.preferredRadius) {
    distanceScore = 14;
  } else {
    distanceScore = Math.max(2, 25 - distanceKm * 1.5);
  }

  // 3. Wage Overlap Score (20 pts max)
  let wageScore = 0;
  const expected = worker.expectedDailyWage;
  if (expected >= job.minWage && expected <= job.maxWage) {
    wageScore = 20;
    reasons.push('Expected wage matches employer budget');
  } else if (expected < job.minWage) {
    wageScore = 18;
    reasons.push('Highly competitive wage requirement');
  } else if (expected <= job.maxWage * 1.15) {
    wageScore = 12; // Within 15% negotiable range
    reasons.push('Wage within negotiation range');
  } else {
    wageScore = 5;
  }

  // 4. Trust & Reliability Score (15 pts max)
  let trustScore = 0;
  if (worker.verificationStatus === 'verified') {
    trustScore += 5;
  }
  const ratingWeight = Math.min(6, (worker.rating / 5) * 6);
  const trustIndexWeight = Math.min(4, (worker.trustScore / 100) * 4);
  trustScore = Math.round(trustScore + ratingWeight + trustIndexWeight);
  if (worker.trustScore >= 85) {
    reasons.push('Top-rated trusted worker');
  }

  // 5. Experience Score (5 pts max)
  const experienceScore = Math.min(5, Math.round(worker.experienceYears * 0.8));
  if (worker.experienceYears >= 3) {
    reasons.push(`${worker.experienceYears}+ years proven experience`);
  }

  const totalScore = Math.min(
    100,
    Math.round(skillScore + distanceScore + wageScore + trustScore + experienceScore)
  );

  let matchTier: MatchScoreBreakdown['matchTier'] = 'FAIR';
  if (totalScore >= 88) matchTier = 'EXCELLENT';
  else if (totalScore >= 75) matchTier = 'STRONG';
  else if (totalScore >= 60) matchTier = 'GOOD';

  return {
    totalScore,
    skillScore,
    distanceScore,
    wageScore,
    trustScore,
    experienceScore,
    matchTier,
    reasons,
  };
}

/**
 * Sorts and ranks jobs for a worker based on intelligent multi-factor matching score.
 */
export function rankJobsForWorker(
  jobs: Job[],
  worker: WorkerProfile
): { job: Job; match: MatchScoreBreakdown }[] {
  return jobs
    .map((job) => ({
      job,
      match: computeJobWorkerMatch(job, worker),
    }))
    .sort((a, b) => b.match.totalScore - a.match.totalScore);
}

/**
 * Sorts and ranks applicants for an employer's job based on matching score.
 */
export function rankWorkersForJob(
  workers: WorkerProfile[],
  job: Job
): { worker: WorkerProfile; match: MatchScoreBreakdown }[] {
  return workers
    .map((worker) => ({
      worker,
      match: computeJobWorkerMatch(job, worker),
    }))
    .sort((a, b) => b.match.totalScore - a.match.totalScore);
}
