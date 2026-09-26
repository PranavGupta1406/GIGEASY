// Worker Jobs Discovery Screen — Fast Search & Visual Feed
// Warm Premium Palette · Hamburger Filter Drawer · Category Pills · Scannable Cards

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { GigEasyJobCard } from '../../components/GigEasyCards';
import { GigEasyEmptyState } from '../../components';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore } from '../../store';
import { getLocalizedCategory } from '../../i18n/translations';
import { api } from '../../services/api';
import { apiGigToJob } from '../../services/gigMapper';
import { Job } from '../../types';

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
  'Household',
  'Factory',
  'Security',
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
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, language } = useLanguageStore();

  const loadGigs = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true); else setIsLoading(true);
    try {
      const gigs = await api.getGigs({ status: 'PUBLISHED,APPLICATIONS_OPEN,MATCHING' });
      setApiJobs((gigs || []).map(apiGigToJob));
    } catch (err) {
      console.warn('[WorkerJobs] gig fetch failed:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadGigs(); }, [loadGigs]);

  const filtered = useMemo(() => {
    return apiJobs.filter((job) => {
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
  }, [apiJobs, search, selectedCat, selectedWageMin]);

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
            <Feather name="search" size={16} color={Theme.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={Theme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color={Theme.textMuted} />
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
                  {cat === 'All' ? t('allCategories') : getLocalizedCategory(cat, language)}
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadGigs(true)} tintColor={Theme.primary} />}
      >
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator color={Theme.primary} size="large" />
            <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Theme.textSecondary, marginTop: 12 }}>
              {t('loadingGigs')}
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <GigEasyEmptyState
            title={t('noGigsFound')}
            subtitle={t('adjustSearchTerms')}
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
                <Text style={styles.drawerTitle}>{t('filterGigs')}</Text>
                {hasActiveFilters && (
                  <View style={styles.activeFilterCount}>
                    <Text style={styles.activeFilterCountText}>{language === 'hi' ? 'सक्रिय' : 'Active'}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
                <Text style={styles.resetText}>{t('resetAll')}</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <Text style={styles.filterSectionLabel}>{language === 'hi' ? 'काम का प्रकार' : 'Category'}</Text>
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
                      {cat === 'All' ? t('allCategories') : getLocalizedCategory(cat, language)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Daily Wage Filter */}
            <Text style={[styles.filterSectionLabel, { marginTop: 16 }]}>{language === 'hi' ? 'कम से कम दिहाड़ी' : 'Min Daily Pay'}</Text>
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
                      {wf.label === 'Any Wage' ? t('anyWage') : wf.label}
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
              <Text style={styles.applyBtnText}>
                {language === 'hi' ? `${filtered.length} काम देखें` : `Show ${filtered.length} Gigs`}
              </Text>
              <Feather name="arrow-right" size={16} color={T.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  searchHeader: {
    backgroundColor: Theme.bg,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
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
    backgroundColor: Theme.surfaceSubtle,
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
    fontSize: 14,
    color: Theme.ink,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  hamburgerBtnActive: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentLight,
  },
  hamburgerIconWrap: {
    gap: 3.5,
    alignItems: 'flex-start',
  },
  hamburgerLine: {
    width: 17,
    height: 2,
    backgroundColor: Theme.ink,
    borderRadius: 1,
  },
  hamburgerLineActive: {
    backgroundColor: Theme.accent,
  },
  hamburgerDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Theme.accent,
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
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  catPillActive: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  catText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  catTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: Theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.border,
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
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  activeFilterCount: {
    backgroundColor: Theme.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeFilterCountText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.accent,
  },
  resetText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.accent,
  },
  filterSectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
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
    borderRadius: 10,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  drawerPillSelected: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  drawerPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.ink,
  },
  drawerPillTextSelected: {
    color: '#FFFFFF',
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
    borderRadius: 10,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  wagePillSelected: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  wagePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.ink,
  },
  wagePillTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
