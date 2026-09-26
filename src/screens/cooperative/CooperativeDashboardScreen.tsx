// Cooperative Admin Dashboard Screen — SIH 26089
// Central mission control for Cooperative Societies & Federation
// Displays worker utilization, FairWork allocation, AI demand forecasting, and welfare oversight

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import {
  useCooperativeStore,
  useDemandForecastStore,
  useServiceRequestStore,
  useDisputeStore,
} from '../../store';
import { MOCK_WORKERS, formatWage } from '../../data/mockData';
import { analyzeCooperativeUtilization } from '../../services/allocation/fairWorkEngine';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation?: NavProp;
  shellNavigation?: NavProp;
  onNavigateToForecast?: () => void;
  onNavigateToDisputes?: () => void;
}

export const CooperativeDashboardScreen: React.FC<Props> = ({
  navigation,
  shellNavigation,
  onNavigateToForecast,
  onNavigateToDisputes,
}) => {
  const activeNav = navigation || shellNavigation;
  const {
    cooperatives,
    selectedCooperativeId,
    setSelectedCooperativeId,
    getSelectedCooperative,
    stats,
    federation,
  } = useCooperativeStore();

  const { forecasts, skillGaps } = useDemandForecastStore();
  const { requests } = useServiceRequestStore();
  const { disputes } = useDisputeStore();

  const currentCoop = getSelectedCooperative() || cooperatives[0];
  const coopWorkers = MOCK_WORKERS.filter((w) => w.cooperativeId === currentCoop.id);
  const utilizationReport = analyzeCooperativeUtilization(coopWorkers.length ? coopWorkers : MOCK_WORKERS);

  const openDisputes = disputes.filter((d) => d.status !== 'resolved');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Federation Header */}
        <View style={styles.federationBar}>
          <View style={styles.federationLeft}>
            <MaterialCommunityIcons name="handshake" size={16} color={Theme.primary} />
            <Text style={styles.federationText}>{federation.name}</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>FEDERATED NETWORK</Text>
          </View>
        </View>

        {/* Cooperative Selector */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>COOPERATIVE ADMINISTRATION</Text>
          <Text style={styles.title}>{currentCoop.name}</Text>
          <Text style={styles.subtitle}>
            Reg: {currentCoop.registrationNumber} · {currentCoop.district}, {currentCoop.state}
          </Text>

          {/* Society Selector Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coopPillsContainer}
            contentContainerStyle={styles.coopPillsContent}
          >
            {cooperatives.map((c) => {
              const isSelected = c.id === selectedCooperativeId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.coopPill, isSelected && styles.coopPillActive]}
                  onPress={() => setSelectedCooperativeId(c.id)}
                >
                  <Text style={[styles.coopPillText, isSelected && styles.coopPillTextActive]}>
                    {c.name.split(' ')[0]} Coop
                  </Text>
                  <View style={[styles.pillBadge, isSelected && styles.pillBadgeActive]}>
                    <Text style={[styles.pillBadgeText, isSelected && styles.pillBadgeTextActive]}>
                      {c.memberCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* KPI Summary Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Feather name="users" size={18} color={Theme.primary} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalWorkers}</Text>
            <Text style={styles.kpiLabel}>Total Workers</Text>
            <Text style={styles.kpiMeta}>{stats.verifiedWorkers} Verified</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="activity" size={18} color={Theme.success} />
            </View>
            <Text style={styles.kpiValue}>{stats.activeToday}</Text>
            <Text style={styles.kpiLabel}>Active Today</Text>
            <Text style={[styles.kpiMeta, { color: Theme.success }]}>
              {stats.utilizationRate}% Utilized
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: Theme.surfaceSubtle }]}>
              <Feather name="check-circle" size={18} color={Theme.primary} />
            </View>
            <Text style={styles.kpiValue}>{stats.jobsThisWeek}</Text>
            <Text style={styles.kpiLabel}>Jobs This Week</Text>
            <Text style={styles.kpiMeta}>₹{(stats.earningsThisWeek / 1000).toFixed(0)}k Paid</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: Theme.warningLight }]}>
              <Feather name="shield" size={18} color={Theme.warning} />
            </View>
            <Text style={styles.kpiValue}>{stats.insuredWorkers}</Text>
            <Text style={styles.kpiLabel}>Insured Members</Text>
            <Text style={styles.kpiMeta}>
              {Math.round((stats.insuredWorkers / stats.totalWorkers) * 100)}% Protected
            </Text>
          </View>
        </View>

        {/* FairWork Allocation & Balance Engine Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.indicatorIcon, { backgroundColor: Theme.accentLight }]}>
                <MaterialCommunityIcons name="scale-balance" size={18} color={Theme.accent} />
              </View>
              <View>
                <Text style={styles.cardTitle}>FairWork Allocation Status</Text>
                <Text style={styles.cardSubtitle}>Workload Balancing & Equity</Text>
              </View>
            </View>
            <View style={styles.fairworkScoreBadge}>
              <Text style={styles.fairworkScoreText}>{utilizationReport.fairnessIndex}/100</Text>
            </View>
          </View>

          <View style={styles.balanceMeterContainer}>
            <View style={styles.balanceMeterBar}>
              <View
                style={[
                  styles.balanceMeterFill,
                  { width: `${utilizationReport.fairnessIndex}%` },
                ]}
              />
            </View>
            <View style={styles.balanceMeterLabels}>
              <Text style={styles.balanceMeterLabel}>
                {utilizationReport.underUtilizedWorkers} Under-utilized
              </Text>
              <Text style={styles.balanceMeterLabel}>
                {utilizationReport.activeWorkers} Balanced
              </Text>
              <Text style={styles.balanceMeterLabel}>
                {utilizationReport.overUtilizedWorkers} Near-cap
              </Text>
            </View>
          </View>

          <View style={styles.fairnessAlertBox}>
            <Feather name="info" size={14} color={Theme.accent} />
            <Text style={styles.fairnessAlertText}>
              FairWork algorithm prevents job monopolies: 82% of earnings flow directly to workers, with balanced shift allocation.
            </Text>
          </View>
        </View>

        {/* Demand Forecast & Shortage Alert Banner */}
        <View style={[styles.card, styles.aiForecastCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.indicatorIcon, { backgroundColor: Theme.amberLight }]}>
                <MaterialCommunityIcons name="chart-bell-curve" size={18} color={Theme.amberDark} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Demand Forecast & Intelligence</Text>
                <Text style={styles.cardSubtitle}>Shortages & Surge Predictions</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.actionLinkBtn}
              onPress={() => {
                if (onNavigateToForecast) onNavigateToForecast();
                else if (activeNav) activeNav.navigate('DemandForecast' as any);
              }}
            >
              <Text style={styles.actionLinkText}>View Details</Text>
              <Feather name="chevron-right" size={14} color={Theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Top Shortage Item */}
          {forecasts.slice(0, 2).map((fc) => (
            <View key={fc.id} style={styles.forecastRow}>
              <View style={styles.forecastInfo}>
                <View style={styles.forecastTitleRow}>
                  <Text style={styles.forecastService}>{fc.serviceCategory}</Text>
                  <View style={[styles.trendBadge, { backgroundColor: fc.trend === 'up' ? Theme.errorLight : Theme.surfaceSubtle }]}>
                    <Feather
                      name={fc.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={fc.trend === 'up' ? Theme.error : Theme.primary}
                    />
                    <Text
                      style={[
                        styles.trendText,
                        { color: fc.trend === 'up' ? Theme.error : Theme.primary },
                      ]}
                    >
                      {fc.changePercent > 0 ? `+${fc.changePercent}%` : `${fc.changePercent}%`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.forecastZone}>{fc.zone}</Text>
                <Text style={styles.forecastRecommendation} numberOfLines={2}>
                  {fc.recommendedAction}
                </Text>
              </View>
              <View style={styles.shortagePill}>
                <Text style={styles.shortageCount}>
                  {fc.shortage > 0 ? `-${fc.shortage}` : `+${Math.abs(fc.shortage)}`}
                </Text>
                <Text style={styles.shortageLabel}>
                  {fc.shortage > 0 ? 'deficit' : 'surplus'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Skill Gap & ITI Training Recommendation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.indicatorIcon, { backgroundColor: Theme.oliveLight }]}>
                <Feather name="award" size={18} color={Theme.olive} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Skill Upgrading & Grants</Text>
                <Text style={styles.cardSubtitle}>NSDC / ITI Partner Centers</Text>
              </View>
            </View>
          </View>

          {skillGaps.slice(0, 2).map((sg) => (
            <View key={sg.id} style={styles.skillGapItem}>
              <View style={styles.skillGapLeft}>
                <Text style={styles.skillGapCategory}>{sg.serviceCategory}</Text>
                <Text style={styles.skillGapRecommendation} numberOfLines={2}>
                  {sg.trainingRecommendation}
                </Text>
                <View style={styles.skillGapMeta}>
                  <Text style={styles.skillGapWeeks}>{sg.estimatedTrainingWeeks} weeks duration</Text>
                  <Text style={styles.skillGapDot}>·</Text>
                  <Text style={styles.skillGapSeverity}>
                    {sg.severity.toUpperCase()} PRIORITY
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pending Grievances / Dispute Resolution */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.indicatorIcon, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="alert-triangle" size={18} color={Theme.error} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Dispute & Grievance Mediation</Text>
                <Text style={styles.cardSubtitle}>Cooperative Mediation Board</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.actionLinkBtn}
              onPress={() => {
                if (onNavigateToDisputes) onNavigateToDisputes();
                else if (activeNav) activeNav.navigate('Dispute' as any);
              }}
            >
              <Text style={styles.actionLinkText}>Mediate ({openDisputes.length})</Text>
              <Feather name="chevron-right" size={14} color={Theme.primary} />
            </TouchableOpacity>
          </View>

          {openDisputes.length === 0 ? (
            <Text style={styles.emptyNote}>No pending disputes in this cooperative society.</Text>
          ) : (
            openDisputes.map((disp) => (
              <View key={disp.id} style={styles.disputeItem}>
                <View style={styles.disputeHeader}>
                  <Text style={styles.disputeType}>
                    {disp.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <View style={styles.disputeStatusBadge}>
                    <Text style={styles.disputeStatusText}>{disp.status.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.disputeDesc}>{disp.description}</Text>
                {disp.cooperativeAdminNote && (
                  <Text style={styles.disputeNote}>
                    Coop Note: {disp.cooperativeAdminNote}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Active Household Service Requests */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.indicatorIcon, { backgroundColor: '#F3F4F6' }]}>
                <Feather name="clock" size={18} color={Theme.ink} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Live Household Bookings</Text>
                <Text style={styles.cardSubtitle}>Active dispatched workers</Text>
              </View>
            </View>
          </View>

          {requests.slice(0, 3).map((req) => (
            <View key={req.id} style={styles.requestRow}>
              <View style={styles.requestLeft}>
                <Text style={styles.requestTitle}>{req.serviceTitle}</Text>
                <Text style={styles.requestMeta}>
                  {req.location.zone} · {req.assignedWorker?.name || 'Assigning...'}
                </Text>
              </View>
              <View style={styles.requestRight}>
                <Text style={styles.requestPrice}>
                  ₹{req.estimatedPrice?.totalEstimate || 450}
                </Text>
                <Text style={styles.requestStatus}>{req.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          ))}
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  federationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surface,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.sm,
  },
  federationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  federationText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.success,
  },
  liveText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.success,
  },
  header: {
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Theme.ink,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  coopPillsContainer: {
    marginTop: Spacing.sm,
  },
  coopPillsContent: {
    gap: 8,
  },
  coopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  coopPillActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  coopPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
  },
  coopPillTextActive: {
    color: Theme.surface,
  },
  pillBadge: {
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  pillBadgeActive: {
    backgroundColor: '#374151',
  },
  pillBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  pillBadgeTextActive: {
    color: Theme.surface,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  kpiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Theme.ink,
  },
  kpiLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  kpiMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  aiForecastCard: {
    borderColor: Theme.amberBorder,
    backgroundColor: Theme.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicatorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
  },
  fairworkScoreBadge: {
    backgroundColor: Theme.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  fairworkScoreText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.accent,
  },
  balanceMeterContainer: {
    marginTop: Spacing.xs,
  },
  balanceMeterBar: {
    height: 8,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  balanceMeterFill: {
    height: '100%',
    backgroundColor: Theme.accent,
    borderRadius: 4,
  },
  balanceMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  balanceMeterLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
  },
  fairnessAlertBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Theme.accentLight,
    padding: 10,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  fairnessAlertText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.accentDark,
    lineHeight: 15,
  },
  actionLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.primary,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  forecastInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  forecastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastService: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
  },
  forecastZone: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  forecastRecommendation: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 3,
  },
  shortagePill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.errorLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    minWidth: 54,
  },
  shortageCount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.error,
  },
  shortageLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.error,
  },
  skillGapItem: {
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  skillGapLeft: {
    flex: 1,
  },
  skillGapCategory: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  skillGapRecommendation: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  skillGapMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  skillGapWeeks: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
  },
  skillGapDot: {
    color: Theme.textMuted,
    fontSize: 10,
  },
  skillGapSeverity: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.olive,
  },
  disputeItem: {
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeType: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.error,
  },
  disputeStatusBadge: {
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  disputeStatusText: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: Theme.textSecondary,
  },
  disputeDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  disputeNote: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  requestLeft: {
    flex: 1,
  },
  requestTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  requestMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  requestPrice: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  requestStatus: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: Theme.primary,
    marginTop: 2,
  },
});
