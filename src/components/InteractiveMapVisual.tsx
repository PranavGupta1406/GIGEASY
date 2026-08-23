// GigEasy Signature Interactive Map Visual
// Clean cartography with live pulse and selectable wage pins
// Brand Navy (#1E3A5F)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { FontFamily, BorderRadius } from '../constants';

export interface MapJobMarker {
  id: string;
  wage: number | string;
  title?: string;
  category?: string;
  distance?: string;
  top: string | number;
  left: string | number;
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

const B = {
  navy: '#1A68D5',
  navyLight: '#EBF3FC',
  ink: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  mapBg: '#F1F5F9',
  road: '#E2E8F0',
  green: '#10B981',
  money: '#EA580C',
};

export const InteractiveMapVisual: React.FC<InteractiveMapVisualProps> = ({
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  height = 200,
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
        {/* Grid and routes */}
        <View style={styles.gridLineH1} />
        <View style={styles.gridLineH2} />
        <View style={styles.gridLineV1} />
        <View style={styles.gridLineV2} />
        <View style={styles.arterialRoadH} />
        <View style={styles.arterialRoadV} />

        {/* City zones */}
        <View style={styles.zoneBlock1} />
        <View style={styles.zoneBlock2} />

        {/* Pulse Waves */}
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
                        outputRange: [0.2, 2.6],
                      }),
                    },
                  ],
                  opacity: pulseAnim1.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.4, 0.15, 0],
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
                        outputRange: [0.2, 2.6],
                      }),
                    },
                  ],
                  opacity: pulseAnim2.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.4, 0.15, 0],
                  }),
                },
              ]}
            />
          </>
        )}

        {/* Center User Marker */}
        <View style={styles.userMarkerContainer}>
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
          <Text style={styles.stripLiveText}>Gigs in {locationCity}</Text>
        </View>
        <Text style={styles.stripRadiusText}>Within {radiusKm} km</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: B.border,
    backgroundColor: B.mapBg,
  },
  mapCanvas: {
    position: 'relative',
    backgroundColor: B.mapBg,
    overflow: 'hidden',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25%',
    height: 1,
    backgroundColor: B.road,
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '75%',
    height: 1,
    backgroundColor: B.road,
  },
  gridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 1,
    backgroundColor: B.road,
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 1,
    backgroundColor: B.road,
  },
  arterialRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 5,
    backgroundColor: B.road,
  },
  arterialRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 5,
    backgroundColor: B.road,
  },
  zoneBlock1: {
    position: 'absolute',
    top: '12%',
    left: '60%',
    width: 65,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#E4EAF2',
  },
  zoneBlock2: {
    position: 'absolute',
    bottom: '15%',
    left: '12%',
    width: 55,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E4EAF2',
  },
  radarWave: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 110,
    height: 110,
    marginLeft: -55,
    marginTop: -55,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: B.navy,
    backgroundColor: 'rgba(30, 58, 95, 0.08)',
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
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: B.navy,
    borderWidth: 2,
    borderColor: B.white,
  },
  userBadge: {
    marginTop: 2,
    backgroundColor: B.navy,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  userBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 7,
    color: B.white,
    letterSpacing: 0.5,
  },
  markerWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -14 }],
  },
  markerPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  markerPillActive: {
    backgroundColor: B.navy,
    borderColor: B.navy,
  },
  markerPillDefault: {
    backgroundColor: B.white,
    borderColor: B.border,
  },
  markerWage: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: -0.3,
  },
  markerWageActive: {
    color: B.white,
  },
  markerWageDefault: {
    color: B.navy,
  },
  markerAnchorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1.5,
  },
  anchorDotActive: {
    backgroundColor: B.navy,
  },
  anchorDotDefault: {
    backgroundColor: '#8A99AB',
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: B.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: B.border,
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
    backgroundColor: B.green,
  },
  stripLiveText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: B.ink,
  },
  stripRadiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: B.textMuted,
  },
});
