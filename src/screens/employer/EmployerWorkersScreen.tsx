// Employer Workers Screen — Worker discovery directory
// Brand Blue (#6497B2) Palette · Simple & Confident

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { MOCK_WORKERS, formatWage } from '../../data/mockData';

import { Theme } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

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
  money: Theme.primary,
  moneyBg: Theme.primaryLight,
};

export const EmployerWorkersScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = MOCK_WORKERS.filter((w) => {
    const matchSearch =
      search.length === 0 ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills.some((s) => s.name.toLowerCase().includes(search.toLowerCase())) ||
      w.location.city.toLowerCase().includes(search.toLowerCase());
    const matchVerified = !verifiedOnly || w.verificationStatus === 'verified';
    return matchSearch && matchVerified;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Discover Workers</Text>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={T.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, name, location..."
            placeholderTextColor={T.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={T.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.verifiedChip, verifiedOnly && styles.verifiedChipActive]}
          onPress={() => setVerifiedOnly(!verifiedOnly)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={13}
            color={verifiedOnly ? T.white : T.primary}
          />
          <Text style={[styles.verifiedText, verifiedOnly && styles.verifiedTextActive]}>
            Aadhaar Verified Only
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.count}>Showing {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={styles.workerRow}
            onPress={() => shellNavigation.navigate('WorkerDetail', { workerId: worker.id })}
            activeOpacity={0.88}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {worker.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.workerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                {worker.verificationStatus === 'verified' && (
                  <MaterialCommunityIcons name="check-decagram" size={12} color={T.primary} />
                )}
                <View style={[styles.trustPill, { backgroundColor: T.primaryMuted }]}>
                  <Text style={[styles.trustText, { color: T.primary }]}>
                    {worker.trustScore}% trust
                  </Text>
                </View>
              </View>

              <Text style={styles.workerSub} numberOfLines={1}>
                {worker.skills.map(s => s.name).join(', ')}
              </Text>

              <View style={styles.bottomMeta}>
                <View style={styles.ratingWrap}>
                  <Ionicons name="star" size={11} color="#D97706" />
                  <Text style={styles.ratingText}>{worker.rating.toFixed(1)}</Text>
                  <Text style={styles.metaCount}>({worker.completedJobs})</Text>
                </View>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.locText}>{worker.location.city}</Text>
              </View>
            </View>

            <View style={styles.wageColumn}>
              <Text style={styles.wageText}>{worker.trustScore}%</Text>
              <Text style={styles.wageUnit}>Trust Score</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: 10,
  },
  screenTitle: { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: T.ink, letterSpacing: -0.5 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  searchInput: { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: T.ink },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: T.primaryMuted,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  verifiedChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  verifiedText: { fontFamily: FontFamily.semiBold, fontSize: 11, color: T.primary },
  verifiedTextActive: { color: T.white },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  count: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary, marginBottom: 10 },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border,
    gap: 12,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 15, color: T.white },
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  workerName: { fontFamily: FontFamily.bold, fontSize: 14, color: T.ink },
  trustPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  trustText: { fontFamily: FontFamily.bold, fontSize: 9 },
  workerSub: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginBottom: 3 },
  bottomMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontFamily: FontFamily.bold, fontSize: 11, color: T.ink },
  metaCount: { fontFamily: FontFamily.regular, fontSize: 10, color: T.textMuted },
  dot: { color: T.textMuted, fontSize: 10 },
  locText: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  wageColumn: { alignItems: 'flex-end' },
  wageText: { fontFamily: FontFamily.extraBold, fontSize: 16, color: T.primary, letterSpacing: -0.3 },
  wageUnit: { fontFamily: FontFamily.medium, fontSize: 10, color: T.textMuted },
});
