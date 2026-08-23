// GigEasy Functional Google Maps & Interactive Radar Visual
// Multiplatform: Renders interactive Google Maps on Web when available, with sleek Radar fallback

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, BorderRadius, Spacing, Shadow } from '../constants';
import {
  loadGoogleMapsScript,
  GIGEASY_MAP_STYLE,
  getCurrentCoordinates,
  GOOGLE_MAPS_API_KEY,
} from '../services/maps/googleMapsLoader';

export interface MapJobMarker {
  id: string;
  wage: number | string;
  title?: string;
  category?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  top?: string | number; // percentage or px fallback
  left?: string | number; // percentage or px fallback
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
  userCoordinates?: { lat: number; lng: number };
  style?: ViewStyle;
}

export const InteractiveMapVisual: React.FC<InteractiveMapVisualProps> = ({
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  height = 230,
  showRadar = true,
  userLabel = 'YOU',
  locationCity = 'Noida',
  radiusKm = 10,
  userCoordinates,
  style,
}) => {
  const [mapMode, setMapMode] = useState<'google' | 'radar'>('google');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>(
    userCoordinates || { lat: 28.6139, lng: 77.209 }
  );
  const [selectedJob, setSelectedJob] = useState<MapJobMarker | null>(null);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);

  // Radar Animation values
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Initialize coordinates
  useEffect(() => {
    if (userCoordinates) {
      setActiveCoords(userCoordinates);
    } else if (Platform.OS === 'web') {
      getCurrentCoordinates().then((coords) => {
        setActiveCoords(coords);
      });
    }
  }, [userCoordinates]);

  // Load Google Maps on Web
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setMapMode('radar');
      return;
    }

    let isMounted = true;
    loadGoogleMapsScript()
      .then(() => {
        if (isMounted) {
          setIsGoogleMapsReady(true);
        }
      })
      .catch((err) => {
        console.warn('Google Maps script unavailable, using radar view fallback:', err.message);
        if (isMounted) {
          setMapMode('radar');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize and update Google Map instance
  useEffect(() => {
    if (Platform.OS !== 'web' || !isGoogleMapsReady || !mapDivRef.current || mapMode !== 'google') {
      return;
    }

    const google = (window as any).google;
    if (!google?.maps) return;

    // Create or reuse map instance
    if (!googleMapInstance.current) {
      googleMapInstance.current = new google.maps.Map(mapDivRef.current, {
        center: activeCoords,
        zoom: 13,
        styles: GIGEASY_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
      });
    } else {
      googleMapInstance.current.setCenter(activeCoords);
    }

    const map = googleMapInstance.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Draw Operating Radius Circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    circleRef.current = new google.maps.Circle({
      strokeColor: '#0D3B3F',
      strokeOpacity: 0.5,
      strokeWeight: 1.5,
      fillColor: '#0D3B3F',
      fillOpacity: 0.05,
      map,
      center: activeCoords,
      radius: radiusKm * 1000,
    });

    // 1. Plot User Marker
    const userMarker = new google.maps.Marker({
      position: activeCoords,
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#090D14',
        fillOpacity: 1,
        strokeColor: '#C8F135',
        strokeWeight: 3,
      },
    });
    markersRef.current.push(userMarker);

    // 2. Plot Job Markers
    markers.forEach((marker, index) => {
      const lat = marker.lat ?? activeCoords.lat + (index % 2 === 0 ? 0.012 : -0.014) * (index + 1);
      const lng = marker.lng ?? activeCoords.lng + (index % 3 === 0 ? 0.015 : -0.011) * (index + 1);
      const displayWage = typeof marker.wage === 'number' ? `₹${marker.wage.toLocaleString('en-IN')}` : marker.wage;
      const isSelected = marker.id === selectedMarkerId;

      const jobMarker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: marker.title || `Gig ${displayWage}`,
        label: {
          text: displayWage,
          color: isSelected ? '#C8F135' : '#090D14',
          fontSize: '11px',
          fontWeight: 'bold',
          className: 'gigeasy-map-marker-label',
        },
        icon: {
          path: 'M -28,-14 L 28,-14 A 12,12 0 0,1 28,10 L 6,10 L 0,16 L -6,10 L -28,10 A 12,12 0 0,1 -28,-14 Z',
          fillColor: isSelected ? '#090D14' : '#FFFFFF',
          fillOpacity: 0.96,
          strokeColor: isSelected ? '#C8F135' : '#D4D1C8',
          strokeWeight: 1.5,
          scale: 1,
          labelOrigin: new google.maps.Point(0, -2),
        },
      });

      jobMarker.addListener('click', () => {
        setSelectedJob(marker);
        onSelectMarker?.(marker.id);
        map.panTo({ lat, lng });
      });

      markersRef.current.push(jobMarker);
    });
  }, [isGoogleMapsReady, mapMode, markers, selectedMarkerId, activeCoords, radiusKm]);

  // Radar Animation Loop
  useEffect(() => {
    if (!showRadar && mapMode !== 'radar') return;

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
  }, [showRadar, mapMode]);

  // Recenter Google Map to User Location
  const handleRecenter = () => {
    if (googleMapInstance.current) {
      getCurrentCoordinates().then((coords) => {
        setActiveCoords(coords);
        googleMapInstance.current.panTo(coords);
        googleMapInstance.current.setZoom(13);
      });
    }
  };

  const handleZoomIn = () => {
    if (googleMapInstance.current) {
      googleMapInstance.current.setZoom(googleMapInstance.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapInstance.current) {
      googleMapInstance.current.setZoom(Math.max(googleMapInstance.current.getZoom() - 1, 8));
    }
  };

  return (
    <View style={[styles.mapContainer, style]}>
      {/* ─── Map Canvas Area ─── */}
      <View style={[styles.mapCanvas, { height }]}>
        {/* Real Google Maps Container (Web) */}
        {Platform.OS === 'web' && (
          <div
            ref={mapDivRef}
            style={{
              width: '100%',
              height: '100%',
              display: mapMode === 'google' ? 'block' : 'none',
            }}
          />
        )}

        {/* Radar / Vector Fallback View */}
        {mapMode === 'radar' && (
          <>
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
            <View style={styles.arterialRoadH} />
            <View style={styles.arterialRoadV} />
            <View style={styles.diagonalRoad} />

            <View style={styles.zoneBlock1} />
            <View style={styles.zoneBlock2} />
            <View style={styles.zoneBlock3} />

            {/* Animated Radar Pulse */}
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

            {/* Center User Pin */}
            <View style={styles.userMarkerContainer}>
              <View style={styles.userDotPulse} />
              <View style={styles.userDot} />
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>{userLabel}</Text>
              </View>
            </View>

            {/* Fallback Relative Job Pins */}
            {markers.map((marker, idx) => {
              const isSelected = marker.id === selectedMarkerId;
              const displayWage =
                typeof marker.wage === 'number' ? `₹${marker.wage.toLocaleString('en-IN')}` : marker.wage;
              const top = marker.top ?? (idx % 2 === 0 ? '32%' : '65%');
              const left = marker.left ?? (idx % 3 === 0 ? '68%' : '24%');

              return (
                <TouchableOpacity
                  key={marker.id}
                  onPress={() => onSelectMarker?.(marker.id)}
                  activeOpacity={0.85}
                  style={[styles.markerWrap, { top: top as any, left: left as any }]}
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
          </>
        )}

        {/* ─── Floating Map Action Controls ─── */}
        <View style={styles.floatingControls}>
          {Platform.OS === 'web' && isGoogleMapsReady && (
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() => setMapMode(mapMode === 'google' ? 'radar' : 'google')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={mapMode === 'google' ? 'radar' : 'map'}
                size={16}
                color="#090D14"
              />
            </TouchableOpacity>
          )}

          {mapMode === 'google' && (
            <>
              <TouchableOpacity style={styles.floatingBtn} onPress={handleRecenter} activeOpacity={0.8}>
                <Feather name="crosshair" size={15} color="#090D14" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingBtn} onPress={handleZoomIn} activeOpacity={0.8}>
                <Feather name="plus" size={15} color="#090D14" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingBtn} onPress={handleZoomOut} activeOpacity={0.8}>
                <Feather name="minus" size={15} color="#090D14" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ─── Interactive Selected Job Popup Card ─── */}
        {selectedJob && (
          <View style={styles.jobPreviewCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedJob.title || 'Gig Opportunity'}
              </Text>
              <Text style={styles.previewSub}>
                {typeof selectedJob.wage === 'number'
                  ? `₹${selectedJob.wage.toLocaleString('en-IN')} / day`
                  : selectedJob.wage}{' '}
                · {locationCity}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onSelectMarker?.(selectedJob.id)}
              style={styles.previewBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.previewBtnText}>View →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ─── Map Bottom Status Strip ─── */}
      <View style={styles.statusStrip}>
        <View style={styles.stripLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stripLiveText}>
            {mapMode === 'google' ? 'Google Maps Live' : 'Live Radar'} · {locationCity}
          </Text>
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
  gridLineH1: { position: 'absolute', left: 0, right: 0, top: '25%', height: 1, backgroundColor: '#E0DDD5' },
  gridLineH2: { position: 'absolute', left: 0, right: 0, top: '75%', height: 1, backgroundColor: '#E0DDD5' },
  gridLineV1: { position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, backgroundColor: '#E0DDD5' },
  gridLineV2: { position: 'absolute', top: 0, bottom: 0, left: '70%', width: 1, backgroundColor: '#E0DDD5' },
  arterialRoadH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 6, backgroundColor: '#DFDBD2' },
  arterialRoadV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 6, backgroundColor: '#DFDBD2' },
  diagonalRoad: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    left: '20%',
    width: 4,
    backgroundColor: '#DFDBD2',
    transform: [{ rotate: '35deg' }],
  },
  zoneBlock1: { position: 'absolute', top: '12%', left: '60%', width: 65, height: 45, borderRadius: 6, backgroundColor: '#E4E0D6' },
  zoneBlock2: { position: 'absolute', bottom: '15%', left: '12%', width: 55, height: 40, borderRadius: 6, backgroundColor: '#E4E0D6' },
  zoneBlock3: { position: 'absolute', top: '18%', left: '10%', width: 50, height: 35, borderRadius: 6, backgroundColor: '#E4E0D6' },
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
  markerWageActive: { color: '#C8F135' },
  markerWageDefault: { color: '#090D14' },
  markerAnchorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1.5,
  },
  anchorDotActive: { backgroundColor: '#C8F135' },
  anchorDotDefault: { backgroundColor: '#8E99A8' },

  // Floating map controls
  floatingControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
    zIndex: 10,
  },
  floatingBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.sm,
  },

  // Selected Job Card
  jobPreviewCard: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    backgroundColor: '#090D14',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 15,
    ...Shadow.md,
  },
  previewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  previewSub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#8E99A8',
    marginTop: 2,
  },
  previewBtn: {
    backgroundColor: '#C8F135',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  previewBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#090D14',
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
  stripLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  livePulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  stripLiveText: { fontFamily: FontFamily.semiBold, fontSize: 11, color: '#090D14' },
  stripRadiusText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#8E99A8' },
});
