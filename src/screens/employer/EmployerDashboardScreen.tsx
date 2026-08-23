// Employer Dashboard — Staffing overview + post CTA + ranked applicants
// Deep Teal + Electric Lime + Warm Ivory

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import {
  CURRENT_EMPLOYER,
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  formatWage,
  getStatusColor,
  getStatusLabel,
} from '../../data/mockData';
import { useEmployerStore, useAuthStore } from '../../store';
import { computeJobWorkerMatch } from '../../services/matching/matchingEngine';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

export const EmployerDashboardScreen: React.FC<Props> = ({ shellNavigation }) => {
  const storeProfile = useEmployerStore((s) => s.profile);
  const authName = useAuthStore((s) => s.name);
  const employer = storeProfile ?? {
    ...CURRENT_EMPLOYER,
    businessName: authName || CURRENT_EMPLOYER.businessName,
    contactName: authName || CURRENT_EMPLOYER.contactName,
  };
  const employerJobs = MOCK_JOBS.filter((j) => j.employerId === employer.id);
  const totalHired = employerJobs.reduce((sum, j) => sum + j.workersHired, 0);
  const totalNeeded = employerJobs.reduce((sum, j) => sum + j.workersRequired, 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ─── 1. Greeting & Business Header ─── */}
      <View style={styles.greetingBlock}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}, {employer.contactName.split(' ')[0]}</Text>
          <View style={styles.businessRow}>
            <Text style={styles.businessName}>{employer.businessName}</Text>
            {employer.verificationStatus === 'verified' && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={12} color="#0D3B3F" />
                <Text style={styles.verifiedText}>Verified Employer</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {employer.businessName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ─── 2. Post Gig Hero CTA ─── */}
      <TouchableOpacity
        style={styles.postCTA}
        onPress={() => shellNavigation.navigate('PostJob')}
        activeOpacity={0.88}
      >
        <View style={styles.postCTALeft}>
          <View style={styles.postIcon}>
            <Feather name="plus" size={18} color="#090D14" />
          </View>
          <View>
            <Text style={styles.postTitle}>Post a New Gig</Text>
            <Text style={styles.postSub}>Matched workers dispatched in 60 seconds</Text>
          </View>
        </View>
        <Feather name="arrow-right" size={18} color="#C8F135" />
      </TouchableOpacity>

      {/* ─── 3. Workforce & Hiring Overview ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Hiring Progress</Text>
          <Text style={styles.overallCount}>{totalHired}/{totalNeeded} Staffed</Text>
        </View>

        {employerJobs.map((job) => {
          const pct = job.workersRequired > 0 ? job.workersHired / job.workersRequired : 0;
          const isFull = pct >= 1;
          return (
            <TouchableOpacity
              key={job.id}
              style={styles.staffingRow}
              onPress={() => shellNavigation.navigate('JobApplicants', { jobId: job.id })}
              activeOpacity={0.85}
            >
              <View style={styles.staffingLeft}>
                <Text style={styles.staffingTitle} numberOfLines={1}>{job.title}</Text>
                <View style={styles.staffingBar}>
                  <View
                    style={[
                      styles.staffingFill,
                      {
                        width: `${Math.min(pct * 100, 100)}%` as any,
                        backgroundColor: isFull ? '#10B981' : '#0D3B3F',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.staffingRight}>
                <Text style={[styles.staffingCount, isFull && { color: '#10B981' }]}>
                  {job.workersHired}/{job.workersRequired}
                </Text>
                <Feather name="chevron-right" size={14} color="#8E99A8" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── 4. Live Geofenced Shift Tracker ─── */}
      <View style={styles.liveCard}>
        <View style={styles.liveHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>Live Shift Geofence</Text>
          <Text style={styles.liveCount}>2 Workers On-Site</Text>
        </View>
        <Text style={styles.liveSub}>
          Noida Sector 62 Hub · Attendance locked · Escrow active
        </Text>
      </View>

      {/* ─── 5. Ranked Candidate Applicants ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ranked Applicants</Text>
          <Text style={styles.sectionCount}>{MOCK_APPLICATIONS.length} pending review</Text>
        </View>

        {MOCK_APPLICATIONS.map((app) => {
          const match = computeJobWorkerMatch(app.job, app.worker);
          return (
            <TouchableOpacity
              key={app.id}
              style={styles.applicantRow}
              onPress={() => shellNavigation.navigate('WorkerDetail', { workerId: app.workerId })}
              activeOpacity={0.85}
            >
              {/* Avatar */}
              <View style={styles.appAvatar}>
                <Text style={styles.appAvatarText}>
                  {app.worker.name.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.appInfo}>
                <View style={styles.appNameRow}>
                  <Text style={styles.appName}>{app.worker.name}</Text>
                  <View style={styles.matchPill}>
                    <Text style={styles.matchText}>{match.totalScore}% Match</Text>
                  </View>
                </View>
                <Text style={styles.appJobTitle} numberOfLines={1}>{app.job.title}</Text>
                <View style={styles.appMeta}>
                  <Ionicons name="star" size={11} color="#090D14" />
                  <Text style={styles.appMetaText}>{app.worker.rating.toFixed(1)}</Text>
                  <Text style={styles.appMetaDot}>·</Text>
                  <MaterialCommunityIcons name="shield-check" size={12} color="#10B981" />
                  <Text style={[styles.appMetaText, { color: '#047857' }]}>{app.worker.trustScore}% trust</Text>
                  <Text style={styles.appMetaDot}>·</Text>
                  <Text style={[styles.appMetaText, { color: '#0D3B3F', fontFamily: FontFamily.bold }]}>{formatWage(app.proposedWage)}/day</Text>
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(app.status) + '18' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                  {getStatusLabel(app.status)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scrollContent: { paddingBottom: 24 },

  // Greeting
  greetingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: '#090D14',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  businessRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  businessName: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: { fontFamily: FontFamily.semiBold, fontSize: 10, color: '#0D3B3F' },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontFamily: FontFamily.bold, fontSize: 14, color: '#FFFFFF' },

  // Post CTA
  postCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D14',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    ...Shadow.xs,
  },
  postCTALeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  postIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#FFFFFF' },
  postSub: { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E99A8', marginTop: 1 },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#090D14', letterSpacing: -0.2 },
  sectionCount: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },

  // Staffing overview
  overallCount: { fontFamily: FontFamily.bold, fontSize: 12, color: '#0D3B3F' },
  staffingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 12,
    ...Shadow.xs,
  },
  staffingLeft: { flex: 1 },
  staffingTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14', marginBottom: 6 },
  staffingBar: { height: 4, backgroundColor: '#F2F0EB', borderRadius: 2, overflow: 'hidden' },
  staffingFill: { height: '100%', borderRadius: 2 },
  staffingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffingCount: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14' },

  // Live card
  liveCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#E8F3F4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  liveHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveTitle: { fontFamily: FontFamily.bold, fontSize: 12, color: '#0D3B3F', flex: 1 },
  liveCount: { fontFamily: FontFamily.bold, fontSize: 11, color: '#0D3B3F' },
  liveSub: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },

  // Applicants
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 10,
    ...Shadow.xs,
  },
  appAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appAvatarText: { fontFamily: FontFamily.bold, fontSize: 13, color: '#FFFFFF' },
  appInfo: { flex: 1 },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  appName: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14' },
  matchPill: { backgroundColor: '#090D14', paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full },
  matchText: { fontFamily: FontFamily.bold, fontSize: 9, color: '#C8F135' },
  appJobTitle: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578', marginBottom: 3 },
  appMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  appMetaText: { fontFamily: FontFamily.medium, fontSize: 10, color: '#5A6578' },
  appMetaDot: { color: '#D4D1C8', fontSize: 10 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontFamily: FontFamily.semiBold, fontSize: 10 },
});
