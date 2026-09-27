// Employer Dashboard — Real user data, real gig stats, demand intelligence
// Warm Premium · Forest Green trust language · Deep charcoal structure

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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { useLanguageStore, useAuthStore } from '../../store';
import { Theme } from '../../theme';
import { api } from '../../services/api';
import { realtimeSocket } from '../../services/realtime/socketService';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  shellNavigation: NavProp;
  onNavigateTab?: (tab: 'Dashboard' | 'Jobs' | 'Workers' | 'Profile') => void;
}

const QUICK_ACTIONS = [
  { label: 'Post a Job', icon: 'plus-circle', screen: 'PostJob' as const, accent: Theme.forestGreen },
  { label: 'Find Workers', icon: 'users', tab: 'Workers', accent: Theme.ink },
  { label: 'View Jobs', icon: 'briefcase', tab: 'Jobs', accent: Theme.ink },
];

const JOB_CATEGORIES = [
  { id: 'Warehouse', label: 'Warehouse', icon: 'package' },
  { id: 'Construction', label: 'Construction', icon: 'tool' },
  { id: 'Driving', label: 'Driving', icon: 'navigation' },
  { id: 'Cleaning', label: 'Cleaning', icon: 'wind' },
  { id: 'Electrical', label: 'Electrical', icon: 'zap' },
  { id: 'Hospitality', label: 'Catering', icon: 'coffee' },
];

export const EmployerDashboardScreen: React.FC<Props> = ({ shellNavigation, onNavigateTab }) => {
  const { t } = useLanguageStore();
  const userId = useAuthStore((s) => s.userId);
  const authName = useAuthStore((s) => s.name);
  const authPhone = useAuthStore((s) => s.phoneNumber);

  // Derive employer display name from auth store
  const businessName = authName || (authPhone ? 'My Business' : 'GigEasy Employer');
  const initials = businessName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'ME';

  const [gigs, setGigs] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeJobs: 0, workersConfirmed: 0, workersNeeded: 0, completedJobs: 0 });
  const [recentWorkers, setRecentWorkers] = useState<any[]>([]);
  const [demandInsights, setDemandInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Parallel fetch for performance
      const [gigsData, workersData, demandData] = await Promise.allSettled([
        api.getGigs({ status: 'ALL' }),
        api.getWorkers({ available: true, limit: 4 }),
        api.getDemandIntelligence(),
      ]);

      if (gigsData.status === 'fulfilled') {
        const allGigs = gigsData.value || [];
        const myGigs = userId
          ? allGigs.filter((g: any) => g.employer_id === userId || g.employer_id === 'demo_user' || !g.employer_id)
          : allGigs;
        setGigs(myGigs);

        // Compute stats from gig list
        const open = myGigs.filter((g: any) => !['COMPLETED','CANCELLED','EXPIRED'].includes(g.status));
        const totalConfirmed = myGigs.reduce((s: number, g: any) => s + (Number(g.workers_confirmed) || 0), 0);
        const totalNeeded = open.reduce((s: number, g: any) => s + (Number(g.workers_required) || 0), 0);
        const completed = myGigs.filter((g: any) => g.status === 'COMPLETED').length;
        setStats({
          activeJobs: open.length,
          workersConfirmed: totalConfirmed,
          workersNeeded: Math.max(0, totalNeeded - totalConfirmed),
          completedJobs: completed,
        });
      }

      if (workersData.status === 'fulfilled') {
        setRecentWorkers((workersData.value || []).slice(0, 4));
      }

      if (demandData.status === 'fulfilled') {
        setDemandInsights((demandData.value || []).slice(0, 3));
      }
    } catch (err) {
      console.warn('[Dashboard] load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
    const unsub1 = realtimeSocket.subscribe('JOB_DISPATCHED', () => loadData(true));
    const unsub2 = realtimeSocket.subscribe('APPLICATION_RECEIVED', () => loadData(true));
    const unsub3 = realtimeSocket.subscribe('WORKER_HIRED', () => loadData(true));
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [loadData]);

  const recentGigs = gigs
    .filter((g) => !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(g.status))
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadData(true)}
          tintColor={Theme.forestGreen}
          colors={[Theme.forestGreen]}
        />
      }
    >
      {/* ─── 1. Business Header ─── */}
      <View style={styles.topHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.postJobBtn}
          onPress={() => shellNavigation.navigate('PostJob')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.postJobBtnText}>Post Job</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 2. Stats Row ─── */}
      <View style={styles.statsRow}>
        {[
          { value: stats.activeJobs, label: 'Active Jobs', color: Theme.ink },
          { value: stats.workersConfirmed, label: 'Workers Hired', color: Theme.forestGreen },
          { value: stats.workersNeeded, label: 'Still Needed', color: stats.workersNeeded > 0 ? Theme.accent : Theme.textMuted },
          { value: stats.completedJobs, label: 'Completed', color: Theme.textMuted },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, i < 3 && styles.statCardBorder]}>
            <Text style={[styles.statNumber, { color: s.color }]}>{isLoading ? '–' : s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ─── 3. Quick Actions ─── */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionPrimary]}
            onPress={() => shellNavigation.navigate('PostJob')}
            activeOpacity={0.88}
          >
            <View style={styles.quickActionIcon}>
              <Feather name="plus-circle" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionPrimaryText}>Post a New Job</Text>
            <Text style={styles.quickActionSub}>Reach workers instantly</Text>
            <Feather name="arrow-right" size={16} color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }} />
          </TouchableOpacity>

          <View style={styles.quickActionsCol}>
            <TouchableOpacity
              style={styles.quickActionSecondary}
              onPress={() => onNavigateTab ? onNavigateTab('Workers') : shellNavigation.navigate('MainApp', { employerTab: 'Workers' } as any)}
              activeOpacity={0.8}
            >
              <Feather name="users" size={17} color={Theme.ink} />
              <Text style={styles.quickActionSecText}>Find Workers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionSecondary}
              onPress={() => onNavigateTab ? onNavigateTab('Jobs') : shellNavigation.navigate('MainApp', { employerTab: 'Jobs' } as any)}
              activeOpacity={0.8}
            >
              <Feather name="briefcase" size={17} color={Theme.ink} />
              <Text style={styles.quickActionSecText}>My Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── 4. Category Shortcuts ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hire by Trade</Text>
        <View style={styles.categoryGrid}>
          {JOB_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryChip}
              onPress={() => shellNavigation.navigate('PostJob')}
              activeOpacity={0.8}
            >
              <Feather name={cat.icon as any} size={15} color={Theme.ink} />
              <Text style={styles.categoryChipLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── 5. Active Jobs ─── */}
      {recentGigs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active Jobs</Text>
            <TouchableOpacity onPress={() => onNavigateTab ? onNavigateTab('Jobs') : shellNavigation.navigate('MainApp', { employerTab: 'Jobs' } as any)} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentGigs.map((gig) => {
            const confirmed = Number(gig.workers_confirmed) || 0;
            const required = Number(gig.workers_required) || 1;
            const pct = Math.min((confirmed / required) * 100, 100);
            const gigDate = gig.start_date
              ? new Date(gig.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : '';

            return (
              <TouchableOpacity
                key={gig.gig_id || gig.id}
                style={styles.gigCard}
                onPress={() => shellNavigation.navigate('JobApplicants', { jobId: gig.gig_id || gig.id })}
                activeOpacity={0.88}
              >
                <View style={styles.gigCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gigTitle} numberOfLines={1}>{gig.title}</Text>
                    <Text style={styles.gigMeta}>{gigDate}{gig.city ? ` · ${gig.city}` : ''}</Text>
                  </View>
                  <Text style={styles.gigWage}>₹{Number(gig.max_wage).toLocaleString('en-IN')}/day</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>{confirmed}/{required} hired</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ─── 6. Available Workers Nearby ─── */}
      {recentWorkers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Workers Available</Text>
            <TouchableOpacity onPress={() => onNavigateTab ? onNavigateTab('Workers') : shellNavigation.navigate('MainApp', { employerTab: 'Workers' } as any)} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.workerList}>
            {recentWorkers.map((w) => {
              const name: string = w.name || 'Worker';
              const initials2 = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              const skills: any[] = (() => {
                try {
                  const raw = typeof w.skills === 'string' ? JSON.parse(w.skills) : (w.skills || []);
                  return Array.isArray(raw) ? raw : [];
                } catch { return []; }
              })();
              const skillLabel = skills[0]?.name || skills[0]?.category || '';
              const isVerified = (w.user_verification || '').toLowerCase() === 'verified';

              return (
                <TouchableOpacity
                  key={w.user_id || w.id}
                  style={styles.workerRow}
                  onPress={() => shellNavigation.navigate('WorkerDetail', { workerId: w.user_id || w.id })}
                  activeOpacity={0.85}
                >
                  <View style={[styles.workerAvatar, isVerified && { backgroundColor: Theme.forestGreen }]}>
                    <Text style={styles.workerAvatarText}>{initials2}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerName}>{name}</Text>
                    <Text style={styles.workerSkill}>{skillLabel || 'General Labour'} · {w.city || 'Nearby'}</Text>
                  </View>
                  {Number(w.rating) > 0 && (
                    <View style={styles.ratingPill}>
                      <Feather name="star" size={10} color="#D97706" />
                      <Text style={styles.ratingText}>{Number(w.rating).toFixed(1)}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={15} color={Theme.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ─── 7. Demand Intelligence Feed ─── */}
      {demandInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Demand Signal</Text>
          {demandInsights.map((insight: any, i) => (
            <View key={i} style={styles.insightCard}>
              <View style={styles.insightLeft}>
                <Text style={styles.insightCategory}>{insight.skill_category || insight.category}</Text>
                <Text style={styles.insightCity}>{insight.city || 'Pan-India'}</Text>
              </View>
              <View style={styles.insightRight}>
                <Text style={styles.insightGap}>
                  {insight.demand_gap || insight.gap || '+'}{insight.demand_gap ? '' : ' jobs open'}
                </Text>
                <Text style={styles.insightLabel}>demand gap</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ─── 8. Empty State ─── */}
      {!isLoading && gigs.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="briefcase" size={32} color={Theme.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No jobs posted yet</Text>
          <Text style={styles.emptySub}>
            Start hiring by posting your first job. Workers will apply instantly.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => shellNavigation.navigate('PostJob')}
            activeOpacity={0.88}
          >
            <Feather name="plus" size={15} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Post Your First Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="small" color={Theme.forestGreen} />
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  scrollContent: { paddingBottom: 24 },

  // Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontFamily: FontFamily.bold, fontSize: 16, color: '#FFFFFF', letterSpacing: -0.4 },
  headerInfo: { flex: 1 },
  greeting: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textMuted, marginBottom: 1 },
  businessName: { fontFamily: FontFamily.bold, fontSize: 16, color: Theme.ink, letterSpacing: -0.3 },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.forestGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: Theme.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  postJobBtnText: { fontFamily: FontFamily.bold, fontSize: 12, color: '#FFFFFF' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Theme.surface,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statCardBorder: { borderRightWidth: 1, borderRightColor: Theme.border },
  statNumber: { fontFamily: FontFamily.extraBold, fontSize: 22, color: Theme.ink, letterSpacing: -0.8 },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: Theme.textMuted, marginTop: 2, textAlign: 'center' },

  // Quick actions
  section: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 15, color: Theme.ink, letterSpacing: -0.3, marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { fontFamily: FontFamily.semiBold, fontSize: 12, color: Theme.forestGreen },

  quickActions: { flexDirection: 'row', gap: 10 },
  quickActionPrimary: {
    flex: 1.4,
    backgroundColor: Theme.forestGreen,
    borderRadius: 18,
    padding: 16,
    gap: 4,
    shadowColor: Theme.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  quickActionIcon: { marginBottom: 4 },
  quickActionPrimaryText: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: -0.3 },
  quickActionSub: { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  quickActionsCol: { flex: 1, gap: 10 },
  quickActionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  quickActionSecText: { fontFamily: FontFamily.semiBold, fontSize: 12, color: Theme.ink },

  // Categories
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: Theme.ink },

  // Gig cards
  gigCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gigCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  gigTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Theme.ink, letterSpacing: -0.2, marginBottom: 2 },
  gigMeta: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textSecondary },
  gigWage: { fontFamily: FontFamily.bold, fontSize: 13, color: Theme.amber },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 4, backgroundColor: Theme.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.forestGreen, borderRadius: 2 },
  progressLabel: { fontFamily: FontFamily.medium, fontSize: 11, color: Theme.textMuted, minWidth: 60 },

  // Worker list
  workerList: { gap: 8 },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  workerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarText: { fontFamily: FontFamily.bold, fontSize: 13, color: '#FFFFFF' },
  workerName: { fontFamily: FontFamily.bold, fontSize: 13, color: Theme.ink, marginBottom: 1 },
  workerSkill: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textSecondary },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: FontFamily.bold, fontSize: 11, color: Theme.ink },

  // Demand insight
  insightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  insightLeft: { gap: 2 },
  insightCategory: { fontFamily: FontFamily.bold, fontSize: 13, color: Theme.ink },
  insightCity: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textSecondary },
  insightRight: { alignItems: 'flex-end' },
  insightGap: { fontFamily: FontFamily.extraBold, fontSize: 18, color: Theme.accent, letterSpacing: -0.5 },
  insightLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: Theme.textMuted },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 17, color: Theme.ink, letterSpacing: -0.3 },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Theme.forestGreen,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: Theme.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: { fontFamily: FontFamily.bold, fontSize: 14, color: '#FFFFFF' },
});
