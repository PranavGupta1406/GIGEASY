// Worker Passport Screen — SIH 26089
// Portable, verified digital credential for cooperative gig workers
// Contains government verification, skill certifications, FairWork ratings, and cooperative endorsement

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { CURRENT_WORKER, formatWage } from '../../data/mockData';
import { useWorkerStore, useAuthStore, useWelfareStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

export const WorkerPassportScreen: React.FC<Props> = ({ navigation }) => {
  const storeProfile = useWorkerStore((s) => s.profile);
  const authName = useAuthStore((s) => s.name);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authKyc = useAuthStore((s) => s.kycStatus);

  const worker = storeProfile ?? {
    ...CURRENT_WORKER,
    name: authName || CURRENT_WORKER.name,
    phoneNumber: authPhone || CURRENT_WORKER.phoneNumber,
    verificationStatus: (authKyc as any) || CURRENT_WORKER.verificationStatus,
  };

  const { getWorkerWelfare } = useWelfareStore();
  const welfare = getWorkerWelfare(worker.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'welfare'>('overview');

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${worker.name}'s Verified Cooperative Passport`,
        message: `Verified Worker Passport for ${worker.name}\nCooperative: ${worker.cooperativeName || 'Delhi Cooperative'}\nRating: ${worker.rating}★ (${worker.completedJobs} jobs)\nSkills: ${worker.skills.map((s) => s.name).join(', ')}\nAadhaar & Skill Certified on GigEasy.`,
      });
    } catch (err) {
      // Ignored
    }
  };

  const handleShowQr = () => {
    Alert.alert(
      'Worker Passport QR Verification',
      `Passport ID: PASS-${worker.id.toUpperCase()}-2026\nSociety: ${worker.cooperativeName}\nStatus: Officially Endorsed & Insured\n\nHouseholds scan this QR to confirm worker identity and safety insurance.`,
      [{ text: 'Close' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.ink} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Digital Worker Passport</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Feather name="share-2" size={18} color={Theme.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Passport Identity Card */}
        <View style={styles.passportCard}>
          {/* Header Banner */}
          <View style={styles.passportHeader}>
            <View style={styles.coopBadgeRow}>
              <MaterialCommunityIcons name="shield-check" size={16} color={Theme.success} />
              <Text style={styles.passportIssuer}>VERIFIED COOPERATIVE WORKER</Text>
            </View>
            <TouchableOpacity style={styles.qrIconBtn} onPress={handleShowQr}>
              <MaterialCommunityIcons name="qrcode-scan" size={20} color={Theme.ink} />
            </TouchableOpacity>
          </View>

          {/* Profile Row */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>
                {worker.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.coopName}>{worker.cooperativeName}</Text>
              <Text style={styles.memberId}>
                ID: DL-COOP-{(worker.id || 'w1').toUpperCase()}-0421
              </Text>
            </View>
          </View>

          {/* Verification Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.verifBadge}>
              <Feather name="check" size={12} color={Theme.success} />
              <Text style={styles.verifBadgeText}>Aadhaar Verified</Text>
            </View>
            <View style={styles.verifBadge}>
              <Feather name="check" size={12} color={Theme.success} />
              <Text style={styles.verifBadgeText}>Police Clearance</Text>
            </View>
            <View style={styles.verifBadge}>
              <Feather name="check" size={12} color={Theme.success} />
              <Text style={styles.verifBadgeText}>Insured (₹2L)</Text>
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{worker.rating}★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{worker.completedJobs}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{worker.trustScore}/100</Text>
              <Text style={styles.statLabel}>Trust Index</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{worker.experienceYears}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Skills & Trades
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'certifications' && styles.tabBtnActive]}
            onPress={() => setActiveTab('certifications')}
          >
            <Text style={[styles.tabText, activeTab === 'certifications' && styles.tabTextActive]}>
              Certifications ({worker.certifications?.length || 2})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'welfare' && styles.tabBtnActive]}
            onPress={() => setActiveTab('welfare')}
          >
            <Text style={[styles.tabText, activeTab === 'welfare' && styles.tabTextActive]}>
              Welfare & Insurance
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Skills & Trades */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Verified Skills</Text>
              <Text style={styles.cardSubtitle}>
                Skills endorsed by cooperative evaluation panel
              </Text>
              <View style={styles.skillWrap}>
                {worker.skills.map((s) => (
                  <View key={s.id} style={styles.skillPill}>
                    <MaterialCommunityIcons name="tools" size={13} color={Theme.primary} />
                    <Text style={styles.skillPillText}>{s.name}</Text>
                    <Feather name="check-circle" size={11} color={Theme.success} />
                  </View>
                ))}
              </View>
            </View>

            {/* Service Locations Covered */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Service Territory</Text>
              <Text style={styles.cardSubtitle}>
                Operating zone and maximum travel radius
              </Text>
              <View style={styles.territoryRow}>
                <Feather name="map-pin" size={16} color={Theme.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.territoryAddress}>{worker.location.address}, {worker.location.city}</Text>
                  <Text style={styles.territoryZone}>{worker.location.zone || 'Zone 6 - Noida'}</Text>
                </View>
                <View style={styles.radiusPill}>
                  <Text style={styles.radiusText}>{worker.preferredRadius} km radius</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: Certifications */}
        {activeTab === 'certifications' && (
          <View style={styles.tabContent}>
            {(worker.certifications && worker.certifications.length > 0
              ? worker.certifications
              : [
                  {
                    id: 'c1',
                    name: 'ITI Domestic Electrical Wiring Certificate',
                    issuedBy: 'ITI Delhi (Govt of NCT)',
                    issueDate: '2022-04-10',
                    expiryDate: '2027-04-09',
                    verified: true,
                    skillCategory: 'Electrical' as const,
                  },
                  {
                    id: 'c2',
                    name: 'NSDC Home Appliance Maintenance Certificate',
                    issuedBy: 'National Skill Development Corporation',
                    issueDate: '2023-08-15',
                    verified: true,
                    skillCategory: 'Appliance Repair' as const,
                  },
                ]
            ).map((c) => (
              <View key={c.id} style={styles.certCard}>
                <View style={styles.certIconWrap}>
                  <Feather name="award" size={20} color={Theme.olive} />
                </View>
                <View style={styles.certBody}>
                  <Text style={styles.certName}>{c.name}</Text>
                  <Text style={styles.certIssuer}>Issued by: {c.issuedBy}</Text>
                  <Text style={styles.certDate}>
                    Valid: {c.issueDate} {c.expiryDate ? `to ${c.expiryDate}` : '(Perpetual)'}
                  </Text>
                  <View style={styles.certVerifiedTag}>
                    <Feather name="check" size={11} color={Theme.success} />
                    <Text style={styles.certVerifiedText}>NSDC / Govt Verified</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addCertBtn}
              onPress={() =>
                Alert.alert(
                  'Add Certification',
                  'Upload your NSDC, ITI, or trade council certificate for cooperative verification.',
                  [{ text: 'Select Document' }, { text: 'Cancel', style: 'cancel' }]
                )
              }
            >
              <Feather name="plus-circle" size={16} color={Theme.ink} />
              <Text style={styles.addCertText}>Submit Certificate for Cooperative Endorsement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: Welfare & Insurance */}
        {activeTab === 'welfare' && (
          <View style={styles.tabContent}>
            {/* Active Insurance */}
            <View style={styles.card}>
              <View style={styles.cardHeaderWithAction}>
                <View>
                  <Text style={styles.cardTitle}>Social Security & Insurance</Text>
                  <Text style={styles.cardSubtitle}>Government & Cooperative safety net</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('WorkerWelfare' as any)}
                  style={styles.welfareDetailLink}
                >
                  <Text style={styles.welfareDetailLinkText}>Full Welfare Hub</Text>
                  <Feather name="chevron-right" size={13} color={Theme.primary} />
                </TouchableOpacity>
              </View>

              {welfare.insurance.map((ins, idx) => (
                <View key={idx} style={styles.insRow}>
                  <View style={styles.insLeft}>
                    <Text style={styles.insProvider}>{ins.provider}</Text>
                    <Text style={styles.insPolicy}>Policy: {ins.policyNumber}</Text>
                    <Text style={styles.insExpiry}>Coverage valid through {ins.expiryDate}</Text>
                  </View>
                  <View style={styles.insRight}>
                    <Text style={styles.insAmount}>₹{(ins.coverageAmount / 100000).toFixed(0)} Lakh</Text>
                    <View style={styles.insActiveBadge}>
                      <Text style={styles.insActiveText}>Active</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Welfare Fund Balances */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cooperative Welfare Pool</Text>
              <Text style={styles.cardSubtitle}>Balances maintained by your cooperative society</Text>

              <View style={styles.welfareFundGrid}>
                <View style={styles.fundBox}>
                  <Text style={styles.fundAmount}>₹{welfare.emergencyFundBalance.toLocaleString('en-IN')}</Text>
                  <Text style={styles.fundLabel}>Emergency Grant Fund</Text>
                  <Text style={styles.fundMeta}>Instant approval</Text>
                </View>

                <View style={styles.fundBox}>
                  <Text style={styles.fundAmount}>{welfare.trainingCredits} hrs</Text>
                  <Text style={styles.fundLabel}>Skill Credits</Text>
                  <Text style={styles.fundMeta}>Free ITI/NSDC courses</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceSubtle,
  },
  topNavTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceSubtle,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  passportCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  coopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passportIssuer: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.success,
    letterSpacing: 0.8,
  },
  qrIconBtn: {
    padding: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Theme.surface,
  },
  profileInfo: {
    flex: 1,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Theme.ink,
  },
  coopName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  memberId: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  verifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  verifBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.success,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Theme.border,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  tabBtnActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
  },
  tabTextActive: {
    color: Theme.surface,
  },
  tabContent: {
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 1,
  },
  welfareDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  welfareDetailLinkText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.primary,
  },
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  skillPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  territoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.sm,
  },
  territoryAddress: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  territoryZone: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  radiusPill: {
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  radiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  certCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'flex-start',
  },
  certIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Theme.oliveLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certBody: {
    flex: 1,
  },
  certName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  certIssuer: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  certDate: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
  },
  certVerifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  certVerifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.success,
  },
  addCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.border,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  addCertText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  insRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
    marginTop: Spacing.xs,
  },
  insLeft: {
    flex: 1,
  },
  insProvider: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  insPolicy: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  insExpiry: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
  },
  insRight: {
    alignItems: 'flex-end',
  },
  insAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  insActiveBadge: {
    backgroundColor: Theme.successLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  insActiveText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.success,
  },
  welfareFundGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  fundBox: {
    flex: 1,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  fundAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  fundLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  fundMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.textMuted,
    marginTop: 2,
  },
});
