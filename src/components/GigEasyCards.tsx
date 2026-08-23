// GigEasyCard — High-Scannability Consumer Job & Worker Cards
// Strict Hierarchy: 1. Visual/Photo -> 2. Job Name -> 3. Pay -> 4. Location/Dist -> 5. Time -> 6. Action

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  FontFamily,
  FontSize,
  BorderRadius,
  Spacing,
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
  GigEasyStatusPill,
  GigEasyVerifiedBadge,
  getCategoryVisual,
} from './GigEasyPrimitives';
import { useLanguageStore } from '../store';

const T = {
  primary: '#1A68D5',
  primaryLight: '#D6E6FA',
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
};

// ─── Visual Job Card ──────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  onPress: () => void;
  style?: ViewStyle;
}

export const GigEasyJobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  style,
}) => {
  const { t } = useLanguageStore();
  const catVisual = getCategoryVisual(job.skillRequired.category);
  const isFull = job.workersHired >= job.workersRequired;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.jobCard, style]}
    >
      <View style={styles.cardMainRow}>
        {/* 1. Category Visual Thumbnail */}
        <View style={[styles.visualBox, { backgroundColor: catVisual.bg }]}>
          <Feather name={catVisual.iconName} size={22} color={catVisual.color} />
          <Text style={[styles.visualTag, { color: catVisual.color }]} numberOfLines={1}>
            {job.skillRequired.category}
          </Text>
        </View>

        {/* 2. Job Info & 3. Pay */}
        <View style={styles.cardContent}>
          <View style={styles.titleWageRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {job.title}
              </Text>
              <Text style={styles.employerName} numberOfLines={1}>
                {job.employer.businessName}
              </Text>
            </View>

            {/* High-Visibility Warm Wage Pill */}
            <View style={styles.wagePill}>
              <Text style={styles.wageText}>{formatWage(job.maxWage)}</Text>
              <Text style={styles.wageUnit}>/day</Text>
            </View>
          </View>

          {/* 4. Location & 5. Time */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color={T.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {job.location.city} {job.distanceKm !== undefined ? `· ${formatDistance(job.distanceKm)}` : ''}
              </Text>
            </View>

            <View style={styles.metaDot} />

            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={T.textMuted} />
              <Text style={styles.metaText}>
                {t('today')} · {job.startTime}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card Footer: Staffing count & Action CTA */}
      <View style={styles.cardFooter}>
        <View style={styles.hiringCountBadge}>
          <View style={[styles.liveDot, { backgroundColor: isFull ? '#94A3B8' : T.success }]} />
          <Text style={styles.hiringCountText}>
            {isFull ? 'Positions Filled' : `${job.workersRequired - job.workersHired} spots left`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[styles.applyBtn, isFull && styles.applyBtnFull]}
        >
          <Text style={[styles.applyBtnText, isFull && styles.applyBtnFullText]}>
            {isFull ? 'View' : t('applyNow')}
          </Text>
          <Feather name="arrow-right" size={13} color={isFull ? T.textMuted : T.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Visual Worker Card (for Employers) ───────────────────────────────────────

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
}) => {
  const { t } = useLanguageStore();
  const primarySkill = worker.skills[0]?.name ?? 'General Worker';
  const catVisual = getCategoryVisual(worker.skills[0]?.category ?? 'General');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.workerCard, style]}
    >
      <View style={styles.workerTopRow}>
        <GigEasyAvatar
          name={worker.name}
          photoUri={worker.profilePhoto}
          size={50}
          showVerified={worker.verificationStatus === 'verified'}
        />

        <View style={styles.workerInfoCol}>
          <View style={styles.nameVerifiedRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.verificationStatus === 'verified' && (
              <GigEasyVerifiedBadge small />
            )}
          </View>

          {/* Primary skill visual chip */}
          <View style={[styles.skillChip, { backgroundColor: catVisual.bg }]}>
            <Feather name={catVisual.iconName} size={11} color={catVisual.color} />
            <Text style={[styles.skillChipText, { color: catVisual.color }]}>
              {primarySkill}
            </Text>
          </View>

          <View style={styles.workerMetaRow}>
            <GigEasyRating rating={worker.rating} count={worker.completedJobs} />
            <View style={styles.metaDot} />
            <Text style={styles.workerLocText}>{worker.location.city} · Within {worker.preferredRadius}km</Text>
          </View>
        </View>

        {/* Expected daily wage */}
        <View style={styles.workerWageBlock}>
          <Text style={styles.workerWageAmount}>{formatWage(worker.expectedDailyWage)}</Text>
          <Text style={styles.workerWagePeriod}>/day</Text>
        </View>
      </View>

      {/* Action footer */}
      {showActions && (
        <View style={styles.workerActionRow}>
          {onNegotiate && (
            <TouchableOpacity
              onPress={onNegotiate}
              activeOpacity={0.8}
              style={styles.negotiateBtn}
            >
              <Text style={styles.negotiateBtnText}>{t('counterOffer')}</Text>
            </TouchableOpacity>
          )}
          {onAccept && (
            <TouchableOpacity
              onPress={onAccept}
              activeOpacity={0.85}
              style={styles.hireBtn}
            >
              <Text style={styles.hireBtnText}>{t('hireWorker')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {application && (
        <View style={styles.applicationBanner}>
          <GigEasyStatusPill
            status={application.status}
            label={getStatusLabel(application.status)}
            color={getStatusColor(application.status)}
          />
          <Text style={styles.proposedWageText}>
            Asking: {formatWage(application.proposedWage)}/day
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

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
  const catVisual = getCategoryVisual(job.skillRequired.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.appCard}
    >
      <View style={styles.appCardTop}>
        <View style={[styles.smallVisualBox, { backgroundColor: catVisual.bg }]}>
          <Feather name={catVisual.iconName} size={16} color={catVisual.color} />
        </View>

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

      <View style={styles.appCardBottom}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={11} color={T.textMuted} />
          <Text style={styles.appDateText}>{formatDate(job.startDate)} · {job.startTime}</Text>
        </View>
        <Text style={styles.appWageAmount}>{formatWage(proposedWage)}/day</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Job Card
  jobCard: {
    backgroundColor: T.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  visualBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  visualTag: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
  },
  titleWageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 6,
  },
  titleBlock: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.ink,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  employerName: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.textSecondary,
  },
  wagePill: {
    backgroundColor: T.moneyBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  wageText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 15,
    color: T.money,
    letterSpacing: -0.4,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 9.5,
    color: T.money,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hiringCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hiringCountText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: T.textSecondary,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  applyBtnFull: {
    backgroundColor: '#F1F5F9',
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.white,
  },
  applyBtnFullText: {
    color: T.textMuted,
  },

  // Worker Card
  workerCard: {
    backgroundColor: T.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  workerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  workerInfoCol: {
    flex: 1,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.ink,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  skillChipText: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
  },
  workerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerLocText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  workerWageBlock: {
    alignItems: 'flex-end',
    backgroundColor: T.moneyBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workerWageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 15,
    color: T.money,
  },
  workerWagePeriod: {
    fontFamily: FontFamily.medium,
    fontSize: 9.5,
    color: T.money,
  },
  workerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  negotiateBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.primary,
    alignItems: 'center',
  },
  negotiateBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },
  hireBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: T.primary,
    alignItems: 'center',
  },
  hireBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.white,
  },
  applicationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  proposedWageText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: T.textSecondary,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  appCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  smallVisualBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitleBlock: {
    flex: 1,
  },
  appJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.ink,
  },
  appEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  appCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  appDateText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  appWageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 14,
    color: T.money,
  },
});
