// Job Detail Screen — Premium showcase transaction screen
// Large wage · Map route visual · Staffing · Employer trust · Sticky action

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import {
  MOCK_JOBS,
  CURRENT_WORKER,
  formatWage,
  formatDate,
  formatDistance,
} from '../../data/mockData';
import { useAuthStore } from '../../store';
import { computeJobWorkerMatch } from '../../services/matching/matchingEngine';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const role = useAuthStore((s) => s.role);
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
  const hiringProgress = job.workersRequired > 0 ? job.workersHired / job.workersRequired : 0;
  const isFull = job.workersHired >= job.workersRequired;
  const match = computeJobWorkerMatch(job, CURRENT_WORKER);

  return (
    <View style={styles.container}>
      {/* Nav header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Gig Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Category & Title Section */}
        <View style={styles.topSection}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{job.skillRequired.category.toUpperCase()}</Text>
            </View>
            <View style={styles.matchBadge}>
              <View style={styles.matchDot} />
              <Text style={styles.matchBadgeText}>{match.totalScore}% Match for you</Text>
            </View>
          </View>

          {/* Job Title */}
          <Text style={styles.jobTitle}>{job.title}</Text>

          {/* Wage Hero */}
          <View style={styles.wageHero}>
            <Text style={styles.wageAmount}>{formatWage(job.maxWage)}</Text>
            <Text style={styles.wageUnit}> / day</Text>
          </View>

          {/* Key meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color="#0D3B3F" />
              <Text style={styles.metaText}>{job.location.city} · {formatDistance(job.distanceKm ?? 3)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color="#0D3B3F" />
              <Text style={styles.metaText}>{formatDate(job.startDate)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color="#0D3B3F" />
              <Text style={styles.metaText}>{job.startTime}–{job.endTime}</Text>
            </View>
          </View>
        </View>

        {/* Map Location Visual */}
        <View style={styles.mapSection}>
          <InteractiveMapVisual
            markers={[
              { id: job.id, wage: formatWage(job.maxWage), top: '45%', left: '50%' }
            ]}
            selectedMarkerId={job.id}
            height={160}
            locationCity={job.location.city}
            radiusKm={job.distanceKm ?? 3}
          />
          <View style={styles.locationAddressCard}>
            <Feather name="map-pin" size={14} color="#0D3B3F" />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationAddress}>{job.location.address}</Text>
              <Text style={styles.locationCity}>{job.location.city}, {job.location.state}</Text>
            </View>
          </View>
        </View>

        {/* Staffing Progress */}
        <View style={styles.staffingCard}>
          <View style={styles.staffingHeader}>
            <Text style={styles.staffingTitle}>Hiring Progress</Text>
            <Text style={[styles.staffingCount, isFull && { color: '#10B981' }]}>
              {job.workersHired} / {job.workersRequired} hired
            </Text>
          </View>
          <View style={styles.staffingBarBg}>
            <View
              style={[
                styles.staffingBarFill,
                {
                  width: `${Math.min(hiringProgress * 100, 100)}%` as any,
                  backgroundColor: isFull ? '#10B981' : '#0D3B3F',
                },
              ]}
            />
          </View>
          <Text style={isFull ? styles.staffingFull : styles.staffingOpen}>
            {isFull ? 'All slots filled' : `${job.workersRequired - job.workersHired} positions still available`}
          </Text>
        </View>

        {/* Employer Identity */}
        <View style={styles.employerCard}>
          <View style={styles.employerAvatar}>
            <Text style={styles.employerInitials}>
              {job.employer.businessName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.employerInfo}>
            <View style={styles.employerNameRow}>
              <Text style={styles.employerName}>{job.employer.businessName}</Text>
              {job.employer.verificationStatus === 'verified' && (
                <MaterialCommunityIcons name="check-decagram" size={14} color="#0D3B3F" />
              )}
            </View>
            <Text style={styles.employerType}>{job.employer.businessType}</Text>
            <View style={styles.employerMeta}>
              <Ionicons name="star" size={11} color="#0D3B3F" />
              <Text style={styles.employerMetaText}>{job.employer.rating.toFixed(1)} rating · {job.employer.totalJobsPosted} gigs posted</Text>
            </View>
          </View>
        </View>

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <View style={styles.requirementsCard}>
            <Text style={styles.reqTitle}>Requirements & Tools</Text>
            <View style={styles.reqChips}>
              {job.requirements.map((req, idx) => (
                <View key={idx} style={styles.reqChip}>
                  <Feather name="check" size={11} color="#0D3B3F" strokeWidth={2.5} />
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>About this gig</Text>
          <Text style={styles.descText}>{job.description}</Text>
        </View>

        {/* Escrow Protection Badge */}
        <View style={styles.escrowBadge}>
          <MaterialCommunityIcons name="shield-lock" size={18} color="#0D3B3F" />
          <Text style={styles.escrowText}>
            Payout secured in GigEasy Escrow · Instantly disbursed upon GPS check-out
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.stickyBottom}>
        <View style={styles.stickyWage}>
          <Text style={styles.stickyWageNum}>{formatWage(job.maxWage)}</Text>
          <Text style={styles.stickyWageLabel}>/day</Text>
        </View>
        {role === 'employer' ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('JobApplicants', { jobId: job.id })}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>View Applicants</Text>
            <Feather name="arrow-right" size={16} color="#090D14" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtn, isFull && styles.ctaBtnDisabled]}
            onPress={() => !isFull && navigation.navigate('JobApply', { jobId: job.id })}
            activeOpacity={isFull ? 1 : 0.88}
          >
            <Text style={styles.ctaBtnText}>{isFull ? 'Position Full' : 'Apply Instantly'}</Text>
            {!isFull && <Feather name="arrow-right" size={16} color="#090D14" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#090D14',
  },
  placeholder: { width: 36 },
  scrollContent: { paddingBottom: 20 },

  // Top Section
  topSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
    letterSpacing: 0.8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#090D14',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  matchDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8F135',
  },
  matchBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#C8F135',
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: '#090D14',
    letterSpacing: -0.8,
    lineHeight: 30,
    marginBottom: 6,
  },
  wageHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 36,
    color: '#0D3B3F',
    letterSpacing: -1.2,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: '#8E99A8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578' },
  metaDivider: { width: 1, height: 12, backgroundColor: '#E8E6E0', marginHorizontal: 8 },

  // Map Section
  mapSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  locationAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E8E6E0',
  },
  locationAddress: { fontFamily: FontFamily.bold, fontSize: 12, color: '#090D14' },
  locationCity: { fontFamily: FontFamily.regular, fontSize: 10, color: '#8E99A8', marginTop: 1 },

  // Staffing
  staffingCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  staffingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  staffingTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: '#090D14' },
  staffingCount: { fontFamily: FontFamily.extraBold, fontSize: 14, color: '#0D3B3F' },
  staffingBarBg: { height: 6, backgroundColor: '#F2F0EB', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  staffingBarFill: { height: '100%', borderRadius: 3 },
  staffingFull: { fontFamily: FontFamily.bold, fontSize: 11, color: '#10B981' },
  staffingOpen: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578' },

  // Employer Card
  employerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 12,
    ...Shadow.xs,
  },
  employerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employerInitials: { fontFamily: FontFamily.bold, fontSize: 14, color: '#FFFFFF' },
  employerInfo: { flex: 1 },
  employerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 1 },
  employerName: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14' },
  employerType: { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E99A8', marginBottom: 2 },
  employerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  employerMetaText: { fontFamily: FontFamily.medium, fontSize: 10, color: '#5A6578' },

  // Requirements
  requirementsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  reqTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14', marginBottom: 8 },
  reqChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  reqText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#0D3B3F' },

  // Description
  descCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  descTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14', marginBottom: 6 },
  descText: { fontFamily: FontFamily.regular, fontSize: 12, color: '#5A6578', lineHeight: 18 },

  // Escrow Badge
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#E8F3F4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  escrowText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#0D3B3F', flex: 1, lineHeight: 16 },

  // Sticky Action
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
    ...Shadow.md,
  },
  stickyWage: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  stickyWageNum: { fontFamily: FontFamily.extraBold, fontSize: 22, color: '#0D3B3F', letterSpacing: -0.5 },
  stickyWageLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: '#8E99A8' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C8F135',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  ctaBtnDisabled: { backgroundColor: '#E8E6E0' },
  ctaBtnText: { fontFamily: FontFamily.extraBold, fontSize: 14, color: '#090D14' },
});
