// Worker Activity Screen — Live Applications + Earnings + Lifecycle Actions
// Reads from shared store so employer accept instantly updates this screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily } from '../../constants';
import { formatWage, formatDate, getStatusLabel, getStatusColor, CURRENT_WORKER } from '../../data/mockData';
import { useSharedApplicationsStore, useWorkerStore, useLanguageStore } from '../../store';
import { JobApplication } from '../../types';
import { Theme, statusColor as getThemeStatusColor, statusLabel as getThemeStatusLabel } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type TabKey = 'applications' | 'earnings';

const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
  successLight: Theme.successLight,
  warning: Theme.warning,
  warningBg: Theme.warningLight,
  error: Theme.error,
  errorBg: Theme.errorLight,
};

const STATUS_ORDER: Record<string, number> = {
  CHECKED_IN: 0,
  IN_PROGRESS: 1,
  ACCEPTED: 2,
  UNDER_REVIEW: 3,
  APPLIED: 4,
  COMPLETED: 5,
  PAID: 6,
  REJECTED: 7,
  WITHDRAWN: 8,
  EXPIRED: 9,
};

export const WorkerActivityScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('applications');
  const { t } = useLanguageStore();

  const workerProfile = useWorkerStore((s) => s.profile);
  const workerId = workerProfile?.id ?? CURRENT_WORKER.id;

  const {
    getWorkerApplications,
    checkIn,
    markComplete,
    confirmPaymentReceived,
    workerAcceptCounter,
    workerDeclineCounter,
  } = useSharedApplicationsStore();
  const myApplications = getWorkerApplications(workerId);

  // Sort by priority (active first)
  const sortedApps = [...myApplications].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 10) - (STATUS_ORDER[b.status] ?? 10)
  );

  const activeApps = sortedApps.filter(a =>
    !['PAID', 'REJECTED', 'WITHDRAWN', 'EXPIRED'].includes(a.status)
  );
  const completedApps = sortedApps.filter(a =>
    ['PAID', 'COMPLETED'].includes(a.status)
  );
  const totalEarned = myApplications
    .filter(a => a.status === 'PAID')
    .reduce((sum, a) => sum + (a.agreedWage ?? a.proposedWage), 0);

  const worker = workerProfile ?? CURRENT_WORKER;

  const handleCheckIn = (app: JobApplication) => {
    checkIn(app.id);
  };

  const handleMarkComplete = (app: JobApplication) => {
    markComplete(app.id);
  };

  const handleAcceptCounter = (app: JobApplication) => {
    workerAcceptCounter(app.id);
  };

  const handleDeclineCounter = (app: JobApplication) => {
    workerDeclineCounter(app.id);
  };

  const handleViewJob = (jobId: string) => {
    shellNavigation.navigate('JobDetail', { jobId });
  };

  const renderApplicationCard = (app: JobApplication) => {
    const statusColor = getStatusColor(app.status);
    const statusLabel = getStatusLabel(app.status);
    const isPaid = app.status === 'PAID';
    const isCompleted = app.status === 'COMPLETED' || app.status === 'PAYMENT_PENDING';
    const isAccepted = app.status === 'ACCEPTED';
    const isCheckedIn = app.status === 'CHECKED_IN' || app.status === 'IN_PROGRESS';
    const isNegotiating = app.status === 'NEGOTIATING';
    const isRejected = app.status === 'REJECTED';

    const displayWage = app.currentCounterWage ?? app.agreedWage ?? app.proposedWage;

    return (
      <TouchableOpacity
        key={app.id}
        style={[
          styles.appCard,
          isPaid && styles.appCardPaid,
          isRejected && styles.appCardRejected,
        ]}
        onPress={() => handleViewJob(app.jobId)}
        activeOpacity={0.85}
      >
        {/* Status pill */}
        <View style={styles.appCardHeader}>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.appDate}>{formatDate(app.appliedAt)}</Text>
        </View>

        {/* Job info */}
        <Text style={styles.appJobTitle} numberOfLines={1}>{app.job.title}</Text>
        <View style={styles.appMeta}>
          <Feather name="map-pin" size={11} color={T.textSecondary} />
          <Text style={styles.appMetaText}>{app.job.location.city}</Text>
          <View style={styles.metaDot} />
          <Feather name="calendar" size={11} color={T.textSecondary} />
          <Text style={styles.appMetaText}>{formatDate(app.job.startDate)}</Text>
        </View>

        {/* Wage */}
        <View style={styles.appWageRow}>
          <Text style={styles.appWage}>{formatWage(displayWage)}</Text>
          <Text style={styles.appWageUnit}>/ day</Text>
          {isNegotiating && (
            <Text style={{ fontSize: 11, color: T.warning, fontFamily: FontFamily.bold, marginLeft: 6 }}>
              ({app.counterBy === 'employer' ? 'Employer Offer' : 'Your Counter'})
            </Text>
          )}
        </View>

        {/* Employer */}
        <Text style={styles.appEmployer} numberOfLines={1}>
          {app.job.employer.businessName}
        </Text>

        {/* Counter offer actions for worker */}
        {isNegotiating && (
          app.counterBy === 'employer' ? (
            <View style={{ marginTop: 10 }}>
              <View style={[styles.paymentPendingBanner, { backgroundColor: T.warningBg, borderColor: '#FDE68A', marginBottom: 8 }]}>
                <Feather name="alert-circle" size={13} color={T.warning} />
                <Text style={[styles.paymentPendingText, { color: T.warning }]}>
                  Employer offered {formatWage(app.currentCounterWage ?? app.proposedWage)}/day
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1, backgroundColor: T.errorBg, borderWidth: 1, borderColor: '#FECACA' }]}
                  onPress={() => workerDeclineCounter(app.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.actionBtnText, { color: T.error }]}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1.5, backgroundColor: T.success }]}
                  onPress={() => workerAcceptCounter(app.id)}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={14} color={T.white} />
                  <Text style={styles.actionBtnText}>Accept {formatWage(app.currentCounterWage ?? app.proposedWage)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.paymentPendingBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', marginTop: 8 }]}>
              <Feather name="clock" size={13} color={T.primary} />
              <Text style={[styles.paymentPendingText, { color: T.primary }]}>
                Counter offer sent · Waiting for employer response
              </Text>
            </View>
          )
        )}

        {/* Action buttons based on status */}
        {isAccepted && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCheckIn(app)}
            activeOpacity={0.85}
          >
            <Feather name="map-pin" size={14} color={T.white} />
            <Text style={styles.actionBtnText}>GPS Check In</Text>
          </TouchableOpacity>
        )}

        {isCheckedIn && (
          <View style={styles.actionBtnGroup}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Shift in Progress</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: T.success }]}
              onPress={() => handleMarkComplete(app)}
              activeOpacity={0.85}
            >
              <Feather name="check" size={14} color={T.white} />
              <Text style={styles.actionBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <View style={styles.paymentPendingBanner}>
            <Feather name="clock" size={13} color={T.warning} />
            <Text style={styles.paymentPendingText}>Payment Pending — employer will pay shortly</Text>
          </View>
        )}

        {isPaid && (
          <View style={styles.paidBanner}>
            <Feather name="check-circle" size={14} color={T.success} />
            <Text style={styles.paidText}>{formatWage(displayWage)} Received ✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >

      {/* Earnings Hero */}
      <View style={styles.earningsHero}>
        <View style={styles.earningsTopRow}>
          <View>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsAmount}>{formatWage(totalEarned || (47 * 1100))}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{worker.completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{worker.rating} ★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'applications' && styles.tabBtnActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
            My Applications {myApplications.length > 0 ? `(${myApplications.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'earnings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
            Work History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <View style={styles.tabContent}>
          {myApplications.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Applications Yet</Text>
              <Text style={styles.emptySub}>
                Browse jobs and tap Apply to get started.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => shellNavigation.navigate('MainApp', { initialMode: 'worker' })}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyBtnText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {activeApps.length > 0 && (
                <View style={styles.groupSection}>
                  <Text style={styles.groupLabel}>Active</Text>
                  {activeApps.map(renderApplicationCard)}
                </View>
              )}
              {completedApps.length > 0 && (
                <View style={styles.groupSection}>
                  <Text style={styles.groupLabel}>Completed</Text>
                  {completedApps.map(renderApplicationCard)}
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Work History Tab */}
      {activeTab === 'earnings' && (
        <View style={styles.tabContent}>
          {worker.workHistory.length === 0 && completedApps.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="award" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Completed Work Yet</Text>
              <Text style={styles.emptySub}>Completed jobs and payments will appear here.</Text>
            </View>
          ) : (
            [...worker.workHistory, ...completedApps.map(a => ({
              id: a.id,
              jobTitle: a.job.title,
              employerName: a.job.employer.businessName,
              wage: a.proposedWage,
              date: a.completedAt ?? a.updatedAt,
              rating: 5,
              status: 'completed' as const,
            }))].map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyIcon}>
                  <Feather name="briefcase" size={16} color={T.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{item.jobTitle}</Text>
                  <Text style={styles.historyEmployer}>{item.employerName}</Text>
                  <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.historyWageCol}>
                  <Text style={styles.historyWage}>{formatWage(item.wage)}</Text>
                  <View style={styles.paidTag}>
                    <Text style={styles.paidTagText}>Paid ✓</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: 40 },

  // Earnings Hero
  earningsHero: {
    backgroundColor: T.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  earningsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 3,
  },
  earningsAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 30,
    color: T.white,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  statCard: { alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: 16, color: T.white },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: T.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontFamily: FontFamily.medium, fontSize: 12.5, color: T.textSecondary },
  tabTextActive: { fontFamily: FontFamily.bold, color: T.ink },
  tabContent: { paddingHorizontal: 16, paddingTop: 14 },

  // Group
  groupSection: { marginBottom: 8 },
  groupLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.textMuted,
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // Application Card
  appCard: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  appCardPaid: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  appCardRejected: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: FontFamily.bold, fontSize: 11 },
  appDate: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textMuted },
  appJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.ink,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  appMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  appMetaText: { fontFamily: FontFamily.regular, fontSize: 11.5, color: T.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 2 },
  appWageRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: 4 },
  appWage: { fontFamily: FontFamily.extraBold, fontSize: 20, color: T.primary, letterSpacing: -0.5 },
  appWageUnit: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary },
  appEmployer: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginBottom: 10 },

  // Action buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
  },
  actionBtnText: { fontFamily: FontFamily.bold, fontSize: 13.5, color: T.white },
  actionBtnGroup: { gap: 8, marginTop: 4 },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
  liveText: { fontFamily: FontFamily.bold, fontSize: 12, color: '#92400E' },
  paymentPendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.warningBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  paymentPendingText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: T.warning,
    flex: 1,
  },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  paidText: { fontFamily: FontFamily.bold, fontSize: 13, color: T.success },

  // History Card
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyTitle: { fontFamily: FontFamily.bold, fontSize: 13.5, color: T.ink, marginBottom: 2 },
  historyEmployer: { fontFamily: FontFamily.regular, fontSize: 11.5, color: T.textSecondary, marginBottom: 2 },
  historyDate: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textMuted },
  historyWageCol: { alignItems: 'flex-end' },
  historyWage: { fontFamily: FontFamily.extraBold, fontSize: 16, color: T.primary, marginBottom: 4 },
  paidTag: {
    backgroundColor: T.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paidTagText: { fontFamily: FontFamily.bold, fontSize: 10, color: T.success },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, marginTop: 14, marginBottom: 6 },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, textAlign: 'center', lineHeight: 19 },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontFamily: FontFamily.bold, fontSize: 14, color: T.white },
});
