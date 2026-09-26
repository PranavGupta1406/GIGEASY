// Employer Jobs Screen — Manage posted gigs with live API data
// Warm Premium Palette · Simple & Confident

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius } from '../../constants';
import { formatWage, formatDate } from '../../data/mockData';
import { useAuthStore } from '../../store';
import { api } from '../../services/api';

import { Theme } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type FilterTab = 'all' | 'hiring' | 'full';

const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryDark: Theme.primaryDark,
  primaryLight: Theme.primaryLight,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
  successLight: Theme.successLight,
};

export const EmployerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [apiGigs, setApiGigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userId = useAuthStore((s) => s.userId);
  const authName = useAuthStore((s) => s.name);
  const businessLabel = authName || 'My Business';

  const loadGigs = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true); else setIsLoading(true);
    try {
      // Fetch all gigs (backend filters by employer_id via auth token)
      const allGigs = await api.getGigs({ status: 'ALL' });
      // Only show this employer's own gigs (matched by authenticated userId)
      const myGigs = (allGigs || []).filter((g: any) =>
        g.employer_id === userId
      );
      setApiGigs(myGigs);
    } catch (err) {
      console.warn('[EmployerJobs] Failed to load gigs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);

  // Map API gig status to local filter tabs
  const filteredJobs = apiGigs.filter((g) => {
    const confirmed = Number(g.workers_confirmed) || 0;
    const required = Number(g.workers_required) || 1;
    if (activeTab === 'hiring') return confirmed < required;
    if (activeTab === 'full') return confirmed >= required;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.screenTitle}>My Posted Jobs</Text>
            <Text style={styles.screenSubtitle}>{apiGigs.length} active listings · {businessLabel}</Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadGigs(true)} tintColor={T.primary} />}
      >
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator color={T.primary} size="large" />
            <Text style={[styles.emptySub, { marginTop: 12 }]}>Loading your jobs...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="briefcase" size={36} color={Theme.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptySub}>Post a job to quickly connect with workers nearby.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => shellNavigation.navigate('PostJob')}
            >
              <Text style={styles.emptyButtonText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredJobs.map((gig: any) => {
            const confirmed = Number(gig.workers_confirmed) || 0;
            const required = Number(gig.workers_required) || 1;
            const pct = required > 0 ? confirmed / required : 0;
            const isFull = pct >= 1;
            const gigDate = gig.start_date ? new Date(gig.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

            return (
              <TouchableOpacity
                key={gig.gig_id || gig.id}
                style={styles.card}
                onPress={() => shellNavigation.navigate('JobApplicants', { jobId: gig.gig_id || gig.id })}
                activeOpacity={0.88}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{gig.title}</Text>
                    <Text style={styles.jobMeta}>{gigDate} · {gig.start_time || ''}</Text>
                  </View>
                  <Text style={styles.wageText}>₹{gig.max_wage || 0}/day</Text>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(pct * 100, 100)}%` as any }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{confirmed}/{required} hired</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.jobMeta}>{gig.city || ''} · {gig.status}</Text>
                  {isFull && (
                    <View style={styles.fullPill}>
                      <Text style={styles.fullPillText}>Fully Staffed</Text>
                    </View>
                  )}
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
    backgroundColor: Theme.sandLight,
  },
  filterTabActive: { backgroundColor: T.primary },
  filterText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  filterTextActive: { color: T.white, fontFamily: FontFamily.bold },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.sandLight,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: T.ink,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: T.primary,
  },
  emptyButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: T.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: T.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: T.ink,
    marginBottom: 4,
  },
  jobMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: { flex: 1, height: 4, backgroundColor: Theme.sandLight, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.primary, borderRadius: 2 },
  progressText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: T.textMuted,
    minWidth: 70,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  wageText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: T.ink,
  },
  fullPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: T.successLight,
  },
  fullPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: T.success,
  },
  emptyBtn: { marginTop: 16, backgroundColor: T.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { fontFamily: FontFamily.bold, fontSize: 13, color: T.white },
});
