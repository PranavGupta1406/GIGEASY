// GigEasy Product Telemetry & Observability Service
// Tracks funnel conversions, error states, and marketplace liquidity metrics

export type AnalyticsEvent =
  | 'signup_completed'
  | 'profile_completed'
  | 'job_viewed'
  | 'job_applied'
  | 'counter_offer_sent'
  | 'application_accepted'
  | 'worker_checked_in'
  | 'shift_completed'
  | 'payment_completed'
  | 'rating_submitted';

export class AnalyticsService {
  track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    // In production, forwards to Mixpanel / PostHog / Segment
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      properties,
    };
    if (__DEV__) {
      // console.log('[Analytics]', logData);
    }
  }

  logError(error: Error, context?: Record<string, unknown>) {
    // In production, forwards to Sentry
    if (__DEV__) {
      // console.warn('[Observability Error]', error.message, context);
    }
  }
}

export const analytics = new AnalyticsService();
