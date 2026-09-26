// GigEasy Shared Primitives — Production Design System v2
// Warm Ivory · Charcoal · GigEasy Orange · Forest Green Trust Language
// Icon-first. Text only when essential. No badge overload.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { FontFamily, FontSize, BorderRadius } from '../constants';
import { Theme } from '../theme';

// ─── Category Visual Mapping ──────────────────────────────────────────────────
// Icons chosen for immediate physical recognition, not metaphorical abstraction.
export function getCategoryVisual(category: string): {
  iconName: keyof typeof Feather.glyphMap;
  color: string;
  bg: string;
} {
  const cat = category.toLowerCase();
  if (cat.includes('ware') || cat.includes('load') || cat.includes('pack') || cat.includes('logist')) {
    return { iconName: 'package', color: Theme.olive, bg: Theme.oliveLight };
  }
  if (cat.includes('elect') || cat.includes('wiring')) {
    return { iconName: 'zap', color: '#B45309', bg: '#FEF3C7' };
  }
  if (cat.includes('plumb') || cat.includes('pipe')) {
    return { iconName: 'droplet', color: '#1A6B3C', bg: Theme.forestGreenLight };
  }
  if (cat.includes('construct') || cat.includes('mason') || cat.includes('site') || cat.includes('helper')) {
    return { iconName: 'tool', color: Theme.olive, bg: Theme.oliveLight };
  }
  if (cat.includes('deliver') || cat.includes('driv') || cat.includes('fleet') || cat.includes('transport')) {
    return { iconName: 'truck', color: Theme.accent, bg: Theme.accentLight };
  }
  if (cat.includes('clean') || cat.includes('sweep') || cat.includes('maid') || cat.includes('house')) {
    return { iconName: 'wind', color: Theme.forestGreen, bg: Theme.forestGreenLight };
  }
  if (cat.includes('event') || cat.includes('crew') || cat.includes('hospit')) {
    return { iconName: 'star', color: '#B45309', bg: '#FEF3C7' };
  }
  if (cat.includes('paint') || cat.includes('brush')) {
    return { iconName: 'edit-2', color: Theme.accent, bg: Theme.accentLight };
  }
  if (cat.includes('cook') || cat.includes('kitchen') || cat.includes('catering')) {
    return { iconName: 'coffee', color: Theme.accent, bg: Theme.accentLight };
  }
  if (cat.includes('care') || cat.includes('elder') || cat.includes('child')) {
    return { iconName: 'heart', color: Theme.accent, bg: Theme.accentLight };
  }
  if (cat.includes('security') || cat.includes('guard')) {
    return { iconName: 'shield', color: Theme.ink, bg: Theme.surfaceSubtle };
  }
  if (cat.includes('factory') || cat.includes('industr') || cat.includes('assembl')) {
    return { iconName: 'settings', color: Theme.olive, bg: Theme.oliveLight };
  }
  if (cat.includes('appliance') || cat.includes('repair') || cat.includes('fix')) {
    return { iconName: 'tool', color: Theme.olive, bg: Theme.oliveLight };
  }
  return { iconName: 'briefcase', color: Theme.textSecondary, bg: Theme.surfaceSubtle };
}

// ─── GigEasyAvatar ─────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  photoUri?: string;
  size?: number;
  showVerified?: boolean;
  style?: ViewStyle;
}

export const GigEasyAvatar: React.FC<AvatarProps> = ({
  name,
  photoUri,
  size = 48,
  showVerified = false,
  style,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fontSize = size * 0.36;

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.avatarInitials, { fontSize }]}>{initials}</Text>
        </View>
      )}
      {showVerified && (
        <View style={[styles.avatarVerifiedBadge, { width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16 }]}>
          <Feather name="check" size={size * 0.18} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </View>
  );
};

// ─── GigEasyBadge ──────────────────────────────────────────────────────────────
// Restrained. Only used when a text label is genuinely necessary.

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'money' | 'success' | 'warning' | 'error' | 'neutral' | 'verified' | 'olive';
  size?: 'sm' | 'md';
}

export const GigEasyBadge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  const variantMap: Record<string, { bg: string; text: string; border: string }> = {
    primary:  { bg: Theme.sand,           text: Theme.ink,           border: Theme.border },
    accent:   { bg: Theme.accentLight,    text: Theme.accentDark,    border: Theme.accentMuted },
    money:    { bg: Theme.amberLight,     text: Theme.amberDark,     border: Theme.amberBorder },
    verified: { bg: Theme.forestGreenLight, text: Theme.forestGreen, border: Theme.forestGreenBorder },
    success:  { bg: Theme.forestGreenLight, text: Theme.forestGreen, border: Theme.forestGreenBorder },
    warning:  { bg: Theme.warningLight,   text: Theme.warning,       border: Theme.warningBorder },
    error:    { bg: Theme.errorLight,     text: Theme.error,         border: Theme.errorBorder },
    neutral:  { bg: Theme.surfaceSubtle,  text: Theme.textSecondary, border: Theme.border },
    olive:    { bg: Theme.oliveLight,     text: Theme.olive,         border: Theme.oliveMuted },
  };

  const c = variantMap[variant] ?? variantMap.neutral;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingHorizontal: isSm ? 6 : 9,
          paddingVertical: isSm ? 2.5 : 4,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: c.text, fontSize: isSm ? 9.5 : 11 }]}>
        {label}
      </Text>
    </View>
  );
};

// ─── GigEasyRating ─────────────────────────────────────────────────────────────
// Clean: star + number only. Count shown only when explicitly passed.

export const GigEasyRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
  <View style={styles.ratingWrap}>
    <Ionicons name="star" size={11} color="#C07A1A" />
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    {count !== undefined && <Text style={styles.ratingCount}>({count})</Text>}
  </View>
);

// ─── GigEasyTrustScore ─────────────────────────────────────────────────────────

export const GigEasyTrustScore: React.FC<{
  score: number;
  label?: string;
}> = ({ score, label }) => {
  return (
    <View style={styles.trustWrap}>
      <MaterialCommunityIcons name="shield-check" size={12} color={Theme.forestGreen} />
      <Text style={[styles.trustScore, { color: Theme.ink }]}>{score}%</Text>
      {label && <Text style={styles.trustLabel}>· {label}</Text>}
    </View>
  );
};

// ─── GigEasyStatusPill ─────────────────────────────────────────────────────────
// Restrained — thin border, small dot, compact padding.

export const GigEasyStatusPill: React.FC<{
  status: string;
  label: string;
  color?: string;
}> = ({ label, color = Theme.ink }) => (
  <View style={[styles.statusPill, { backgroundColor: color + '12', borderColor: color + '30' }]}>
    <View style={[styles.statusDot, { backgroundColor: color }]} />
    <Text style={[styles.statusLabel, { color }]}>{label}</Text>
  </View>
);

// ─── GigEasyVerifiedBadge ──────────────────────────────────────────────────────
// Small variant: icon-only green dot. Full variant: icon + "Verified" label.

export const GigEasyVerifiedBadge: React.FC<{ small?: boolean }> = ({ small = false }) =>
  small ? (
    // Icon-only — no text noise on card surfaces
    <View style={styles.verifiedDot}>
      <MaterialCommunityIcons name="check-decagram" size={14} color={Theme.forestGreen} />
    </View>
  ) : (
    <View style={styles.verifiedBadge}>
      <MaterialCommunityIcons name="check-decagram" size={13} color={Theme.forestGreen} />
      <Text style={styles.verifiedText}>Verified</Text>
    </View>
  );

// ─── GigEasyCertBadge ──────────────────────────────────────────────────────────

export const GigEasyCertBadge: React.FC<{ label: string; small?: boolean }> = ({ label, small = false }) => (
  <View style={[styles.certBadge, small && styles.certBadgeSmall]}>
    <MaterialCommunityIcons name="certificate" size={small ? 10 : 12} color={Theme.olive} />
    <Text style={[styles.certText, small && { fontSize: 9 }]}>{label}</Text>
  </View>
);

// ─── GigEasyCoopBadge ──────────────────────────────────────────────────────────

export const GigEasyCoopBadge: React.FC<{ name: string; small?: boolean }> = ({ name, small = false }) => (
  <View style={[styles.coopBadge, small && styles.coopBadgeSmall]}>
    <MaterialCommunityIcons name="account-group" size={small ? 10 : 12} color={Theme.accentDark} />
    <Text style={[styles.coopText, small && { fontSize: 9 }]} numberOfLines={1}>{name}</Text>
  </View>
);

// ─── GigEasyEmptyState ─────────────────────────────────────────────────────────

export const GigEasyEmptyState: React.FC<{
  title: string;
  subtitle?: string;
  iconName?: any;
}> = ({ title, subtitle, iconName = 'search' }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconWrap}>
      <Feather name={iconName} size={22} color={Theme.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ─── GigEasyDivider ────────────────────────────────────────────────────────────

export const GigEasyDivider: React.FC<{ label?: string }> = ({ label }) => (
  <View style={styles.dividerWrap}>
    <View style={styles.dividerLine} />
    {label && <Text style={styles.dividerLabel}>{label}</Text>}
    {label && <View style={styles.dividerLine} />}
  </View>
);

// ─── LivePulseDot — animated availability/live indicator ───────────────────────

export const LivePulseDot: React.FC<{ color?: string; size?: number }> = ({
  color = Theme.forestGreen,
  size = 8,
}) => (
  <View style={[styles.liveDotOuter, {
    width: size + 4,
    height: size + 4,
    borderRadius: (size + 4) / 2,
    backgroundColor: color + '28',
  }]}>
    <View style={[styles.liveDotInner, {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }]} />
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Theme.sandLight,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  avatarFallback: {
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.bold,
    color: Theme.textOnDark,
    letterSpacing: -0.5,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: Theme.forestGreen,
    borderWidth: 2,
    borderColor: Theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
    color: Theme.ink,
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: 10.5,
    color: Theme.textMuted,
  },
  trustWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trustScore: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  trustLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
  },
  // Verified — icon-only small variant
  verifiedDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Verified — full badge
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.forestGreenLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.forestGreenBorder,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: Theme.forestGreen,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.oliveLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.oliveMuted,
  },
  certBadgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  certText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: Theme.olive,
  },
  coopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.accentMuted,
  },
  coopBadgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  coopText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: Theme.accentDark,
    maxWidth: 110,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Theme.ink,
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Theme.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.border,
  },
  dividerLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  liveDotOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotInner: {},
});
