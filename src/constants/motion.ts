/**
 * GigEasy Signature Motion System
 *
 * Core motion tokens, easing curves, and spring physics used across the
 * Gig Thread hero, application transitions, matching feedback, and UI choreography.
 */

export const Motion = {
  // ── Duration Tokens (ms) ───────────────────────────────────────────────────
  duration: {
    instant: 120,
    snappy: 220,
    standard: 340,
    deliberate: 480,
    cinematic: 680,
  },

  // ── Cubic Bezier Easing Formulas ───────────────────────────────────────────
  easing: {
    // Standard Apple/Uber-style responsive ease-out
    easeOut: (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3),
    // High-inertia physical deceleration
    easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    // Satisfying magnetic snap with slight overshoot
    magneticSnap: (t: number) => {
      const c = 1.45;
      const p = Math.min(Math.max(t, 0), 1) - 1;
      return 1 + (c + 1) * Math.pow(p, 3) + c * Math.pow(p, 2);
    },
    // Smooth cinematic ease in-out
    easeInOut: (t: number) => {
      const p = Math.min(Math.max(t, 0), 1);
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    },
  },

  // ── Spring Presets (for React Native Animated) ──────────────────────────────
  spring: {
    tight: { tension: 120, friction: 10 },
    magnetic: { tension: 80, friction: 8 },
    gentle: { tension: 45, friction: 7 },
  },

  // ── The Gig Thread Signature Physical Parameters ───────────────────────────
  gigThread: {
    ribbonWidth: 2.2,
    activeRibbonWidth: 3.2,
    colorIdle: 'rgba(255, 255, 255, 0.14)',
    colorActive: '#1A68D5',
    colorBlueGlow: 'rgba(26, 104, 213, 0.45)',
    glowBlur: 14,
    magneticPullFactor: 0.08,
  },
};
