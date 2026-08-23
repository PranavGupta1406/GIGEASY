// Employer Dashboard — Premium Consumer-Grade Hiring Overview
// Brand Blue #1A68D5 · Vibrant stats · Live store jobs · Visual worker cards

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import {
  CURRENT_EMPLOYER,
  MOCK_WORKERS,
  formatWage,
} from '../../data/mockData';
import { GigEasyWorkerCard } from '../../components/GigEasyCards';
import { GigEasyStatusPill, GigEasyVerifiedBadge } from '../../components/GigEasyPrimitives';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useEmployerStore, useSharedApplicationsStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  primaryLight: '#D6E6FA',
  money: '#1A68D5',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
};

export const EmployerDashboardScreen: React.FC<Props> = ({ shellNavigation }) => {
  const employer = CURRENT_EMPLOYER;
  const { t } = useLanguageStore();

  const employerJobs = useEmployerStore((s) => s.jobs);
  const { getJobApplications } = useSharedApplicationsStore();

  const totalHired = employerJobs.reduce((sum, j) => sum + (j.workersHired || 0), 0);
  const totalNeeded = employerJobs.reduce((sum, j) => sum + (j.workersRequired || 0), 0);
  const openJobs = employerJobs.filter((j) => j.status === 'HIRING').length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ─── 1. Business Header ─── */}
      <View style={styles.topHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {employer.businessName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName} numberOfLines={1}>{employer.businessName}</Text>
            {employer.verificationStatus === 'verified' && <GigEasyVerifiedBadge small />}
          </View>
          <Text style={styles.contactName}>{employer.contactName} · {employer.location.city}</Text>
        </View>
        <TouchableOpacity
          style={styles.postJobBtn}
          onPress={() => shellNavigation.navigate('PostJob')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color={T.white} />
          <Text style={styles.postJobBtnText}>{t('postJobCTA')}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 2. Quick Stats Row ─── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{openJobs}</Text>
          <Text style={styles.statLabel}>{t('activeJobs')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: T.primary }]}>{totalHired}</Text>
          <Text style={styles.statLabel}>{t('hired')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.max(0, totalNeeded - totalHired)}</Text>
          <Text style={styles.statLabel}>{t('workersNeeded')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{employer.rating.toFixed(1)} ★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* ─── 3. Active Jobs Section ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('activeJobs')}</Text>
          <TouchableOpacity onPress={() => shellNavigation.navigate('MainApp', { initialMode: 'employer' })}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {employerJobs.map((job) => {
          const category = job.skillRequired?.category || 'General';
          const catVisual = getCategoryVisual(category);
          const isFull = (job.workersHired || 0) >= (job.workersRequired || 1);
          const applicants = getJobApplications(job.id);

          return (
            <TouchableOpacity
              key={job.id}
              style={styles.jobSummaryCard}
              onPress={() => shellNavigation.navigate('JobApplicants', { jobId: job.id })}
              activeOpacity={0.88}
            >
              <View style={[styles.jobCatIcon, { backgroundColor: catVisual.bg }]}>
                <Feather name={catVisual.iconName} size={18} color={catVisual.color} />
              </View>

              <View style={styles.jobSummaryInfo}>
                <Text style={styles.jobSummaryTitle} numberOfLines={1}>{job.title}</Text>
                <Text style={styles.jobSummaryMeta}>
                  {job.location.city} · {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.hiringProgress}>
                  <View style={styles.progressTrack}>
                    <View style={[
                      styles.progressFill,
                      { width: `${Math.min(((job.workersHired || 0) / (job.workersRequired || 1)) * 100, 100)}%` }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>{job.workersHired || 0}/{job.workersRequired || 1}</Text>
                </View>
              </View>

              <View style={styles.jobSummaryRight}>
                <Text style={styles.jobWage}>{formatWage(job.maxWage)}</Text>
                <Text style={styles.jobWageUnit}>/day</Text>
                <GigEasyStatusPill
                  status={job.status}
                  label={isFull ? 'Full' : 'Hiring'}
                  color={isFull ? '#10B981' : T.primary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── 4. Available Workers Near You ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Near You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {MOCK_WORKERS.slice(0, 3).map((worker) => (
          <GigEasyWorkerCard
            key={worker.id}
            worker={worker}
            onPress={() => shellNavigation.navigate('WorkerDetail', { workerId: worker.id })}
            showActions
            onAccept={() => shellNavigation.navigate('WorkerDetail', { workerId: worker.id })}
            onNegotiate={() => shellNavigation.navigate('WorkerDetail', { workerId: worker.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingBottom: 32 },

  // Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.extraBold,
    fontSize: 15,
    color: T.white,
    letterSpacing: -0.5,
  },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  businessName: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.ink,
    flex: 1,
  },
  contactName: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: T.textSecondary,
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  postJobBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.white,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: T.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: T.border, marginHorizontal: 4 },
  statNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    color: T.ink,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9.5,
    color: T.textMuted,
    textAlign: 'center',
  },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.ink,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },

  // Job Summary Card
  jobSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  jobCatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobSummaryInfo: { flex: 1 },
  jobSummaryTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    color: T.ink,
    marginBottom: 2,
  },
  jobSummaryMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
    marginBottom: 6,
  },
  hiringProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: T.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: T.primary,
  },
  jobSummaryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  jobWage: {
    fontFamily: FontFamily.extraBold,
    fontSize: 15,
    color: T.primary,
    letterSpacing: -0.3,
  },
  jobWageUnit: {
    fontFamily: FontFamily.regular,
    fontSize: 9.5,
    color: T.textMuted,
    marginTop: -2,
  },
});
