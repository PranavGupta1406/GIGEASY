// Worker Home Screen — Clean, wage-first visual job discovery
// High-scannability, hamburger filter drawer, visual category pills, live radar map, and multilingual support

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, CURRENT_WORKER, formatWage } from '../../data/mockData';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';
import { GigEasyJobCard } from '../../components/GigEasyCards';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore } from '../../store';

import { Theme } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryDark: Theme.primaryDark,
  primaryMuted: Theme.primaryLight,
  primaryLight: Theme.primaryLight,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
  money: Theme.primary,
};

const MAP_JOB_PINS = [
  { id: 'j1', wage: '₹1,000', title: 'Warehouse Helper', top: '30%', left: '62%' },
  { id: 'j2', wage: '₹1,500', title: 'Electrician', top: '56%', left: '18%' },
  { id: 'j3', wage: '₹850', title: 'Site Helper', top: '22%', left: '26%' },
  { id: 'j4', wage: '₹1,200', title: 'Event Setup', top: '68%', left: '72%' },
];

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

export const WorkerHomeScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState('j1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWageMin, setSelectedWageMin] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useLanguageStore();

  const worker = CURRENT_WORKER;

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const jobCat = job?.skillRequired?.category || '';
      const matchCat =
        selectedCategory === 'All' ||
        jobCat.toLowerCase() === selectedCategory.toLowerCase();
      const matchWage = (job?.maxWage ?? 0) >= selectedWageMin;
      return matchCat && matchWage;
    });
  }, [selectedCategory, selectedWageMin]);

  const hasActiveFilters = selectedCategory !== 'All' || selectedWageMin > 0;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedWageMin(0);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── 1. Location & Status ─── */}
        <View style={styles.topHeader}>
          <View style={styles.locationBlock}>
            <View style={styles.locationPill}>
              <Feather name="map-pin" size={12} color={T.primary} />
              <Text style={styles.locationCity}>{worker.location.city}, {worker.location.state}</Text>
            </View>
            <Text style={styles.workerGreeting}>Hi, {worker.name.split(' ')[0]}</Text>
          </View>

          <View style={styles.availControl}>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? T.success : '#94A3B8' }]} />
            <Text style={styles.availText}>{isAvailable ? 'Looking for work' : 'Busy'}</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={isAvailable ? T.primary : '#94A3B8'}
              style={styles.switch}
            />
          </View>
        </View>

        {/* ─── 2. Interactive Map Visual ─── */}
        <View style={styles.mapSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('gigsNearYou')}</Text>
              <Text style={styles.sectionSub}>{filteredJobs.length} {t('availableToday')}</Text>
            </View>
            <TouchableOpacity
              style={styles.explorePill}
              onPress={() => shellNavigation.navigate('MainApp', { initialMode: 'worker' })}
            >
              <Text style={styles.explorePillText}>Explore All →</Text>
            </TouchableOpacity>
          </View>

          <InteractiveMapVisual
            markers={MAP_JOB_PINS}
            selectedMarkerId={selectedPinId}
            onSelectMarker={(id) => {
              setSelectedPinId(id);
              shellNavigation.navigate('JobDetail', { jobId: id });
            }}
            height={180}
            locationCity={worker.location.city}
            radiusKm={worker.preferredRadius}
          />
        </View>

        {/* ─── 3. Filter Bar Header with Hamburger Button ─── */}
        <View style={styles.filterHeaderRow}>
          <View>
            <Text style={styles.filterHeaderTitle}>Categories & Filters</Text>
            <Text style={styles.filterHeaderSub}>
              {selectedCategory !== 'All' ? `Filtered by ${selectedCategory}` : 'Showing all trades'}
            </Text>
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

        {/* Horizontal Category Scroll */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const catVisual = cat !== 'All' ? getCategoryVisual(cat) : null;

              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    isSelected && styles.catPillSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  {catVisual && (
                    <Feather
                      name={catVisual.iconName}
                      size={13}
                      color={isSelected ? T.white : catVisual.color}
                      style={{ marginRight: 5 }}
                    />
                  )}
                  <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── 4. Recommended Gigs List ─── */}
        <View style={styles.jobsListSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Gigs</Text>
            <TouchableOpacity onPress={() => shellNavigation.navigate('MainApp', { initialMode: 'worker' })}>
              <Text style={styles.seeAll}>See all ({filteredJobs.length}) →</Text>
            </TouchableOpacity>
          </View>

          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={28} color="#94A3B8" />
              <Text style={styles.emptyText}>No gigs match your filters</Text>
              <TouchableOpacity style={styles.emptyResetBtn} onPress={handleResetFilters}>
                <Text style={styles.emptyResetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <GigEasyJobCard
                key={job.id}
                job={job}
                onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ─── 5. Hamburger Filter Drawer / Bottom Sheet Modal ─── */}
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

            {/* Drawer Header */}
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

            {/* Filter Section: Categories */}
            <Text style={styles.filterSectionLabel}>Work Category</Text>
            <View style={styles.drawerGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const visual = cat !== 'All' ? getCategoryVisual(cat) : null;

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.drawerPill,
                      isSelected && styles.drawerPillSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
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

            {/* Filter Section: Daily Wage */}
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

            {/* Close / Apply CTA */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setIsDrawerOpen(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.applyBtnText}>Show {filteredJobs.length} Gigs</Text>
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
  scrollContent: { paddingBottom: 32 },

  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  locationBlock: { gap: 2 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationCity: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  workerGreeting: { fontFamily: FontFamily.bold, fontSize: 17, color: T.ink, letterSpacing: -0.4 },
  availControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  availText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },

  // Map Section
  mapSection: { paddingHorizontal: 16, paddingTop: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, letterSpacing: -0.3 },
  sectionSub: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginTop: 1 },
  explorePill: {
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  explorePillText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
  },

  // Filter Header Row
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 6,
  },
  filterHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.ink,
    letterSpacing: -0.2,
  },
  filterHeaderSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
    marginTop: 1,
  },

  // Hamburger Button
  hamburgerBtn: {
    width: 38,
    height: 38,
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

  // Categories Horizontal
  categorySection: { paddingTop: 4 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  catPillSelected: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  catText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary },
  catTextSelected: { fontFamily: FontFamily.bold, color: T.white },

  // Jobs Section
  jobsListSection: { paddingHorizontal: 16, paddingTop: 18 },
  seeAll: { fontFamily: FontFamily.bold, fontSize: 12, color: T.primary },

  // Empty State
  emptyState: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.border,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.ink,
    marginTop: 8,
    marginBottom: 10,
  },
  emptyResetBtn: {
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },

  // Drawer / Bottom Sheet Modal
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
