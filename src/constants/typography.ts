// GigEasy Typography System
// Font: Inter (Google Fonts)

import { Platform } from 'react-native';

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  // Fallback
  system: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 26,
  '4xl': 30,
  '5xl': 36,
  display: 40,
} as const;

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1.0,
} as const;

// Pre-built text style objects
export const TextStyles = {
  display: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.display,
    lineHeight: FontSize.display * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'] * LineHeight.snug,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * LineHeight.snug,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * LineHeight.snug,
  },
  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.snug,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.snug,
  },
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    letterSpacing: LetterSpacing.normal,
  },
  buttonSm: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    letterSpacing: LetterSpacing.tight,
  },
  priceDisplay: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    letterSpacing: LetterSpacing.tight,
  },
  tag: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
} as const;
