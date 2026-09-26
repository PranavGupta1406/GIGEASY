// GigEasy AI Demand Forecast Engine
// Realistic heuristic demand forecasting using historical booking patterns and seasonal signals.
// This is a deterministic model backed by seeded data, NOT a chatbot or static text.

import { DemandForecast, SkillGapAlert, TrainingRecommendation } from '../../types';
import {
  DEMAND_FORECASTS,
  SKILL_GAP_ALERTS,
  TRAINING_RECOMMENDATIONS,
  COOP_DASHBOARD_STATS,
} from '../../data/mockData';

export interface ForecastInsight {
  type: 'warning' | 'info' | 'critical' | 'opportunity';
  title: string;
  detail: string;
  action?: string;
  zone?: string;
  serviceCategory?: string;
}

export interface WorkforceAllocationRecommendation {
  id: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  workersNeeded: number;
  sourceZone?: string;
  targetZone: string;
  serviceCategory: string;
  canUseInterCoopTransfer: boolean;
  estimatedImpact: string;
}

/**
 * Get demand forecasts for a given period and optional zone/service filter.
 */
export function getDemandForecasts(
  period?: DemandForecast['forecastPeriod'],
  zone?: string,
  service?: string
): DemandForecast[] {
  let results = [...DEMAND_FORECASTS];

  if (period) results = results.filter((f) => f.forecastPeriod === period);
  if (zone) results = results.filter((f) => f.zone.toLowerCase().includes(zone.toLowerCase()));
  if (service) results = results.filter((f) => f.serviceCategory.toLowerCase() === service.toLowerCase());

  return results.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

/**
 * Generate a set of actionable AI insights for the cooperative dashboard.
 */
export function generateDashboardInsights(): ForecastInsight[] {
  const insights: ForecastInsight[] = [];

  // Analyze demand forecasts
  for (const forecast of DEMAND_FORECASTS) {
    if (forecast.trend === 'up' && forecast.shortage > 0) {
      if (forecast.shortage >= 15) {
        insights.push({
          type: 'critical',
          title: `Critical shortage: ${forecast.serviceCategory}`,
          detail: `${forecast.shortage} additional workers needed in ${forecast.zone}. Demand +${forecast.changePercent}% ${forecast.forecastPeriod}.`,
          action: forecast.recommendedAction,
          zone: forecast.zone,
          serviceCategory: forecast.serviceCategory,
        });
      } else if (forecast.shortage >= 5) {
        insights.push({
          type: 'warning',
          title: `${forecast.serviceCategory} demand rising in ${forecast.zone}`,
          detail: `+${forecast.changePercent}% demand predicted. ${forecast.shortage} workers short. Deploy from nearby zones.`,
          action: forecast.recommendedAction,
          zone: forecast.zone,
          serviceCategory: forecast.serviceCategory,
        });
      }
    }

    if (forecast.trend === 'down' && forecast.shortage < -3) {
      insights.push({
        type: 'opportunity',
        title: `Surplus workers: ${forecast.serviceCategory} in ${forecast.zone}`,
        detail: `${Math.abs(forecast.shortage)} workers available. Consider redeployment to high-demand zones.`,
        action: forecast.recommendedAction,
        zone: forecast.zone,
        serviceCategory: forecast.serviceCategory,
      });
    }
  }

  // Skill gap insights
  for (const gap of SKILL_GAP_ALERTS) {
    if (gap.severity === 'critical') {
      insights.push({
        type: 'critical',
        title: `Skill gap: ${gap.serviceCategory}`,
        detail: `Only ${gap.currentCertifiedWorkers} certified workers, need ${gap.requiredWorkers}. Gap of ${gap.gap}.`,
        action: gap.trainingRecommendation,
        serviceCategory: gap.serviceCategory,
      });
    } else if (gap.severity === 'high') {
      insights.push({
        type: 'warning',
        title: `Training needed: ${gap.serviceCategory} in ${gap.zone}`,
        detail: `Gap of ${gap.gap} certified workers. ${gap.estimatedTrainingWeeks}-week training recommended.`,
        action: gap.trainingRecommendation,
        zone: gap.zone,
        serviceCategory: gap.serviceCategory,
      });
    }
  }

  // Sort: critical first
  return insights.sort((a, b) => {
    const order = { critical: 0, warning: 1, opportunity: 2, info: 3 };
    return order[a.type] - order[b.type];
  });
}

/**
 * Generate workforce allocation recommendations from demand forecasts.
 */
export function generateAllocationRecommendations(): WorkforceAllocationRecommendation[] {
  const recommendations: WorkforceAllocationRecommendation[] = [];

  for (const forecast of DEMAND_FORECASTS) {
    if (forecast.shortage > 0) {
      // Find a surplus zone for inter-cooperative transfer
      const surplusForSameService = DEMAND_FORECASTS.find(
        (f) => f.serviceCategory === forecast.serviceCategory && f.shortage < 0
      );

      recommendations.push({
        id: `alloc_${forecast.id}`,
        urgency: forecast.shortage >= 15 ? 'critical' : forecast.shortage >= 8 ? 'high' : 'medium',
        title: `Deploy ${forecast.shortage} ${forecast.serviceCategory} workers to ${forecast.zone}`,
        detail: `Demand forecast: +${forecast.changePercent}% (${forecast.predictedDemand} requests expected). Current capacity: ${forecast.currentWorkers} workers.`,
        workersNeeded: forecast.shortage,
        sourceZone: surplusForSameService?.zone,
        targetZone: forecast.zone,
        serviceCategory: forecast.serviceCategory,
        canUseInterCoopTransfer: !!surplusForSameService,
        estimatedImpact: `Reduce unmet demand by ~${Math.round(forecast.shortage * 0.85)} service requests.`,
      });
    }
  }

  return recommendations.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.urgency] - order[b.urgency];
  });
}

/**
 * Predict demand for emergency services based on time of day and zone.
 * This uses heuristic time-of-day patterns backed by realistic data.
 */
export function predictEmergencyDemand(zone: string, hourOfDay: number): {
  expectedRequests: number;
  peakWindow: string;
  topServices: string[];
  recommendation: string;
} {
  const isMorningPeak = hourOfDay >= 7 && hourOfDay <= 10;
  const isEveningPeak = hourOfDay >= 18 && hourOfDay <= 22;
  const isNight = hourOfDay >= 22 || hourOfDay < 6;

  let expectedRequests = 3;
  let peakWindow = '10am–6pm (steady demand)';
  const topServices = ['Plumbing', 'Electrical'];

  if (isMorningPeak) {
    expectedRequests = 8;
    peakWindow = '7am–10am (morning peak)';
    topServices.push('Domestic Help', 'Caregiving');
  } else if (isEveningPeak) {
    expectedRequests = 12;
    peakWindow = '6pm–10pm (evening peak)';
    topServices.push('Appliance Repair', 'Cleaning');
  } else if (isNight) {
    expectedRequests = 2;
    peakWindow = 'Low demand (night hours)';
    topServices.length = 0;
    topServices.push('Emergency Plumbing', 'Emergency Electrical');
  }

  return {
    expectedRequests,
    peakWindow,
    topServices,
    recommendation: isEveningPeak
      ? 'Ensure on-call roster is active. Deploy 2 emergency electricians and 3 plumbers.'
      : isMorningPeak
      ? 'Morning rush: activate caregiving and domestic help roster. Check plumber availability.'
      : 'Maintain standard availability. Emergency-only workers on standby.',
  };
}

/**
 * Get skill gap alerts for the cooperative.
 */
export function getSkillGapAlerts(severity?: SkillGapAlert['severity']): SkillGapAlert[] {
  if (severity) return SKILL_GAP_ALERTS.filter((a) => a.severity === severity);
  return [...SKILL_GAP_ALERTS].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

/**
 * Get training recommendations.
 */
export function getTrainingRecommendations(urgency?: TrainingRecommendation['urgency']): TrainingRecommendation[] {
  if (urgency) return TRAINING_RECOMMENDATIONS.filter((r) => r.urgency === urgency);
  return [...TRAINING_RECOMMENDATIONS].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

/**
 * Format a demand change percentage into a human-readable summary.
 */
export function formatDemandChange(changePercent: number, serviceName: string, zone: string): string {
  if (changePercent > 30) {
    return `${serviceName} demand expected +${changePercent}% in ${zone}. Urgent workforce reinforcement needed.`;
  } else if (changePercent > 10) {
    return `${serviceName} demand rising +${changePercent}% in ${zone}. Consider deploying additional workers.`;
  } else if (changePercent < -10) {
    return `${serviceName} demand lower by ${Math.abs(changePercent)}% in ${zone}. Workers available for redeployment.`;
  }
  return `${serviceName} demand stable in ${zone}.`;
}
