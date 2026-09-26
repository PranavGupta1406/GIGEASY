// AI Demand Forecast Screen — SIH 26089
// Predictive workforce planning and skill gap analysis for cooperatives
// Deterministic heuristics backed by historical booking patterns and seasonal signals

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
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { useDemandForecastStore, useCooperativeStore } from '../../store';
import { SkillCategory } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

export const DemandForecastScreen: React.FC<Props> = ({ navigation }) => {
  const {
    forecasts,
    skillGaps,
    trainingRecommendations,
    selectedZone,
    setSelectedZone,
  } = useDemandForecastStore();

  const { getSelectedCooperative, cooperatives } = useCooperativeStore();
  const currentCoop = getSelectedCooperative() || cooperatives[0];

  const [selectedHorizon, setSelectedHorizon] = useState<'all' | 'tomorrow' | 'this_week'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  const filteredForecasts = forecasts.filter((f) => {
    if (selectedHorizon !== 'all' && f.forecastPeriod !== selectedHorizon) return false;
    if (selectedCategory !== 'all' && f.serviceCategory !== selectedCategory) return false;
    if (selectedZone && f.zone !== selectedZone) return false;
    return true;
  });

  const categories: SkillCategory[] = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Appliance Repair',
    'Caregiving',
  ];

  const handleDeployWorkers = (forecastId: string, actionText: string) => {
    Alert.alert(
      'Workforce Allocation',
      `${actionText}\n\nDispatch notification will be sent to the selected cooperative members via SMS & App.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Dispatch',
          onPress: () => {
            setActionDone((prev) => ({ ...prev, [forecastId]: true }));
            Alert.alert('Dispatched ✓', 'Workers have been notified of priority assignment.');
          },
        },
      ]
    );
  };

  const handleEnrollTraining = (courseName: string, provider: string, targetCount: number) => {
    Alert.alert(
      'Enroll Members in Training',
      `Enroll ${targetCount} cooperative members in "${courseName}" at ${provider}?\n\nTuition is covered 100% by the Cooperative Skill Grant Fund.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve Grant & Enroll',
          onPress: () => {
            Alert.alert('Enrolled ✓', `${targetCount} members registered with ${provider}.`);
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
          <Text style={styles.topNavTitle}>AI Demand Forecasting</Text>
          <Text style={styles.topNavSubtitle}>{currentCoop.name}</Text>
        </View>
        <View style={styles.aiBadge}>
          <MaterialCommunityIcons name="brain" size={14} color={Theme.accent} />
          <Text style={styles.aiBadgeText}>AI-Powered</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Model Transparency Card */}
        <View style={styles.transparencyCard}>
          <View style={styles.transparencyHeader}>
            <MaterialCommunityIcons name="information-outline" size={16} color={Theme.olive} />
            <Text style={styles.transparencyTitle}>Deterministic Demand Forecast Model</Text>
          </View>
          <Text style={styles.transparencyDesc}>
            Calculated from 30-day rolling booking history, day-of-week seasonality, weather signals, and local festive demand patterns across NCR zones.
          </Text>
        </View>

        {/* Time Horizon Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionLabel}>TIME HORIZON</Text>
          <View style={styles.pillRow}>
            {(['all', 'tomorrow', 'this_week'] as const).map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.pill, selectedHorizon === h && styles.pillActive]}
                onPress={() => setSelectedHorizon(h)}
              >
                <Text style={[styles.pillText, selectedHorizon === h && styles.pillTextActive]}>
                  {h === 'all' ? 'All Periods' : h === 'tomorrow' ? 'Tomorrow' : 'This Week'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionLabel}>SERVICE TRADE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            <TouchableOpacity
              style={[styles.pill, selectedCategory === 'all' && styles.pillActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.pillText, selectedCategory === 'all' && styles.pillTextActive]}>
                All Trades
              </Text>
            </TouchableOpacity>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.pill, selectedCategory === c && styles.pillActive]}
                onPress={() => setSelectedCategory(c)}
              >
                <Text style={[styles.pillText, selectedCategory === c && styles.pillTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Forecast Cards */}
        <View style={styles.forecastList}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Predicted Demand & Shortages</Text>
            <Text style={styles.resultCount}>{filteredForecasts.length} forecasts</Text>
          </View>

          {filteredForecasts.map((fc) => {
            const isDeficit = fc.shortage > 0;
            const isDone = actionDone[fc.id];

            return (
              <View key={fc.id} style={styles.forecastCard}>
                {/* Header */}
                <View style={styles.cardTop}>
                  <View style={styles.cardServiceWrap}>
                    <Text style={styles.serviceName}>{fc.serviceCategory}</Text>
                    <Text style={styles.zoneName}>{fc.zone}</Text>
                  </View>
                  <View
                    style={[
                      styles.trendIndicator,
                      { backgroundColor: isDeficit ? '#FEF2F2' : '#ECFDF5' },
                    ]}
                  >
                    <Feather
                      name={fc.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={isDeficit ? Theme.error : Theme.success}
                    />
                    <Text
                      style={[
                        styles.trendValue,
                        { color: isDeficit ? Theme.error : Theme.success },
                      ]}
                    >
                      {fc.changePercent > 0 ? `+${fc.changePercent}%` : `${fc.changePercent}%`}
                    </Text>
                  </View>
                </View>

                {/* Metrics Comparison */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricVal}>{fc.predictedDemand}</Text>
                    <Text style={styles.metricSub}>Predicted Requests</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCol}>
                    <Text style={styles.metricVal}>{fc.currentWorkers}</Text>
                    <Text style={styles.metricSub}>Available Workers</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCol}>
                    <Text
                      style={[
                        styles.metricVal,
                        { color: isDeficit ? Theme.error : Theme.success },
                      ]}
                    >
                      {isDeficit ? `-${fc.shortage}` : `+${Math.abs(fc.shortage)}`}
                    </Text>
                    <Text style={styles.metricSub}>
                      {isDeficit ? 'Workers Short' : 'Surplus'}
                    </Text>
                  </View>
                </View>

                {/* AI Action Box */}
                <View style={styles.actionBox}>
                  <View style={styles.actionHeader}>
                    <MaterialCommunityIcons name="robot" size={14} color="#D97706" />
                    <Text style={styles.actionTitle}>AI Recommended Action</Text>
                  </View>
                  <Text style={styles.actionText}>{fc.recommendedAction}</Text>

                  <TouchableOpacity
                    style={[styles.deployBtn, isDone && styles.deployBtnDone]}
                    disabled={isDone}
                    onPress={() => handleDeployWorkers(fc.id, fc.recommendedAction)}
                  >
                    <Feather
                      name={isDone ? 'check' : 'send'}
                      size={14}
                      color={isDone ? Theme.success : Theme.surface}
                    />
                    <Text style={[styles.deployBtnText, isDone && styles.deployBtnTextDone]}>
                      {isDone ? 'Dispatched to Roster' : 'Execute Allocation'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer Meta */}
                <View style={styles.cardFooter}>
                  <Text style={styles.confidenceText}>
                    Confidence: {Math.round(fc.confidence * 100)}%
                  </Text>
                  <Text style={styles.periodText}>Horizon: {fc.forecastPeriod.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Skill Gap & ITI Course Recommendations */}
        <View style={styles.trainingSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Cooperative Skill Development</Text>
              <Text style={styles.sectionSub}>Closing long-term workforce deficits via NSDC/ITI</Text>
            </View>
          </View>

          {trainingRecommendations.map((tr) => (
            <View key={tr.id} style={styles.trainingCard}>
              <View style={styles.trainingTop}>
                <View style={styles.trainingLeft}>
                  <Text style={styles.courseName}>{tr.courseName}</Text>
                  <Text style={styles.providerName}>{tr.provider} · {tr.durationWeeks} weeks</Text>
                </View>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: tr.urgency === 'high' ? Theme.errorLight : Theme.surfaceSubtle },
                  ]}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: tr.urgency === 'high' ? Theme.error : Theme.primary },
                    ]}
                  >
                    {tr.urgency.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.trainingReason}>{tr.reason}</Text>

              <View style={styles.trainingBottom}>
                <View>
                  <Text style={styles.targetCount}>Target: {tr.targetWorkers} members</Text>
                  {tr.estimatedCost && (
                    <Text style={styles.grantCost}>Grant: ₹{tr.estimatedCost}/member</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.enrollBtn}
                  onPress={() => handleEnrollTraining(tr.courseName, tr.provider, tr.targetWorkers)}
                >
                  <Text style={styles.enrollBtnText}>Sponsor Batch</Text>
                  <Feather name="arrow-right" size={13} color={Theme.surface} />
                </TouchableOpacity>
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
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  aiBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.accent,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  transparencyCard: {
    backgroundColor: Theme.sandLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  transparencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  transparencyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  transparencyDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    lineHeight: 16,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  pillActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
  },
  pillTextActive: {
    color: Theme.surface,
  },
  forecastList: {
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 1,
  },
  resultCount: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
  },
  forecastCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardServiceWrap: {
    flex: 1,
  },
  serviceName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  zoneName: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  trendValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm,
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  metricSub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.border,
  },
  actionBox: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  actionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: '#92400E',
  },
  actionText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
    marginBottom: 10,
  },
  deployBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  deployBtnDone: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: Theme.success,
  },
  deployBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
  deployBtnTextDone: {
    color: Theme.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  confidenceText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
  },
  periodText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    textTransform: 'capitalize',
  },
  trainingSection: {
    marginTop: Spacing.sm,
  },
  trainingCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.sm,
  },
  trainingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  trainingLeft: {
    flex: 1,
  },
  courseName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  providerName: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  urgencyText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
  },
  trainingReason: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    lineHeight: 15,
    marginBottom: 10,
  },
  trainingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetCount: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.ink,
  },
  grantCost: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
  },
  enrollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  enrollBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
});
