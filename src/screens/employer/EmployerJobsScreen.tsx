// Employer Jobs Screen — Manage posted gigs with progress bars
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { api } from '../../services/api';
import { formatDate, formatWage } from '../../data/mockData';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type FilterTab = 'all' | 'hiring' | 'full';

export const EmployerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const employer = { businessName: 'Apex Builders' };

  useEffect(() => {
    async function loadEmployerJobs() {
      try {
        const jobsList = await api.getJobs({ employer_id: 1 });
        if (jobsList && Array.isArray(jobsList)) setEmployerJobs(jobsList);
      } catch (err) {
        console.error('Error fetching employer jobs:', err);
      }
    }
    loadEmployerJobs();
  }, []);

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
            <Text style={styles.screenTitle}>My Posted Gigs</Text>
            <Text style={styles.screenSubtitle}>{employerJobs.length} active listings · {employer.businessName}</Text>
          </View>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => shellNavigation.navigate('PostJob')}
            activeOpacity={0.88}
          >
            <Feather name="plus" size={16} color="#090D14" />
            <Text style={styles.postBtnText}>Post Gig</Text>
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
                {tab === 'all' ? 'All Gigs' : tab === 'hiring' ? 'Active Hiring' : 'Fully Staffed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredJobs.map((job) => {
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
                    <Text style={styles.cardCategory}>{job.skillRequired.category.toUpperCase()}</Text>
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
                        backgroundColor: isFull ? '#10B981' : '#0D3B3F',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, isFull && { color: '#10B981', fontFamily: FontFamily.bold }]}>
                  {job.workersHired}/{job.workersRequired} hired
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Feather name="users" size={12} color="#5A6578" />
                  <Text style={styles.footerText}>3 applicants in review</Text>
                </View>
                <View style={isFull ? styles.fullPill : styles.hiringPill}>
                  <Text style={isFull ? styles.fullPillText : styles.hiringPillText}>
                    {isFull ? 'Fully Staffed' : 'Manage Applicants →'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  screenTitle: { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: '#090D14', letterSpacing: -0.5 },
  screenSubtitle: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578', marginTop: 2 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8F135',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    ...Shadow.xs,
  },
  postBtnText: { fontFamily: FontFamily.bold, fontSize: 12, color: '#090D14' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F2F0EB',
  },
  filterTabActive: { backgroundColor: '#0D3B3F' },
  filterText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578' },
  filterTextActive: { color: '#FFFFFF', fontFamily: FontFamily.bold },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardTitleBlock: { flex: 1, marginRight: 12 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  cardCategory: { fontFamily: FontFamily.bold, fontSize: 8, color: '#0D3B3F', letterSpacing: 0.5 },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#090D14', marginBottom: 2, letterSpacing: -0.3 },
  cardMeta: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },
  cardWageBlock: { alignItems: 'flex-end' },
  cardWage: { fontFamily: FontFamily.extraBold, fontSize: 18, color: '#0D3B3F', letterSpacing: -0.3 },
  cardWageUnit: { fontFamily: FontFamily.medium, fontSize: 10, color: '#8E99A8' },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#F2F0EB', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578', minWidth: 60 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },
  fullPill: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  fullPillText: { fontFamily: FontFamily.bold, fontSize: 10, color: '#047857' },
  hiringPill: { backgroundColor: '#090D14', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  hiringPillText: { fontFamily: FontFamily.bold, fontSize: 10, color: '#FFFFFF' },
});
