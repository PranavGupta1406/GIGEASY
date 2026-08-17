// GigEasy Design System — Color Tokens
// Signature Brand: Deep Teal (#0D3B3F) + Electric Lime (#C8F135) + Warm Ivory (#F8F7F4) + Ink Slate (#090D14)

export const Colors = {
  // Brand Core
  primary: '#0D3B3F', // Deep Midnight Teal
  primaryDark: '#072427',
  primaryLight: '#E8F3F4',
  primaryMuted: '#F0F7F7',

  // Electric Lime Accent (High-impact data, active state, radar, badges)
  lime: '#C8F135',
  limeDark: '#9FC417',
  limeLight: '#F3FCD4',
  limeMuted: '#F9FEE8',

  // Accent & Secondary
  accent: '#0D3B3F',
  accentLime: '#C8F135',
  accentCoral: '#FA5A2A',

  // Dark & Neutrals (Ink Slate scale)
  dark: '#090D14',
  darkElevated: '#121822',
  darkCard: '#19222E',
  darkBorder: '#293547',
  darkSurface: '#0E131C',

  // Light Background & Surfaces (Warm Ivory / Bone)
  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F2F0EB',
  border: '#E8E6E0',
  borderLight: '#F2F0EB',
  borderDark: '#D4D1C8',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#047857',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Text
  textPrimary: '#090D14',
  textSecondary: '#5A6578',
  textTertiary: '#8E99A8',
  textDisabled: '#CBD5E1',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',
  textOnLime: '#090D14',

  // Status pills
  statusApplied: '#0284C7',
  statusAccepted: '#10B981',
  statusRejected: '#EF4444',
  statusPending: '#F59E0B',
  statusActive: '#0D3B3F',
  statusCompleted: '#059669',

  // Trust score
  trustExcellent: '#10B981',
  trustGood: '#84CC16',
  trustFair: '#F59E0B',
  trustPoor: '#EF4444',

  // Navigation
  tabActive: '#0D3B3F',
  tabActiveLime: '#C8F135',
  tabInactive: '#8E99A8',
  tabBackground: '#FFFFFF',

  // Card
  cardBackground: '#FFFFFF',
  cardBorder: '#E8E6E0',
  cardShadow: 'rgba(9, 13, 20, 0.04)',

  // Overlays
  overlay: 'rgba(9, 13, 20, 0.65)',
  overlayLight: 'rgba(9, 13, 20, 0.12)',

  // Verified badge
  verified: '#0D3B3F',
  verifiedBackground: '#E8F3F4',
  verifiedLime: '#C8F135',
} as const;

export type ColorKey = keyof typeof Colors;
