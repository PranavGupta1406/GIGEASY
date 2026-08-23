// Worker Home Screen — Clean, wage-first visual job discovery
// High-scannability, visual category pills, live radar map, and multilingual support

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, CURRENT_WORKER } from '../../data/mockData';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';
import { GigEasyJobCard } from '../../components/GigEasyCards';
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
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
};

const MAP_JOB_PINS = [
  { id: 'j1', wage: '₹1,000', title: 'Warehouse Helper', top: '30%', left: '62%' },
  { id: 'j2', wage: '₹1,500', title: 'Electrician', top: '56%', left: '18%' },
  { id: 'j3', wage: '₹850', title: 'Site Helper', top: '22%', left: '26%' },
  { id: 'j4', wage: '₹1,200', title: 'Event Setup', top: '68%', left: '72%' },
];

const CATEGORIES = ['All', 'Warehouse', 'Electrical', 'Plumbing', 'Construction', 'Delivery', 'Events', 'Cleaning'];

export const WorkerHomeScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState('j1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { t } = useLanguageStore();

  const worker = CURRENT_WORKER;

  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'All') return MOCK_JOBS;
    return MOCK_JOBS.filter(
      (job) => job.skillRequired.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);

  return (
    <ScrollView
      style={styles.container}
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
          <Text style={styles.sectionTitle}>{t('gigsNearYou')}</Text>
          <Text style={styles.sectionSub}>{filteredJobs.length} {t('availableToday')}</Text>
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

      {/* ─── 3. Visual Horizontal Category Filter ─── */}
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
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
              >
                {catVisual && (
                  <Feather
                    name={catVisual.iconName}
                    size={12}
                    color={isSelected ? T.white : catVisual.color}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat === 'All' ? t('allCategories') : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── 4. Visual Job Cards Feed ─── */}
      <View style={styles.feedSection}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>{t('tabJobs')}</Text>
          <TouchableOpacity
            onPress={() => shellNavigation.navigate('WorkerTabs')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See all ({filteredJobs.length}) →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobList}>
          {filteredJobs.map((job) => (
            <GigEasyJobCard
              key={job.id}
              job={job}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  locationBlock: { flex: 1 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  locationCity: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },
  workerGreeting: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: T.ink,
    letterSpacing: -0.4,
  },
  availControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  availText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.textSecondary,
  },
  switch: {
    transform: [{ scale: 0.75 }],
  },

  // Map Section
  mapSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.ink,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: T.textSecondary,
  },

  // Category Pills
  categorySection: {
    marginTop: 14,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: T.white,
    borderWidth: 1,
    borderColor: T.border,
  },
  categoryPillActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  categoryPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.textSecondary,
  },
  categoryPillTextActive: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },

  // Feed Section
  feedSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: T.ink,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },
  jobList: {
    gap: 10,
  },
});
