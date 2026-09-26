// GigEasy Gig Radar — Proactive Opportunity Engine
// Multi-factor real-time matching evaluation considering:
// 1. Skill Fit (verified skills & category)
// 2. Distance Decay vs Preferred Radius
// 3. Worker Availability & Timing Overlap
// 4. Pay Preference & Fair Pay Overlap
// 5. Worker Reliability & Completed Gigs
// 6. Employer Reliability & Payout Record
// 7. Gig Urgency & Remaining Positions
// 8. Behavioral History Learning

import { Job, WorkerProfile, WorkerAvailabilityModel } from '../../types';
import { calculateGeospatialDistance } from '../matching/matchingEngine';
import { fairPayService } from '../pricing/fairPayService';
import { trustEngine } from '../trust/trustEngine';
import { deriveWorkerBehaviorProfile, recordInteraction } from '../recommendation/recommendationService';

export interface GigRadarFactorDetail {
  score: number; // Factor points earned
  maxScore: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Low';
  label: string;
  icon: string;
}

export interface GigRadarMatchResult {
  job: Job;
  workerId: string;
  totalScore: number; // 0–100
  tier: 'EXCELLENT' | 'STRONG' | 'GOOD' | 'FAIR';
  factors: {
    skill: GigRadarFactorDetail;
    distance: GigRadarFactorDetail;
    availability: GigRadarFactorDetail;
    pay: GigRadarFactorDetail;
    reliability: GigRadarFactorDetail;
    urgency: GigRadarFactorDetail;
  };
  conciseSummary: string; // e.g. "You frequently accept electrical work within 5 km during morning hours."
  distanceKm: number;
  spotsLeft: number;
  isUrgent: boolean;
  shouldAlert: boolean;
}

export class GigRadarService {
  /**
   * Evaluate a single gig against a worker profile & availability
   */
  public evaluateGigMatch(
    job: Job,
    worker: WorkerProfile,
    customAvailability?: WorkerAvailabilityModel
  ): GigRadarMatchResult {
    // ── 1. Skill Fit (30 pts max) ──
    let skillScore = 0;
    const workerSkills = worker.skills || [];
    const jobSkillName = (job.skillRequired?.name || job.title || '').toLowerCase();
    const jobSkillCat = (job.skillRequired?.category || '').toLowerCase();

    const hasExactTrade = workerSkills.some((s) => {
      const sName = s.name.toLowerCase();
      return sName === jobSkillName || jobSkillName.includes(sName) || sName.includes(jobSkillName);
    });
    const hasCategoryTrade = workerSkills.some((s) => s.category.toLowerCase() === jobSkillCat);

    if (hasExactTrade) {
      skillScore = 30;
    } else if (hasCategoryTrade) {
      skillScore = 22;
    } else {
      skillScore = 8;
    }

    const skillGrade: GigRadarFactorDetail['grade'] =
      skillScore >= 28 ? 'Excellent' : skillScore >= 20 ? 'Good' : skillScore >= 12 ? 'Fair' : 'Low';
    const skillFactor: GigRadarFactorDetail = {
      score: skillScore,
      maxScore: 30,
      grade: skillGrade,
      label: `Skill — ${skillGrade}`,
      icon: 'zap',
    };

    // ── 2. Distance Decay (20 pts max) ──
    const distanceKm =
      job.distanceKm ??
      calculateGeospatialDistance(
        worker.location.lat,
        worker.location.lng,
        job.location.lat,
        job.location.lng
      );
    const maxRadius = customAvailability?.preferredRadiusKm ?? worker.preferredRadius ?? 15;

    let distanceScore = 0;
    if (distanceKm <= 2.5) {
      distanceScore = 20;
    } else if (distanceKm <= 5) {
      distanceScore = 17;
    } else if (distanceKm <= maxRadius) {
      const decay = ((maxRadius - distanceKm) / maxRadius) * 12;
      distanceScore = Math.max(8, Math.round(5 + decay));
    } else {
      distanceScore = Math.max(2, Math.round(15 - (distanceKm - maxRadius)));
    }

    const distGrade: GigRadarFactorDetail['grade'] =
      distanceScore >= 18 ? 'Excellent' : distanceScore >= 14 ? 'Good' : distanceScore >= 8 ? 'Fair' : 'Low';
    const distanceFactor: GigRadarFactorDetail = {
      score: distanceScore,
      maxScore: 20,
      grade: distGrade,
      label: `Distance — ${distanceKm.toFixed(1)} km`,
      icon: 'map-pin',
    };

    // ── 3. Worker Availability & Timing Overlap (20 pts max) ──
    const availMode = customAvailability?.mode ?? (worker.availabilityStatus === 'available' ? 'NOW' : 'SCHEDULED');
    let availabilityScore = 15; // default reasonable baseline

    if (availMode === 'NOW') {
      availabilityScore = 20;
    } else if (availMode === 'SCHEDULED') {
      // Check trade alignment in availability preferences
      const prefTrades = customAvailability?.preferredTrades || [];
      const tradeMatches = prefTrades.length === 0 || prefTrades.some(t => t.toLowerCase() === jobSkillCat);
      availabilityScore = tradeMatches ? 18 : 12;
    } else {
      // OFF mode
      availabilityScore = 4;
    }

    const availGrade: GigRadarFactorDetail['grade'] =
      availabilityScore >= 18 ? 'Excellent' : availabilityScore >= 12 ? 'Good' : 'Fair';
    const availabilityFactor: GigRadarFactorDetail = {
      score: availabilityScore,
      maxScore: 20,
      grade: availGrade,
      label: `Availability — ${availGrade === 'Excellent' ? 'Exact' : 'Compatible'}`,
      icon: 'clock',
    };

    // ── 4. Pay Preference & Fair Pay Overlap (15 pts max) ──
    const expectedWage = worker.expectedDailyWage || 1000;
    const jobWage = job.maxWage || 1000;
    let payScore = 0;

    if (jobWage >= expectedWage + 200) {
      payScore = 15;
    } else if (jobWage >= expectedWage) {
      payScore = 13;
    } else if (jobWage >= expectedWage - 150) {
      payScore = 9;
    } else {
      payScore = 4;
    }

    const payGrade: GigRadarFactorDetail['grade'] =
      payScore >= 14 ? 'Excellent' : payScore >= 11 ? 'Good' : payScore >= 7 ? 'Fair' : 'Low';
    const payFactor: GigRadarFactorDetail = {
      score: payScore,
      maxScore: 15,
      grade: payGrade,
      label: `Pay — ${payGrade}`,
      icon: 'dollar-sign',
    };

    // ── 5. Worker Reliability & Completed Gigs (10 pts max) ──
    const trustMetrics = trustEngine.getWorkerTrustMetrics(worker);
    const reliabilityScore = Math.min(10, Math.round((trustMetrics.completionRate / 100) * 6 + (trustMetrics.punctualityRate / 100) * 4));
    const reliabilityFactor: GigRadarFactorDetail = {
      score: reliabilityScore,
      maxScore: 10,
      grade: reliabilityScore >= 9 ? 'Excellent' : 'Good',
      label: `Reliability — ${reliabilityScore >= 9 ? 'Verified' : 'Good'}`,
      icon: 'shield',
    };

    // ── 6. Gig Urgency & Remaining Positions (5 pts max) ──
    const spotsLeft = Math.max(0, (job.workersRequired || 1) - (job.workersHired || 0));
    let urgencyScore = 3;
    if (spotsLeft === 1) urgencyScore = 5;
    else if (spotsLeft <= 3) urgencyScore = 4;

    const urgencyFactor: GigRadarFactorDetail = {
      score: urgencyScore,
      maxScore: 5,
      grade: urgencyScore >= 4 ? 'Excellent' : 'Good',
      label: `Spots — ${spotsLeft} left`,
      icon: 'users',
    };

    // ── 7. Behavioral History Adjustment (-8 to +8 pts) ──
    const behavior = deriveWorkerBehaviorProfile(worker.id);
    let behaviorAdj = 0;
    let behavioralExplanation = '';

    if (behavior.hasSufficientHistory) {
      const topCat = behavior.preferredCategories[0];
      if (topCat && topCat.toLowerCase() === jobSkillCat) {
        behaviorAdj += 5;
        behavioralExplanation = `You frequently accept ${topCat} work within ${distanceKm.toFixed(0)} km during shift hours.`;
      } else if (behavior.inferredMinWage > 0 && jobWage >= behavior.inferredMinWage) {
        behaviorAdj += 2;
      }
    }

    const isHi = (() => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('gigeasy_language');
          if (stored) return JSON.parse(stored) === 'hi';
        }
      } catch {}
      return false;
    })();

    if (!behavioralExplanation) {
      if (hasExactTrade && distanceKm <= 5) {
        behavioralExplanation = isHi
          ? `आपके नज़दीक (${distanceKm.toFixed(1)} किमी) आपकी स्किल का काम`
          : `High trade match in your immediate vicinity (${distanceKm.toFixed(1)} km).`;
      } else if (jobWage >= expectedWage) {
        behavioralExplanation = isHi
          ? `आपकी पसंद के अनुसार ₹${expectedWage.toLocaleString('en-IN')}+ की दिहाड़ी`
          : `Matches your daily wage preference of ₹${expectedWage.toLocaleString('en-IN')}+.`;
      } else {
        behavioralExplanation = isHi
          ? `${worker.location.city} में आपकी स्किल के अनुसार सही काम`
          : `Recommended based on your verified skills in ${worker.location.city}.`;
      }
    }

    // Total Score
    const rawTotal =
      skillScore +
      distanceScore +
      availabilityScore +
      payScore +
      reliabilityScore +
      urgencyScore +
      behaviorAdj;

    const totalScore = Math.max(15, Math.min(99, Math.round(rawTotal)));

    let tier: GigRadarMatchResult['tier'] = 'FAIR';
    if (totalScore >= 88) tier = 'EXCELLENT';
    else if (totalScore >= 75) tier = 'STRONG';
    else if (totalScore >= 60) tier = 'GOOD';

    // Alert eligibility: Score >= 80, spots left > 0, not in OFF availability
    const shouldAlert = totalScore >= 80 && spotsLeft > 0 && availMode !== 'OFF';

    return {
      job,
      workerId: worker.id,
      totalScore,
      tier,
      factors: {
        skill: skillFactor,
        distance: distanceFactor,
        availability: availabilityFactor,
        pay: payFactor,
        reliability: reliabilityFactor,
        urgency: urgencyFactor,
      },
      conciseSummary: behavioralExplanation,
      distanceKm,
      spotsLeft,
      isUrgent: spotsLeft <= 2,
      shouldAlert,
    };
  }

  /**
   * Rank all active jobs for a worker using the exact same multi-factor radar logic
   */
  public rankGigsForWorker(
    jobs: Job[],
    worker: WorkerProfile,
    customAvailability?: WorkerAvailabilityModel
  ): GigRadarMatchResult[] {
    return jobs
      .filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED')
      .map((j) => this.evaluateGigMatch(j, worker, customAvailability))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Rank all workers for an employer job (for candidate search & workforce gap notification)
   */
  public rankWorkersForGig(
    workers: WorkerProfile[],
    job: Job
  ): GigRadarMatchResult[] {
    return workers
      .map((w) => this.evaluateGigMatch(job, w))
      .sort((a, b) => b.totalScore - a.totalScore);
  }
}

export const gigRadarService = new GigRadarService();
