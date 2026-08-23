// Job Detail Screen — Complete Apply Flow
// Applied state guard · Duplicate prevention · Live status from shared store

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, formatWage, formatDate, formatDistance } from '../../data/mockData';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';
import { getCategoryVisual, GigEasyVerifiedBadge } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useWorkerStore, useSharedApplicationsStore } from '../../store';
import { googleMapsService } from '../../services/maps/googleMapsService';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  money: '#0F6FDE',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#16A34A',
  successLight: '#DCFCE7',
};

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;

  // Look up in employer store first (to get live posted jobs), fallback to MOCK_JOBS
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];

  const { t } = useLanguageStore();
  const workerProfile = useWorkerStore((s) => s.profile);
  const { applyForJob, hasApplied } = useSharedApplicationsStore();

  const workerId = workerProfile?.id ?? 'w1';
  const alreadyApplied = hasApplied(jobId, workerId);

  const [justApplied, setJustApplied] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const catVisual = getCategoryVisual(job.skillRequired.category);
  const isFull = job.workersHired >= job.workersRequired;

  const handleApply = () => {
    if (alreadyApplied || justApplied || isFull) return;

    const worker = workerProfile ?? {
      id: 'w1',
      name: 'Ravi Kumar',
    } as any;

    applyForJob(jobId, job.maxWage, worker, job);
    setJustApplied(true);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const isApplied = alreadyApplied || justApplied;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Nav header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Job Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. Category Visual Banner */}
        <View style={[styles.categoryBanner, { backgroundColor: catVisual.bg }]}>
          <View style={[styles.categoryIconCircle, { backgroundColor: catVisual.color + '22' }]}>
            <Feather name={catVisual.iconName} size={28} color={catVisual.color} />
          </View>
          <View style={styles.categoryBannerText}>
            <Text style={[styles.categoryLabel, { color: catVisual.color }]}>
              {job.skillRequired.category.toUpperCase()}
            </Text>
            <Text style={styles.bannerJobTitle}>{job.title}</Text>
          </View>
        </View>

        {/* 2. Wage Hero + Key Info */}
        <View style={styles.topSection}>
          <View style={styles.wageRow}>
            <View>
              <Text style={styles.wageAmount}>{formatWage(job.maxWage)}</Text>
              <Text style={styles.wageUnit}>per day</Text>
            </View>
            <View style={styles.wageRange}>
              <Text style={styles.wageRangeText}>
                Range: {formatWage(job.minWage)} – {formatWage(job.maxWage)}
              </Text>
            </View>
          </View>

          {/* Employer row */}
          <View style={styles.employerRow}>
            <Text style={styles.employerName}>{job.employer.businessName}</Text>
            {job.employer.verificationStatus === 'verified' && <GigEasyVerifiedBadge small />}
          </View>

          {/* Key meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color={T.primary} />
              <Text style={styles.metaText}>{job.location.city} · {formatDistance(job.distanceKm ?? 2)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={T.textSecondary} />
              <Text style={styles.metaText}>{formatDate(job.startDate)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="clock" size={13} color={T.textSecondary} />
              <Text style={styles.metaText}>{job.startTime} – {job.endTime}</Text>
            </View>
          </View>
        </View>

        {/* 3. Map Location */}
        <View style={styles.mapSection}>
          <View style={styles.locationHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Work Location</Text>
              <Text style={styles.locationAddress}>{job.location.address}, {job.location.city}</Text>
            </View>
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => googleMapsService.openDirections({
                destLat: job.location.lat,
                destLng: job.location.lng,
                destLabel: job.title,
              })}
              activeOpacity={0.8}
            >
              <Feather name="navigation" size={13} color={T.white} />
              <Text style={styles.directionsBtnText}>Directions</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapWrap}>
            <InteractiveMapVisual
              markers={[
                { id: job.id, wage: formatWage(job.maxWage), top: '45%', left: '50%', lat: job.location.lat, lng: job.location.lng }
              ]}
              height={160}
              locationCity={job.location.city}
              radiusKm={5}
              centerLat={job.location.lat}
              centerLng={job.location.lng}
            />
          </View>
        </View>

        {/* 4. Shift Overview */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>About This Job</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>

          {job.requirements && job.requirements.length > 0 && (
            <View style={styles.reqList}>
              {job.requirements.map((req, idx) => (
                <View key={idx} style={styles.reqItem}>
                  <Feather name="check-circle" size={14} color={T.primary} />
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 5. Staffing Status */}
        <View style={styles.infoSection}>
          <View style={styles.staffingRow}>
            <Text style={styles.sectionHeading}>Open Positions</Text>
            <Text style={styles.staffingCount}>{job.workersHired} of {job.workersRequired} filled</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((job.workersHired / job.workersRequired) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Applied Success Banner */}
        {isApplied && (
          <View style={styles.appliedBanner}>
            <Feather name="check-circle" size={18} color={T.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.appliedBannerTitle}>Application Sent!</Text>
              <Text style={styles.appliedBannerSub}>
                Check your Activity tab to track the status.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.applyCTA,
              isFull && styles.applyCTAFull,
              isApplied && styles.applyCTAApplied,
            ]}
            onPress={handleApply}
            disabled={isFull || isApplied}
            activeOpacity={0.88}
          >
            {isApplied ? (
              <>
                <Feather name="check-circle" size={18} color={T.success} />
                <Text style={[styles.applyCTAText, styles.appliedText]}>Applied ✓</Text>
              </>
            ) : isFull ? (
              <Text style={styles.applyCTAText}>All Positions Filled</Text>
            ) : (
              <>
                <Text style={styles.applyCTAText}>
                  {t('applyNow')} · {formatWage(job.maxWage)}/day
                </Text>
                <Feather name="arrow-right" size={18} color={T.white} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: 4 },
  navTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: T.ink },
  scrollContent: { paddingBottom: 100 },

  // Category Banner
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBannerText: { flex: 1 },
  categoryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  bannerJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: T.ink,
    letterSpacing: -0.3,
  },

  // Top section
  topSection: {
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  wageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 34,
    color: T.money,
    letterSpacing: -1,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    marginBottom: 4,
  },
  wageRange: {
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  wageRangeText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: T.primary,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  employerName: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: T.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.ink },
  metaDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1' },

  // Map
  mapSection: {
    backgroundColor: T.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  directionsBtnText: { fontFamily: FontFamily.bold, fontSize: 11, color: T.white },
  sectionHeading: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: T.ink, marginBottom: 2 },
  locationAddress: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary },
  mapWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.border },

  // Info sections
  infoSection: {
    backgroundColor: T.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  descriptionText: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, lineHeight: 20, marginBottom: 12 },
  reqList: { gap: 8 },
  reqItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reqText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.ink },
  staffingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  staffingCount: { fontFamily: FontFamily.bold, fontSize: 12, color: T.primary },
  progressBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.primary, borderRadius: 3 },

  // Applied banner
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.successLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  appliedBannerTitle: { fontFamily: FontFamily.bold, fontSize: 13.5, color: '#15803D', marginBottom: 2 },
  appliedBannerSub: { fontFamily: FontFamily.regular, fontSize: 11.5, color: '#166534' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  applyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.primary,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 24,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  applyCTAFull: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  applyCTAApplied: {
    backgroundColor: T.successLight,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    shadowOpacity: 0,
  },
  applyCTAText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.white,
    letterSpacing: -0.3,
  },
  appliedText: {
    color: T.success,
  },
});
