// GigEasyCard — Job, Worker, and Application card components
// Modern marketplace cards with layered depth and vector primitives

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  Colors,
  FontFamily,
  FontSize,
  BorderRadius,
  Spacing,
  Shadow,
} from '../constants';
import { Job, WorkerProfile, JobApplication } from '../types';
import {
  formatWage,
  formatDate,
  formatDistance,
  getStatusColor,
  getStatusLabel,
} from '../data/mockData';
import {
  GigEasyAvatar,
  GigEasyRating,
  GigEasyTrustScore,
  GigEasyStatusPill,
  GigEasyVerifiedBadge,
  GigEasyMatchBadge,
} from './GigEasyPrimitives';
import { computeJobWorkerMatch } from '../services/matching/matchingEngine';
import { CURRENT_WORKER } from '../data/mockData';

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  onPress: () => void;
  style?: ViewStyle;
  showMatchScore?: boolean;
}

export const GigEasyJobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  style,
  showMatchScore = true,
}) => {
  const hiringProgress = job.workersHired / job.workersRequired;
  const isFull = job.workersHired >= job.workersRequired;
  const match = computeJobWorkerMatch(job, CURRENT_WORKER);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.jobCard, style]}
    >
      {/* Header Row */}
      <View style={styles.jobCardHeader}>
        <View style={styles.jobCardTitleBlock}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{job.skillRequired.category.toUpperCase()}</Text>
            </View>
            {showMatchScore && <GigEasyMatchBadge score={match.totalScore} />}
          </View>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.jobEmployer} numberOfLines={1}>
            {job.employer.businessName}
          </Text>
        </View>

        <View style={styles.jobWageBlock}>
          <Text style={styles.jobWage}>{formatWage(job.maxWage)}</Text>
          <Text style={styles.jobWageLabel}>/ day</Text>
        </View>
      </View>

      {/* Meta Row */}
      <View style={styles.jobCardMeta}>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color="#5A6578" style={styles.metaIcon} />
          <Text style={styles.metaText}>
            {job.location.city}
            {job.distanceKm !== undefined ? ` · ${formatDistance(job.distanceKm)}` : ''}
          </Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaRow}>
          <Feather name="clock" size={11} color="#5A6578" style={styles.metaIcon} />
          <Text style={styles.metaText}>
            {formatDate(job.startDate)} · {job.startTime}
          </Text>
        </View>
      </View>

      {/* Workers Progress Bar */}
      <View style={styles.workersRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(hiringProgress * 100, 100)}%`,
                backgroundColor: isFull ? '#10B981' : '#0D3B3F',
              },
            ]}
          />
        </View>
        <Text style={styles.workersText}>
          {job.workersHired}/{job.workersRequired} hired
        </Text>
      </View>

      {/* Footer Row */}
      <View style={styles.jobCardFooter}>
        <View style={styles.footerLeft}>
          {job.employer.verificationStatus === 'verified' && (
            <GigEasyVerifiedBadge small />
          )}
          <GigEasyRating rating={job.employer.rating} />
        </View>

        <View style={[styles.applyBtn, isFull && styles.applyBtnFull]}>
          <Text style={[styles.applyBtnText, isFull && styles.applyBtnFullText]}>
            {isFull ? 'Filled' : 'View Gig →'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Worker Card (for Employers) ──────────────────────────────────────────────

interface WorkerCardProps {
  worker: WorkerProfile;
  onPress: () => void;
  onAccept?: () => void;
  onNegotiate?: () => void;
  showActions?: boolean;
  application?: JobApplication;
  style?: ViewStyle;
}

export const GigEasyWorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onPress,
  onAccept,
  onNegotiate,
  showActions = false,
  application,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={[styles.workerCard, style]}
  >
    {/* Top Row */}
    <View style={styles.workerCardTop}>
      <GigEasyAvatar name={worker.name} photoUri={worker.profilePhoto} size={48} showVerified={worker.verificationStatus === 'verified'} />
      <View style={styles.workerInfo}>
        <View style={styles.workerNameRow}>
          <Text style={styles.workerName}>{worker.name}</Text>
          {worker.verificationStatus === 'verified' && (
            <GigEasyVerifiedBadge small />
          )}
        </View>
        <Text style={styles.workerSkills} numberOfLines={1}>
          {worker.skills.map((s) => s.name).join(' · ')}
        </Text>
        <View style={styles.workerStats}>
          <GigEasyRating rating={worker.rating} />
          <View style={styles.statDivider} />
          <GigEasyTrustScore
            score={worker.trustScore}
            label={worker.trustLabel}
          />
        </View>
      </View>
      <View style={styles.workerWageBlock}>
        <Text style={styles.workerWage}>{formatWage(worker.expectedDailyWage)}</Text>
        <Text style={styles.workerWageLabel}>/day</Text>
      </View>
    </View>

    {/* Details Chips */}
    <View style={styles.workerCardDetails}>
      <View style={styles.detailChip}>
        <Text style={styles.detailText}>{worker.experienceYears}y exp</Text>
      </View>
      <View style={styles.detailChip}>
        <Text style={styles.detailText}>{worker.completedJobs} gigs done</Text>
      </View>
      <View style={styles.detailChip}>
        <Text style={styles.detailText}>Within {worker.preferredRadius} km</Text>
      </View>
    </View>

    {/* Actions */}
    {showActions && (
      <View style={styles.workerActions}>
        {onNegotiate && (
          <TouchableOpacity
            onPress={onNegotiate}
            activeOpacity={0.8}
            style={styles.negotiateBtn}
          >
            <Text style={styles.negotiateBtnText}>Negotiate</Text>
          </TouchableOpacity>
        )}
        {onAccept && (
          <TouchableOpacity
            onPress={onAccept}
            activeOpacity={0.8}
            style={styles.acceptBtn}
          >
            <Text style={styles.acceptBtnText}>Hire Worker</Text>
          </TouchableOpacity>
        )}
      </View>
    )}

    {/* Application Status */}
    {application && (
      <View style={styles.applicationStatus}>
        <GigEasyStatusPill
          status={application.status}
          label={getStatusLabel(application.status)}
          color={getStatusColor(application.status)}
        />
        <Text style={styles.proposedWage}>
          Asking: {formatWage(application.proposedWage)}/day
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// ─── Application Card (Worker View) ──────────────────────────────────────────

interface ApplicationCardProps {
  application: JobApplication;
  onPress: () => void;
}

export const GigEasyApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
}) => {
  const { job, status, proposedWage } = application;
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.applicationCard}
    >
      <View style={styles.appCardHeader}>
        <View style={styles.appTitleBlock}>
          <Text style={styles.appJobTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.appEmployer}>{job.employer.businessName}</Text>
        </View>
        <GigEasyStatusPill
          status={status}
          label={getStatusLabel(status)}
          color={statusColor}
        />
      </View>
      <View style={styles.appCardMeta}>
        <View style={styles.metaRow}>
          <Feather name="clock" size={11} color="#5A6578" style={styles.metaIcon} />
          <Text style={styles.appMetaText}>
            {formatDate(job.startDate)} · {job.startTime}
          </Text>
        </View>
        <Text style={styles.appWage}>{formatWage(proposedWage)}/day</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Job Card
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  jobCardTitleBlock: {
    flex: 1,
    marginRight: Spacing[2],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  jobEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  jobWageBlock: {
    alignItems: 'flex-end',
  },
  jobWage: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: '#0D3B3F',
    letterSpacing: -0.4,
  },
  jobWageLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#8E99A8',
  },
  jobCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[2.5],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4D1C8',
    marginHorizontal: Spacing[2],
  },
  workersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[2.5],
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F2F0EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  workersText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  applyBtn: {
    backgroundColor: '#090D14',
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  applyBtnFull: {
    backgroundColor: '#F2F0EB',
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  applyBtnFullText: {
    color: '#8E99A8',
  },

  // Worker Card
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  workerCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[2.5],
  },
  workerInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginBottom: 2,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    letterSpacing: -0.3,
  },
  workerSkills: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    marginBottom: Spacing[1],
  },
  workerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E8E6E0',
  },
  workerWageBlock: {
    alignItems: 'flex-end',
  },
  workerWage: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.base,
    color: '#0D3B3F',
  },
  workerWageLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#8E99A8',
  },
  workerCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
    marginBottom: Spacing[1],
  },
  detailChip: {
    backgroundColor: '#F2F0EB',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: 4,
  },
  detailText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#4B5565',
  },
  workerActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  negotiateBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#090D14',
    alignItems: 'center',
  },
  negotiateBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  applicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  proposedWage: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },

  // Application Card
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing[3.5],
    marginBottom: Spacing[2.5],
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  appTitleBlock: {
    flex: 1,
    marginRight: Spacing[2],
  },
  appJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    marginBottom: 1,
    letterSpacing: -0.3,
  },
  appEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  appCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  appWage: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.sm,
    color: '#0D3B3F',
  },
});
