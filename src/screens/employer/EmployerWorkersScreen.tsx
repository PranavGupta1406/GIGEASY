// Employer Workers Screen — Worker discovery directory
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
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
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { api } from '../../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

export const EmployerWorkersScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [workersList, setWorkersList] = useState<any[]>([]);

  useEffect(() => {
    async function loadWorkers() {
      try {
        const list = await api.searchWorkers();
        if (list && Array.isArray(list)) setWorkersList(list);
      } catch (err) {
        console.error('Error searching workers:', err);
      }
    }
    loadWorkers();
  }, []);

  const filtered = workersList.filter((w) => {
    const matchSearch =
      search.length === 0 ||
      (w.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.location || '').toLowerCase().includes(search.toLowerCase());
    const matchVerified = !verifiedOnly || w.verified;
    return matchSearch && matchVerified;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Discover Workers</Text>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#8E99A8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, name, location..."
            placeholderTextColor="#8E99A8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#8E99A8" />
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
            color={verifiedOnly ? '#C8F135' : '#0D3B3F'}
          />
          <Text style={[styles.verifiedText, verifiedOnly && styles.verifiedTextActive]}>
            Aadhaar Verified Only
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.count}>Showing {filtered.length} verified candidate{filtered.length !== 1 ? 's' : ''}</Text>

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
                  <MaterialCommunityIcons name="check-decagram" size={12} color="#0D3B3F" />
                )}
                <View style={[styles.trustPill, { backgroundColor: worker.trustScore >= 85 ? '#E8F3F4' : '#FEF3C7' }]}>
                  <Text style={[styles.trustText, { color: worker.trustScore >= 85 ? '#0D3B3F' : '#D97706' }]}>
                    {worker.trustScore}% trust
                  </Text>
                </View>
              </View>
              <Text style={styles.workerSkills} numberOfLines={1}>
                {worker.skills.map(s => s.name).join(' · ')}
              </Text>
              <View style={styles.workerMeta}>
                <Feather name="map-pin" size={10} color="#5A6578" />
                <Text style={styles.workerMetaText}>{worker.location.city}</Text>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="star" size={10} color="#090D14" />
                <Text style={styles.workerMetaText}>{worker.rating.toFixed(1)}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={[styles.workerMetaText, { color: '#0D3B3F', fontFamily: FontFamily.bold }]}>
                  {formatWage(worker.expectedDailyWage)}/day
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#8E99A8" />
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: '#090D14',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#090D14',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E8F3F4',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  verifiedChipActive: {
    backgroundColor: '#0D3B3F',
    borderColor: '#0D3B3F',
  },
  verifiedText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#0D3B3F' },
  verifiedTextActive: { color: '#FFFFFF', fontFamily: FontFamily.bold },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  count: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578', marginBottom: 10 },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 12,
    ...Shadow.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 14, color: '#FFFFFF' },
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  workerName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#090D14' },
  trustPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  trustText: { fontFamily: FontFamily.bold, fontSize: 9 },
  workerSkills: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578', marginBottom: 3 },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerMetaText: { fontFamily: FontFamily.medium, fontSize: 10, color: '#5A6578' },
  dot: { color: '#D4D1C8', fontSize: 10 },
});
