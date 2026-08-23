// GigEasy Signature Interactive Google Map Visual
// Integrates Google Maps API Key with live cartography backdrop, radar pulses, and selectable wage pins

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ViewStyle,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, BorderRadius } from '../constants';
import { GOOGLE_MAPS_API_KEY, DEFAULT_MAP_COORDINATES } from '../config/maps';
import { googleMapsService } from '../services/maps/googleMapsService';

export interface MapJobMarker {
  id: string;
  wage: number | string;
  title?: string;
  category?: string;
  distance?: string;
  top: string | number;
  left: string | number;
  lat?: number;
  lng?: number;
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
  centerLat?: number;
  centerLng?: number;
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
  centerLat = DEFAULT_MAP_COORDINATES.lat,
  centerLng = DEFAULT_MAP_COORDINATES.lng,
  style,
}) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [mapImgError, setMapImgError] = useState(false);

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

  // Google Maps Static API Image URL
  const staticMapUrl = googleMapsService.getStaticMapUrl({
    centerLat,
    centerLng,
    zoom: 13,
    width: 640,
    height: Math.round(height * 2),
    theme: 'light',
  });

  const handleOpenGoogleMaps = () => {
    googleMapsService.openLocation(centerLat, centerLng, `Gigs near ${locationCity}`);
  };

  return (
    <View style={[styles.mapContainer, style]}>
      <View style={[styles.mapCanvas, { height }]}>
        {/* Real Google Maps Satellite/Cartography Image Backdrop */}
        {GOOGLE_MAPS_API_KEY && !mapImgError ? (
          <Image
            source={{ uri: staticMapUrl }}
            style={styles.googleMapImage}
            onError={() => setMapImgError(true)}
            resizeMode="cover"
          />
        ) : (
          <>
            {/* Fallback Vector Grid and routes */}
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
            <View style={styles.arterialRoadH} />
            <View style={styles.arterialRoadV} />
            <View style={styles.zoneBlock1} />
            <View style={styles.zoneBlock2} />
          </>
        )}

        {/* Ambient overlay tint */}
        <View style={styles.mapTintOverlay} pointerEvents="none" />

        {/* Radar Pulse Waves */}
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

        {/* Center User Location Marker */}
        <View style={styles.userMarkerContainer}>
          <View style={styles.userDot} />
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{userLabel}</Text>
          </View>
        </View>

        {/* Dynamic Job Wage Pins */}
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

        {/* Google Maps Badge / Direct Action */}
        <TouchableOpacity
          style={styles.googleWatermark}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.85}
        >
          <Feather name="navigation" size={10} color={B.navy} />
          <Text style={styles.googleMapsText}>Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Map Bottom Status Strip */}
      <View style={styles.statusStrip}>
        <View style={styles.stripLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stripLiveText}>Gigs in {locationCity}</Text>
        </View>
        <TouchableOpacity
          style={styles.openMapsPill}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.8}
        >
          <Text style={styles.stripRadiusText}>Within {radiusKm} km · View Map ↗</Text>
        </TouchableOpacity>
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
  googleMapImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  mapTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.15)',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: B.border,
  },
  arterialRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 5,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: B.border,
  },
  zoneBlock1: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  zoneBlock2: {
    position: 'absolute',
    bottom: 20,
    right: 25,
    width: 60,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  radarWave: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginTop: -40,
    marginLeft: -40,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: B.navy,
    backgroundColor: 'rgba(26, 104, 213, 0.08)',
  },
  userMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: B.navy,
    borderWidth: 2.5,
    borderColor: B.white,
    shadowColor: B.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  userBadge: {
    backgroundColor: B.navy,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 2,
  },
  userBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 8.5,
    color: B.white,
    letterSpacing: 0.5,
  },
  markerWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
  },
  markerPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  markerPillDefault: {
    backgroundColor: B.white,
    borderColor: B.border,
  },
  markerPillActive: {
    backgroundColor: B.navy,
    borderColor: B.white,
  },
  markerWage: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  markerWageDefault: {
    color: B.ink,
  },
  markerWageActive: {
    color: B.white,
  },
  markerAnchorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -2,
  },
  anchorDotDefault: {
    backgroundColor: B.ink,
  },
  anchorDotActive: {
    backgroundColor: B.navy,
    borderWidth: 1,
    borderColor: B.white,
  },
  googleWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: B.border,
    zIndex: 20,
  },
  googleMapsText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: B.navy,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: B.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 11.5,
    color: B.ink,
  },
  openMapsPill: {
    paddingVertical: 2,
  },
  stripRadiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: B.navy,
  },
});
