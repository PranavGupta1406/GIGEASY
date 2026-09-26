// Employer Profile Screen — Business identity + verification + switch mode
// Warm Premium Palette: Charcoal · Ivory · Terracotta

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { CURRENT_EMPLOYER, MOCK_JOBS } from '../../data/mockData';
import { useEmployerStore, useAuthStore } from '../../store';
import { authService } from '../../services/firebase';

import { Theme } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  shellNavigation: NavProp;
  onSwitchMode?: () => void;
}

const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryDark: Theme.primaryDark,
  primaryLight: Theme.primaryLight,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
};

export const EmployerProfileScreen: React.FC<Props> = ({ shellNavigation, onSwitchMode }) => {
  const storeProfile = useEmployerStore((s) => s.profile);
  const authName = useAuthStore((s) => s.name);
  const authEmail = useAuthStore((s) => s.email);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authUserId = useAuthStore((s) => s.userId);
  const authKyc = useAuthStore((s) => s.kycStatus);
  const logout = useAuthStore((s) => s.logout);

  const employer = storeProfile ?? {
    ...CURRENT_EMPLOYER,
    id: authUserId || CURRENT_EMPLOYER.id,
    businessName: authName || (authPhone ? 'New Business' : CURRENT_EMPLOYER.businessName),
    contactName: authName || (authPhone ? 'New Employer' : CURRENT_EMPLOYER.contactName),
    contactEmail: authEmail || CURRENT_EMPLOYER.contactEmail,
    contactPhone: authPhone || CURRENT_EMPLOYER.contactPhone,
    verificationStatus: (authKyc as any) || CURRENT_EMPLOYER.verificationStatus,
  };

  const totalJobs = MOCK_JOBS.filter(j => j.employerId === employer.id).length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOutFirebase();
          logout();
          shellNavigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header actions */}
      <View style={styles.headerRow}>
        <Text style={styles.screenLabel}>Business Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Feather name="log-out" size={17} color="#D95050" />
        </TouchableOpacity>
      </View>

      {/* Business hero */}
      <View style={styles.heroCard}>
        <View style={styles.businessAvatar}>
          <Text style={styles.businessInitials}>{employer.businessName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.businessName}>{employer.businessName}</Text>
        <Text style={styles.businessType}>{employer.businessType}</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={T.textSecondary} />
          <Text style={styles.locationText}>{employer.location.city}, {employer.location.state}</Text>
        </View>

        {employer.verificationStatus === 'verified' && (
          <View style={styles.verifiedBanner}>
            <MaterialCommunityIcons name="check-decagram" size={13} color={T.primary} />
            <Text style={styles.verifiedText}>GST Verified Business</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{employer.totalJobsPosted}</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{employer.rating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>Reliability</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{totalJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
        </View>
      </View>

      {/* Escrow balance */}
      <View style={styles.escrowCard}>
        <View style={styles.escrowLeft}>
          <MaterialCommunityIcons name="shield-lock" size={20} color={T.primary} />
          <View>
            <Text style={styles.escrowTitle}>GigEasy Escrow Protection</Text>
            <Text style={styles.escrowSub}>₹12,400 locked for upcoming shifts</Text>
          </View>
        </View>
      </View>

      {/* Business Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Verification</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact Person</Text>
          <Text style={styles.detailValue}>{employer.contactName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Industry Sector</Text>
          <Text style={styles.detailValue}>{employer.businessType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Operating Address</Text>
          <Text style={styles.detailValue}>{employer.location.address}</Text>
        </View>
      </View>

      {/* Switch mode */}
      {onSwitchMode && (
        <TouchableOpacity style={styles.switchCard} onPress={onSwitchMode} activeOpacity={0.88}>
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <Feather name="user" size={16} color={T.white} />
            </View>
            <View>
              <Text style={styles.switchTitle}>Looking for work yourself?</Text>
              <Text style={styles.switchSub}>Switch to Find Work mode</Text>
            </View>
          </View>
          <Feather name="arrow-right" size={18} color={T.primary} />
        </TouchableOpacity>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: T.ink, letterSpacing: -0.3 },
  logoutBtn: { padding: 4 },
  heroCard: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  businessAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  businessInitials: { fontFamily: FontFamily.bold, fontSize: 22, color: T.white },
  businessName: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: T.ink },
  businessType: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 12 },
  locationText: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: T.primaryLight,
    marginBottom: 14,
  },
  verifiedText: { fontFamily: FontFamily.bold, fontSize: 10, color: T.primary },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: T.bg,
    borderRadius: 12,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: FontFamily.bold, fontSize: 13, color: T.ink },
  statLabel: { fontFamily: FontFamily.medium, fontSize: 9, color: T.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: T.border },
  escrowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: T.primaryMuted,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  escrowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  escrowTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: T.ink },
  escrowSub: { fontFamily: FontFamily.medium, fontSize: 11, color: T.primary, marginTop: 1 },
  section: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: T.ink, marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  detailLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary },
  detailValue: { fontFamily: FontFamily.bold, fontSize: 12, color: T.ink },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Theme.accentMuted,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: T.ink },
  switchSub: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginTop: 1 },
});
