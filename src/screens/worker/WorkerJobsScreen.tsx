// Worker Jobs Discovery Screen — Fast Search & Visual Feed
// Brand Blue (#1A68D5) · Category Pills · Scannable Cards

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS } from '../../data/mockData';
import { GigEasyJobCard } from '../../components/GigEasyCards';
import { GigEasyEmptyState } from '../../components';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

const CATEGORIES = ['All', 'Warehouse', 'Electrical', 'Plumbing', 'Construction', 'Delivery', 'Events', 'Cleaning'];

export const WorkerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const { t } = useLanguageStore();

  const filtered = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const matchSearch =
        search.length === 0 ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location.city.toLowerCase().includes(search.toLowerCase()) ||
        job.employer.businessName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCat === 'All' ||
        job.skillRequired.category.toLowerCase() === selectedCat.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [search, selectedCat]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search role, area, or company..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat;
            const catVisual = cat !== 'All' ? getCategoryVisual(cat) : null;

            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCat(cat)}
                activeOpacity={0.8}
              >
                {catVisual && (
                  <Feather
                    name={catVisual.iconName}
                    size={12}
                    color={isSelected ? T.white : catVisual.color}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat === 'All' ? t('allCategories') : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs Stream */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.jobListContent}
      >
        {filtered.length === 0 ? (
          <GigEasyEmptyState
            title="No gigs found"
            subtitle="Try adjusting your search terms or picking another category."
          />
        ) : (
          filtered.map((job) => (
            <GigEasyJobCard
              key={job.id}
              job={job}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  searchHeader: {
    backgroundColor: T.white,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: T.ink,
  },
  catsScroll: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: T.border,
  },
  catPillActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  catText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.textSecondary,
  },
  catTextActive: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },
  jobListContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
});
