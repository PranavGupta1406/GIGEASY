// Employer Profile Screen — Business identity + verification + switch mode
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
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
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { api } from '../../services/api';
import { useAuthStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  shellNavigation: NavProp;
  onSwitchMode?: () => void;
}

export const EmployerProfileScreen: React.FC<Props> = ({ shellNavigation, onSwitchMode }) => {
  const [employer, setEmployer] = useState<any>({
    employer_id: 1,
    company_name: 'Apex Builders Pvt Ltd',
    company_type: 'Construction',
    address: 'Plot 45, Okhla Phase 3, New Delhi',
    verified: true,
    total_jobs_posted: 3,
    total_spending: 1200
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const fetched = await api.getEmployerProfile(1);
        if (fetched) setEmployer(fetched);
      } catch (err) {
        console.error('Error fetching employer profile:', err);
      }
    }
    loadProfile();
  }, []);

  const logout = useAuthStore((s) => s.logout);
  const totalJobs = employer.total_jobs_posted || 3;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          shellNavigation.replace('Welcome');
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
          <Feather name="log-out" size={17} color="#EF4444" />
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
          <Feather name="map-pin" size={12} color="#5A6578" />
          <Text style={styles.locationText}>{employer.location.city}, {employer.location.state}</Text>
        </View>

        {employer.verificationStatus === 'verified' && (
          <View style={styles.verifiedBanner}>
            <MaterialCommunityIcons name="check-decagram" size={13} color="#0D3B3F" />
            <Text style={styles.verifiedText}>GST Verified Enterprise</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{employer.totalJobsPosted}</Text>
            <Text style={styles.statLabel}>Gigs Posted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{employer.rating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>Reliability</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{totalJobs}</Text>
            <Text style={styles.statLabel}>Active Gigs</Text>
          </View>
        </View>
      </View>

      {/* Escrow balance */}
      <View style={styles.escrowCard}>
        <View style={styles.escrowLeft}>
          <MaterialCommunityIcons name="shield-lock" size={20} color="#C8F135" />
          <View>
            <Text style={styles.escrowLabel}>Secured Escrow Balance</Text>
            <Text style={styles.escrowAmount}>₹42,500</Text>
          </View>
        </View>
        <View style={styles.escrowRight}>
          <Text style={styles.escrowSub}>Auto-released on GPS check-out</Text>
          <View style={styles.escrowStatus}>
            <View style={styles.escrowDot} />
            <Text style={styles.escrowStatusText}>Protected</Text>
          </View>
        </View>
      </View>

      {/* Business details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact Person</Text>
          <Text style={styles.detailValue}>{employer.contactName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sector</Text>
          <Text style={styles.detailValue}>{employer.businessType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registered Address</Text>
          <Text style={styles.detailValue}>{employer.location.address}, {employer.location.city}</Text>
        </View>
      </View>

      {/* Switch mode */}
      {onSwitchMode && (
        <TouchableOpacity style={styles.switchCard} onPress={onSwitchMode} activeOpacity={0.88}>
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <Feather name="search" size={16} color="#090D14" />
            </View>
            <View>
              <Text style={styles.switchTitle}>Looking for work yourself?</Text>
              <Text style={styles.switchSub}>Switch to Find Work mode</Text>
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  businessAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C8F135',
  },
  businessInitials: { fontFamily: FontFamily.extraBold, fontSize: 24, color: '#FFFFFF' },
  businessName: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: '#090D14', letterSpacing: -0.3, textAlign: 'center' },
  businessType: { fontFamily: FontFamily.regular, fontSize: 12, color: '#5A6578', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  verifiedText: { fontFamily: FontFamily.bold, fontSize: 10, color: '#0D3B3F' },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F2F0EB',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: FontFamily.bold, fontSize: 15, color: '#090D14', letterSpacing: -0.2 },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 9, color: '#5A6578', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E8E6E0' },
  escrowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D14',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    ...Shadow.xs,
  },
  escrowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  escrowLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: '#8E99A8' },
  escrowAmount: { fontFamily: FontFamily.extraBold, fontSize: 20, color: '#C8F135', letterSpacing: -0.4 },
  escrowRight: { alignItems: 'flex-end' },
  escrowSub: { fontFamily: FontFamily.regular, fontSize: 9, color: '#8E99A8' },
  escrowStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  escrowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  escrowStatusText: { fontFamily: FontFamily.bold, fontSize: 9, color: '#10B981' },
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
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#090D14', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F0EB',
  },
  detailLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: '#5A6578' },
  detailValue: { fontFamily: FontFamily.bold, fontSize: 12, color: '#090D14', flex: 1, textAlign: 'right', marginLeft: 12 },
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
    borderRadius: 18,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#090D14' },
  switchSub: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578', marginTop: 1 },
});
