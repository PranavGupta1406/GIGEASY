// GigEasy Live Workforce Gap Widget — Operational Staffing Progress
// Turns employer demand into a live operational tracker.
// Shows: [X / Y filled] · [Z workers needed] · Live progress bar · One-tap Radar Dispatch.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme';
import { FontFamily } from '../constants';
import { WorkforceGap, Job } from '../types';

interface WorkforceGapWidgetProps {
  job: Job;
  gap: WorkforceGap;
  onDispatchRadar?: () => void;
  onViewApplicants?: () => void;
}

export const WorkforceGapWidget: React.FC<WorkforceGapWidgetProps> = ({
  job,
  gap,
  onDispatchRadar,
  onViewApplicants,
}) => {
  const isFilled = gap.workersRemaining === 0;
  const isUrgent = gap.workersRemaining > 0 && gap.workersRemaining <= 2;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.eyebrowRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isFilled ? Theme.forestGreen : isUrgent ? Theme.accent : Theme.warning }
          ]} />
          <Text style={styles.eyebrow}>WORKFORCE GAP · LIVE STAFFING</Text>
        </View>

        <Text style={[
          styles.remainingBadge,
          { color: isFilled ? Theme.forestGreen : isUrgent ? Theme.accent : Theme.ink }
        ]}>
          {isFilled ? 'Fully Staffed ✓' : `${gap.workersRemaining} needed`}
        </Text>
      </View>

      {/* Main Count & Fill Progress */}
      <View style={styles.metricsRow}>
        <View style={styles.countBlock}>
          <Text style={styles.countNumber}>
            {gap.workersHired} <Text style={styles.countDivider}>/</Text> {gap.workersRequired}
          </Text>
          <Text style={styles.countSub}>positions confirmed</Text>
        </View>

        <View style={styles.applicantsBlock}>
          <Text style={styles.applicantsCount}>{gap.applicantsCount}</Text>
          <Text style={styles.applicantsSub}>applicants</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(100, Math.max(8, gap.fillPercentage))}%`,
              backgroundColor: isFilled ? Theme.forestGreen : Theme.accent,
            },
          ]}
        />
      </View>

      {/* Action Footer */}
      <View style={styles.actionFooter}>
        <View style={styles.poolInfo}>
          <Feather name="users" size={12} color={Theme.textSecondary} />
          <Text style={styles.poolText}>
            {gap.availableWorkerPool} suitable workers active in area
          </Text>
        </View>

        <View style={styles.btnsRow}>
          {onViewApplicants && (
            <TouchableOpacity
              style={styles.viewAppsBtn}
              onPress={onViewApplicants}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAppsText}>Review ({gap.applicantsCount})</Text>
            </TouchableOpacity>
          )}

          {!isFilled && onDispatchRadar && (
            <TouchableOpacity
              style={styles.radarBtn}
              onPress={onDispatchRadar}
              activeOpacity={0.85}
            >
              <Feather name="radio" size={12} color={Theme.surface} />
              <Text style={styles.radarBtnText}>Radar Dispatch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    color: Theme.ink,
    letterSpacing: 0.5,
  },
  remainingBadge: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  countBlock: {
    gap: 2,
  },
  countNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.5,
  },
  countDivider: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    color: Theme.textMuted,
  },
  countSub: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  applicantsBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  applicantsCount: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.accent,
  },
  applicantsSub: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textMuted,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  poolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  poolText: {
    fontFamily: FontFamily.regular,
    fontSize: 10.5,
    color: Theme.textSecondary,
  },
  btnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAppsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  viewAppsText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.ink,
  },
  radarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Theme.accent,
  },
  radarBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.surface,
  },
});
