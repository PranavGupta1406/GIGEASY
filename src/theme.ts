/**
 * GigEasy Universal Design System
 * 
 * Clean, restrained, human-crafted mobile product design.
 * Warm off-white backgrounds, pure white content cards, crisp charcoal typography,
 * selective cobalt blue for active/interactive states, and semantic status colors.
 */

export const Theme = {
  // ── Brand Accent Family ──────────────────────────────────────────────
  /** Selective brand cobalt blue — active tabs, primary buttons, selected filters, links */
  primary: '#1D4ED8',
  primaryVibrant: '#2563EB',
  /** Very subtle blue tint for selected item background */
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  primaryMuted: '#DBEAFE',

  // ── Neutrals (Minimalist, Apple/MNC Polish) ──────────────────────────
  /** Warm, crisp canvas background */
  bg: '#F8FAFC',
  /** Clean white surface for cards, sheets, headers */
  surface: '#FFFFFF',
  /** Subtle background for search inputs, inactive segmented controls */
  surfaceSubtle: '#F1F5F9',
  /** Charcoal typography for maximum readability */
  ink: '#0F172A',
  /** Secondary text, labels, subheads */
  textSecondary: '#475569',
  /** Muted placeholder & subtle timestamp text */
  textMuted: '#94A3B8',
  /** Crisp hairline border */
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  // ── Dark Accent (Used for segmented switch pill and strong headers) ──
  darkPill: '#0F172A',
  darkPillHover: '#1E293B',

  // ── Semantic Status Colors (Used ONLY for functional states) ──────────
  success: '#059669',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',

  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  info: '#0284C7',
  infoLight: '#F0F9FF',
  infoBorder: '#BAE6FD',

  // ── Category Identities (Subtle neutral icon tiles) ──────────────────
  categories: {
    construction: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    factory:      { color: '#334155', bg: '#F1F5F9', border: '#E2E8F0' },
    transport:    { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    retail:       { color: '#334155', bg: '#F1F5F9', border: '#E2E8F0' },
    hospitality:  { color: '#334155', bg: '#F1F5F9', border: '#E2E8F0' },
  },

  // ── Subtle Native Elevation ──────────────────────────────────────────
  shadowColor: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.45)',

  // Backward compatibility alias
  primaryDark: '#0F172A',
  black: '#0F172A',
} as const;

/** Universal Application Status Colors */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:         '#2563EB',
    UNDER_REVIEW:    '#D97706',
    NEGOTIATING:     '#D97706',
    ACCEPTED:        '#059669',
    CONFIRMED:       '#059669',
    CHECKED_IN:      '#0284C7',
    IN_PROGRESS:     '#2563EB',
    COMPLETED:       '#059669',
    PAYMENT_PENDING: '#D97706',
    PAID:            '#059669',
    REJECTED:        '#DC2626',
    WITHDRAWN:       '#94A3B8',
    EXPIRED:         '#94A3B8',
    HIRING:          '#2563EB',
    FULL:            '#059669',
    ACTIVE:          '#2563EB',
    PUBLISHED:       '#2563EB',
    CANCELLED:       '#DC2626',
  };
  return map[status] ?? '#94A3B8';
};

/** Universal Application Status Labels */
export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:         'Applied',
    UNDER_REVIEW:    'In Review',
    NEGOTIATING:     'Counter Offer',
    ACCEPTED:        'Hired ✓',
    CONFIRMED:       'Confirmed',
    CHECKED_IN:      'Checked In',
    IN_PROGRESS:     'Shift Active',
    COMPLETED:       'Work Completed',
    PAYMENT_PENDING: 'Payment Due',
    PAID:            'Paid ✓',
    REJECTED:        'Declined',
    WITHDRAWN:       'Withdrawn',
    EXPIRED:         'Expired',
    HIRING:          'Hiring Open',
    FULL:            'Staffed',
    ACTIVE:          'Active',
    PUBLISHED:       'Open',
    CANCELLED:       'Cancelled',
  };
  return map[status] ?? status;
};
