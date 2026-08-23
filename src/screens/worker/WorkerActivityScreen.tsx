// Worker Activity Screen — Earnings, Applications, GPS Check-in
// Uber/Zomato-style earnings dashboard with payout status pills

import React, { useState, useMemo } from 'react';
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
import { FontFamily, FontSize } from '../../constants';
import {
  WORKER_APPLICATIONS,
  CURRENT_WORKER,
  formatWage,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../../data/mockData';
import { calculatePaymentBreakdown } from '../../services/payments/paymentEscrowService';
import { attendanceService } from '../../services/attendance/attendanceService';
import { GigEasyApplicationCard } from '../../components/GigEasyCards';
import { GigEasyStatusPill } from '../../components/GigEasyPrimitives';
import { useLanguageStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type TabKey = 'earnings' | 'applications';

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  money: '#EA580C',
  moneyBg: '#FFEDD5',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
};

// Mock weekly earning records for demo
const MOCK_PAYOUTS = [
  {
    id: 'p1',
    jobTitle: 'Warehouse Loading Helper',
    employer: 'Bharat Logistics Pvt Ltd',
    date: '2026-08-22',
    wage: 1000,
    status: 'RELEASED_TO_WORKER' as const,
  },
  {
    id: 'p2',
    jobTitle: 'Event Setup Crew',
    employer: 'Grand Palace Banquets',
    date: '2026-08-20',
    wage: 1200,
    status: 'RELEASED_TO_WORKER' as const,
  },
  {
    id: 'p3',
    jobTitle: 'Factory Line Worker',
    employer: 'TechnoFab Industries',
    date: '2026-08-18',
    wage: 950,
    status: 'HELD_IN_ESCROW' as const,
  },
];

const payoutStatusLabel = (status: string): { label: string; color: string; bg: string } => {
  if (status === 'RELEASED_TO_WORKER') return { label: 'Paid', color: T.success, bg: T.successLight };
  if (status === 'HELD_IN_ESCROW') return { label: 'In Escrow', color: T.warning, bg: T.warningBg };
  if (status === 'PENDING') return { label: 'Pending', color: T.textMuted, bg: '#F1F5F9' };
  return { label: status, color: T.textMuted, bg: '#F1F5F9' };
};

export const WorkerActivityScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('earnings');
  const [checkedIn, setCheckedIn] = useState(false);
  const { t } = useLanguageStore();

  const totalEarned = MOCK_PAYOUTS
    .filter((p) => p.status === 'RELEASED_TO_WORKER')
    .reduce((sum, p) => sum + p.wage, 0);

  const inEscrow = MOCK_PAYOUTS
    .filter((p) => p.status === 'HELD_IN_ESCROW')
    .reduce((sum, p) => sum + p.wage, 0);

  const handleCheckIn = () => {
    Alert.alert(
      checkedIn ? 'Check Out' : 'GPS Check-In',
      checkedIn
        ? 'Are you sure you want to check out? This will end your shift.'
        : 'This will record your GPS location for attendance verification.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: checkedIn ? 'Check Out' : 'Check In',
          onPress: () => setCheckedIn(!checkedIn),
        },
      ]
    );
  };

  const handleWithdraw = () => {
    Alert.alert('Instant UPI Payout', 'Your earnings will be transferred to your UPI ID within minutes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'default' },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* ─── Earnings Hero Block ─── */}
      <View style={styles.earningsHero}>
        <View style={styles.earningsTopRow}>
          <View>
            <Text style={styles.earningsLabel}>This Month's Earnings</Text>
            <Text style={styles.earningsAmount}>{formatWage(totalEarned)}</Text>
          </View>
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} activeOpacity={0.85}>
            <MaterialCommunityIcons name="bank-transfer-out" size={16} color={T.white} />
            <Text style={styles.withdrawText}>{t('withdrawEarnings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Escrow Notice */}
        {inEscrow > 0 && (
          <View style={styles.escrowBanner}>
            <MaterialCommunityIcons name="shield-lock" size={14} color={T.warning} />
            <Text style={styles.escrowBannerText}>
              {formatWage(inEscrow)} {t('paymentInEscrow')} — will be released after shift verification.
            </Text>
          </View>
        )}

        {/* Stat Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{MOCK_PAYOUTS.length}</Text>
            <Text style={styles.statLabel}>Shifts Worked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{CURRENT_WORKER.rating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{CURRENT_WORKER.completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
        </View>
      </View>

      {/* ─── GPS Check-In Card ─── */}
      <TouchableOpacity
        style={[styles.checkInCard, checkedIn && styles.checkInCardActive]}
        onPress={handleCheckIn}
        activeOpacity={0.85}
      >
        <View style={[styles.checkInIcon, checkedIn && styles.checkInIconActive]}>
          <Feather name="map-pin" size={20} color={checkedIn ? T.white : T.primary} />
        </View>
        <View style={styles.checkInInfo}>
          <Text style={[styles.checkInTitle, checkedIn && styles.checkInTitleActive]}>
            {checkedIn ? t('statusCheckedIn') : t('checkInGps')}
          </Text>
          <Text style={styles.checkInSub}>
            {checkedIn ? 'Shift in progress — tap to check out' : 'Tap to start your shift & mark attendance'}
          </Text>
        </View>
        <View style={[styles.checkInBadge, checkedIn && styles.checkInBadgeActive]}>
          <Text style={[styles.checkInBadgeText, checkedIn && { color: T.white }]}>
            {checkedIn ? 'Live' : 'Tap'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ─── Tabs ─── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'earnings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
            {t('payoutHistory')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'applications' && styles.tabBtnActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
            {t('recentApplicants') !== 'recentApplicants' ? 'My Applications' : 'Applications'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Tab Content ─── */}
      {activeTab === 'earnings' && (
        <View style={styles.sectionContent}>
          {MOCK_PAYOUTS.map((payout) => {
            const breakdown = calculatePaymentBreakdown(payout.wage);
            const statusInfo = payoutStatusLabel(payout.status);

            return (
              <View key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutTopRow}>
                  <View style={styles.payoutIcon}>
                    <Feather name="briefcase" size={16} color={T.primary} />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.payoutJobTitle} numberOfLines={1}>{payout.jobTitle}</Text>
                    <Text style={styles.payoutEmployer}>{payout.employer}</Text>
                  </View>
                  <View>
                    <Text style={styles.payoutAmount}>{formatWage(breakdown.netWorkerPayout)}</Text>
                    <Text style={styles.payoutAmountSub}>net payout</Text>
                  </View>
                </View>

                <View style={styles.payoutFooter}>
                  <Text style={styles.payoutDate}>{formatDate(payout.date)}</Text>
                  <View style={[styles.payoutStatusPill, { backgroundColor: statusInfo.bg }]}>
                    <View style={[styles.payoutStatusDot, { backgroundColor: statusInfo.color }]} />
                    <Text style={[styles.payoutStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>

                {/* Breakdown tooltip */}
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownItem}>Agreed: {formatWage(payout.wage)}</Text>
                  <Text style={styles.breakdownItem}>TDS: -{formatWage(breakdown.tdsDeduction)}</Text>
                  <Text style={styles.breakdownItem}>Net: {formatWage(breakdown.netWorkerPayout)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {activeTab === 'applications' && (
        <View style={styles.sectionContent}>
          {WORKER_APPLICATIONS.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={24} color="#94A3B8" />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySub}>Jobs you apply for will appear here</Text>
            </View>
          ) : (
            WORKER_APPLICATIONS.map((app) => (
              <GigEasyApplicationCard
                key={app.id}
                application={app}
                onPress={() => shellNavigation.navigate('JobDetail', { jobId: app.jobId })}
              />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: 32 },

  // Earnings Hero
  earningsHero: {
    backgroundColor: T.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  earningsTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningsLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 3,
  },
  earningsAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    color: T.white,
    letterSpacing: -1,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  withdrawText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.white,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.30)',
  },
  escrowBannerText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#FDE68A',
    flex: 1,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  statValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 18,
    color: T.white,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.70)',
  },

  // GPS Check-in Card
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  checkInCardActive: {
    borderColor: T.success,
    backgroundColor: T.successLight,
  },
  checkInIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInIconActive: {
    backgroundColor: T.success,
  },
  checkInInfo: { flex: 1 },
  checkInTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.ink,
    marginBottom: 2,
  },
  checkInTitleActive: { color: '#047857' },
  checkInSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
    lineHeight: 15,
  },
  checkInBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.primaryMuted,
  },
  checkInBadgeActive: { backgroundColor: T.success },
  checkInBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: T.white, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  tabText: { fontFamily: FontFamily.medium, fontSize: 12.5, color: T.textSecondary },
  tabTextActive: { fontFamily: FontFamily.bold, color: T.ink },

  // Content
  sectionContent: { paddingHorizontal: 16, paddingTop: 14 },

  // Payout Cards
  payoutCard: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  payoutTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  payoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutInfo: { flex: 1 },
  payoutJobTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: T.ink, marginBottom: 2 },
  payoutEmployer: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  payoutAmount: { fontFamily: FontFamily.extraBold, fontSize: 15, color: T.money, textAlign: 'right' },
  payoutAmountSub: { fontFamily: FontFamily.regular, fontSize: 9.5, color: T.textMuted, textAlign: 'right' },
  payoutFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  payoutDate: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  payoutStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  payoutStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  payoutStatusText: { fontFamily: FontFamily.bold, fontSize: 10.5 },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  breakdownItem: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: T.textMuted,
  },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontFamily: FontFamily.bold, fontSize: 15, color: T.ink, marginTop: 12 },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginTop: 4 },
});
