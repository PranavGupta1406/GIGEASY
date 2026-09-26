// Worker Welfare & Social Security Screen — SIH 26089
// Transparent social security safety net for cooperative gig workers
// PMSBY, PMJJBY insurance, emergency grant pool, skill credits, and transparent cooperative match

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { useWelfareStore, useWorkerStore, useAuthStore } from '../../store';
import { CURRENT_WORKER } from '../../data/mockData';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

export const WorkerWelfareScreen: React.FC<Props> = ({ navigation }) => {
  const storeProfile = useWorkerStore((s) => s.profile);
  const worker = storeProfile ?? CURRENT_WORKER;

  const {
    getWorkerWelfare,
    requestEmergencyFund,
    enrollInTraining,
    enrollInScheme,
  } = useWelfareStore();

  const welfare = getWorkerWelfare(worker.id);

  const [claimPolicy, setClaimPolicy] = useState<string | null>(null);

  const handleEmergencyRequest = () => {
    Alert.alert(
      'Emergency Grant Request',
      `Available Emergency Pool: ₹${welfare.emergencyFundBalance.toLocaleString('en-IN')}\n\nCooperative emergency grants are processed within 2 hours without interest.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request ₹2,000 Instant Grant',
          onPress: () => {
            const ok = requestEmergencyFund(worker.id, 2000, 'Medical emergency');
            if (ok) {
              Alert.alert('Approved ✓', '₹2,000 has been transferred to your registered UPI account.');
            } else {
              Alert.alert('Insufficient Balance', 'Please contact your cooperative officer.');
            }
          },
        },
      ]
    );
  };

  const handleInsuranceClaim = (policyNum: string, provider: string) => {
    Alert.alert(
      'Initiate Insurance Claim',
      `Policy: ${policyNum} (${provider})\n\nA cooperative claims liaison will be assigned to assist you with document submission.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'File Claim with Cooperative',
          onPress: () => {
            Alert.alert('Claim Submitted ✓', 'Cooperative Welfare Officer Rakesh Prasad will contact you today.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.ink} />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Cooperative Welfare Hub</Text>
          <Text style={styles.topNavSubtitle}>{worker.cooperativeName || 'Cooperative Society'}</Text>
        </View>
        <View style={styles.secShield}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#059669" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Safety Net Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEyebrow}>WORKER PROTECTION FUND</Text>
              <Text style={styles.heroTotal}>
                ₹{(welfare.emergencyFundBalance + welfare.totalContributed).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.heroSub}>Total Safety Net Value (Protected by Society)</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="hand-heart" size={28} color={Theme.surface} />
            </View>
          </View>

          {/* Quick Stat Strip */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>₹4.0 Lakh</Text>
              <Text style={styles.heroStatLabel}>Insurance Cover</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>₹{welfare.emergencyFundBalance.toLocaleString('en-IN')}</Text>
              <Text style={styles.heroStatLabel}>Emergency Grant</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{welfare.trainingCredits} hrs</Text>
              <Text style={styles.heroStatLabel}>Skill Credits</Text>
            </View>
          </View>
        </View>

        {/* Instant Action Button */}
        <TouchableOpacity style={styles.emergencyCta} onPress={handleEmergencyRequest}>
          <View style={styles.emergencyCtaLeft}>
            <View style={styles.emergencyIconWrap}>
              <Feather name="zap" size={18} color="#D97706" />
            </View>
            <View>
              <Text style={styles.emergencyCtaTitle}>Need Emergency Assistance?</Text>
              <Text style={styles.emergencyCtaSub}>
                Instant zero-interest grant from cooperative member pool
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={Theme.ink} />
        </TouchableOpacity>

        {/* Section 1: Insurance Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Government & Cooperative Insurance</Text>
          <Text style={styles.sectionDesc}>
            Premiums automatically funded through cooperative collective earnings
          </Text>

          {welfare.insurance.map((ins, idx) => (
            <View key={idx} style={styles.policyCard}>
              <View style={styles.policyHeader}>
                <View style={styles.policyHeaderLeft}>
                  <View style={styles.policyIcon}>
                    <Feather
                      name={ins.type === 'life' ? 'heart' : 'shield'}
                      size={18}
                      color="#059669"
                    />
                  </View>
                  <View>
                    <Text style={styles.policyName}>{ins.provider}</Text>
                    <Text style={styles.policyType}>
                      {ins.type.toUpperCase()} INSURANCE · ₹{(ins.coverageAmount / 100000).toFixed(0)} LAKH COVER
                    </Text>
                  </View>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>

              <View style={styles.policyDetailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Policy Number</Text>
                  <Text style={styles.detailVal}>{ins.policyNumber}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Valid Until</Text>
                  <Text style={styles.detailVal}>{ins.expiryDate}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Monthly Premium</Text>
                  <Text style={styles.detailVal}>₹{ins.premiumPerMonth}/mo (Paid)</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.claimBtn}
                onPress={() => handleInsuranceClaim(ins.policyNumber, ins.provider)}
              >
                <Feather name="file-text" size={14} color={Theme.ink} />
                <Text style={styles.claimBtnText}>File Insurance Claim</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Section 2: Active Cooperative Welfare Schemes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooperative Welfare Schemes</Text>
          <Text style={styles.sectionDesc}>
            Community welfare programs maintained by your society
          </Text>

          {welfare.welfareSchemes.map((ws) => (
            <View key={ws.id} style={styles.schemeCard}>
              <View style={styles.schemeLeft}>
                <Text style={styles.schemeName}>{ws.name}</Text>
                <Text style={styles.schemeDesc}>{ws.description}</Text>
                {ws.monthlyBenefit ? (
                  <Text style={styles.schemeBenefit}>
                    Benefit: ₹{ws.monthlyBenefit}/month health assistance
                  </Text>
                ) : null}
              </View>
              <View style={styles.schemeRight}>
                <View style={styles.enrolledBadge}>
                  <Feather name="check" size={11} color={Theme.success} />
                  <Text style={styles.enrolledText}>Enrolled</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Section 3: Contribution Ledger (Transparency) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transparent Welfare Ledger</Text>
          <Text style={styles.sectionDesc}>
            5% deducted from your completed gigs matched by the cooperative
          </Text>

          <View style={styles.ledgerCard}>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Worker Gig Savings (5% pool)</Text>
              <Text style={styles.ledgerVal}>₹{welfare.totalContributed.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Cooperative Society Match</Text>
              <Text style={[styles.ledgerVal, { color: Theme.success }]}>
                +₹{welfare.cooperativeContributed.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.ledgerDivider} />
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerTotalLabel}>Total Accumulated Safety Pool</Text>
              <Text style={styles.ledgerTotalVal}>
                ₹{(welfare.totalContributed + welfare.cooperativeContributed).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

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
  topNavCenter: {
    alignItems: 'center',
  },
  topNavTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  topNavSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
  },
  secShield: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  heroCard: {
    backgroundColor: Theme.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  heroTotal: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Theme.surface,
    marginTop: 2,
  },
  heroSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
  heroStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#374151',
  },
  emergencyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  emergencyCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emergencyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCtaTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#92400E',
  },
  emergencyCtaSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#78350F',
    marginTop: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  sectionDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 1,
    marginBottom: Spacing.sm,
  },
  policyCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  policyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  policyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  policyType: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.success,
  },
  policyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: 10,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.textMuted,
  },
  detailVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.ink,
    marginTop: 2,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.surfaceSubtle,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  claimBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  schemeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.xs,
  },
  schemeLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  schemeName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  schemeDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  schemeBenefit: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.success,
    marginTop: 3,
  },
  schemeRight: {},
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  enrolledText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.success,
  },
  ledgerCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ledgerLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  ledgerVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  ledgerDivider: {
    height: 1,
    backgroundColor: Theme.border,
    marginVertical: 6,
  },
  ledgerTotalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  ledgerTotalVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
});
