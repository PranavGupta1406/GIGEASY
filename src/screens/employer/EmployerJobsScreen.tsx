// Employer Jobs Screen — Manage posted gigs with live store & applications
// Brand Blue (#1A68D5) Palette · Simple & Confident

import React, { useState } from 'react';
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
import { FontFamily, FontSize, BorderRadius } from '../../constants';
import { CURRENT_EMPLOYER, formatWage, formatDate } from '../../data/mockData';
import { useEmployerStore, useSharedApplicationsStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type FilterTab = 'all' | 'hiring' | 'full';

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryDark: '#124FA8',
  primaryLight: '#D6E6FA',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
};

export const EmployerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const employer = CURRENT_EMPLOYER;
  
  // Read live jobs from employer store
  const employerJobs = useEmployerStore((s) => s.jobs);
  const { getJobApplications } = useSharedApplicationsStore();

  const filteredJobs = employerJobs.filter((job) => {
    if (activeTab === 'hiring') return job.workersHired < job.workersRequired;
    if (activeTab === 'full') return job.workersHired >= job.workersRequired;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.screenTitle}>My Posted Jobs</Text>
            <Text style={styles.screenSubtitle}>{employerJobs.length} active listings · {employer.businessName}</Text>
          </View>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => shellNavigation.navigate('PostJob')}
            activeOpacity={0.88}
          >
            <Feather name="plus" size={16} color={T.white} />
            <Text style={styles.postBtnText}>Post Job</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'hiring', 'full'] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeTab === tab && styles.filterTabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeTab === tab && styles.filterTextActive]}>
                {tab === 'all' ? 'All Jobs' : tab === 'hiring' ? 'Active Hiring' : 'Fully Staffed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptySub}>Post a job to quickly connect with workers nearby.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => shellNavigation.navigate('PostJob')}
            >
              <Text style={styles.emptyBtnText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredJobs.map((job) => {
            const applicants = getJobApplications(job.id);
            const pct = job.workersRequired > 0 ? job.workersHired / job.workersRequired : 0;
            const isFull = pct >= 1;

            return (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => shellNavigation.navigate('JobApplicants', { jobId: job.id })}
                activeOpacity={0.88}
              >
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleBlock}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.cardCategory}>{(job.skillRequired?.category || 'GENERAL').toUpperCase()}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{job.title}</Text>
                    <Text style={styles.cardMeta}>{formatDate(job.startDate)} · {job.startTime}–{job.endTime}</Text>
                  </View>
                  <View style={styles.cardWageBlock}>
                    <Text style={styles.cardWage}>{formatWage(job.maxWage)}</Text>
                    <Text style={styles.cardWageUnit}>/day</Text>
                  </View>
                </View>

                {/* Staffing progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(pct * 100, 100)}%` as any,
                          backgroundColor: isFull ? T.success : T.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, isFull && { color: T.success, fontFamily: FontFamily.bold }]}>
                    {job.workersHired}/{job.workersRequired} hired
                  </Text>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <Feather name="users" size={12} color={T.textSecondary} />
                    <Text style={styles.footerText}>
                      {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} in review
                    </Text>
                  </View>
                  <View style={isFull ? styles.fullPill : styles.hiringPill}>
                    <Text style={isFull ? styles.fullPillText : styles.hiringPillText}>
                      {isFull ? 'Fully Staffed' : 'Manage Applicants →'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    backgroundColor: T.white,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  screenTitle: { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: T.ink, letterSpacing: -0.5 },
  screenSubtitle: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginTop: 2 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  postBtnText: { fontFamily: FontFamily.bold, fontSize: 12, color: T.white },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F0F4F8',
  },
  filterTabActive: { backgroundColor: T.primary },
  filterText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  filterTextActive: { color: T.white, fontFamily: FontFamily.bold },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  jobCard: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardTitleBlock: { flex: 1, marginRight: 12 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  cardCategory: { fontFamily: FontFamily.bold, fontSize: 8, color: T.primary, letterSpacing: 0.5 },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: T.ink, marginBottom: 2, letterSpacing: -0.3 },
  cardMeta: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  cardWageBlock: { alignItems: 'flex-end' },
  cardWage: { fontFamily: FontFamily.extraBold, fontSize: 18, color: T.primary, letterSpacing: -0.3 },
  cardWageUnit: { fontFamily: FontFamily.medium, fontSize: 10, color: T.textMuted },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#F0F4F8', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary, minWidth: 60 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  fullPill: { backgroundColor: T.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  fullPillText: { fontFamily: FontFamily.bold, fontSize: 10, color: '#1F7A59' },
  hiringPill: { backgroundColor: T.primaryMuted, borderWidth: 1, borderColor: T.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  hiringPillText: { fontFamily: FontFamily.bold, fontSize: 10, color: T.primary },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, marginTop: 14 },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
  emptyBtn: { marginTop: 16, backgroundColor: T.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { fontFamily: FontFamily.bold, fontSize: 13, color: T.white },
});
