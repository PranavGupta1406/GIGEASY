// GigEasy Gig Pulse Widget — Lightweight Live Labour-Demand Visualization
// Minimal text bloat. Visual demand pills (Green = High, Orange = Good, Neutral = Moderate).
// Interactive: Tapping a trade filters the radar/map to that category.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme';
import { FontFamily } from '../constants';
import { GigPulseTradeDemand, DemandPredictionSignal } from '../types';
import { getCategoryVisual } from './GigEasyPrimitives';

interface GigPulseWidgetProps {
  demands: GigPulseTradeDemand[];
  prediction?: DemandPredictionSignal;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onActionClick?: (signal: DemandPredictionSignal) => void;
}

export const GigPulseWidget: React.FC<GigPulseWidgetProps> = ({
  demands,
  prediction,
  selectedCategory,
  onSelectCategory,
  onActionClick,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.headerEyebrow}>WORK PULSE · NEAR YOU</Text>
        </View>
        <Text style={styles.locationTag}>Sector 62, Noida</Text>
      </View>

      {/* Demand Chips Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {demands.map((item) => {
          const isSelected = selectedCategory.toLowerCase() === item.category.toLowerCase();
          const visual = getCategoryVisual(item.category);

          let dotColor: string = Theme.textMuted;
          let badgeText = 'Moderate';
          if (item.intensity === 'HIGH') {
            dotColor = Theme.forestGreen;
            badgeText = 'High Demand';
          } else if (item.intensity === 'GOOD') {
            dotColor = Theme.accent;
            badgeText = 'Good Demand';
          }

          return (
            <TouchableOpacity
              key={item.category}
              style={[
                styles.pulseChip,
                isSelected && styles.pulseChipSelected,
              ]}
              onPress={() => onSelectCategory(isSelected ? 'All' : item.category)}
              activeOpacity={0.8}
            >
              <View style={styles.chipTop}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <Text style={[styles.tradeName, isSelected && styles.tradeNameSelected]}>
                  {item.trade}
                </Text>
              </View>

              <View style={styles.chipBottom}>
                <Text style={[styles.spotsCount, isSelected && styles.spotsCountSelected]}>
                  {item.openPositions} spots
                </Text>
                <Text style={styles.metaTime}>· {badgeText}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Proactive Prediction Notification Strip */}
      {prediction && (
        <View style={styles.predictionBanner}>
          <View style={styles.predictionLeft}>
            <Feather name="trending-up" size={13} color={Theme.forestGreen} />
            <Text style={styles.predictionText} numberOfLines={1}>
              {prediction.actionableText}
            </Text>
          </View>
          {onActionClick && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onActionClick(prediction)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {prediction.suggestedAction === 'SET_AVAILABLE' ? 'SET AVAILABLE' : 'VIEW GIGS'}
              </Text>
              <Feather name="arrow-right" size={10} color={Theme.surface} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Theme.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Theme.forestGreen,
  },
  headerEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    color: Theme.ink,
    letterSpacing: 0.6,
  },
  locationTag: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: Theme.textMuted,
  },
  scrollRow: {
    gap: 8,
    paddingBottom: 2,
  },
  pulseChip: {
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
    minWidth: 125,
  },
  pulseChipSelected: {
    backgroundColor: Theme.surface,
    borderColor: Theme.forestGreen,
    borderWidth: 1.5,
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tradeName: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.ink,
  },
  tradeNameSelected: {
    color: Theme.forestGreen,
  },
  chipBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  spotsCount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 12,
    color: Theme.ink,
  },
  spotsCountSelected: {
    color: Theme.forestGreen,
  },
  metaTime: {
    fontFamily: FontFamily.regular,
    fontSize: 10.5,
    color: Theme.textMuted,
  },
  predictionBanner: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  predictionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predictionText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.ink,
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.forestGreen,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: Theme.surface,
    letterSpacing: 0.3,
  },
});
