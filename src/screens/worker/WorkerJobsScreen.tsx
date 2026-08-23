// Worker Jobs Discovery Screen — Fast Search & Visual Feed
// Brand Blue (#1A68D5) · Hamburger Filter Drawer · Category Pills · Scannable Cards

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS } from '../../data/mockData';
import { GigEasyJobCard } from '../../components/GigEasyCards';
import { GigEasyEmptyState } from '../../components';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useEmployerStore } from '../../store';

import { Theme } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryDark: Theme.primaryDark,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
};

const CATEGORIES = [
  'All',
  'Warehouse',
  'Electrical',
  'Plumbing',
  'Construction',
  'Delivery',
  'Events',
  'Cleaning',
  'Factory',
  'Hospitality',
];

const WAGE_FILTERS = [
  { label: 'Any Wage', min: 0 },
  { label: '₹800+', min: 800 },
  { label: '₹1,000+', min: 1000 },
  { label: '₹1,200+', min: 1200 },
];

export const WorkerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedWageMin, setSelectedWageMin] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useLanguageStore();

  const allJobs = useEmployerStore((s) => s.jobs);

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      const title = job?.title || '';
      const city = job?.location?.city || '';
      const businessName = job?.employer?.businessName || '';
      const jobCat = job?.skillRequired?.category || '';

      const matchSearch =
        search.length === 0 ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        city.toLowerCase().includes(search.toLowerCase()) ||
        businessName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCat === 'All' ||
        jobCat.toLowerCase() === selectedCat.toLowerCase();
      const matchWage = (job?.maxWage ?? 0) >= selectedWageMin;
      return matchSearch && matchCat && matchWage;
    });
  }, [allJobs, search, selectedCat, selectedWageMin]);

  const hasActiveFilters = selectedCat !== 'All' || selectedWageMin > 0;

  const handleResetFilters = () => {
    setSelectedCat('All');
    setSelectedWageMin(0);
  };

  return (
    <View style={styles.container}>
      {/* Search Header Row */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
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

          {/* Hamburger Filter Button */}
          <TouchableOpacity
            style={[styles.hamburgerBtn, hasActiveFilters && styles.hamburgerBtnActive]}
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.hamburgerIconWrap}>
              <View style={[styles.hamburgerLine, hasActiveFilters && styles.hamburgerLineActive]} />
              <View style={[styles.hamburgerLine, hasActiveFilters && styles.hamburgerLineActive, { width: 14 }]} />
              <View style={[styles.hamburgerLine, hasActiveFilters && styles.hamburgerLineActive]} />
            </View>
            {hasActiveFilters && <View style={styles.hamburgerDot} />}
          </TouchableOpacity>
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

      {/* Hamburger Filter Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsDrawerOpen(false)}
          />

          <View style={styles.drawerSheet}>
            <View style={styles.drawerHandle} />

            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderLeft}>
                <Text style={styles.drawerTitle}>Filter Gigs</Text>
                {hasActiveFilters && (
                  <View style={styles.activeFilterCount}>
                    <Text style={styles.activeFilterCountText}>Active</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <Text style={styles.filterSectionLabel}>Work Category</Text>
            <View style={styles.drawerGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCat === cat;
                const visual = cat !== 'All' ? getCategoryVisual(cat) : null;

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.drawerPill,
                      isSelected && styles.drawerPillSelected,
                    ]}
                    onPress={() => setSelectedCat(cat)}
                    activeOpacity={0.8}
                  >
                    {visual && (
                      <Feather
                        name={visual.iconName}
                        size={13}
                        color={isSelected ? T.white : visual.color}
                      />
                    )}
                    <Text style={[styles.drawerPillText, isSelected && styles.drawerPillTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Daily Wage Filter */}
            <Text style={[styles.filterSectionLabel, { marginTop: 16 }]}>Minimum Daily Wage</Text>
            <View style={styles.wageRow}>
              {WAGE_FILTERS.map((wf) => {
                const isSelected = selectedWageMin === wf.min;

                return (
                  <TouchableOpacity
                    key={wf.label}
                    style={[
                      styles.wagePill,
                      isSelected && styles.wagePillSelected,
                    ]}
                    onPress={() => setSelectedWageMin(wf.min)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.wagePillText, isSelected && styles.wagePillTextSelected]}>
                      {wf.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply CTA */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setIsDrawerOpen(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.applyBtnText}>Show {filtered.length} Gigs</Text>
              <Feather name="arrow-right" size={16} color={T.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  searchHeader: {
    backgroundColor: T.white,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: T.ink,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hamburgerBtnActive: {
    borderColor: T.primary,
    backgroundColor: T.primaryMuted,
  },
  hamburgerIconWrap: {
    gap: 3.5,
    alignItems: 'flex-start',
  },
  hamburgerLine: {
    width: 17,
    height: 2,
    backgroundColor: T.ink,
    borderRadius: 1,
  },
  hamburgerLineActive: {
    backgroundColor: T.primary,
  },
  hamburgerDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: T.primary,
  },
  catsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
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

  // Modal Drawer
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerSheet: {
    backgroundColor: T.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: T.ink,
    letterSpacing: -0.4,
  },
  activeFilterCount: {
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeFilterCountText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
  },
  resetText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },
  filterSectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: T.ink,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  drawerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  drawerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: T.border,
  },
  drawerPillSelected: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  drawerPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.ink,
  },
  drawerPillTextSelected: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },
  wageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  wagePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: T.border,
  },
  wagePillSelected: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  wagePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: T.ink,
  },
  wagePillTextSelected: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.primary,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.white,
  },
});
