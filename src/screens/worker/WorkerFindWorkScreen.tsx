// Worker Find Work Screen — Primary Opportunity & Discovery Hub
// Clean, minimal, practical. Natural worker language.
// Real Map Synchronization · Gig Radar & AI Matching · Fast Search & Categorization

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily } from '../../constants';
import { CURRENT_WORKER, formatWage } from '../../data/mockData';
import { InteractiveMapVisual, MapJobMarker } from '../../components/InteractiveMapVisual';
import { PersonalizedJobCard, BestMatchBanner } from '../../components/GigEasyCards';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import {
  useLanguageStore,
  useWorkerStore,
  useRecommendationStore,
  useAppNotificationStore,
} from '../../store';
import { getLocalizedCategory } from '../../i18n/translations';
import { Theme } from '../../theme';
import {
  getPersonalizedGigsForWorker,
  getBestAlertGig,
  PersonalizedGigResult,
} from '../../services/recommendation/recommendationService';
import { api } from '../../services/api';
import { apiGigToJob } from '../../services/gigMapper';
import { Job } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const CATEGORIES = [
  'All', 'Warehouse', 'Electrical', 'Plumbing',
  'Construction', 'Delivery', 'Events', 'Household', 'Factory', 'Security',
];

const WAGE_FILTERS = [
  { label: 'Any Wage', min: 0 },
  { label: '₹800+', min: 800 },
  { label: '₹1,000+', min: 1000 },
  { label: '₹1,200+', min: 1200 },
];

export const WorkerFindWorkScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWageMin, setSelectedWageMin] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, language } = useLanguageStore();

  const workerProfile = useWorkerStore((s) => s.profile);
  const recPrefs = useRecommendationStore((s) => s.preferences);
  const worker = workerProfile ?? CURRENT_WORKER;
  const workerCity = worker.location?.city || 'Noida';

  // ─── Fetch live gigs ──────────────────────────────────────────────────────
  const loadGigs = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true); else setIsLoading(true);
    try {
      const gigs = await api.getGigs({
        status: 'PUBLISHED,APPLICATIONS_OPEN,MATCHING',
      });
      const jobs = (gigs || []).map(apiGigToJob);
      setApiJobs(jobs);
    } catch (err) {
      console.warn('[WorkerFindWork] gig fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);

  const handleAvailabilityToggle = async (val: boolean) => {
    setIsAvailable(val);
    try {
      await api.updateAvailability({ mode: val ? 'AVAILABLE_NOW' : 'NOT_AVAILABLE' });
    } catch (_) {}
    if (val) loadGigs();
  };

  const personalizedResults = useMemo<PersonalizedGigResult[]>(() => {
    return getPersonalizedGigsForWorker(apiJobs, worker);
  }, [apiJobs, worker]);

  // Combined Search + Category + Wage filtering
  const filteredResults = useMemo(() => {
    return personalizedResults.filter((r) => {
      const job = r.job;
      const title = (job?.title || '').toLowerCase();
      const city = (job?.location?.city || '').toLowerCase();
      const employer = (job?.employer?.businessName || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchSearch =
        query.length === 0 ||
        title.includes(query) ||
        city.includes(query) ||
        employer.includes(query);

      const jobCat = job?.skillRequired?.category || '';
      const matchCat =
        selectedCategory === 'All' ||
        jobCat.toLowerCase() === selectedCategory.toLowerCase();

      const matchWage = (job?.maxWage ?? 0) >= selectedWageMin;
      return matchSearch && matchCat && matchWage;
    });
  }, [personalizedResults, searchQuery, selectedCategory, selectedWageMin]);

  // 1-to-1 Guaranteed Dynamic Map Markers
  const mapMarkers = useMemo<MapJobMarker[]>(() => {
    return filteredResults.map((r) => {
      const job = r.job;
      const score = r.finalScore;

      let priority: 'standard' | 'good' | 'best' = 'standard';
      if (score >= 85 || (job.maxWage && job.maxWage >= 1400)) {
        priority = 'best';
      } else if (score >= 70 || (job.maxWage && job.maxWage >= 1000)) {
        priority = 'good';
      }

      return {
        id: job.id,
        gigId: job.id,
        wage: job.maxWage,
        displayWage: formatWage(job.maxWage),
        title: job.title,
        category: job.skillRequired?.category || 'Gig',
        distanceKm: r.distanceKm ?? job.distanceKm ?? 2.0,
        lat: job.location?.lat ?? 28.6139,
        lng: job.location?.lng ?? 77.2090,
        priority,
        matchScore: score,
        job: job,
      };
    });
  }, [filteredResults]);

  const bestMatch = filteredResults[0]?.finalScore >= 88 ? filteredResults[0] : null;
  const remainingResults = bestMatch ? filteredResults.slice(1) : filteredResults;
  const moreCount = remainingResults.length;

  const hasActiveFilters = selectedCategory !== 'All' || selectedWageMin > 0;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedWageMin(0);
    setSearchQuery('');
  };

  // Natural Language Opportunity Summary
  const getOpportunitySummary = () => {
    const count = filteredResults.length;
    if (count === 0) {
      return language === 'hi'
        ? 'आपके पास अभी कोई काम नहीं है'
        : 'No jobs available right now';
    }
    return language === 'hi'
      ? `${count} काम आपके पास हैं`
      : `${count} ${count === 1 ? 'job' : 'jobs'} near you`;
  };

  return (
    <View style={styles.container}>
      {/* ─── Top Status Strip ─── */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={12} color={Theme.accent} />
            <Text style={styles.locationCityText}>{workerCity}</Text>
          </View>
          <Text style={styles.opportunitySummaryText}>
            {getOpportunitySummary()}
          </Text>
        </View>

        <View style={styles.availToggleBox}>
          <Text style={[styles.availStatusLabel, isAvailable && styles.availStatusLabelOn]}>
            {isAvailable
              ? (language === 'hi' ? 'काम के लिए तैयार' : 'Available')
              : (language === 'hi' ? 'ब्रेक पर' : 'On Break')}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={handleAvailabilityToggle}
            trackColor={{ false: Theme.sandDark, true: Theme.forestGreenLight }}
            thumbColor={isAvailable ? Theme.forestGreen : Theme.textMuted}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      {/* ─── Search & Hamburger Filter Bar ─── */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={Theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              language === 'hi'
                ? 'काम, कंपनी या जगह खोजें...'
                : 'Search job, company or location...'
            }
            placeholderTextColor={Theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={15} color={Theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterIconBtn, hasActiveFilters && styles.filterIconBtnActive]}
          onPress={() => setIsDrawerOpen(true)}
          activeOpacity={0.8}
          accessibilityLabel="Filter jobs"
        >
          <Feather
            name="sliders"
            size={16}
            color={hasActiveFilters ? Theme.accent : Theme.ink}
          />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadGigs(true)}
            tintColor={Theme.accent}
          />
        }
      >
        {/* ─── Interactive Map Visual ─── */}
        <View style={styles.mapContainer}>
          <InteractiveMapVisual
            markers={mapMarkers}
            selectedMarkerId={selectedPinId}
            onSelectMarker={(id, openDirectly) => {
              setSelectedPinId(id);
              if (openDirectly) {
                shellNavigation.navigate('JobDetail', { jobId: id });
              }
            }}
            onOpenGig={(id) => {
              shellNavigation.navigate('JobDetail', { jobId: id });
            }}
            onClosePreview={() => setSelectedPinId('')}
            height={230}
            locationCity={workerCity}
            radiusKm={worker.preferredRadius || 15}
            centerLat={worker.location.lat}
            centerLng={worker.location.lng}
          />
        </View>

        {/* ─── Category Pills ─── */}
        <View style={styles.categoryRow}>
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
                  style={[styles.catPill, isSelected && styles.catPillSelected]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  {catVisual && (
                    <Feather
                      name={catVisual.iconName}
                      size={12}
                      color={isSelected ? '#FFFFFF' : Theme.textSecondary}
                    />
                  )}
                  <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                    {cat === 'All'
                      ? (language === 'hi' ? 'सभी काम' : 'All Jobs')
                      : getLocalizedCategory(cat, language)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Best Match Opportunity (Gig Radar) ─── */}
        {bestMatch && (
          <View style={styles.bestMatchSection}>
            <BestMatchBanner
              job={bestMatch.job}
              finalScore={bestMatch.finalScore}
              distanceKm={bestMatch.distanceKm}
              moreCount={moreCount}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: bestMatch.job.id })}
            />
          </View>
        )}

        {/* ─── Opportunities Feed ─── */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.feedTitle}>
              {language === 'hi' ? 'पास के उपलब्ध काम' : 'Opportunities Near You'}
            </Text>
            {filteredResults.length > 0 && (
              <Text style={styles.feedCountLabel}>
                {filteredResults.length} {language === 'hi' ? 'काम' : 'gigs'}
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Theme.accent} />
              <Text style={styles.loadingText}>
                {language === 'hi' ? 'काम लोड हो रहे हैं...' : 'Loading available gigs...'}
              </Text>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Feather name="search" size={28} color={Theme.textMuted} />
              <Text style={styles.emptyStateTitle}>
                {language === 'hi'
                  ? 'कोई काम नहीं मिला'
                  : 'No Matching Gigs Found'}
              </Text>
              <Text style={styles.emptyStateSub}>
                {language === 'hi'
                  ? 'दूरी बढ़ाएं या फ़िल्टर बदल कर देखें।'
                  : 'Try expanding your distance or adjusting category filters.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={handleResetFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyResetBtnText}>
                  {language === 'hi' ? 'फ़िल्टर हटाएं' : 'Reset Filters'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            remainingResults.map((result) => (
              <PersonalizedJobCard
                key={result.job.id}
                job={result.job}
                match={result.breakdown}
                finalScore={result.finalScore}
                reasons={result.reasons}
                distanceKm={result.distanceKm}
                isNew={result.isNew}
                onPress={() => shellNavigation.navigate('JobDetail', { jobId: result.job.id })}
              />
            ))
          )}
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>

      {/* ─── Filter Modal Drawer ─── */}
      <Modal
        visible={isDrawerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {language === 'hi' ? 'फ़िल्टर चुनें' : 'Filter Gigs'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsDrawerOpen(false)}
                activeOpacity={0.7}
                style={styles.drawerCloseBtn}
              >
                <Feather name="x" size={18} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            {/* Wage filter */}
            <Text style={styles.drawerSectionLabel}>
              {language === 'hi' ? 'न्यूनतम दिहाड़ी (रोजाना)' : 'Minimum Daily Wage'}
            </Text>
            <View style={styles.drawerPillGrid}>
              {WAGE_FILTERS.map((wf) => {
                const isSelected = selectedWageMin === wf.min;
                return (
                  <TouchableOpacity
                    key={wf.label}
                    style={[styles.drawerWagePill, isSelected && styles.drawerWagePillSelected]}
                    onPress={() => setSelectedWageMin(wf.min)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.drawerWageText, isSelected && styles.drawerWageTextSelected]}>
                      {wf.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category filter */}
            <Text style={styles.drawerSectionLabel}>
              {language === 'hi' ? 'काम का प्रकार' : 'Job Category'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.drawerCatPill, isSelected && styles.drawerCatPillSelected]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.drawerCatText, isSelected && styles.drawerCatTextSelected]}>
                      {cat === 'All'
                        ? (language === 'hi' ? 'सभी' : 'All')
                        : getLocalizedCategory(cat, language)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.drawerResetBtn}
                onPress={handleResetFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.drawerResetBtnText}>
                  {language === 'hi' ? 'रीसेट' : 'Reset'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerApplyBtn}
                onPress={() => setIsDrawerOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.drawerApplyBtnText}>
                  {language === 'hi' ? 'लागू करें' : 'Apply Filters'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Aliased export for compatibility
export { WorkerFindWorkScreen as WorkerHomeScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F6',
  },

  // ── Status Bar ──
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  statusLeft: {
    flex: 1,
    gap: 3,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationCityText: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.ink,
  },
  opportunitySummaryText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Theme.ink,
  },
  availToggleBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1,
  },
  availStatusLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: Theme.textMuted,
  },
  availStatusLabelOn: {
    color: Theme.forestGreen,
    fontFamily: FontFamily.semiBold,
  },

  // ── Search Bar ──
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F2ED',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.ink,
    paddingVertical: 0,
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F2ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconBtnActive: {
    backgroundColor: Theme.accentLight,
    borderWidth: 1,
    borderColor: Theme.accent,
  },
  filterDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.accent,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  // ── Map ──
  mapContainer: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },

  // ── Categories ──
  categoryRow: {
    marginTop: 12,
    paddingHorizontal: 14,
  },
  categoryScroll: {
    gap: 7,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  catPillSelected: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  catText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  catTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
  },

  // ── Best Match ──
  bestMatchSection: {
    marginHorizontal: 14,
    marginTop: 14,
  },

  // ── Feed ──
  feedSection: {
    marginHorizontal: 14,
    marginTop: 16,
    gap: 10,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  feedTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14.5,
    color: Theme.ink,
  },
  feedCountLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },

  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    marginTop: 6,
  },
  emptyStateTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14.5,
    color: Theme.ink,
    marginTop: 10,
  },
  emptyStateSub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyResetBtn: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Theme.accentLight,
  },
  emptyResetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
    color: Theme.accent,
  },

  // ── Drawer Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  drawerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    gap: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Theme.ink,
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerSectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 4,
  },
  drawerPillGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  drawerWagePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F2ED',
    alignItems: 'center',
  },
  drawerWagePillSelected: {
    backgroundColor: Theme.accent,
  },
  drawerWageText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.ink,
  },
  drawerWageTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  drawerCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F2ED',
    marginRight: 8,
  },
  drawerCatPillSelected: {
    backgroundColor: Theme.ink,
  },
  drawerCatText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.ink,
  },
  drawerCatTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  drawerFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  drawerResetBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F3F2ED',
    alignItems: 'center',
  },
  drawerResetBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },
  drawerApplyBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Theme.accent,
    alignItems: 'center',
  },
  drawerApplyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
