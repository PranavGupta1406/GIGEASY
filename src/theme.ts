/**
 * GigEasy — Production Design System v2
 *
 * Designed for Indian workers, households, and cooperative societies.
 * Warm Ivory Canvas · Deep Charcoal Structure · GigEasy Orange CTA
 * Forest Green Trust Language · Premium but accessible.
 *
 * Color Semantics:
 *   Orange  = action / opportunity / urgency
 *   Green   = trust / availability / success / verified
 *   Black   = authority / primary information
 *   Cream   = environment / background
 */

export const Theme = {
  // ── Core Brand ─────────────────────────────────────────────────────────────
  /** Deep charcoal — structure, headings, high-priority icons */
  primary: '#1A1A1A',
  primaryDark: '#0D0D0D',
  primaryVibrant: '#2A2A2A',

  /** GigEasy Orange — reserved exclusively for primary CTAs and opportunity signals */
  accent: '#D4561A',
  accentDark: '#B54716',
  accentLight: '#FEF0E9',   // ultra-subtle orange tint for active states
  accentMuted: '#F5D5C4',   // subtle border for active items
  burntOrange: '#E06D3B',   // occasional emphasis

  // ── Backgrounds & Surfaces (Warm Ivory First) ────────────────────────────
  /** Warm ivory — the dominant page canvas. Calm, premium, not clinical white */
  bg: '#FAF9F6',
  /** Pure white card surface — slightly elevated from warm bg */
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  /** Ultra-subtle warm off-white — occasional secondary surface */
  surfaceSubtle: '#F5F2ED',
  sand: '#F0EDE7',
  sandLight: '#F8F6F2',
  sandDark: '#DDD9D0',

  // ── Typography ─────────────────────────────────────────────────────────────
  /** Rich near-black for headings and primary labels */
  ink: '#1A1A1A',
  inkLight: '#2A2A2A',
  /** Secondary text — highly legible neutral charcoal */
  textSecondary: '#505050',
  /** Muted metadata, helper text */
  textMuted: '#787878',
  textDisabled: '#ABABAB',
  textOnAccent: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // ── Borders & Dividers ──────────────────────────────────────────────────────
  border: '#E4E0D8',
  borderSubtle: '#EEEBe4',
  borderStrong: '#CECAC2',

  // ── Forest Green — Verified, Available, Trust, Match, Success ─────────────
  /** The secondary design language. NOT decorative — carries meaning. */
  success: '#1A6B3C',
  successLight: '#E6F4EC',
  successBorder: '#B8DCCA',
  successDark: '#134F2C',
  forestGreen: '#1A6B3C',
  forestGreenDark: '#134F2C',
  forestGreenLight: '#E6F4EC',
  forestGreenBorder: '#B8DCCA',
  forestGreenSubtle: '#F0F8F3',
  /** Used for forest green text on light backgrounds */
  sageText: '#1A6B3C',
  sageBg: '#E6F4EC',
  sageBorder: '#C4D9CC',

  // ── Error & Critical ─────────────────────────────────────────────────────
  error: '#C0392B',
  errorLight: '#FDECEA',
  errorBorder: '#F0B4AE',

  // ── Warm Amber — Wages, Earnings, Important Figures ──────────────────────
  /** Amber is used specifically for earnings display, not generic warnings */
  amber: '#C07A1A',
  amberLight: '#FEF3DC',
  amberBorder: '#F5DFA0',
  amberDark: '#9A6014',

  // ── Warning & Attention ───────────────────────────────────────────────────
  warning: '#B45309',
  warningLight: '#FEF3C7',
  warningBorder: '#FDE68A',

  // ── Neutral Information ───────────────────────────────────────────────────
  info: '#1A1A1A',
  infoLight: '#F0EDE7',
  infoBorder: '#E4E0D8',

  // ── Olive / Cooperative Badges ────────────────────────────────────────────
  olive: '#5A6349',
  oliveDark: '#444C36',
  oliveLight: '#F0F2EB',
  oliveMuted: '#C0C8B2',

  // ── Navigation ────────────────────────────────────────────────────────────
  tabBackground: '#FAF9F6',
  tabActive: '#D4561A',
  tabInactive: '#787878',
  tabBorder: '#E4E0D8',

  // ── Cards & Elevation ─────────────────────────────────────────────────────
  cardBackground: '#FFFFFF',
  cardBorder: '#E4E0D8',
  shadowColor: '#1A1A1A',
  overlay: 'rgba(26, 26, 26, 0.48)',
  overlayLight: 'rgba(26, 26, 26, 0.04)',

  // ── Category Identities (Precise, Restrained) ─────────────────────────────
  categories: {
    construction: { color: '#5A6349', bg: '#F0F2EB', border: '#C0C8B2' },
    factory:      { color: '#D4561A', bg: '#FEF0E9', border: '#F5D5C4' },
    transport:    { color: '#1A1A1A', bg: '#F0EDE7', border: '#E4E0D8' },
    retail:       { color: '#1A6B3C', bg: '#E6F4EC', border: '#B8DCCA' },
    hospitality:  { color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  },

  // ── Backward Compatibility Aliases ────────────────────────────────────────
  black: '#1A1A1A',
  white: '#FFFFFF',
  accentBlue: '#1A1A1A',   // NO BLUE — mapped to charcoal
  primaryLight: '#FEF0E9',
  primaryBorder: '#F5D5C4',
  primaryMuted: '#FAF9F6',
  darkPill: '#1A1A1A',
  darkPillHover: '#2A2A2A',
} as const;

/** Universal Application Status Colors */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:         '#1A1A1A',
    UNDER_REVIEW:    '#B45309',
    NEGOTIATING:     '#B45309',
    ACCEPTED:        '#1A6B3C',
    CONFIRMED:       '#1A6B3C',
    CHECKED_IN:      '#5A6349',
    IN_PROGRESS:     '#D4561A',
    COMPLETED:       '#1A6B3C',
    PAYMENT_PENDING: '#B45309',
    PAID:            '#1A6B3C',
    REJECTED:        '#C0392B',
    WITHDRAWN:       '#787878',
    EXPIRED:         '#787878',
    HIRING:          '#D4561A',
    FULL:            '#1A6B3C',
    ACTIVE:          '#D4561A',
    PUBLISHED:       '#5A6349',
    CANCELLED:       '#C0392B',
  };
  return map[status] ?? '#787878';
};

import { getLocalizedStatus, LanguageCode } from './i18n/translations';

function getActiveLanguage(): LanguageCode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('gigeasy_language');
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return 'en';
}

/** Universal Application Status Labels */
export const statusLabel = (status: string, lang?: LanguageCode): string => {
  const activeLang = lang || getActiveLanguage();
  return getLocalizedStatus(status, activeLang);
};

