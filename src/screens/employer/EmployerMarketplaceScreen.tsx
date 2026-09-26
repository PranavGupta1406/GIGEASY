import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily } from '../../constants';
import { api } from '../../services/api';
import { InteractiveMapVisual, MapJobMarker } from '../../components/InteractiveMapVisual';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { Theme } from '../../theme';

const T = {
  bg: Theme.bg,
  primary: Theme.accent,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
};

// Mock Worker Pins for Employer Map
const MAP_WORKER_PINS: MapJobMarker[] = [
  { id: 'w1', wage: '₹700', title: 'Rajesh - Plumber', top: '30%', left: '62%' },
  { id: 'w2', wage: '₹500', title: 'Amit - Helper', top: '56%', left: '18%' },
  { id: 'w3', wage: '₹850', title: 'Vikram - Mason', top: '22%', left: '26%' },
  { id: 'w4', wage: '₹600', title: 'Sunil - Electrician', top: '68%', left: '72%' },
];

export function EmployerMarketplaceScreen({ shellNavigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState('w1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isHiring, setIsHiring] = useState(true);

  // Hardcoded Employer Info for Prototype
  const employer = {
    name: 'Ansh',
    location: { city: 'New Delhi', state: 'DL' },
    preferredRadius: 15
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const catData = await api.getCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const onCategoryPress = (categoryId: string) => {
    shellNavigation.navigate('CategoryServices', { categoryId });
  };

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
            <Text style={styles.locationCity}>{employer.location.city}, {employer.location.state}</Text>
          </View>
          <Text style={styles.greeting}>Hi, {employer.name}</Text>
        </View>

        <View style={styles.availControl}>
          <View style={[styles.statusDot, { backgroundColor: isHiring ? T.success : Theme.textMuted }]} />
          <Text style={styles.availText}>{isHiring ? 'Hiring Now' : 'Not Hiring'}</Text>
          <Switch
            value={isHiring}
            onValueChange={setIsHiring}
            trackColor={{ false: Theme.border, true: Theme.accentLight }}
            thumbColor={isHiring ? T.primary : Theme.textMuted}
            style={styles.switch}
          />
        </View>
      </View>

      {/* ─── 2. Interactive Map Visual ─── */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workers near you</Text>
          <Text style={styles.sectionSub}>125 available today</Text>
        </View>

        <InteractiveMapVisual
          markers={MAP_WORKER_PINS}
          selectedMarkerId={selectedPinId}
          onSelectMarker={(id) => setSelectedPinId(id)}
          height={180}
          userLabel="OFFICE"
          locationCity={employer.location.city}
          radiusKm={employer.preferredRadius}
        />
      </View>

      {/* ─── 3. Visual Horizontal Category Filter ─── */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories of work</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {/* 'All' option */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('All')}
              activeOpacity={0.8}
              style={[
                styles.categoryPill,
                selectedCategory === 'All' && styles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === 'All' && styles.categoryPillTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              // using standard getCategoryVisual mapping from our primitives
              const catVisual = getCategoryVisual(cat.name);

              return (
                <TouchableOpacity
                  key={cat.category_id}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    onCategoryPress(cat.category_id);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                  ]}
                >
                  {catVisual && (
                    <Feather
                      name={catVisual.iconName as any}
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
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

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
  greeting: {
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
});
