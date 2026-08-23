// Worker Home Screen — Flagship map experience + earnings hero + horizontal job discovery
// Location + Opportunities + Earnings + Availability

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, Spacing, BorderRadius, Colors, Shadow } from '../../constants';
import { MOCK_JOBS, CURRENT_WORKER, formatWage } from '../../data/mockData';
import { useWorkerStore, useAuthStore } from '../../store';
import { rankJobsForWorker } from '../../services/matching/matchingEngine';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const MAP_JOB_PINS = [
  { id: 'j1', wage: '₹1,000', title: 'Warehouse Loading', top: '30%', left: '62%' },
  { id: 'j2', wage: '₹1,500', title: 'Industrial Electrician', top: '56%', left: '18%' },
  { id: 'j3', wage: '₹850', title: 'Site Helper', top: '22%', left: '26%' },
  { id: 'j4', wage: '₹1,200', title: 'Event Setup', top: '68%', left: '72%' },
];

export const WorkerHomeScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState('j1');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const storeProfile = useWorkerStore((s) => s.profile);
  const authName = useAuthStore((s) => s.name);
  const worker = storeProfile ?? {
    ...CURRENT_WORKER,
    name: authName || CURRENT_WORKER.name,
  };
  const rankedJobs = useMemo(() => rankJobsForWorker(MOCK_JOBS, worker), [worker]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'ALL') return rankedJobs;
    return rankedJobs.filter(
      (item) => item.job.skillRequired.category.toUpperCase() === selectedCategory
    );
  }, [rankedJobs, selectedCategory]);

  const nearJobs = filteredJobs.slice(0, 4);
  const bestPaying = [...filteredJobs].sort((a, b) => b.job.maxWage - a.job.maxWage).slice(0, 4);

  const mapMarkers = useMemo(() => {
    return rankedJobs.slice(0, 6).map((item, idx) => ({
      id: item.job.id,
      wage: formatWage(item.job.maxWage),
      title: item.job.title,
      category: item.job.skillRequired.category,
      lat: item.job.location?.lat ?? (28.6139 + (idx % 2 === 0 ? 0.015 : -0.015)),
      lng: item.job.location?.lng ?? (77.209 + (idx % 3 === 0 ? 0.018 : -0.012)),
      distance: `${(item.job.distanceKm ?? 2.5).toFixed(1)} km`,
      top: idx === 0 ? '30%' : idx === 1 ? '56%' : idx === 2 ? '22%' : '68%',
      left: idx === 0 ? '62%' : idx === 1 ? '18%' : idx === 2 ? '26%' : '72%',
    }));
  }, [rankedJobs]);

  const categories = ['ALL', 'WAREHOUSE', 'ELECTRICAL', 'CONSTRUCTION', 'HOSPITALITY', 'DELIVERY'];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ─── 1. Greeting + Availability ─── */}
      <View style={styles.greetingBlock}>
        <View style={styles.greetingLeft}>
          <Text style={styles.greetingText}>
            {greeting}, {worker.name.split(' ')[0]}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color="#0D3B3F" />
            <Text style={styles.locationText}>{worker.location?.city || 'Noida'}</Text>
            <View style={styles.dotDivider} />
            <View style={[styles.availDot, { backgroundColor: isAvailable ? '#10B981' : '#8E99A8' }]} />
            <Text style={styles.availText}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
          </View>
        </View>

        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: '#E8E6E0', true: '#C8F135' }}
          thumbColor={isAvailable ? '#090D14' : '#FFFFFF'}
          style={styles.switch}
        />
      </View>

      {/* ─── 2. Earnings Hero Card ─── */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsTopRow}>
          <View>
            <Text style={styles.earningsLabel}>EARNED THIS MONTH</Text>
            <Text style={styles.earningsAmount}>₹4,850</Text>
          </View>
          <View style={styles.earningsBadge}>
            <Feather name="trending-up" size={12} color="#C8F135" />
            <Text style={styles.earningsBadgeText}>+18% vs last month</Text>
          </View>
        </View>

        <View style={styles.earningsDivider} />

        <View style={styles.earningsMetaRow}>
          <View style={styles.metaItem}>
            <Feather name="briefcase" size={12} color="#8E99A8" />
            <Text style={styles.metaValue}>{worker.completedJobs}</Text>
            <Text style={styles.metaLabel}>gigs done</Text>
          </View>
          <View style={styles.metaSeparator} />
          <View style={styles.metaItem}>
            <Feather name="star" size={12} color="#C8F135" />
            <Text style={styles.metaValue}>{worker.rating.toFixed(1)}</Text>
            <Text style={styles.metaLabel}>rating</Text>
          </View>
          <View style={styles.metaSeparator} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="shield-check" size={13} color="#10B981" />
            <Text style={[styles.metaValue, { color: '#10B981' }]}>{worker.trustScore}%</Text>
            <Text style={styles.metaLabel}>trust score</Text>
          </View>
        </View>
      </View>

      {/* ─── 3. Work Near You Map Visual ─── */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Work near you</Text>
            <Text style={styles.sectionSub}>
              {rankedJobs.length} live opportunities within {worker.preferredRadius} km
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => shellNavigation.navigate('JobDetail', { jobId: selectedPinId })}
            activeOpacity={0.7}
            style={styles.explorePill}
          >
            <Text style={styles.explorePillText}>Explore →</Text>
          </TouchableOpacity>
        </View>

        <InteractiveMapVisual
          markers={mapMarkers}
          selectedMarkerId={selectedPinId}
          userCoordinates={
            worker.location?.lat && worker.location?.lng
              ? { lat: worker.location.lat, lng: worker.location.lng }
              : { lat: 28.6139, lng: 77.209 }
          }
          onSelectMarker={(id) => {
            setSelectedPinId(id);
            shellNavigation.navigate('JobDetail', { jobId: id });
          }}
          height={230}
          locationCity={worker.location?.city || 'Noida'}
          radiusKm={worker.preferredRadius || 15}
        />
      </View>

      {/* ─── 4. Quick Category Filter Pills ─── */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
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
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── 5. Near You — Horizontal Discovery ─── */}
      <View style={styles.discoverySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Urgent Today</Text>
          <TouchableOpacity
            onPress={() => shellNavigation.navigate('JobDetail', { jobId: nearJobs[0]?.job.id ?? 'j1' })}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>See all ({nearJobs.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}
        >
          {nearJobs.map(({ job, match }) => (
            <TouchableOpacity
              key={job.id}
              style={styles.horizontalJobCard}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
              activeOpacity={0.88}
            >
              <View style={styles.hCardHeader}>
                <View style={styles.hCategoryBadge}>
                  <Text style={styles.hCardCategory}>{job.skillRequired.category.toUpperCase()}</Text>
                </View>
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{match.totalScore}% Match</Text>
                </View>
              </View>

              <Text style={styles.hCardWage}>
                {formatWage(job.maxWage)}
                <Text style={styles.hCardWageUnit}>/day</Text>
              </Text>

              <Text style={styles.hCardTitle} numberOfLines={2}>{job.title}</Text>

              <View style={styles.hCardMeta}>
                <Feather name="map-pin" size={10} color="#5A6578" />
                <Text style={styles.hCardMetaText}>{job.distanceKm} km · {job.location.city}</Text>
              </View>

              <View style={styles.hCardFooter}>
                <View style={styles.verifiedRow}>
                  <MaterialCommunityIcons name="check-decagram" size={12} color="#0D3B3F" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
                <Text style={styles.shiftText}>{job.startTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ─── 6. Best Paying Gigs — Dark Luxury Cards ─── */}
      <View style={styles.discoverySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>High Paying Near You</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>Highest Rate</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}
        >
          {bestPaying.map(({ job }) => (
            <TouchableOpacity
              key={job.id}
              style={[styles.horizontalJobCard, styles.darkCard]}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
              activeOpacity={0.88}
            >
              <View style={styles.hCardHeader}>
                <View style={styles.hCategoryBadgeDark}>
                  <Text style={styles.hCardCategoryDark}>{job.skillRequired.category.toUpperCase()}</Text>
                </View>
                <View style={styles.instantBadge}>
                  <Text style={styles.instantBadgeText}>Daily Cash</Text>
                </View>
              </View>

              <Text style={styles.hCardWageDark}>
                {formatWage(job.maxWage)}
                <Text style={styles.hCardWageUnitDark}>/day</Text>
              </Text>

              <Text style={styles.hCardTitleDark} numberOfLines={2}>{job.title}</Text>

              <View style={styles.hCardMeta}>
                <Feather name="map-pin" size={10} color="rgba(255,255,255,0.4)" />
                <Text style={styles.hCardMetaTextDark}>{job.distanceKm} km · {job.location.city}</Text>
              </View>

              <View style={styles.hCardFooterDark}>
                <Text style={styles.employerNameDark} numberOfLines={1}>
                  {job.employer.businessName}
                </Text>
                <Feather name="arrow-up-right" size={13} color="#C8F135" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scrollContent: { paddingBottom: 24 },

  // Greeting
  greetingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  greetingLeft: { flex: 1 },
  greetingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: '#090D14',
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: '#090D14',
  },
  dotDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4D1C8',
    marginHorizontal: 3,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
  },
  switch: { transform: [{ scale: 0.75 }] },

  // Earnings Hero
  earningsCard: {
    backgroundColor: '#090D14',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#090D14',
    ...Shadow.sm,
  },
  earningsTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  earningsLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#8E99A8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  earningsAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  earningsBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#C8F135',
  },
  earningsDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 12,
  },
  earningsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#8E99A8',
  },
  metaSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#1E293B',
  },

  // Map Section
  mapSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
    marginTop: 1,
  },
  explorePill: {
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  explorePillText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#0D3B3F',
  },

  // Category Pills
  categorySection: {
    marginTop: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  categoryPillActive: {
    backgroundColor: '#0D3B3F',
    borderColor: '#0D3B3F',
  },
  categoryPillText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: '#5A6578',
    letterSpacing: 0.4,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },

  // Discovery
  discoverySection: {
    marginTop: 20,
  },
  seeAll: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#0D3B3F',
  },
  hScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  horizontalJobCard: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  darkCard: {
    backgroundColor: '#090D14',
    borderColor: '#090D14',
  },
  hCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hCategoryBadge: {
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hCategoryBadgeDark: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hCardCategory: {
    fontFamily: FontFamily.bold,
    fontSize: 8,
    color: '#0D3B3F',
    letterSpacing: 0.5,
  },
  hCardCategoryDark: {
    fontFamily: FontFamily.bold,
    fontSize: 8,
    color: '#C8F135',
    letterSpacing: 0.5,
  },
  matchScoreBadge: {
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  matchScoreText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
  },
  instantBadge: {
    backgroundColor: 'rgba(200, 241, 53, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  instantBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#C8F135',
  },
  hCardWage: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    color: '#0D3B3F',
    letterSpacing: -0.5,
  },
  hCardWageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#8E99A8',
  },
  hCardWageDark: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    color: '#C8F135',
    letterSpacing: -0.5,
  },
  hCardWageUnitDark: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  hCardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#090D14',
    lineHeight: 16,
    marginVertical: 4,
  },
  hCardTitleDark: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
    marginVertical: 4,
  },
  hCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  hCardMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#5A6578',
  },
  hCardMetaTextDark: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#8E99A8',
  },
  hCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  hCardFooterDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: '#0D3B3F',
  },
  shiftText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#5A6578',
  },
  employerNameDark: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#CBD5E1',
    marginRight: 4,
  },
  bottomPad: { height: 16 },
});
