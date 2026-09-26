// Worker Home Screen — Personalized Gig Discovery
// Calm visual hierarchy. One dominant element at a time. Warm ivory canvas.

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { CURRENT_WORKER, formatWage } from '../../data/mockData';
import { InteractiveMapVisual, MapJobMarker } from '../../components/InteractiveMapVisual';
import { PersonalizedJobCard, BestMatchBanner } from '../../components/GigEasyCards';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useWorkerStore, useRecommendationStore, useAppNotificationStore } from '../../store';
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
  'Construction', 'Delivery', 'Events', 'Household', 'Factory',
];

const WAGE_FILTERS = [
  { label: 'Any', min: 0 },
  { label: '₹800+', min: 800 },
  { label: '₹1,000+', min: 1000 },
  { label: '₹1,200+', min: 1200 },
];

const getGreeting = (lang: string = 'en'): string => {
  const hour = new Date().getHours();
  if (lang === 'hi') {
    if (hour < 12) return 'शुभ प्रभात';
    if (hour < 17) return 'नमस्ते';
    return 'शुभ संध्या';
  }
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const WorkerHomeScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWageMin, setSelectedWageMin] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguageStore();

  const workerProfile = useWorkerStore((s) => s.profile);
  const recPrefs = useRecommendationStore((s) => s.preferences);
  const worker = workerProfile ?? CURRENT_WORKER;
  const firstName = worker.name.split(' ')[0];

  // ─── Load real gigs from backend ───────────────────────────────────────────
  const loadGigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const gigs = await api.getGigs({
        status: 'PUBLISHED,APPLICATIONS_OPEN,MATCHING',
        city: worker.location?.city || undefined,
      });
      const jobs = (gigs || []).map(apiGigToJob);
      setApiJobs(jobs);
    } catch (err) {
      console.warn('[WorkerHome] API gig load failed, no gigs shown:', err);
      setApiJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [worker.location?.city]);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);

  // When availability toggles, update backend and re-fetch
  const handleAvailabilityToggle = async (val: boolean) => {
    setIsAvailable(val);
    try {
      await api.updateAvailability({ mode: val ? 'AVAILABLE_NOW' : 'NOT_AVAILABLE' });
    } catch { /* non-critical */ }
    if (val) loadGigs();
  };

  const personalizedResults = useMemo<PersonalizedGigResult[]>(() => {
    return getPersonalizedGigsForWorker(apiJobs, worker);
  }, [apiJobs, worker]);

  const filteredResults = useMemo(() => {
    return personalizedResults.filter((r) => {
      const jobCat = r.job?.skillRequired?.category || '';
      const matchCat =
        selectedCategory === 'All' ||
        jobCat.toLowerCase() === selectedCategory.toLowerCase();
      const matchWage = (r.job?.maxWage ?? 0) >= selectedWageMin;
      return matchCat && matchWage;
    });
  }, [personalizedResults, selectedCategory, selectedWageMin]);

  // 1-to-1 Guaranteed Dynamic Map Markers derived strictly from live gig data
  const mapMarkers = useMemo<MapJobMarker[]>(() => {
    return filteredResults.map((r) => {
      const job = r.job;
      const score = r.finalScore;

      // Subtle priority hierarchy: Best opportunity -> Good value -> Standard
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

  useEffect(() => {
    if (recPrefs.alertsEnabled && !alertDismissed) {
      const best = getBestAlertGig(
        personalizedResults,
        recPrefs.minAlertScore,
        recPrefs.maxDistanceKm,
        recPrefs.minPayPerDay
      );
      if (best) {
        const notifications = useAppNotificationStore.getState().notifications;
        const exists = notifications.some(
          (n) => n.type === 'GIG_ALERT' && n.data?.jobId === best.job.id
        );
        if (!exists) {
          useAppNotificationStore.getState().notify({
            type: 'GIG_ALERT',
            title: best.job.title,
            message: `${formatWage(best.job.maxWage)}/day · ${best.distanceKm.toFixed(1)} km away · ${best.score}% match`,
            targetRole: 'worker',
            data: {
              jobId: best.job.id,
              wage: best.job.maxWage,
              location: best.job.location.address,
              city: best.job.location.city || 'Noida',
              distanceKm: best.distanceKm,
              time: best.job.startTime || '10:00 AM',
              category: best.job.skillRequired?.category,
              spotsRequired: best.job.workersRequired,
              spotsHired: best.job.workersHired,
              matchScore: best.score,
              matchReason: best.score >= 95 ? 'Nearby · Skill match' : 'Matches your trade',
            },
          });
        }
      }
    }
  }, [personalizedResults, recPrefs, alertDismissed]);

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
        {/* ─── 1. Header ─── */}
        {/* Minimal: location left, availability right. Nothing else. */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={11} color={Theme.accent} />
              <Text style={styles.locationText}>
                {worker.location.city}
              </Text>
            </View>
            <Text style={styles.greeting}>
              {getGreeting(language)}, {firstName}
            </Text>
          </View>

          <View style={styles.availRow}>
            <View style={[
              styles.availDot,
              { backgroundColor: isAvailable ? Theme.forestGreen : Theme.textMuted }
            ]} />
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: Theme.sandDark, true: Theme.forestGreenLight }}
              thumbColor={isAvailable ? Theme.forestGreen : Theme.textMuted}
              style={styles.switch}
            />
          </View>
        </View>

        {/* ─── 2. Best Opportunity — visually dominant ─── */}
        {bestMatch ? (
          <View style={styles.bestMatchSection}>
            <BestMatchBanner
              job={bestMatch.job}
              finalScore={bestMatch.finalScore}
              distanceKm={bestMatch.distanceKm}
              moreCount={moreCount}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: bestMatch.job.id })}
            />
          </View>
        ) : (
          /* When no best match, show opportunity count — compact */
          <View style={styles.countBanner}>
            {isLoading ? (
              <ActivityIndicator color={Theme.accent} size="small" />
            ) : (
              <Text style={styles.countNumber}>{filteredResults.length}</Text>
            )}
            <Text style={styles.countLabel}>
              {isLoading ? t('loadingGigs') : filteredResults.length === 1 ? t('gigNearYouCount') : t('gigsNearYouCount')}
            </Text>
          </View>
        )}

        {/* ─── 3. Nearby map ─── */}
        <View style={styles.mapSection}>
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
            height={240}
            locationCity={worker.location.city}
            radiusKm={worker.preferredRadius || 15}
            centerLat={worker.location.lat}
            centerLng={worker.location.lng}
          />
        </View>

        {/* ─── 4. Category filter row ─── */}
        <View style={styles.filterRow}>
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
                      size={11}
                      color={isSelected ? Theme.textOnAccent : Theme.textSecondary}
                    />
                  )}
                  <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                    {cat === 'All' ? t('allCategories') : getLocalizedCategory(cat, language)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.8}
          >
            <Feather
              name="sliders"
              size={14}
              color={hasActiveFilters ? Theme.accent : Theme.textSecondary}
            />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* ─── 5. Gig list ─── */}
        <View style={styles.jobsSection}>
          {filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={24} color={Theme.sandDark} />
              <Text style={styles.emptyTitle}>{t('noGigsFound')}</Text>
              <Text style={styles.emptySubtitle}>{t('adjustSearchTerms')}</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Remaining personalized cards (bestMatch already shown above) */}
              {remainingResults.map((result) => (
                <PersonalizedJobCard
                  key={result.job.id}
                  job={result.job}
                  match={result.breakdown}
                  finalScore={result.finalScore}
                  reasons={result.reasons}
                  distanceKm={result.distanceKm}
                  isNew={result.isNew}
                  isSelected={selectedPinId === result.job.id}
                  onPress={() => {
                    setSelectedPinId(result.job.id);
                    shellNavigation.navigate('JobDetail', { jobId: result.job.id });
                  }}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* ─── Filter Drawer ─── */}
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

            <View style={styles.drawerHeaderRow}>
              <Text style={styles.drawerTitle}>{t('filterGigs')}</Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={handleResetFilters}>
                  <Text style={styles.resetAllText}>{t('resetAll')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.filterGroupLabel}>{language === 'hi' ? 'काम का प्रकार' : 'Category'}</Text>
            <View style={styles.drawerGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const visual = cat !== 'All' ? getCategoryVisual(cat) : null;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.drawerPill, isSelected && styles.drawerPillSelected]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    {visual && (
                      <Feather
                        name={visual.iconName}
                        size={11}
                        color={isSelected ? Theme.textOnAccent : visual.color}
                      />
                    )}
                    <Text style={[
                      styles.drawerPillText,
                      isSelected && styles.drawerPillTextSelected
                    ]}>
                      {cat === 'All' ? t('allCategories') : getLocalizedCategory(cat, language)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.filterGroupLabel, { marginTop: 18 }]}>{language === 'hi' ? 'कम से कम दिहाड़ी' : 'Min Daily Pay'}</Text>
            <View style={styles.wageRow}>
              {WAGE_FILTERS.map((wf) => {
                const isSelected = selectedWageMin === wf.min;
                return (
                  <TouchableOpacity
                    key={wf.label}
                    style={[styles.wagePill, isSelected && styles.wagePillSelected]}
                    onPress={() => setSelectedWageMin(wf.min)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.wagePillText,
                      isSelected && styles.wagePillTextSelected
                    ]}>
                      {wf.label === 'Any' ? t('anyWage') : wf.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.applyFilterBtn}
              onPress={() => setIsDrawerOpen(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.applyFilterBtnText}>
                {language === 'hi' ? `${filteredResults.length} काम देखें` : `Show ${filteredResults.length} ${filteredResults.length === 1 ? 'gig' : 'gigs'}`}
              </Text>
              <Feather name="arrow-right" size={15} color={Theme.textOnAccent} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  scrollContent: { paddingBottom: 32 },

  // Header — minimal, calm
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: Theme.bg,
  },
  headerLeft: { gap: 3 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.5,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  switch: { transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }] },

  // Best match zone
  bestMatchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Count banner — only when no best match
  countBanner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  countNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 30,
    color: Theme.amber,
    letterSpacing: -1.2,
  },
  countLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Theme.textSecondary,
  },

  // Map
  mapSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    marginTop: 14,
    gap: 8,
  },
  categoryScroll: {
    paddingLeft: 20,
    gap: 7,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Theme.surface,
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
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  filterBtnActive: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentLight,
  },
  filterDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.accent,
  },

  // Jobs section
  jobsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Empty state
  emptyState: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textSecondary,
  },
  resetBtn: {
    marginTop: 10,
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Theme.sandDark,
  },
  resetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.ink,
  },

  // Filter Drawer
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Theme.overlay,
  },
  drawerSheet: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  drawerHandle: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  drawerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  resetAllText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.textMuted,
  },
  filterGroupLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: Theme.textMuted,
    letterSpacing: 0.6,
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
    gap: 5,
    paddingHorizontal: 11,
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
  wageRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  wagePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
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
    fontSize: 12,
    color: Theme.ink,
  },
  wagePillTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  applyFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.accent,
    borderRadius: 13,
    paddingVertical: 14,
  },
  applyFilterBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
