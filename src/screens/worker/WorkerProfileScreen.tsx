// Worker Profile Screen — Digital Work Identity + Trust Score Breakdown
// Deep Teal + Electric Lime + Warm Ivory

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { CURRENT_WORKER, formatWage } from '../../data/mockData';
import { useWorkerStore, useAuthStore } from '../../store';
import { signOutUser } from '../../services/firebase';
import { Skill } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  shellNavigation: NavProp;
  onSwitchMode?: () => void;
}

export const WorkerProfileScreen: React.FC<Props> = ({ shellNavigation, onSwitchMode }) => {
  const storeProfile = useWorkerStore((s) => s.profile);
  const authName = useAuthStore((s) => s.name);
  const authEmail = useAuthStore((s) => s.email);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authUserId = useAuthStore((s) => s.userId);
  const authKyc = useAuthStore((s) => s.kycStatus);
  const logout = useAuthStore((s) => s.logout);

  const worker = storeProfile ?? {
    ...CURRENT_WORKER,
    name: authName || CURRENT_WORKER.name,
    phoneNumber: authPhone || CURRENT_WORKER.phoneNumber,
    verificationStatus: (authKyc as any) || CURRENT_WORKER.verificationStatus,
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOutUser().catch(() => {});
          logout();
          shellNavigation.replace('Welcome');
        },
      },
    ]);
  };

  const trustBreakdown = [
    { label: 'Identity Verified', detail: 'Aadhaar + Phone Verified', pts: 30, max: 30 },
    { label: 'Punctuality', detail: '98% on-time GPS check-in', pts: 25, max: 25 },
    { label: 'Completion Rate', detail: '47 gigs, zero disputes', pts: 25, max: 25 },
    { label: 'Employer Ratings', detail: 'Average 4.9 / 5.0 rating', pts: 16, max: 20 },
  ];

  const initials = (worker.name || 'Worker')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header actions */}
      <View style={styles.headerRow}>
        <Text style={styles.screenLabel}>Digital Work Identity</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Feather name="log-out" size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Identity hero card */}
      <View style={styles.heroCard}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          {worker.verificationStatus === 'verified' && (
            <View style={styles.verifiedDot}>
              <Feather name="check" size={10} color="#090D14" strokeWidth={3} />
            </View>
          )}
        </View>

        <Text style={styles.workerName}>{worker.name}</Text>
        <Text style={styles.workerLocation}>{worker.location?.city || 'Noida'}, {worker.location?.state || 'UP'}</Text>

        {/* Trust score ring display */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreLeft}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#C8F135" />
            <View>
              <Text style={styles.trustNum}>{worker.trustScore}%</Text>
              <Text style={styles.trustLabel}>Trust Score · High Trust</Text>
            </View>
          </View>
          <View style={styles.verifiedBadgeHero}>
            <Text style={styles.verifiedBadgeText}>
              {authKyc === 'verified' ? 'KYC VERIFIED' : 'KYC PENDING'}
            </Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{worker.completedJobs}</Text>
            <Text style={styles.statLabel}>Gigs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{worker.rating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{worker.experienceYears}y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{formatWage(worker.expectedDailyWage)}</Text>
            <Text style={styles.statLabel}>Benchmark</Text>
          </View>
        </View>
      </View>

      {/* Account Credentials Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Credentials</Text>
        <View style={styles.credentialsCard}>
          <View style={styles.credRow}>
            <View style={styles.credIconWrap}>
              <Feather name="mail" size={14} color="#0D3B3F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.credLabel}>EMAIL</Text>
              <Text style={styles.credValue}>{authEmail || 'worker@gigeasy.app'}</Text>
            </View>
          </View>

          <View style={styles.credDivider} />

          <View style={styles.credRow}>
            <View style={styles.credIconWrap}>
              <Feather name="phone" size={14} color="#0D3B3F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.credLabel}>MOBILE NUMBER</Text>
              <Text style={styles.credValue}>{authPhone ? `+91 ${authPhone}` : '+91 98765 43210'}</Text>
            </View>
          </View>

          <View style={styles.credDivider} />

          <View style={styles.credRow}>
            <View style={styles.credIconWrap}>
              <Feather name="key" size={14} color="#0D3B3F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.credLabel}>FIREBASE USER ID</Text>
              <Text style={styles.credValueMono} numberOfLines={1} ellipsizeMode="middle">
                {authUserId || 'guest_worker_session'}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>WORKER</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Verified Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verified Skills</Text>
        <View style={styles.skillsRow}>
          {(worker.skills || []).map((skill: Skill) => (
            <View key={skill.id} style={styles.skillChip}>
              <Feather name="check" size={11} color="#0D3B3F" strokeWidth={2.5} />
              <Text style={styles.skillText}>{skill.name}</Text>
            </View>
          ))}
          <View style={[styles.skillChip, { backgroundColor: '#F2F0EB', borderColor: '#E8E6E0' }]}>
            <Text style={[styles.skillText, { color: '#5A6578' }]}>+{Math.max(0, worker.experienceYears - 1)} more verified</Text>
          </View>
        </View>
      </View>

      {/* Trust breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trust Breakdown</Text>
          <Text style={styles.trustTotal}>{worker.trustScore} / 100 PTS</Text>
        </View>
        {trustBreakdown.map((item) => (
          <View key={item.label} style={styles.trustRow}>
            <View style={styles.trustRowLeft}>
              <Text style={styles.trustRowLabel}>{item.label}</Text>
              <Text style={styles.trustRowDetail}>{item.detail}</Text>
            </View>
            <View style={styles.trustRowRight}>
              <Text style={styles.trustPts}>{item.pts}/{item.max}</Text>
              <View style={styles.trustBar}>
                <View
                  style={[
                    styles.trustBarFill,
                    { width: `${(item.pts / item.max) * 100}%` as any },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Preferences & Radius */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.prefGrid}>
          <View style={styles.prefItem}>
            <Feather name="navigation" size={14} color="#0D3B3F" />
            <Text style={styles.prefLabel}>Operating Radius</Text>
            <Text style={styles.prefValue}>Within {worker.preferredRadius} km</Text>
          </View>
          <View style={styles.prefItem}>
            <Feather name="globe" size={14} color="#0D3B3F" />
            <Text style={styles.prefLabel}>Languages</Text>
            <Text style={styles.prefValue}>{worker.languages.join(', ')}</Text>
          </View>
        </View>
      </View>

      {/* Switch mode */}
      {onSwitchMode && (
        <TouchableOpacity style={styles.switchCard} onPress={onSwitchMode} activeOpacity={0.88}>
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <Feather name="briefcase" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.switchTitle}>Looking to hire workers?</Text>
              <Text style={styles.switchSub}>Switch to Hire Workers mode</Text>
            </View>
          </View>
          <Feather name="arrow-right" size={18} color="#090D14" />
        </TouchableOpacity>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scrollContent: { paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: '#090D14', letterSpacing: -0.3 },
  logoutBtn: { padding: 4 },

  // Hero
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C8F135',
  },
  avatarInitials: { fontFamily: FontFamily.bold, fontSize: 24, color: '#FFFFFF' },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  workerName: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: '#090D14', letterSpacing: -0.4 },
  workerLocation: { fontFamily: FontFamily.regular, fontSize: 12, color: '#5A6578', marginTop: 2, marginBottom: 14 },

  trustScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#090D14',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  trustScoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustNum: {
    fontFamily: FontFamily.extraBold,
    fontSize: 18,
    color: '#C8F135',
    letterSpacing: -0.5,
  },
  trustLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#8E99A8',
  },
  verifiedBadgeHero: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 8,
    color: '#C8F135',
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F2F0EB',
    borderRadius: 12,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14', letterSpacing: -0.2 },
  statLabel: { fontFamily: FontFamily.medium, fontSize: 9, color: '#5A6578', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E8E6E0' },

  // Sections
  section: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#090D14', marginBottom: 10 },
  trustTotal: { fontFamily: FontFamily.bold, fontSize: 11, color: '#0D3B3F' },

  // Skills
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  skillText: { fontFamily: FontFamily.bold, fontSize: 11, color: '#0D3B3F' },

  // Trust breakdown
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F0EB',
  },
  trustRowLeft: { flex: 1, marginRight: 12 },
  trustRowLabel: { fontFamily: FontFamily.semiBold, fontSize: 12, color: '#090D14', marginBottom: 1 },
  trustRowDetail: { fontFamily: FontFamily.regular, fontSize: 10, color: '#5A6578' },
  trustRowRight: { alignItems: 'flex-end', minWidth: 52 },
  trustPts: { fontFamily: FontFamily.bold, fontSize: 11, color: '#0D3B3F', marginBottom: 4 },
  trustBar: { width: 52, height: 3, backgroundColor: '#F2F0EB', borderRadius: 2, overflow: 'hidden' },
  trustBarFill: { height: '100%', backgroundColor: '#0D3B3F', borderRadius: 2 },

  // Preferences
  prefGrid: { flexDirection: 'row', gap: 10 },
  prefItem: {
    flex: 1,
    backgroundColor: '#F2F0EB',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  prefLabel: { fontFamily: FontFamily.medium, fontSize: 10, color: '#5A6578' },
  prefValue: { fontFamily: FontFamily.bold, fontSize: 12, color: '#090D14' },

  // Switch mode card
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#090D14',
    ...Shadow.xs,
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#090D14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14' },
  switchSub: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },

  // Credentials Card
  credentialsCard: {
    backgroundColor: '#F8F7F4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 8,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  credIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#8E99A8',
  },
  credValue: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#090D14',
    marginTop: 1,
  },
  credValueMono: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
    marginTop: 1,
  },
  credDivider: {
    height: 1,
    backgroundColor: '#E8E6E0',
    marginVertical: 2,
  },
  roleBadge: {
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  roleBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
    letterSpacing: 0.5,
  },
});
