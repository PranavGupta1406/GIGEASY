// GigEasy Cards — Production Design System v2
// Icon-first. Earnings dominant. Visual match signals. Zero paragraph text.
// JobCard · WorkerCard · ApplicationCard · PersonalizedJobCard · BestMatchBanner

import React, { useState } from 'react';
import { MatchScoreBreakdown } from '../services/matching/matchingEngine';
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
import { Theme } from '../theme';

// ─── Job Card ─────────────────────────────────────────────────────────────────
// Visual hierarchy: ICON + TITLE / WAGE → TIME • DISTANCE → SPOTS + ACTION
// Everything communicates in one scan. No paragraph text.

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
  const { t, language } = useLanguageStore();
  const isHi = language === 'hi';
  const catVisual = getCategoryVisual(job.skillRequired.category);
  const isFull = job.workersHired >= job.workersRequired;
  const spotsLeft = job.workersRequired - job.workersHired;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.87}
      style={[styles.jobCard, style]}
    >
      {/* Category icon tile — communicates work type BEFORE reading title */}
      <View style={[styles.catIconTile, { backgroundColor: catVisual.bg }]}>
        <Feather name={catVisual.iconName} size={20} color={catVisual.color} />
      </View>

      <View style={styles.cardContent}>
        {/* Row 1: Title + Wage */}
        <View style={styles.titleWageRow}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          <View style={styles.wageBlock}>
            <Text style={styles.wageAmount}>{formatWage(job.maxWage)}</Text>
            <Text style={styles.wageUnit}>{t('perDay')}</Text>
          </View>
        </View>

        {/* Row 2: Time • Distance • City — icon-first, no labels */}
        <View style={styles.metaRow}>
          <Feather name="clock" size={11} color={Theme.textMuted} />
          <Text style={styles.metaText}>{job.startTime}</Text>
          <View style={styles.metaDot} />
          <Feather name="map-pin" size={11} color={Theme.textMuted} />
          <Text style={styles.metaText}>
            {job.distanceKm !== undefined ? `${formatDistance(job.distanceKm)} · ` : ''}{job.location.city}
          </Text>
        </View>

        {/* Row 3: Spots indicator + Apply CTA */}
        <View style={styles.footerRow}>
          <View style={styles.spotsRow}>
            <View style={[
              styles.spotsIndicator,
              { backgroundColor: isFull ? Theme.textDisabled : Theme.forestGreen }
            ]} />
            <Text style={[styles.spotsText, { color: isFull ? Theme.textMuted : Theme.forestGreen }]}>
              {isFull ? (isHi ? 'भर गया' : 'Full') : `${spotsLeft} ${isHi ? 'जगह बाकी' : (spotsLeft === 1 ? 'spot' : 'spots')}`}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.applyBtn, isFull && styles.applyBtnFull]}
          >
            <Text style={[styles.applyBtnText, isFull && styles.applyBtnFullText]}>
              {isFull ? (isHi ? 'देखें' : 'View') : (isHi ? 'काम देखें' : 'Apply')}
            </Text>
            <Feather
              name="arrow-right"
              size={11}
              color={isFull ? Theme.textMuted : Theme.textOnAccent}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Worker Card — Employer View ──────────────────────────────────────────────

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
  const { t, language } = useLanguageStore();
  const primarySkill = worker.skills[0]?.name ?? 'General Worker';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.87}
      style={[styles.workerCard, style]}
    >
      <View style={styles.workerTopRow}>
        <GigEasyAvatar
          name={worker.name}
          photoUri={worker.profilePhoto}
          size={46}
          showVerified={worker.verificationStatus === 'verified'}
        />

        <View style={styles.workerInfoCol}>
          <View style={styles.nameVerifiedRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.verificationStatus === 'verified' && (
              <GigEasyVerifiedBadge small />
            )}
          </View>

          <Text style={styles.skillLabel}>{primarySkill}</Text>

          <View style={styles.workerMetaRow}>
            <GigEasyRating rating={worker.rating} />
            <View style={styles.metaDot} />
            <Feather name="map-pin" size={10} color={Theme.textMuted} />
            <Text style={styles.workerLocText}>
              {worker.location.city}
            </Text>
          </View>
        </View>

        {/* Trust Score — restrained olive */}
        <View style={styles.trustBlock}>
          <Text style={styles.trustScore}>{worker.trustScore}</Text>
          <Text style={styles.trustLabel}>{t('trustScore') || (language === 'hi' ? 'भरोसा' : 'Trust')}</Text>
        </View>
      </View>

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
            label={getStatusLabel(application.status, language)}
            color={getStatusColor(application.status)}
          />
          <Text style={styles.proposedWageText}>
            {formatWage(application.proposedWage)}{t('perDay')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Application Card — Worker Activity View ──────────────────────────────────

interface ApplicationCardProps {
  application: JobApplication;
  onPress: () => void;
}

export const GigEasyApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
}) => {
  const { language } = useLanguageStore();
  const { job, status, proposedWage } = application;
  const statusColor = getStatusColor(status);
  const catVisual = getCategoryVisual(job.skillRequired.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.87}
      style={styles.appCard}
    >
      <View style={styles.appCardTop}>
        {/* Category icon */}
        <View style={[styles.catIconTileSmall, { backgroundColor: catVisual.bg }]}>
          <Feather name={catVisual.iconName} size={14} color={catVisual.color} />
        </View>

        <View style={styles.appTitleBlock}>
          <Text style={styles.appJobTitle} numberOfLines={1}>{job.title}</Text>
          <View style={styles.appMetaRow}>
            <Feather name="clock" size={10} color={Theme.textMuted} />
            <Text style={styles.appMetaText}>{formatDate(job.startDate)}</Text>
          </View>
        </View>

        <View style={styles.appRightCol}>
          <Text style={styles.appWageAmount}>{formatWage(proposedWage)}</Text>
          <GigEasyStatusPill
            status={status}
            label={getStatusLabel(status, language)}
            color={statusColor}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ── Job Card ─────────────────────────────────────────────────────────────────
  jobCard: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  catIconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catIconTileSmall: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  titleWageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    letterSpacing: -0.3,
    flex: 1,
    lineHeight: 20,
  },
  wageBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 17,
    color: Theme.accent,
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 9.5,
    color: Theme.textMuted,
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.sandDark,
    marginHorizontal: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  spotsIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  spotsText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  applyBtnFull: {
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.textOnAccent,
  },
  applyBtnFullText: {
    color: Theme.textMuted,
  },

  // ── Worker Card ──────────────────────────────────────────────────────────────
  workerCard: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  workerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  workerInfoCol: {
    flex: 1,
    gap: 2,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: 14.5,
    color: Theme.ink,
    letterSpacing: -0.2,
  },
  skillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  workerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  workerLocText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  trustBlock: {
    alignItems: 'center',
    backgroundColor: Theme.oliveLight,
    borderWidth: 1,
    borderColor: Theme.oliveMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    minWidth: 42,
  },
  trustScore: {
    fontFamily: FontFamily.extraBold,
    fontSize: 13,
    color: Theme.olive,
    letterSpacing: -0.3,
  },
  trustLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: Theme.olive,
  },
  workerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.cardBorder,
  },
  negotiateBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
  },
  negotiateBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.ink,
  },
  hireBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: Theme.accent,
    alignItems: 'center',
  },
  hireBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.textOnAccent,
  },
  applicationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.cardBorder,
  },
  proposedWageText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.amber,
  },

  // ── Application Card ─────────────────────────────────────────────────────────
  appCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  appCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitleBlock: {
    flex: 1,
    gap: 3,
  },
  appJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.ink,
    letterSpacing: -0.2,
  },
  appMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  appRightCol: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  appWageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 14,
    color: Theme.amber,
    letterSpacing: -0.3,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── PersonalizedJobCard ───────────────────────────────────────────────────────
// Icon-first. Match communicated via left stripe strength + visual chips.
// No "% match" pill text. No paragraph "why" reasoning.
// ─────────────────────────────────────────────────────────────────────────────

interface PersonalizedJobCardProps {
  job: Job;
  match: MatchScoreBreakdown;
  finalScore: number;
  reasons: string[];
  distanceKm: number;
  isNew?: boolean;
  isSelected?: boolean;
  onPress: () => void;
}

// Convert verbose reason strings into compact icon+micro-label chips
function parseReasonChip(reason: string, isHi: boolean = false): { icon: keyof typeof Feather.glyphMap; label: string } {
  const r = reason.toLowerCase();
  if (r.includes('skill') || r.includes('trade') || r.includes('experience') || r.includes('match') || r.includes('स्किल')) {
    return { icon: 'check-circle', label: isHi ? 'स्किल मिलती है' : 'Skill match' };
  }
  if (r.includes('km') || r.includes('radius') || r.includes('distance') || r.includes('near') || r.includes('दूरी') || r.includes('नज़दीक')) {
    return { icon: 'map-pin', label: isHi ? 'पास में' : 'Nearby' };
  }
  if (r.includes('avail') || r.includes('time') || r.includes('schedule') || r.includes('समय') || r.includes('उपलब्ध')) {
    return { icon: 'clock', label: isHi ? 'समय सही' : 'Available' };
  }
  if (r.includes('pay') || r.includes('wage') || r.includes('earn') || r.includes('दिहाड़ी') || r.includes('पैसे')) {
    return { icon: 'dollar-sign', label: isHi ? 'सही दिहाड़ी' : 'Good pay' };
  }
  if (r.includes('rating') || r.includes('rated') || r.includes('trusted') || r.includes('भरोसा')) {
    return { icon: 'star', label: isHi ? 'भरोसेमंद' : 'Trusted' };
  }
  return { icon: 'check', label: reason.split(' ').slice(0, 2).join(' ') };
}

// Left stripe color signals match quality before the user reads anything
function getStripeColor(score: number): string {
  if (score >= 90) return Theme.forestGreen;
  if (score >= 70) return Theme.olive;
  if (score >= 50) return Theme.amber;
  return Theme.textMuted;
}

export const PersonalizedJobCard: React.FC<PersonalizedJobCardProps> = ({
  job,
  match,
  finalScore,
  reasons,
  distanceKm,
  isNew = false,
  isSelected = false,
  onPress,
}) => {
  const { t, language } = useLanguageStore();
  const isHi = language === 'hi';
  const [expanded, setExpanded] = useState(false);
  const catVisual = getCategoryVisual(job.skillRequired.category);
  const isFull = job.workersHired >= job.workersRequired;
  const spotsLeft = job.workersRequired - job.workersHired;
  const stripeColor = getStripeColor(finalScore);

  // Deduplicate and limit to 3 chips max
  const chips = reasons
    .map(r => parseReasonChip(r, isHi))
    .filter((c, i, arr) => arr.findIndex(x => x.label === c.label) === i)
    .slice(0, 3);

  return (
    <View style={[pStyles.card, isSelected && pStyles.cardSelected]}>
      {/* Left match stripe — color signals quality at a glance */}
      <View style={[pStyles.matchStripe, { backgroundColor: stripeColor }]} />

      {/* New gig pulse dot */}
      {isNew && <View style={pStyles.newDot} />}

      <TouchableOpacity onPress={onPress} activeOpacity={0.87} style={pStyles.inner}>
        {/* Row 1: Category icon + Title + Wage */}
        <View style={pStyles.topRow}>
          <View style={[pStyles.catIconTile, { backgroundColor: catVisual.bg }]}>
            <Feather name={catVisual.iconName} size={19} color={catVisual.color} />
          </View>

          <View style={pStyles.titleBlock}>
            <Text style={pStyles.jobTitle} numberOfLines={1}>{job.title}</Text>
            <View style={pStyles.metaRow}>
              <Feather name="clock" size={10} color={Theme.textMuted} />
              <Text style={pStyles.metaText}>{job.startTime}</Text>
              <View style={pStyles.metaDot} />
              <Feather name="map-pin" size={10} color={Theme.textMuted} />
              <Text style={pStyles.metaText}>{distanceKm.toFixed(1)} km</Text>
            </View>
          </View>

          <View style={pStyles.wageCol}>
            <Text style={pStyles.wageAmount}>{formatWage(job.maxWage)}</Text>
            <Text style={pStyles.wageUnit}>{t('perDay')}</Text>
          </View>
        </View>

        {/* Row 2: Match reason chips + Apply button */}
        <View style={pStyles.footerRow}>
          <View style={pStyles.chipsRow}>
            {chips.map((chip, i) => (
              <View key={i} style={pStyles.chip}>
                <Feather name={chip.icon} size={9} color={stripeColor} />
                <Text style={[pStyles.chipText, { color: stripeColor }]}>{chip.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[pStyles.applyBtn, isFull && pStyles.applyBtnFull]}
          >
            <Text style={[pStyles.applyBtnText, isFull && pStyles.applyBtnFullText]}>
              {isFull ? (isHi ? 'देखें' : 'View') : (isHi ? 'काम देखें' : 'Apply')}
            </Text>
            <Feather
              name="arrow-right"
              size={11}
              color={isFull ? Theme.textMuted : Theme.textOnAccent}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const pStyles = StyleSheet.create({
  card: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardSelected: {
    borderColor: Theme.accent,
    borderWidth: 1.5,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#FFFDFB',
  },
  matchStripe: {
    width: 4,
  },
  newDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Theme.forestGreen,
    zIndex: 10,
  },
  inner: {
    flex: 1,
    padding: 13,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconTile: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14.5,
    color: Theme.ink,
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  metaDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: Theme.sandDark,
    marginHorizontal: 2,
  },
  wageCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 16,
    color: Theme.accent,
    letterSpacing: -0.5,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 9.5,
    color: Theme.textMuted,
    textAlign: 'right',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  chipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 9.5,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.accent,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    flexShrink: 0,
  },
  applyBtnFull: {
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.textOnAccent,
  },
  applyBtnFullText: { color: Theme.textMuted },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── BestMatchBanner — Visually dominant #1 ranked gig ────────────────────────
// This must NOT look like a bigger card. It IS different — it is the highlight.
// ─────────────────────────────────────────────────────────────────────────────

interface BestMatchBannerProps {
  job: Job;
  finalScore: number;
  distanceKm: number;
  moreCount?: number;
  onPress: () => void;
}

export const BestMatchBanner: React.FC<BestMatchBannerProps> = ({
  job,
  finalScore,
  distanceKm,
  moreCount = 0,
  onPress,
}) => {
  const { t, language } = useLanguageStore();
  const isHi = language === 'hi';
  const catVisual = getCategoryVisual(job.skillRequired.category);
  // Fit bar: 10 blocks, filled proportional to score
  const filledBlocks = Math.round((finalScore / 100) * 10);

  return (
    <View style={bmStyles.wrapper}>
      {/* Best Fit chip — compact, green, no verbose text */}
      <View style={bmStyles.eyebrowRow}>
        <View style={bmStyles.bestFitChip}>
          <View style={bmStyles.bestFitDot} />
          <Text style={bmStyles.bestFitText}>{isHi ? 'बेस्ट काम' : 'BEST FIT'}</Text>
        </View>
        {moreCount > 0 && (
          <Text style={bmStyles.moreCountText}>+{moreCount} {isHi ? 'और काम' : 'more'}</Text>
        )}
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.87} style={bmStyles.card}>
        {/* Forest green left accent — visually distinguishes from ordinary cards */}
        <View style={bmStyles.leftAccent} />

        <View style={bmStyles.cardInner}>
          {/* Top: Large category icon + title + wage */}
          <View style={bmStyles.topSection}>
            <View style={[bmStyles.catIconLarge, { backgroundColor: catVisual.bg }]}>
              <Feather name={catVisual.iconName} size={24} color={catVisual.color} />
            </View>

            <View style={bmStyles.titleSection}>
              <Text style={bmStyles.jobTitle} numberOfLines={1}>{job.title}</Text>
              <Text style={bmStyles.employerName}>{job.employer.businessName}</Text>
            </View>

            <View style={bmStyles.wageSection}>
              <Text style={bmStyles.wageAmount}>{formatWage(job.maxWage)}</Text>
              <Text style={bmStyles.wageUnit}>{t('perDay')}</Text>
            </View>
          </View>

          {/* Middle: Time + Distance — icon row, no labels */}
          <View style={bmStyles.metaRow}>
            <Feather name="clock" size={12} color={Theme.textSecondary} />
            <Text style={bmStyles.metaText}>{isHi ? 'आज' : 'Today'} · {job.startTime}</Text>
            <View style={bmStyles.metaDot} />
            <Feather name="map-pin" size={12} color={Theme.textSecondary} />
            <Text style={bmStyles.metaText}>{distanceKm.toFixed(1)} km · {job.location.city}</Text>
          </View>

          {/* Fit bar — visual score, no text label */}
          <View style={bmStyles.fitRow}>
            <View style={bmStyles.fitBar}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    bmStyles.fitBlock,
                    { backgroundColor: i < filledBlocks ? Theme.forestGreen : Theme.border }
                  ]}
                />
              ))}
            </View>
            <Text style={bmStyles.fitLabel}>
              {finalScore >= 90
                ? (isHi ? 'बेहतरीन काम' : 'Excellent fit')
                : finalScore >= 75
                ? (isHi ? 'बहुत सही काम' : 'Strong fit')
                : (isHi ? 'अच्छा काम' : 'Good fit')}
            </Text>
          </View>

          {/* CTA — full width, prominent */}
          <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={bmStyles.cta}>
            <Text style={bmStyles.ctaText}>{isHi ? 'काम देखें' : 'View Gig'}</Text>
            <Feather name="arrow-right" size={14} color={Theme.textOnAccent} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const bmStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  bestFitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.forestGreenLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: Theme.forestGreenBorder,
  },
  bestFitDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.forestGreen,
  },
  bestFitText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.forestGreen,
    letterSpacing: 0.5,
  },
  moreCountText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textMuted,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Theme.forestGreenBorder,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftAccent: {
    width: 5,
    backgroundColor: Theme.forestGreen,
  },
  cardInner: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  catIconLarge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleSection: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Theme.ink,
    letterSpacing: -0.4,
    lineHeight: 22,
    marginBottom: 2,
  },
  employerName: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  wageSection: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 19,
    color: Theme.accent,
    letterSpacing: -0.6,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.textMuted,
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.sandDark,
    marginHorizontal: 1,
  },
  fitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fitBar: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
  },
  fitBlock: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  fitLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.forestGreen,
    flexShrink: 0,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  ctaText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.textOnAccent,
  },
});
