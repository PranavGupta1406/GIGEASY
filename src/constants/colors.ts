// GigEasy Design System — White-First Color Tokens
// Clean White · Deep Charcoal · Muted Terracotta · Soft Sage · Warm Amber · Clean Taupe
// Philosophy: Real human product, trustworthy, Indian, premium. NO blue. NO neon. NO artificial brown washes.

export const Colors = {
  // ── Primary Actions & Structure ───────────────────────────────────────────
  primary: '#18181B',          // Deep charcoal — primary structure & high-priority text
  primaryDark: '#09090B',      // Deepest for pressed states
  primaryMedium: '#27272A',    // Mid charcoal
  primaryLight: '#FDF2EE',     // Soft terracotta tint — selection surfaces
  primaryMuted: '#F4F4F0',     // Clean neutral for borders / dividers
  primarySurface: '#FFFFFF',   // Pure white canvas

  // ── Terracotta Accent (Primary CTAs) ──────────────────────────────────────
  accent: '#C84B26',           // Muted terracotta — CTAs, active states
  accentDark: '#A93B1B',       // Pressed terracotta
  accentLight: '#FDF2EE',      // Soft terracotta chip backgrounds
  accentMuted: '#F0D5CC',      // Warm terracotta border
  burntOrange: '#E06D3B',

  // ── Value / Wage Accent (Warm Amber) ──────────────────────────────────────
  money: '#B45309',            // Warm amber for rupee amounts
  moneyDark: '#92400E',
  moneyLight: '#FEF3C7',
  moneyMuted: '#FDE68A',
  amber: '#B45309',
  amberLight: '#FEF3C7',
  amberBorder: '#FDE68A',

  // ── Backgrounds & Surfaces (White-First) ──────────────────────────────────
  background: '#FFFFFF',       // Pure white canvas
  surface: '#FFFFFF',          // Pure white card surface
  surfaceElevated: '#FFFFFF',  // White elevated modals
  surfaceSubtle: '#FBFBF9',    // Clean subtle neutral for inputs & alternate rows
  sand: '#F4F4F0',
  sandLight: '#FAFAF8',
  sandDark: '#E5E5E0',
  border: '#E5E5E0',           // Clean taupe border
  borderLight: '#F0F0EB',      // Subtle divider
  borderDark: '#D4D4CE',       // Strong border

  // ── Typography / Ink ──────────────────────────────────────────────────────
  dark: '#18181B',             // Primary text
  darkElevated: '#27272A',
  textPrimary: '#18181B',
  textSecondary: '#52525B',    // Legible neutral secondary
  textTertiary: '#71717A',     // Muted metadata
  textDisabled: '#A1A1AA',
  textMuted: '#71717A',
  textOnPrimary: '#FFFFFF',    // White on dark buttons
  textOnDark: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // ── Olive / Cooperative Accent ────────────────────────────────────────────
  olive: '#5A6349',            // Cooperative, sustainable
  oliveDark: '#444C36',
  oliveLight: '#F2F4ED',
  oliveMuted: '#C2C8B4',

  // ── Category Visual Accents (Restrained) ──────────────────────────────────
  catWarehouse: '#5A6349',
  catWarehouseBg: '#F2F4ED',
  catElectrical: '#B45309',
  catElectricalBg: '#FEF3C7',
  catPlumbing: '#18181B',
  catPlumbingBg: '#F4F4F0',
  catConstruction: '#5A6349',
  catConstructionBg: '#F2F4ED',
  catDelivery: '#C84B26',
  catDeliveryBg: '#FDF2EE',
  catCleaning: '#2E7D5B',
  catCleaningBg: '#EBF5EF',
  catEvents: '#B45309',
  catEventsBg: '#FEF3C7',
  catHospitality: '#C84B26',
  catHospitalityBg: '#FDF2EE',

  // ── Semantic Statuses (Soft Sage / Amber / Red) ───────────────────────────
  success: '#2E7D5B',          // Soft Sage for verified / success
  successLight: '#EBF5EF',
  successDark: '#1E583F',
  error: '#C0392B',            // Deep warm red
  errorLight: '#FDECEA',
  warning: '#B45309',          // Warm amber
  warningLight: '#FEF3C7',
  info: '#18181B',
  infoLight: '#F4F4F0',

  // ── Navigation (Clean White) ──────────────────────────────────────────────
  tabActive: '#C84B26',        // Terracotta for active tab
  tabInactive: '#71717A',      // Charcoal neutral
  tabBackground: '#FFFFFF',    // Pure white nav background
  tabBorder: '#EAEAE5',

  // ── Cards ─────────────────────────────────────────────────────────────────
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E5E0',
  cardShadow: 'rgba(24, 24, 27, 0.04)',

  // ── Overlays ──────────────────────────────────────────────────────────────
  overlay: 'rgba(24, 24, 27, 0.5)',
  overlayLight: 'rgba(24, 24, 27, 0.04)',

  // ── Status Pills ──────────────────────────────────────────────────────────
  statusApplied: '#18181B',
  statusAccepted: '#2E7D5B',
  statusRejected: '#C0392B',
  statusPending: '#B45309',
  statusActive: '#C84B26',
  statusCompleted: '#2E7D5B',

  // ── Backward-compatible Aliases ───────────────────────────────────────────
  accentBlue: '#18181B',       // Mapped to charcoal — NO BLUE
  lime: '#5A6349',
  teal: '#2E7D5B',
  primaryNavy: '#18181B',
  verified: '#2E7D5B',
  verifiedBackground: '#EBF5EF',
  navy: '#18181B',
  navyLight: '#FDF2EE',
} as const;

export type ColorKey = keyof typeof Colors;
