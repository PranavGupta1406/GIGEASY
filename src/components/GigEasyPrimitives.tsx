// GigEasy Shared Primitives — Consumer Brand Palette (#1A68D5)
// Avatar · Visual Badge · Rating · StatusPill · Verified · CategoryIcon

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

const T = {
  primary: '#1A68D5',
  primaryLight: '#D6E6FA',
  primaryMuted: '#EBF3FC',
  money: '#EA580C',
  moneyLight: '#FFEDD5',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
};

// Category icon & color mapping helper
export function getCategoryVisual(category: string): {
  iconName: keyof typeof Feather.glyphMap;
  color: string;
  bg: string;
} {
  const cat = category.toLowerCase();
  if (cat.includes('ware') || cat.includes('load') || cat.includes('pack')) {
    return { iconName: 'package', color: '#EA580C', bg: '#FFEDD5' };
  }
  if (cat.includes('elect')) {
    return { iconName: 'zap', color: '#D97706', bg: '#FEF3C7' };
  }
  if (cat.includes('plumb')) {
    return { iconName: 'tool', color: '#0284C7', bg: '#E0F2FE' };
  }
  if (cat.includes('construct') || cat.includes('mason') || cat.includes('site')) {
    return { iconName: 'layers', color: '#B45309', bg: '#FEF3C7' };
  }
  if (cat.includes('deliver') || cat.includes('driv') || cat.includes('fleet')) {
    return { iconName: 'truck', color: '#16A34A', bg: '#DCFCE7' };
  }
  if (cat.includes('clean') || cat.includes('house')) {
    return { iconName: 'check-circle', color: '#0D9488', bg: '#CCFBF1' };
  }
  if (cat.includes('event') || cat.includes('crew')) {
    return { iconName: 'calendar', color: '#7C3AED', bg: '#F3E8FF' };
  }
  if (cat.includes('cook') || cat.includes('hosp') || cat.includes('kitchen')) {
    return { iconName: 'coffee', color: '#DB2777', bg: '#FCE7F3' };
  }
  return { iconName: 'briefcase', color: '#1A68D5', bg: '#EBF3FC' };
}

// ─── GigEasyAvatar ────────────────────────────────────────────────────────────

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
        <View style={[styles.avatarVerifiedBadge, { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17 }]}>
          <Feather name="check" size={size * 0.20} color={T.white} strokeWidth={3} />
        </View>
      )}
    </View>
  );
};

// ─── GigEasyBadge ─────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'money' | 'success' | 'warning' | 'error' | 'neutral' | 'verified';
  size?: 'sm' | 'md';
}

export const GigEasyBadge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  const variantMap: Record<string, { bg: string; text: string; border: string }> = {
    primary:  { bg: T.primaryMuted, text: T.primary,   border: T.primaryLight },
    money:    { bg: T.moneyLight,   text: T.money,     border: '#FED7AA' },
    verified: { bg: T.primaryMuted, text: T.primary,   border: T.primaryLight },
    success:  { bg: T.successLight, text: '#047857',   border: '#A7F3D0' },
    warning:  { bg: '#FEF3C7',      text: '#B45309',   border: '#FDE68A' },
    error:    { bg: '#FEE2E2',      text: '#B91C1C',   border: '#FECACA' },
    neutral:  { bg: '#F1F5F9',      text: T.textSecondary, border: T.border },
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
      <Text style={[styles.badgeText, { color: c.text, fontSize: isSm ? 10 : 11 }]}>
        {label}
      </Text>
    </View>
  );
};

// ─── GigEasyRating ────────────────────────────────────────────────────────────

export const GigEasyRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
  <View style={styles.ratingWrap}>
    <Ionicons name="star" size={12} color="#F59E0B" />
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    {count !== undefined && <Text style={styles.ratingCount}>({count})</Text>}
  </View>
);

// ─── GigEasyTrustScore ────────────────────────────────────────────────────────

export const GigEasyTrustScore: React.FC<{
  score: number;
  label?: string;
}> = ({ score, label }) => {
  return (
    <View style={styles.trustWrap}>
      <MaterialCommunityIcons name="shield-check" size={13} color={T.primary} />
      <Text style={[styles.trustScore, { color: T.primary }]}>{score}%</Text>
      {label && <Text style={styles.trustLabel}>· {label}</Text>}
    </View>
  );
};

// ─── GigEasyStatusPill ────────────────────────────────────────────────────────

export const GigEasyStatusPill: React.FC<{
  status: string;
  label: string;
  color?: string;
}> = ({ label, color = T.primary }) => (
  <View style={[styles.statusPill, { backgroundColor: `${color}14`, borderColor: `${color}30` }]}>
    <View style={[styles.statusDot, { backgroundColor: color }]} />
    <Text style={[styles.statusLabel, { color }]}>{label}</Text>
  </View>
);

// ─── GigEasyVerifiedBadge ─────────────────────────────────────────────────────

export const GigEasyVerifiedBadge: React.FC<{ small?: boolean }> = ({ small = false }) => (
  <View style={[styles.verifiedBadge, small && styles.verifiedBadgeSmall]}>
    <MaterialCommunityIcons name="check-decagram" size={small ? 12 : 14} color={T.primary} />
    <Text style={[styles.verifiedText, small && { fontSize: 9.5 }]}>Verified</Text>
  </View>
);

// ─── GigEasyEmptyState ────────────────────────────────────────────────────────

export const GigEasyEmptyState: React.FC<{
  title: string;
  subtitle?: string;
  iconName?: any;
}> = ({ title, subtitle, iconName = 'search' }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconWrap}>
      <Feather name={iconName} size={24} color={T.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: T.primaryMuted,
    borderWidth: 1.5,
    borderColor: T.primaryLight,
  },
  avatarFallback: {
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: T.success,
    borderWidth: 2,
    borderColor: T.white,
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
    fontSize: FontSize.xs,
    color: T.ink,
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textMuted,
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
    color: T.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    fontSize: 11,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  verifiedBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: T.primary,
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
    borderRadius: 26,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: T.ink,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});
