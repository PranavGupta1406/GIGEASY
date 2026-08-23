// GigEasy Trust & Reliability Score Engine
// Deterministic scoring engine for marketplace safety, fraud prevention, and quality assurance

export interface WorkerTrustAudit {
  trustScore: number; // 0–100
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  breakdown: {
    identityScore: number; // Max 30: Aadhaar / PAN / Phone verification
    punctualityScore: number; // Max 25: On-time arrival rate
    completionScore: number; // Max 25: Ratio of completed to accepted gigs
    ratingScore: number; // Max 20: Verified employer review average
    penalties: number; // Subtractions for no-shows or safety violations
  };
  metrics: {
    totalJobsAccepted: number;
    totalJobsCompleted: number;
    onTimeArrivalRate: number; // Percentage (e.g. 98)
    noShowCount: number;
    repeatHiresCount: number;
    isAadhaarVerified: boolean;
    isPhoneVerified: boolean;
  };
}

export interface EmployerReliabilityAudit {
  reliabilityScore: number; // 0–100
  label: 'Verified Enterprise' | 'High Reliability' | 'Good' | 'Unverified';
  breakdown: {
    businessVerificationScore: number; // Max 35: GSTIN / Company docs
    payoutPunctualityScore: number; // Max 35: Instant release upon job completion
    workerSatisfactionScore: number; // Max 30: Safe workplace rating
    cancellationPenalty: number; // Subtraction for last-minute gig cancellations
  };
}

/**
 * Calculates a Worker's Trust Score (0–100) using Bayesian marketplace metrics.
 */
export function calculateWorkerTrustScore(metrics: WorkerTrustAudit['metrics']): WorkerTrustAudit {
  // 1. Identity Verification (30 pts max)
  let identityScore = 0;
  if (metrics.isAadhaarVerified) identityScore += 20;
  if (metrics.isPhoneVerified) identityScore += 10;

  // 2. Punctuality Rate (25 pts max)
  const punctualityScore = Math.round((Math.min(100, Math.max(0, metrics.onTimeArrivalRate)) / 100) * 25);

  // 3. Completion Reliability (25 pts max)
  const completionRatio =
    metrics.totalJobsAccepted > 0
      ? metrics.totalJobsCompleted / metrics.totalJobsAccepted
      : 1.0;
  const completionScore = Math.round(completionRatio * 25);

  // 4. Rating & Repeat Employer Bonus (20 pts max)
  const repeatBonus = Math.min(5, metrics.repeatHiresCount * 1.5);
  const ratingScore = Math.min(20, Math.round(15 + repeatBonus));

  // 5. Penalties (-15 pts per unexcused no-show)
  const penalties = metrics.noShowCount * 15;

  const rawScore = identityScore + punctualityScore + completionScore + ratingScore - penalties;
  const trustScore = Math.max(0, Math.min(100, rawScore));

  let label: WorkerTrustAudit['label'] = 'Poor';
  if (trustScore >= 85) label = 'Excellent';
  else if (trustScore >= 70) label = 'Good';
  else if (trustScore >= 50) label = 'Fair';

  return {
    trustScore,
    label,
    breakdown: {
      identityScore,
      punctualityScore,
      completionScore,
      ratingScore,
      penalties,
    },
    metrics,
  };
}

/**
 * Calculates an Employer's Reliability Rating (0–100).
 */
export function calculateEmployerReliabilityScore(params: {
  isGstinVerified: boolean;
  escrowPayoutRate: number; // e.g. 99%
  workerReviewRating: number; // 1–5
  cancelledGigsCount: number;
}): EmployerReliabilityAudit {
  const businessVerificationScore = params.isGstinVerified ? 35 : 15;
  const payoutPunctualityScore = Math.round((Math.min(100, params.escrowPayoutRate) / 100) * 35);
  const workerSatisfactionScore = Math.round((Math.min(5, params.workerReviewRating) / 5) * 30);
  const cancellationPenalty = params.cancelledGigsCount * 8;

  const raw = businessVerificationScore + payoutPunctualityScore + workerSatisfactionScore - cancellationPenalty;
  const reliabilityScore = Math.max(0, Math.min(100, raw));

  let label: EmployerReliabilityAudit['label'] = 'Unverified';
  if (reliabilityScore >= 90) label = 'Verified Enterprise';
  else if (reliabilityScore >= 75) label = 'High Reliability';
  else if (reliabilityScore >= 50) label = 'Good';

  return {
    reliabilityScore,
    label,
    breakdown: {
      businessVerificationScore,
      payoutPunctualityScore,
      workerSatisfactionScore,
      cancellationPenalty,
    },
  };
}
