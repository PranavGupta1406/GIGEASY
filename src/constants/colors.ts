// GigEasy Design System — Color Tokens
// Brand: Vibrant Primary Blue (#1A68D5) · Warm Rupee Amber (#EA580C) · Clean Off-White (#F8FAFC)
// Colourful, consumer-grade, high-energy, premium Indian marketplace design system.

export const Colors = {
  // ── Brand Blue Core ────────────────────────────────────────────────────────
  primary: '#1A68D5',          // Vibrant signature brand blue — energetic & trusted
  primaryDark: '#124FA8',      // Deep rich blue for pressed / gradient anchor
  primaryMedium: '#2575E6',    // Mid blue for hover & interaction
  primaryLight: '#D6E6FA',     // Soft pastel blue for highlights
  primaryMuted: '#EBF3FC',     // Lightest blue surface wash for icons & badges
  primarySurface: '#F1F6FD',   // Subtle tint for active rows

  // ── Money / Payout / Wage Accent (High-Visibility Warm Amber-Orange) ────────
  money: '#EA580C',            // Warm high-energy orange for ₹ amounts & payouts
  moneyDark: '#C2410C',
  moneyLight: '#FFEDD5',
  moneyMuted: '#FFF7ED',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',

  // ── Backgrounds & Neutrals ─────────────────────────────────────────────────
  background: '#F8FAFC',       // Clean, crisp warm off-white main background
  surface: '#FFFFFF',          // Pure white for cards & elevated components
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',    // Soft grey surface for alternate rows
  border: '#E2E8F0',           // Clean modern border
  borderLight: '#EDF2F7',      // Very subtle divider
  borderDark: '#CBD5E1',       // High-contrast border

  // ── Typography / Ink ───────────────────────────────────────────────────────
  dark: '#0F172A',             // Slate dark primary text (rich & crisp)
  darkElevated: '#1E293B',
  textPrimary: '#0F172A',      // Headings & primary labels
  textSecondary: '#475569',    // Secondary descriptions
  textTertiary: '#64748B',     // Metadata, location, timestamps
  textDisabled: '#94A3B8',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // ── Category Visual Accents (For Job & Skill Cards) ────────────────────────
  catWarehouse: '#EA580C',
  catWarehouseBg: '#FFEDD5',
  catElectrical: '#D97706',
  catElectricalBg: '#FEF3C7',
  catPlumbing: '#0284C7',
  catPlumbingBg: '#E0F2FE',
  catConstruction: '#B45309',
  catConstructionBg: '#FEF3C7',
  catDelivery: '#16A34A',
  catDeliveryBg: '#DCFCE7',
  catCleaning: '#0D9488',
  catCleaningBg: '#CCFBF1',
  catEvents: '#7C3AED',
  catEventsBg: '#F3E8FF',
  catHospitality: '#DB2777',
  catHospitalityBg: '#FCE7F3',

  // ── Semantic ───────────────────────────────────────────────────────────────
  success: '#10B981',          // Emerald green for verified & completed states
  successLight: '#D1FAE5',
  successDark: '#047857',
  error: '#EF4444',            // Clean alert red
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#1A68D5',
  infoLight: '#EBF3FC',

  // ── Navigation ─────────────────────────────────────────────────────────────
  tabActive: '#1A68D5',
  tabInactive: '#94A3B8',
  tabBackground: '#FFFFFF',

  // ── Cards ──────────────────────────────────────────────────────────────────
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: 'rgba(15, 23, 42, 0.05)',

  // ── Overlays ───────────────────────────────────────────────────────────────
  overlay: 'rgba(15, 23, 42, 0.60)',
  overlayLight: 'rgba(15, 23, 42, 0.06)',

  // ── Status Pills ───────────────────────────────────────────────────────────
  statusApplied: '#1A68D5',
  statusAccepted: '#10B981',
  statusRejected: '#EF4444',
  statusPending: '#F59E0B',
  statusActive: '#1A68D5',
  statusCompleted: '#10B981',

  // ── Backward-compatible Aliases ────────────────────────────────────────────
  accent: '#1A68D5',
  lime: '#1A68D5',
  teal: '#0D9488',
  primaryNavy: '#0F172A',
  verified: '#1A68D5',
  verifiedBackground: '#EBF3FC',
  navy: '#0F172A',
  navyLight: '#EBF3FC',
} as const;

export type ColorKey = keyof typeof Colors;
