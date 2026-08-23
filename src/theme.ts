/**
 * GigEasy Universal Design System Tokens
 * 
 * Direction: Apple-level polish + MNC Consumer Marketplace confidence
 * Palette: Sophisticated Cobalt / Midnight Navy primary family with warm slate neutrals
 * Semantic colors ONLY for status (success, error, warning). No competing brand colors.
 */

export const Theme = {
  // ── Primary Brand Family ──────────────────────────────────────────────
  /** Deep vibrant royal cobalt — universal primary action, key accents */
  primary: '#1D4ED8',
  /** Midnight navy — headers, dark emphasis, prominent text */
  primaryDark: '#0F172A',
  /** Vibrant highlight blue */
  primaryVibrant: '#2563EB',
  /** Subtle ice tint — active item background, soft highlights */
  primaryLight: '#EFF6FF',
  /** Soft border for active cards/pills */
  primaryBorder: '#BFDBFE',
  /** Muted blue for secondary elements */
  primaryMuted: '#DBEAFE',

  // ── Neutrals (Apple-style Slate Scale) ─────────────────────────────────
  /** Canvas background — crisp, warm neutral */
  bg: '#F8FAFC',
  /** Pure white surface — cards, sheets, modals */
  surface: '#FFFFFF',
  /** Subtle surface — search bars, inactive chips, pill backgrounds */
  surfaceSubtle: '#F1F5F9',
  /** Deep charcoal typography — highest contrast */
  ink: '#0F172A',
  /** Secondary text, labels, subheads */
  textSecondary: '#475569',
  /** Muted placeholder & timestamp text */
  textMuted: '#94A3B8',
  /** Hairline crisp borders */
  border: '#E2E8F0',
  /** Hover & divider border */
  borderSubtle: '#F1F5F9',

  // ── Semantic Status Colors (Used ONLY for functional states) ───────────
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

  // ── Category Identities (Subtle, refined tints for icon tiles only) ────
  categories: {
    construction: { color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0' },
    factory:      { color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0' },
    transport:    { color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0' },
    retail:       { color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0' },
    hospitality:  { color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0' },
  },

  // ── Shadows & Overlays ────────────────────────────────────────────────
  shadowColor: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.6)',
} as const;

/** Universal Application Status Colors */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:       '#2563EB',
    UNDER_REVIEW:  '#D97706',
    NEGOTIATING:   '#D97706',
    ACCEPTED:      '#059669',
    CONFIRMED:     '#059669',
    CHECKED_IN:    '#0284C7',
    IN_PROGRESS:   '#2563EB',
    COMPLETED:     '#059669',
    PAID:          '#059669',
    REJECTED:      '#DC2626',
    WITHDRAWN:     '#94A3B8',
    EXPIRED:       '#94A3B8',
    HIRING:        '#2563EB',
    FULL:          '#059669',
    ACTIVE:        '#2563EB',
    PUBLISHED:     '#2563EB',
    CANCELLED:     '#DC2626',
  };
  return map[status] ?? '#94A3B8';
};

/** Universal Application Status Labels */
export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    APPLIED:       'Applied',
    UNDER_REVIEW:  'In Review',
    NEGOTIATING:   'Counter Offer',
    ACCEPTED:      'Accepted ✓',
    CONFIRMED:     'Confirmed',
    CHECKED_IN:    'Checked In',
    IN_PROGRESS:   'Shift Active',
    COMPLETED:     'Work Completed',
    PAID:          'Paid ✓',
    REJECTED:      'Declined',
    WITHDRAWN:     'Withdrawn',
    EXPIRED:       'Expired',
    HIRING:        'Hiring Open',
    FULL:          'Staffed',
    ACTIVE:        'Active',
    PUBLISHED:     'Open',
    CANCELLED:     'Cancelled',
  };
  return map[status] ?? status;
};
