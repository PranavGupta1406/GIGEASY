// GigEasy Shared Primitives — Avatar, Badge, Rating, Trust Score, StatusPill, Skeleton
// Premium vector-based design tokens — Deep Teal + Electric Lime + Warm Ivory + Ink

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, BorderRadius, Spacing, Shadow } from '../constants';
import { getTrustColor } from '../data/mockData';

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
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
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
        <View style={styles.avatarVerifiedBadge}>
          <Feather name="check" size={size * 0.22} color="#090D14" strokeWidth={3} />
        </View>
      )}
    </View>
  );
};

// ─── GigEasyBadge ─────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  variant?: 'verified' | 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'match' | 'lime';
  size?: 'sm' | 'md';
}

export const GigEasyBadge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    verified: { bg: '#E8F3F4', text: '#0D3B3F', border: '#C0DFE2' },
    lime: { bg: '#F3FCD4', text: '#090D14', border: '#D9F870' },
    match: { bg: '#0D3B3F', text: '#C8F135', border: '#0D3B3F' },
    primary: { bg: '#E8F3F4', text: '#0D3B3F', border: '#C0DFE2' },
    success: { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
    warning: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    error: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
    neutral: { bg: '#F2F0EB', text: '#4B5565', border: '#E4E1D8' },
  };

  const current = variantStyles[variant] ?? variantStyles.neutral;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.bg,
          borderColor: current.border ?? 'transparent',
          paddingHorizontal: isSm ? 6 : 8,
          paddingVertical: isSm ? 2.5 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: current.text, fontSize: isSm ? 10 : 11 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ─── GigEasyRating ────────────────────────────────────────────────────────────

export const GigEasyRating: React.FC<{ rating: number; count?: number }> = ({
  rating,
  count,
}) => (
  <View style={styles.ratingWrap}>
    <Ionicons name="star" size={12} color="#0D3B3F" />
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    {count !== undefined && (
      <Text style={styles.ratingCount}>({count})</Text>
    )}
  </View>
);

// ─── GigEasyTrustScore ────────────────────────────────────────────────────────

export const GigEasyTrustScore: React.FC<{
  score: number;
  label?: string;
  size?: 'sm' | 'md';
}> = ({ score, label }) => {
  const color = getTrustColor(score);

  return (
    <View style={styles.trustWrap}>
      <MaterialCommunityIcons name="shield-check" size={13} color={color} />
      <Text style={[styles.trustScore, { color }]}>{score}%</Text>
      {label && <Text style={styles.trustLabel}>· {label}</Text>}
    </View>
  );
};

// ─── GigEasyStatusPill ────────────────────────────────────────────────────────

export const GigEasyStatusPill: React.FC<{
  status: string;
  label: string;
  color?: string;
}> = ({ label, color = '#0D3B3F' }) => (
  <View
    style={[
      styles.statusPill,
      { backgroundColor: `${color}12`, borderColor: `${color}25` },
    ]}
  >
    <View style={[styles.statusDot, { backgroundColor: color }]} />
    <Text style={[styles.statusLabel, { color }]}>{label}</Text>
  </View>
);

// ─── GigEasyVerifiedBadge ─────────────────────────────────────────────────────

export const GigEasyVerifiedBadge: React.FC<{ small?: boolean }> = ({
  small = false,
}) => (
  <View style={[styles.verifiedBadge, small && styles.verifiedBadgeSmall]}>
    <MaterialCommunityIcons name="check-decagram" size={small ? 12 : 14} color="#0D3B3F" />
    <Text style={[styles.verifiedText, small && styles.verifiedTextSmall]}>
      Verified
    </Text>
  </View>
);

// ─── GigEasyMatchBadge ────────────────────────────────────────────────────────

export const GigEasyMatchBadge: React.FC<{ score: number }> = ({ score }) => (
  <View style={styles.matchBadge}>
    <View style={styles.matchDot} />
    <Text style={styles.matchBadgeText}>{score}% Match</Text>
  </View>
);

// ─── GigEasySkeleton ──────────────────────────────────────────────────────────

export const GigEasySkeleton: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}> = ({ width, height, borderRadius = 6, style }) => (
  <View
    style={[
      styles.skeleton,
      { width: width as any, height, borderRadius },
      style,
    ]}
  />
);

// ─── GigEasyEmptyState ────────────────────────────────────────────────────────

export const GigEasyEmptyState: React.FC<{
  title: string;
  subtitle?: string;
  iconName?: any;
}> = ({ title, subtitle, iconName = 'search' }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconWrap}>
      <Feather name={iconName} size={24} color="#0D3B3F" />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F2F0EB',
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
  },
  avatarFallback: {
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8F135',
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
    backgroundColor: '#C8F135',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    letterSpacing: 0.2,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E99A8',
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
    color: '#5A6578',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 10,
    letterSpacing: 0.1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  verifiedBadgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: '#0D3B3F',
  },
  verifiedTextSmall: {
    fontSize: 9,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#090D14',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  matchDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8F135',
  },
  matchBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#C8F135',
    letterSpacing: 0.2,
  },
  skeleton: {
    backgroundColor: '#E8E6E0',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[8],
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2.5],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#090D14',
    marginBottom: 2,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    textAlign: 'center',
    maxWidth: 240,
  },
});
