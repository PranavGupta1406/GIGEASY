// Worker Jobs Discovery Screen — Premium marketplace visual feed
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { MOCK_JOBS, CURRENT_WORKER, formatWage, formatDate } from '../../data/mockData';
import { rankJobsForWorker } from '../../services/matching/matchingEngine';
import { GigEasyEmptyState } from '../../components';
import { Job } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

const CATEGORIES = ['All', 'Warehouse', 'Construction', 'Events', 'Electrical', 'Delivery', 'Plumbing'];

function MarketplaceJobTile({
  job,
  matchScore,
  onPress,
}: {
  job: Job;
  matchScore?: number;
  onPress: () => void;
}) {
  const isFull = job.workersHired >= job.workersRequired;
  const slotsRemaining = job.workersRequired - job.workersHired;

  return (
    <TouchableOpacity
      style={cardStyles.tile}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={cardStyles.topRow}>
        <View style={cardStyles.categoryBadge}>
          <Text style={cardStyles.categoryText}>{job.skillRequired.category.toUpperCase()}</Text>
        </View>

        {matchScore !== undefined && (
          <View style={cardStyles.matchPill}>
            <View style={cardStyles.matchDot} />
            <Text style={cardStyles.matchText}>{matchScore}% Match</Text>
          </View>
        )}
      </View>

      <View style={cardStyles.mainRow}>
        <View style={cardStyles.titleCol}>
          <Text style={cardStyles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={cardStyles.employer} numberOfLines={1}>{job.employer.businessName}</Text>
        </View>

        <View style={cardStyles.wageCol}>
          <Text style={cardStyles.wage}>{formatWage(job.maxWage)}</Text>
          <Text style={cardStyles.wageUnit}>/day</Text>
        </View>
      </View>

      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaItem}>
          <Feather name="map-pin" size={11} color="#5A6578" />
          <Text style={cardStyles.metaText}>{job.distanceKm} km · {job.location.city}</Text>
        </View>
        <View style={cardStyles.dot} />
        <View style={cardStyles.metaItem}>
          <Feather name="clock" size={11} color="#5A6578" />
          <Text style={cardStyles.metaText}>{formatDate(job.startDate)} · {job.startTime}</Text>
        </View>
      </View>

      <View style={cardStyles.footerRow}>
        <View style={cardStyles.verifiedWrap}>
          {job.employer.verificationStatus === 'verified' && (
            <View style={cardStyles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={12} color="#0D3B3F" />
              <Text style={cardStyles.verifiedText}>Verified</Text>
            </View>
          )}
          <View style={cardStyles.ratingWrap}>
            <Ionicons name="star" size={11} color="#0D3B3F" />
            <Text style={cardStyles.ratingText}>{job.employer.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={[cardStyles.slotPill, isFull && cardStyles.slotPillFull]}>
          <Text style={[cardStyles.slotText, isFull && cardStyles.slotTextFull]}>
            {isFull ? 'Filled' : `${slotsRemaining} open · Apply →`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
    letterSpacing: 0.5,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#090D14',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  matchDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8F135',
  },
  matchText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#C8F135',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleCol: { flex: 1, marginRight: 10 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  employer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  wageCol: {
    alignItems: 'flex-end',
  },
  wage: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    color: '#0D3B3F',
    letterSpacing: -0.5,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#8E99A8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4D1C8',
    marginHorizontal: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  verifiedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: '#0D3B3F',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#090D14',
  },
  slotPill: {
    backgroundColor: '#090D14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  slotPillFull: {
    backgroundColor: '#F2F0EB',
  },
  slotText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  slotTextFull: {
    color: '#8E99A8',
  },
});

export const WorkerJobsScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const rankedJobs = useMemo(() => rankJobsForWorker(MOCK_JOBS, CURRENT_WORKER), []);

  const filtered = useMemo(() => {
    return rankedJobs.filter(({ job }) => {
      const matchSearch =
        search.length === 0 ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location.city.toLowerCase().includes(search.toLowerCase()) ||
        job.employer.businessName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCat === 'All' ||
        job.skillRequired.category.toLowerCase() === selectedCat.toLowerCase();
      const matchVerified = !verifiedOnly || job.employer.verificationStatus === 'verified';
      return matchSearch && matchCat && matchVerified;
    });
  }, [rankedJobs, search, selectedCat, verifiedOnly]);

  return (
    <View style={styles.container}>
      {/* ─── Search & Filter Header ─── */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#8E99A8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search roles, locations, employers..."
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

        {/* Quick Filter Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTogglePill, verifiedOnly && styles.filterTogglePillActive]}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={12}
              color={verifiedOnly ? '#C8F135' : '#5A6578'}
            />
            <Text style={[styles.filterToggleText, verifiedOnly && styles.filterToggleTextActive]}>
              Verified Only
            </Text>
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
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCat(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Job Stream ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.jobListContent}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Showing <Text style={styles.countBold}>{filtered.length}</Text> verified opportunities
          </Text>
        </View>

        {filtered.length === 0 ? (
          <GigEasyEmptyState
            title="No matching gigs found"
            subtitle="Try changing your search term or clearing filters."
          />
        ) : (
          filtered.map(({ job, match }) => (
            <MarketplaceJobTile
              key={job.id}
              job={job}
              matchScore={match.totalScore}
              onPress={() => shellNavigation.navigate('JobDetail', { jobId: job.id })}
            />
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0EB',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#090D14',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  filterTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F0EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  filterTogglePillActive: {
    backgroundColor: '#0D3B3F',
    borderColor: '#0D3B3F',
  },
  filterToggleText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#5A6578',
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  catsScroll: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F2F0EB',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  catPillActive: {
    backgroundColor: '#090D14',
    borderColor: '#090D14',
  },
  catText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
  },
  catTextActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  jobListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  resultsHeader: {
    marginBottom: 10,
  },
  resultsCount: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
  },
  countBold: {
    fontFamily: FontFamily.bold,
    color: '#090D14',
  },
});
