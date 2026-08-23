// GigEasy Signature Interactive Map Visual with Google Maps Integration
// Clean urban cartography + Live Google Maps Imagery + Radar sweep + Selectable job pins

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, BorderRadius, Spacing, Shadow } from '../constants';
import { googleMapsService } from '../services/maps/googleMapsService';
import { DEFAULT_MAP_COORDINATES } from '../config/maps';

export interface MapJobMarker {
  id: string;
  wage: number | string;
  title?: string;
  category?: string;
  distance?: string;
  top?: string | number; // percentage or px
  left?: string | number; // percentage or px
  lat?: number;
  lng?: number;
}

export type MapViewMode = 'schematic' | 'roadmap' | 'satellite';

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
  zoom?: number;
  initialMode?: MapViewMode;
  showModeToggle?: boolean;
  showGoogleMapsButton?: boolean;
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
  centerLat = DEFAULT_MAP_COORDINATES.lat,
  centerLng = DEFAULT_MAP_COORDINATES.lng,
  zoom = 13,
  initialMode = 'roadmap',
  showModeToggle = true,
  showGoogleMapsButton = true,
  style,
}) => {
  const [viewMode, setViewMode] = useState<MapViewMode>(initialMode);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Generate Google Maps Static URL with markers
  const googleMapMarkers = markers
    .filter((m) => m.lat && m.lng)
    .map((m) => ({
      lat: m.lat!,
      lng: m.lng!,
      color: m.id === selectedMarkerId ? '0xC8F135' : '0x0D3B3F',
      size: 'mid' as const,
    }));

  const googleMapUrl = googleMapsService.getStaticMapUrl({
    centerLat,
    centerLng,
    zoom,
    width: 600,
    height: Math.round(height * 1.5),
    scale: 2,
    mapType: viewMode === 'satellite' ? 'satellite' : 'roadmap',
    theme: viewMode === 'satellite' ? undefined : 'silver',
    markers: googleMapMarkers.length > 0 ? googleMapMarkers : undefined,
  });

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [viewMode, centerLat, centerLng, zoom]);

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

  const handleOpenGoogleMaps = () => {
    const selected = markers.find((m) => m.id === selectedMarkerId);
    const destLat = selected?.lat ?? centerLat;
    const destLng = selected?.lng ?? centerLng;
    const label = selected?.title ?? `${locationCity} Work Site`;
    googleMapsService.openLocation(destLat, destLng, label);
  };

  const isGoogleMode = (viewMode === 'roadmap' || viewMode === 'satellite') && !imageError;

  return (
    <View style={[styles.mapContainer, style]}>
      <View style={[styles.mapCanvas, { height }]}>
        {/* Layer 1: Google Maps Static Imagery */}
        {isGoogleMode && (
          <Image
            source={{ uri: googleMapUrl }}
            style={styles.googleMapImage}
            resizeMode="cover"
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}

        {/* Layer 2: Vector Cartography (Active in schematic mode or while image loading/fallback) */}
        {(!isGoogleMode || imageLoading) && (
          <View style={StyleSheet.absoluteFill}>
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
          </View>
        )}

        {/* Subtle Dark/Light Overlay for contrast over Google Maps */}
        {isGoogleMode && viewMode === 'satellite' && (
          <View style={styles.satelliteTintOverlay} />
        )}
        {isGoogleMode && viewMode === 'roadmap' && (
          <View style={styles.roadmapTintOverlay} />
        )}

        {/* Loading Spinner */}
        {isGoogleMode && imageLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="small" color="#0D3B3F" />
          </View>
        )}

        {/* Layer 3: Live Radar Waves */}
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
                    outputRange: [0.5, 0.2, 0],
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
                    outputRange: [0.5, 0.2, 0],
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
        {markers.map((marker, index) => {
          const isSelected = marker.id === selectedMarkerId;
          const displayWage =
            typeof marker.wage === 'number' ? `₹${marker.wage.toLocaleString('en-IN')}` : marker.wage;

          // Default fallback positioning if top/left not supplied
          const defaultTops = ['30%', '58%', '24%', '68%', '42%'];
          const defaultLefts = ['62%', '20%', '28%', '74%', '48%'];
          const topPos = marker.top ?? defaultTops[index % defaultTops.length];
          const leftPos = marker.left ?? defaultLefts[index % defaultLefts.length];

          return (
            <TouchableOpacity
              key={marker.id}
              onPress={() => onSelectMarker?.(marker.id)}
              activeOpacity={0.85}
              style={[
                styles.markerWrap,
                {
                  top: topPos as any,
                  left: leftPos as any,
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

        {/* Top Control Bar: Mode Toggle + Google Maps Badge */}
        <View style={styles.topControlBar}>
          {showModeToggle && (
            <View style={styles.modeToggleGroup}>
              <TouchableOpacity
                onPress={() => setViewMode('roadmap')}
                activeOpacity={0.8}
                style={[
                  styles.modeBtn,
                  viewMode === 'roadmap' && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    viewMode === 'roadmap' && styles.modeBtnTextActive,
                  ]}
                >
                  Map
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('satellite')}
                activeOpacity={0.8}
                style={[
                  styles.modeBtn,
                  viewMode === 'satellite' && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    viewMode === 'satellite' && styles.modeBtnTextActive,
                  ]}
                >
                  Satellite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('schematic')}
                activeOpacity={0.8}
                style={[
                  styles.modeBtn,
                  viewMode === 'schematic' && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    viewMode === 'schematic' && styles.modeBtnTextActive,
                  ]}
                >
                  Radar
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showGoogleMapsButton && (
            <TouchableOpacity
              onPress={handleOpenGoogleMaps}
              activeOpacity={0.8}
              style={styles.googleMapsBadgeBtn}
            >
              <Feather name="external-link" size={10} color="#0D3B3F" />
              <Text style={styles.googleMapsBadgeText}>Google Maps</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Map Bottom Status Strip */}
      <View style={styles.statusStrip}>
        <View style={styles.stripLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stripLiveText}>
            {viewMode === 'satellite' ? 'Satellite View' : 'Live Radar'} · {locationCity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.7}
          style={styles.stripRightBtn}
        >
          <Feather name="navigation" size={11} color="#0D3B3F" />
          <Text style={styles.stripRadiusText}>Radius {radiusKm} km · Navigate</Text>
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
    borderColor: '#E8E6E0',
    backgroundColor: '#F3F2EE',
    ...Shadow.xs,
  },
  mapCanvas: {
    position: 'relative',
    backgroundColor: '#ECEAE4',
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
  satelliteTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 20, 0.25)',
  },
  roadmapTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236, 234, 228, 0.6)',
  },
  topControlBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: BorderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Shadow.xs,
  },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  modeBtnActive: {
    backgroundColor: '#090D14',
  },
  modeBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 9,
    color: '#5A6578',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  googleMapsBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Shadow.xs,
  },
  googleMapsBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
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
    zIndex: 5,
  },
  userDotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(200, 241, 53, 0.45)',
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
    zIndex: 6,
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
  stripRightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stripRadiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#0D3B3F',
  },
});
