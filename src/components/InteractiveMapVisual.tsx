// GigEasy Signature Interactive Map Visual
// Clean urban cartography with live radar sweep and selectable job pins

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, BorderRadius, Spacing, Shadow } from '../constants';

export interface MapJobMarker {
  id: string;
  wage: number | string;
  title?: string;
  category?: string;
  distance?: string;
  top: string | number; // percentage or px
  left: string | number; // percentage or px
}

interface InteractiveMapVisualProps {
  markers?: MapJobMarker[];
  selectedMarkerId?: string;
  onSelectMarker?: (id: string) => void;
  height?: number;
  showRadar?: boolean;
  userLabel?: string;
  locationCity?: string;
  radiusKm?: number;
  style?: ViewStyle;
}

export const InteractiveMapVisual: React.FC<InteractiveMapVisualProps> = ({
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  height = 220,
  showRadar = true,
  userLabel = 'YOU',
  locationCity = 'Noida',
  radiusKm = 10,
  style,
}) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showRadar) return;

    const p1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const p2 = Animated.loop(
      Animated.sequence([
        Animated.delay(1300),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const fl = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    p1.start();
    p2.start();
    fl.start();

    return () => {
      p1.stop();
      p2.stop();
      fl.stop();
    };
  }, [showRadar]);

  return (
    <View style={[styles.mapContainer, style]}>
      <View style={[styles.mapCanvas, { height }]}>
        {/* Urban grid and arterial routes */}
        <View style={styles.gridLineH1} />
        <View style={styles.gridLineH2} />
        <View style={styles.gridLineV1} />
        <View style={styles.gridLineV2} />
        <View style={styles.arterialRoadH} />
        <View style={styles.arterialRoadV} />
        <View style={styles.diagonalRoad} />

        {/* Subtle city zone polygons */}
        <View style={styles.zoneBlock1} />
        <View style={styles.zoneBlock2} />
        <View style={styles.zoneBlock3} />

        {/* Radar Waves */}
        {showRadar && (
          <>
            <Animated.View
              style={[
                styles.radarWave,
                {
                  transform: [
                    {
                      scale: pulseAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 2.8],
                      }),
                    },
                  ],
                  opacity: pulseAnim1.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.6, 0.25, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.radarWave,
                {
                  transform: [
                    {
                      scale: pulseAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 2.8],
                      }),
                    },
                  ],
                  opacity: pulseAnim2.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.6, 0.25, 0],
                  }),
                },
              ]}
            />
          </>
        )}

        {/* Center User Marker */}
        <View style={styles.userMarkerContainer}>
          <View style={styles.userDotPulse} />
          <View style={styles.userDot} />
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{userLabel}</Text>
          </View>
        </View>

        {/* Job Pins */}
        {markers.map((marker) => {
          const isSelected = marker.id === selectedMarkerId;
          const displayWage = typeof marker.wage === 'number' ? `₹${marker.wage.toLocaleString('en-IN')}` : marker.wage;

          return (
            <TouchableOpacity
              key={marker.id}
              onPress={() => onSelectMarker?.(marker.id)}
              activeOpacity={0.85}
              style={[
                styles.markerWrap,
                {
                  top: marker.top as any,
                  left: marker.left as any,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.markerPill,
                  isSelected ? styles.markerPillActive : styles.markerPillDefault,
                  { transform: [{ translateY: isSelected ? floatAnim : 0 }] },
                ]}
              >
                <Text
                  style={[
                    styles.markerWage,
                    isSelected ? styles.markerWageActive : styles.markerWageDefault,
                  ]}
                >
                  {displayWage}
                </Text>
              </Animated.View>
              <View
                style={[
                  styles.markerAnchorDot,
                  isSelected ? styles.anchorDotActive : styles.anchorDotDefault,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Map Bottom Status Strip */}
      <View style={styles.statusStrip}>
        <View style={styles.stripLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stripLiveText}>Live Radar · {locationCity}</Text>
        </View>
        <Text style={styles.stripRadiusText}>Within {radiusKm} km radius</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    backgroundColor: '#F3F2EE',
    ...Shadow.xs,
  },
  mapCanvas: {
    position: 'relative',
    backgroundColor: '#ECEAE4',
    overflow: 'hidden',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25%',
    height: 1,
    backgroundColor: '#E0DDD5',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '75%',
    height: 1,
    backgroundColor: '#E0DDD5',
  },
  gridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 1,
    backgroundColor: '#E0DDD5',
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 1,
    backgroundColor: '#E0DDD5',
  },
  arterialRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 6,
    backgroundColor: '#DFDBD2',
  },
  arterialRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 6,
    backgroundColor: '#DFDBD2',
  },
  diagonalRoad: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    left: '20%',
    width: 4,
    backgroundColor: '#DFDBD2',
    transform: [{ rotate: '35deg' }],
  },
  zoneBlock1: {
    position: 'absolute',
    top: '12%',
    left: '60%',
    width: 65,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#E4E0D6',
  },
  zoneBlock2: {
    position: 'absolute',
    bottom: '15%',
    left: '12%',
    width: 55,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E4E0D6',
  },
  zoneBlock3: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    width: 50,
    height: 35,
    borderRadius: 6,
    backgroundColor: '#E4E0D6',
  },
  radarWave: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginLeft: -60,
    marginTop: -60,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#0D3B3F',
    backgroundColor: 'rgba(13, 59, 63, 0.06)',
  },
  userMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(200, 241, 53, 0.4)',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#090D14',
    borderWidth: 2.5,
    borderColor: '#C8F135',
  },
  userBadge: {
    marginTop: 3,
    backgroundColor: '#090D14',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  userBadgeText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 7,
    color: '#C8F135',
    letterSpacing: 0.5,
  },
  markerWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -14 }],
  },
  markerPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  markerPillActive: {
    backgroundColor: '#090D14',
    borderColor: '#C8F135',
    borderWidth: 1.5,
    ...Shadow.sm,
  },
  markerPillDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D4D1C8',
    ...Shadow.xs,
  },
  markerWage: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: -0.3,
  },
  markerWageActive: {
    color: '#C8F135',
  },
  markerWageDefault: {
    color: '#090D14',
  },
  markerAnchorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1.5,
  },
  anchorDotActive: {
    backgroundColor: '#C8F135',
  },
  anchorDotDefault: {
    backgroundColor: '#8E99A8',
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  stripLiveText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: '#090D14',
  },
  stripRadiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#8E99A8',
  },
});
