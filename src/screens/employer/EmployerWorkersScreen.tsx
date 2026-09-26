// Employer Workers Screen — Real API Worker Discovery
// Hire Workers · Search · Filter · View Profiles · Send Direct Offers

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius } from '../../constants';
import { MOCK_WORKERS } from '../../data/mockData';
import { Theme } from '../../theme';
import { api } from '../../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const SKILL_FILTERS = [
  'All', 'Electrician', 'Plumber', 'Construction', 'Warehouse', 'Driving', 'Cleaning', 'Hospitality',
];

function workerInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function mapApiWorker(w: any) {
  return {
    id: w.user_id || w.id,
    name: w.name || 'Unknown Worker',
    skills: (() => {
      try {
        const raw = typeof w.skills === 'string' ? JSON.parse(w.skills) : (w.skills || []);
        return Array.isArray(raw) ? raw : [];
      } catch { return []; }
    })(),
    city: w.city || '',
    rating: Number(w.rating) || 0,
    completedJobs: Number(w.completed_jobs) || 0,
    verificationStatus: (w.user_verification || w.verification_status || '').toLowerCase() === 'verified' ? 'verified' : 'unverified',
    availabilityStatus: (w.availability_status || 'AVAILABLE').toLowerCase(),
    trustScore: Math.min(100, Math.round(
      (Number(w.rating) / 5) * 50 +
      Math.min(Number(w.completed_jobs), 50)
    )),
  };
}

export const EmployerWorkersScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadWorkers = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setHasError(false);
    try {
      const params: any = {};
      if (verifiedOnly) params.verified_only = true;
      if (availableOnly) params.available = true;
      if (selectedSkill !== 'All') params.skill = selectedSkill;
      const data = await api.getWorkers(params);
      setWorkers((data || []).map(mapApiWorker));
    } catch {
      // Fallback to mock data when backend not running
      setWorkers(MOCK_WORKERS.map((w: any) => ({
        id: w.id,
        name: w.name,
        skills: w.skills || [],
        city: w.location?.city || '',
        rating: w.rating || 0,
        completedJobs: w.completedJobs || 0,
        verificationStatus: w.verificationStatus || 'unverified',
        availabilityStatus: w.availabilityStatus || 'available',
        trustScore: w.trustScore || 70,
      })));
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [verifiedOnly, availableOnly, selectedSkill]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // Debounced search
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Search is client-side filtered for snappiness
    }, 300);
  };

  const filtered = workers.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch =
      q.length === 0 ||
      w.name.toLowerCase().includes(q) ||
      w.city.toLowerCase().includes(q) ||
      w.skills.some((s: any) => (s.name || s.category || s || '').toLowerCase().includes(q));
    return matchSearch;
  });

  const renderWorkerCard = ({ item: worker }: { item: any }) => {
    const skillLabels = worker.skills
      .slice(0, 2)
      .map((s: any) => s.name || s.category || s || '')
      .filter(Boolean)
      .join(' · ');
    const isVerified = worker.verificationStatus === 'verified';
    const isAvailable = ['available', 'AVAILABLE'].includes(worker.availabilityStatus);

    return (
      <TouchableOpacity
        style={styles.workerCard}
        onPress={() => shellNavigation.navigate('WorkerDetail', { workerId: worker.id })}
        activeOpacity={0.88}
      >
        {/* Avatar */}
        <View style={[styles.avatar, isVerified && styles.avatarVerified]}>
          <Text style={styles.avatarText}>{workerInitials(worker.name)}</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{worker.name}</Text>
            {isAvailable && (
              <View style={styles.availDot} />
            )}
          </View>

          <Text style={styles.workerSkills} numberOfLines={1}>
            {skillLabels || 'General Labour'}
          </Text>

          <View style={styles.metaRow}>
            {worker.rating > 0 && (
              <>
                <Ionicons name="star" size={11} color="#D97706" />
                <Text style={styles.ratingText}>{Number(worker.rating).toFixed(1)}</Text>
                <Text style={styles.metaDot}>·</Text>
              </>
            )}
            {worker.completedJobs > 0 && (
              <>
                <Text style={styles.metaText}>{worker.completedJobs} jobs</Text>
                <Text style={styles.metaDot}>·</Text>
              </>
            )}
            <Feather name="map-pin" size={10} color={Theme.textMuted} />
            <Text style={styles.metaText}>{worker.city || 'Nearby'}</Text>
          </View>
        </View>

        {/* Right column */}
        <View style={styles.rightCol}>
          {worker.trustScore > 0 && (
            <View style={[
              styles.trustPill,
              { backgroundColor: worker.trustScore >= 80 ? Theme.successLight : Theme.warningLight }
            ]}>
              <Text style={[
                styles.trustText,
                { color: worker.trustScore >= 80 ? Theme.success : Theme.warning }
              ]}>
                {worker.trustScore}%
              </Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={Theme.textMuted} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Find Workers</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Name, skill, or location…"
            placeholderTextColor={Theme.textMuted}
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={Theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, verifiedOnly && styles.filterChipActive]}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={12}
              color={verifiedOnly ? '#FFFFFF' : Theme.success}
            />
            <Text style={[styles.filterChipText, verifiedOnly && styles.filterChipTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, availableOnly && styles.filterChipActive]}
            onPress={() => setAvailableOnly(!availableOnly)}
            activeOpacity={0.8}
          >
            <View style={[styles.availDotSmall, { backgroundColor: availableOnly ? '#FFFFFF' : Theme.success }]} />
            <Text style={[styles.filterChipText, availableOnly && styles.filterChipTextActive]}>
              Available
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skill filter row */}
        <FlatList
          data={SKILL_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.skillFilterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.skillChip, selectedSkill === item && styles.skillChipActive]}
              onPress={() => setSelectedSkill(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.skillChipText, selectedSkill === item && styles.skillChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Backend notice */}
      {hasError && !isLoading && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={12} color={Theme.warning} />
          <Text style={styles.offlineText}>Using demo data — backend not reachable</Text>
        </View>
      )}

      {/* Worker list */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Theme.forestGreen} />
          <Text style={styles.loadingText}>Finding workers…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="users" size={32} color={Theme.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No workers found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filters or search terms
          </Text>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setSearch(''); setVerifiedOnly(false); setAvailableOnly(false); setSelectedSkill('All'); }}
          >
            <Text style={styles.clearBtnText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkerCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadWorkers(true)}
              tintColor={Theme.forestGreen}
              colors={[Theme.forestGreen]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },

  // Header
  header: {
    backgroundColor: Theme.surface,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    gap: 10,
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Theme.ink,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.sandLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  filterChipActive: {
    backgroundColor: Theme.forestGreen,
    borderColor: Theme.forestGreen,
  },
  filterChipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  availDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Skill filter
  skillFilterList: {
    gap: 6,
    paddingVertical: 2,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.sandLight,
    borderWidth: 1,
    borderColor: Theme.border,
    marginRight: 6,
  },
  skillChipActive: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  skillChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  skillChipTextActive: {
    color: '#FFFFFF',
  },

  // Offline banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: Theme.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: Theme.warningBorder,
  },
  offlineText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.warning,
  },

  // List
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  resultCount: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textMuted,
    marginBottom: 10,
  },

  // Worker card
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: 12,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarVerified: {
    backgroundColor: Theme.forestGreen,
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.surface,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Theme.success,
    marginLeft: 4,
  },

  // Info
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.ink,
    flex: 1,
  },
  workerSkills: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textSecondary,
    marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: FontFamily.bold, fontSize: 11, color: Theme.ink },
  metaDot: { color: Theme.textMuted, fontSize: 10 },
  metaText: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textSecondary },

  // Right
  rightCol: { alignItems: 'flex-end' },
  trustPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },

  // Loading/Empty
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Theme.ink,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  clearBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.ink,
  },
  clearBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
