// Job Detail Screen — Wage-First Consumer Overview
// Visual category badge, bold warm wage hero, interactive map, and one-tap apply

import React from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, formatWage, formatDate, formatDistance } from '../../data/mockData';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';
import { getCategoryVisual, GigEasyVerifiedBadge } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useWorkerStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

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
};

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
  const { t } = useLanguageStore();
  const applyForJob = useWorkerStore((s) => s.applyForJob);

  const catVisual = getCategoryVisual(job.skillRequired.category);
  const isFull = job.workersHired >= job.workersRequired;

  const handleApply = () => {
    applyForJob(job.id, job.maxWage);
    Alert.alert(
      'Application Submitted',
      `Your application for ${job.title} at ${formatWage(job.maxWage)}/day was sent to ${job.employer.businessName}.`,
      [{ text: 'View Activity', onPress: () => navigation.goBack() }]
    );
  };

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
        {/* 1. Top Category & Wage Hero */}
        <View style={styles.topSection}>
          <View style={[styles.categoryBadge, { backgroundColor: catVisual.bg }]}>
            <Feather name={catVisual.iconName} size={13} color={catVisual.color} />
            <Text style={[styles.categoryBadgeText, { color: catVisual.color }]}>
              {job.skillRequired.category.toUpperCase()}
            </Text>
          </View>

          {/* Wage Hero */}
          <View style={styles.wageHero}>
            <Text style={styles.wageAmount}>{formatWage(job.maxWage)}</Text>
            <Text style={styles.wageUnit}> / day</Text>
          </View>

          {/* Job Title */}
          <Text style={styles.jobTitle}>{job.title}</Text>

          {/* Employer & Verified badge */}
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

        {/* 2. Map Location */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionHeading}>Work Location</Text>
          <Text style={styles.locationAddress}>{job.location.address}, {job.location.city}</Text>
          <View style={styles.mapWrap}>
            <InteractiveMapVisual
              markers={[
                { id: job.id, wage: formatWage(job.maxWage), top: '45%', left: '50%' }
              ]}
              height={150}
              locationCity={job.location.city}
              radiusKm={5}
            />
          </View>
        </View>

        {/* 3. Shift Requirements */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Shift Overview</Text>
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

        {/* 4. Staffing Status */}
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
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.applyCTA, isFull && styles.applyCTAFull]}
          onPress={handleApply}
          disabled={isFull}
          activeOpacity={0.88}
        >
          <Text style={styles.applyCTAText}>
            {isFull ? 'Positions Filled' : `${t('applyNow')} · ${formatWage(job.maxWage)}/day`}
          </Text>
          {!isFull && <Feather name="arrow-right" size={18} color={T.white} />}
        </TouchableOpacity>
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
  topSection: {
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryBadgeText: { fontFamily: FontFamily.bold, fontSize: 10.5, letterSpacing: 0.5 },
  wageHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    color: T.money,
    letterSpacing: -1,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: T.textSecondary,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: T.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
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
  mapSection: {
    backgroundColor: T.white,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  sectionHeading: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: T.ink, marginBottom: 4 },
  locationAddress: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginBottom: 12 },
  mapWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  infoSection: {
    backgroundColor: T.white,
    marginTop: 12,
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
  applyCTAText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.white,
    letterSpacing: -0.3,
  },
});
