/**
 * GigEasy Brand Theme
 * 
 * Deep navy identity + warm orange accent
 * Premium consumer brand — NOT AI SaaS, NOT monochromatic
 */

export const Theme = {
  // ── Core Brand ──────────────────────────────────────────────────────────
  /** Deep navy — wordmark, primary text, brand identity */
  brand: '#1B1B2F',
  brandMid: '#2D2D4E',
  /** Warm orange — primary CTA, apply, hire, post job */
  accent: '#F97316',
  accentLight: '#FFF7ED',
  accentMuted: '#FDBA74',

  // ── Semantic Colors ──────────────────────────────────────────────────────
  success: '#16A34A',
  successLight: '#DCFCE7',
  successBorder: '#86EFAC',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorBorder: '#FECACA',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningBorder: '#FDE68A',

  info: '#0891B2',
  infoLight: '#CFFAFE',

  // ── Neutrals ─────────────────────────────────────────────────────────────
  /** Warm off-white — app background */
  bg: '#FAFAF9',
  /** Pure white — cards, panels, surfaces */
  surface: '#FFFFFF',
  /** Near-black — primary text */
  ink: '#111827',
  /** Secondary text, labels */
  textSecondary: '#374151',
  /** Muted / placeholder text */
  textMuted: '#6B7280',
  /** Very light muted */
  textLight: '#9CA3AF',
  /** Border / divider */
  border: '#E5E7EB',
  /** Light background for chips/tags */
  chipBg: '#F3F4F6',

  // ── Category Colors (each work group gets its own identity) ───────────────
  construction: {
    primary: '#B45309',
    bg: '#FEF3C7',
    icon: '#D97706',
  },
  factory: {
    primary: '#6D28D9',
    bg: '#EDE9FE',
    icon: '#7C3AED',
  },
  transport: {
    primary: '#0E7490',
    bg: '#CFFAFE',
    icon: '#0891B2',
  },
  retail: {
    primary: '#065F46',
    bg: '#D1FAE5',
    icon: '#059669',
  },
  hospitality: {
    primary: '#9D174D',
    bg: '#FCE7F3',
    icon: '#DB2777',
  },

  // ── Misc ────────────────────────────────────────────────────────────────
  shadow: '#111827',
  overlay: 'rgba(17, 24, 39, 0.55)',
} as const;

/** Application status → color mapping */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:       '#2563EB',
    UNDER_REVIEW:  '#D97706',
    NEGOTIATING:   '#7C3AED',
    ACCEPTED:      '#16A34A',
    CONFIRMED:     '#16A34A',
    CHECKED_IN:    '#0891B2',
    IN_PROGRESS:   '#7C3AED',
    COMPLETED:     '#059669',
    PAID:          '#059669',
    REJECTED:      '#DC2626',
    WITHDRAWN:     '#6B7280',
    EXPIRED:       '#6B7280',
    HIRING:        '#F97316',
    FULL:          '#16A34A',
    ACTIVE:        '#7C3AED',
    PUBLISHED:     '#2563EB',
    CANCELLED:     '#DC2626',
  };
  return map[status] ?? '#6B7280';
};

export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:       'Applied',
    UNDER_REVIEW:  'In Review',
    NEGOTIATING:   'Counter Offer Pending',
    ACCEPTED:      'Accepted ✓',
    CONFIRMED:     'Confirmed',
    CHECKED_IN:    'Checked In',
    IN_PROGRESS:   'Work in Progress',
    COMPLETED:     'Work Done',
    PAID:          'Paid ✓',
    REJECTED:      'Declined',
    WITHDRAWN:     'Withdrawn',
    EXPIRED:       'Expired',
    HIRING:        'Hiring Open',
    FULL:          'Fully Staffed',
    ACTIVE:        'Active Shift',
    PUBLISHED:     'Open',
    CANCELLED:     'Cancelled',
  };
  return map[status] ?? status;
};
