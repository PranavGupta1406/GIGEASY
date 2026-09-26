// GigEasy Signature Interactive Map Visual — Production v3
// Real Interactive Map Experience · Pan / Drag / Pinch / Mousewheel Zoom · CartoDB Voyager Cartography
// True 1-to-1 Gig Synchronization · Custom [Icon + Wage] Markers · Visual Priority Tiers · Connected Preview Dock

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Theme } from '../theme';
import { getCategoryVisual } from './GigEasyPrimitives';
import { Job } from '../types';
import { useLanguageStore } from '../store';

export interface MapJobMarker {
  id: string; // EXACT gig.id
  gigId?: string; // alias
  wage: number | string;
  displayWage?: string;
  title?: string;
  category?: string;
  distance?: string;
  distanceKm?: number;
  top?: string | number;
  left?: string | number;
  lat?: number;
  lng?: number;
  priority?: 'standard' | 'good' | 'best';
  matchScore?: number;
  job?: Job;
}

interface InteractiveMapVisualProps {
  markers?: MapJobMarker[];
  selectedMarkerId?: string;
  onSelectMarker?: (id: string, openDirectly?: boolean) => void;
  onOpenGig?: (id: string) => void;
  onClosePreview?: () => void;
  height?: number;
  showRadar?: boolean;
  userLabel?: string;
  locationCity?: string;
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
  showPreview?: boolean;
  style?: ViewStyle;
}

// Inline SVGs for Leaflet HTML Markers
function getCategorySvg(category: string, color: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ware') || cat.includes('load') || cat.includes('pack') || cat.includes('logist')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
  }
  if (cat.includes('elect') || cat.includes('wiring')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
  }
  if (cat.includes('plumb') || cat.includes('pipe')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.69 5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;
  }
  if (cat.includes('construct') || cat.includes('mason') || cat.includes('site') || cat.includes('helper')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
  }
  if (cat.includes('deliver') || cat.includes('driv') || cat.includes('fleet') || cat.includes('transport')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
  }
  if (cat.includes('clean') || cat.includes('sweep') || cat.includes('maid') || cat.includes('house')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`;
  }
  if (cat.includes('event') || cat.includes('crew') || cat.includes('hospit')) {
    return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="11" height="11" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
}

export const InteractiveMapVisual: React.FC<InteractiveMapVisualProps> = ({
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  onOpenGig,
  onClosePreview,
  height = 240,
  showRadar = true,
  userLabel = 'YOU',
  locationCity = 'Noida',
  radiusKm = 15,
  centerLat = DEFAULT_MAP_COORDINATES.lat,
  centerLng = DEFAULT_MAP_COORDINATES.lng,
  showPreview = true,
  style,
}) => {
  const { language, t } = useLanguageStore();
  const effectiveUserLabel = userLabel && userLabel !== 'YOU' ? userLabel : (language === 'hi' ? 'आप' : 'YOU');
  const mapContainerId = useRef(`gigeasy-map-${Math.random().toString(36).substring(2, 9)}`).current;
  const mapInstanceRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);

  // Selected marker object
  const selectedMarker = useMemo(() => {
    if (!selectedMarkerId) return null;
    return markers.find((m) => m.id === selectedMarkerId || m.gigId === selectedMarkerId) || null;
  }, [markers, selectedMarkerId]);

  const selectedCatVisual = selectedMarker ? getCategoryVisual(selectedMarker.category || 'Gig') : null;

  // ── Global bridge for Leaflet marker clicks ──
  const onSelectMarkerRef = useRef(onSelectMarker);
  useEffect(() => {
    onSelectMarkerRef.current = onSelectMarker;
  }, [onSelectMarker]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__gigeasy_select_marker = (gigId: string) => {
        if (onSelectMarkerRef.current) {
          onSelectMarkerRef.current(gigId, false);
        }
      };
      (window as any).__gigeasy_zoom_cluster = (lat: number, lng: number) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], (mapInstanceRef.current.getZoom() || 13) + 2, { duration: 0.5 });
        }
      };
    }
  }, []);

  // ── Inject Leaflet script & stylesheet dynamically on web ──
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const L = (window as any).L;
    if (L) {
      setIsLeafletReady(true);
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.head.appendChild(script);
    } else {
      const checkTimer = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkTimer);
          setIsLeafletReady(true);
        }
      }, 100);
      return () => clearInterval(checkTimer);
    }
  }, []);

  // ── Initialize Leaflet Map Instance ──
  useEffect(() => {
    if (!isLeafletReady || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L) return;

    const container = document.getElementById(mapContainerId);
    if (!container) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerId, {
        center: [centerLat, centerLng],
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false, // Custom styled controls used
        attributionControl: false,
      });

      // CartoDB Voyager Tile Layer — warm ivory, crisp roads, soft parks
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady, mapContainerId, centerLat, centerLng]);

  // ── Add/Update User Location Marker ──
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; pointer-events:none;">
        <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:22px; height:22px; border-radius:11px; background:rgba(22,101,52,0.22); animation:gigeasy-pulse 2s infinite ease-out;"></div>
          <div style="width:12px; height:12px; border-radius:6px; background:#166534; border:2.5px solid #FFFFFF; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
        </div>
        <div style="background:#166534; color:#FFFFFF; font-size:8px; font-weight:700; padding:1px 4px; border-radius:4px; margin-top:2px; letter-spacing:0.4px;">
          ${effectiveUserLabel}
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'gigeasy-user-marker',
      html: userHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 16],
    });

    userMarkerRef.current = L.marker([centerLat, centerLng], { icon: userIcon, interactive: false }).addTo(map);
  }, [isLeafletReady, centerLat, centerLng, effectiveUserLabel]);

  // ── Render 1-to-1 Custom Gig Markers & Clustering onto Leaflet ──
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    // Filter valid markers with lat/lng
    const validMarkers = markers.filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number');

    // Simple distance-based clustering when zoomed out (< 13)
    const zoom = map.getZoom() || 13;
    const shouldCluster = zoom < 13 && validMarkers.length > 3;

    if (shouldCluster) {
      // Cluster nearby markers (within 0.025 lat/lng distance)
      const clusters: { centerLat: number; centerLng: number; items: MapJobMarker[] }[] = [];

      validMarkers.forEach((m) => {
        const found = clusters.find((c) => Math.hypot(c.centerLat - m.lat!, c.centerLng - m.lng!) < 0.035);
        if (found) {
          found.items.push(m);
        } else {
          clusters.push({ centerLat: m.lat!, centerLng: m.lng!, items: [m] });
        }
      });

      clusters.forEach((cl) => {
        if (cl.items.length === 1) {
          // Render single marker
          renderSingleMarker(cl.items[0], L, map);
        } else {
          // Render cluster marker
          const maxWage = Math.max(...cl.items.map((it) => (typeof it.wage === 'number' ? it.wage : parseInt(String(it.wage).replace(/\D/g, ''), 10) || 0)));
          const clusterHtml = `
            <div onclick="window.__gigeasy_zoom_cluster(${cl.centerLat}, ${cl.centerLng})" style="cursor:pointer; display:flex; align-items:center; gap:5px; background:#166534; color:#FFFFFF; padding:4px 9px; border-radius:14px; border:1.5px solid #14532D; box-shadow:0 2px 6px rgba(22,101,52,0.3); font-family:Inter,system-ui,sans-serif;">
              <span style="font-size:10px; font-weight:700;">${cl.items.length} gigs</span>
              <span style="font-size:9.5px; opacity:0.85;">· ₹${maxWage}</span>
            </div>
          `;
          const clusterIcon = L.divIcon({
            className: 'gigeasy-cluster-pin',
            html: clusterHtml,
            iconSize: [80, 26],
            iconAnchor: [40, 13],
          });
          const lm = L.marker([cl.centerLat, cl.centerLng], { icon: clusterIcon }).addTo(map);
          leafletMarkersRef.current.push(lm);
        }
      });
    } else {
      // Full 1-to-1 individual markers with collision avoidance offset
      const placedCoords: { lat: number; lng: number }[] = [];

      validMarkers.forEach((marker, idx) => {
        let lat = marker.lat!;
        let lng = marker.lng!;

        // Subtle collision avoidance for near-identical coords
        for (let i = 0; i < placedCoords.length; i++) {
          const prev = placedCoords[i];
          const dist = Math.hypot(lat - prev.lat, lng - prev.lng);
          if (dist < 0.006) {
            const angle = (idx * 1.35) % (2 * Math.PI);
            lat += Math.cos(angle) * 0.007;
            lng += Math.sin(angle) * 0.007;
          }
        }
        placedCoords.push({ lat, lng });

        renderSingleMarker({ ...marker, lat, lng }, L, map);
      });
    }

    function renderSingleMarker(marker: MapJobMarker, LObj: any, mapObj: any) {
      const isSelected = marker.id === selectedMarkerId || marker.gigId === selectedMarkerId;
      const displayWage =
        marker.displayWage ||
        (typeof marker.wage === 'number' ? `₹${marker.wage.toLocaleString('en-IN')}` : String(marker.wage));

      const priority = marker.priority || 'standard';
      const isBest = priority === 'best';
      const isGood = priority === 'good';

      // Colors based on priority tier
      const bg = isBest ? '#166534' : isSelected ? '#FFFFFF' : '#FFFFFF';
      const borderColor = isSelected ? '#D4561A' : isBest ? '#14532D' : isGood ? '#D4561A' : '#CBD5E1';
      const textColor = isBest ? '#FFFFFF' : isSelected ? '#D4561A' : isGood ? '#D4561A' : '#1A1A1A';
      const iconColor = isBest ? '#FFFFFF' : isGood ? '#D4561A' : '#64748B';
      const iconBg = isBest ? 'rgba(255,255,255,0.2)' : isGood ? '#FED7AA' : '#F1F5F9';
      const anchorColor = isSelected ? '#D4561A' : isBest ? '#166534' : isGood ? '#D4561A' : '#1A1A1A';

      const scale = isSelected ? '1.12' : '1.0';
      const zIndex = isSelected ? '9999' : isBest ? '900' : isGood ? '800' : '700';
      const shadow = isSelected
        ? '0 4px 12px rgba(212,86,26,0.35)'
        : isBest
        ? '0 3px 8px rgba(22,101,52,0.3)'
        : '0 2px 5px rgba(0,0,0,0.12)';

      const svgIcon = getCategorySvg(marker.category || 'Gig', iconColor);

      const markerHtml = `
        <div onclick="window.__gigeasy_select_marker('${marker.id}')" style="cursor:pointer; position:relative; display:flex; flex-direction:column; align-items:center; transform:scale(${scale}); transition:transform 0.15s ease; z-index:${zIndex};">
          <div style="display:flex; align-items:center; gap:4px; background:${bg}; border:1.4px solid ${borderColor}; border-radius:14px; padding:3px 7px 3px 4px; box-shadow:${shadow}; font-family:Inter,system-ui,sans-serif;">
            <div style="width:16px; height:16px; border-radius:8px; background:${iconBg}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${svgIcon}
            </div>
            <span style="font-size:11px; font-weight:700; color:${textColor}; letter-spacing:-0.2px; white-space:nowrap;">
              ${displayWage}
            </span>
          </div>
          <div style="width:6px; height:6px; border-radius:3px; background:${anchorColor}; margin-top:-2px; border:1px solid #FFFFFF;"></div>
        </div>
      `;

      const customIcon = LObj.divIcon({
        className: `gigeasy-marker-${marker.id}`,
        html: markerHtml,
        iconSize: [80, 30],
        iconAnchor: [40, 28],
      });

      const lm = LObj.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(mapObj);
      leafletMarkersRef.current.push(lm);
    }
  }, [isLeafletReady, markers, selectedMarkerId, currentZoom]);

  // ── Smooth Center Map on Selected Marker ──
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMarkerId) return;
    const sm = markers.find((m) => m.id === selectedMarkerId || m.gigId === selectedMarkerId);
    if (sm && typeof sm.lat === 'number' && typeof sm.lng === 'number') {
      mapInstanceRef.current.flyTo([sm.lat, sm.lng], Math.max(mapInstanceRef.current.getZoom(), 14), {
        duration: 0.6,
      });
    }
  }, [selectedMarkerId, markers]);

  // ── Zoom In / Zoom Out Controls ──
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // ── Recenter on User Location ──
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 14, { duration: 0.8 });
    }
  };

  const handleOpenGoogleMaps = () => {
    googleMapsService.openLocation(centerLat, centerLng, `Gigs near ${locationCity}`);
  };

  return (
    <View style={[styles.mapContainer, style]}>
      {/* ── Interactive Map Canvas Container ── */}
      <View style={[styles.mapCanvas, { height }]}>
        {/* Leaflet Web Map Container */}
        {Platform.OS === 'web' ? (
          <div
            id={mapContainerId}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#F5F5F0',
            }}
          />
        ) : (
          /* Native Vector Fallback */
          <View style={styles.nativeFallback}>
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.arterialRoadH} />
            <View style={styles.arterialRoadV} />
            <View style={styles.userMarkerContainer} pointerEvents="none">
              <View style={styles.userDot} />
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>{effectiveUserLabel}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Floating Map Controls: Zoom (+ / -) & Recenter ── */}
        <View style={styles.floatingControlsTop}>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={handleZoomIn}
            activeOpacity={0.8}
            accessibilityLabel="Zoom In"
          >
            <Feather name="plus" size={14} color={Theme.ink} />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity
            style={styles.controlPill}
            onPress={handleZoomOut}
            activeOpacity={0.8}
            accessibilityLabel="Zoom Out"
          >
            <Feather name="minus" size={14} color={Theme.ink} />
          </TouchableOpacity>
        </View>

        {/* Recenter Button (Bottom Right above watermark) */}
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={handleRecenter}
          activeOpacity={0.85}
          accessibilityLabel="Recenter Map"
        >
          <Feather name="crosshair" size={15} color={Theme.forestGreen} />
        </TouchableOpacity>

        {/* Google Maps External Link Watermark */}
        <TouchableOpacity
          style={styles.googleWatermark}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.85}
        >
          <Feather name="navigation" size={9.5} color={Theme.primary} />
          <Text style={styles.googleMapsText}>Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* ── Connected Gig Preview Card Dock ── */}
      {showPreview && selectedMarker && (
        <View style={styles.previewDock}>
          <TouchableOpacity
            style={styles.previewInner}
            onPress={() => {
              if (onOpenGig) {
                onOpenGig(selectedMarker.id);
              } else if (onSelectMarker) {
                onSelectMarker(selectedMarker.id, true);
              }
            }}
            activeOpacity={0.88}
          >
            {/* Category Icon Tile */}
            {selectedCatVisual && (
              <View style={[styles.previewIconTile, { backgroundColor: selectedCatVisual.bg }]}>
                <Feather
                  name={selectedCatVisual.iconName}
                  size={19}
                  color={selectedCatVisual.color}
                />
              </View>
            )}

            {/* Info Column */}
            <View style={styles.previewInfoCol}>
              <View style={styles.previewTitleRow}>
                <Text style={styles.previewTitleText} numberOfLines={1}>
                  {selectedMarker.title || 'Selected Gig'}
                </Text>
                <Text style={styles.previewWageBadge}>
                  {selectedMarker.displayWage || `₹${selectedMarker.wage}`}
                  <Text style={styles.previewWageUnit}>{t('perDay')}</Text>
                </Text>
              </View>

              <View style={styles.previewMetaRow}>
                <Feather name="clock" size={11} color={Theme.textSecondary} />
                <Text style={styles.previewMetaText}>
                  {selectedMarker.job?.startTime || 'Today · 9:00 AM'}
                </Text>
                <View style={styles.previewMetaDot} />
                <Feather name="map-pin" size={11} color={Theme.textSecondary} />
                <Text style={styles.previewMetaText}>
                  {selectedMarker.distanceKm
                    ? `${selectedMarker.distanceKm.toFixed(1)} km`
                    : selectedMarker.job?.location?.city || locationCity}
                </Text>
              </View>
            </View>

            {/* Action CTA Pill */}
            <View style={styles.previewActionBtn}>
              <Text style={styles.previewActionBtnText}>{language === 'hi' ? 'काम देखें' : 'View Gig'}</Text>
              <Feather name="arrow-right" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Dismiss button */}
          {onClosePreview && (
            <TouchableOpacity
              style={styles.previewCloseBtn}
              onPress={onClosePreview}
              activeOpacity={0.7}
              accessibilityLabel="Deselect gig"
            >
              <Feather name="x" size={13} color={Theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Status Strip ── */}
      <View style={styles.statusStrip}>
        <View style={styles.stripLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stripLiveText}>
            {language === 'hi'
              ? `${markers.length} काम ${locationCity} के नज़दीक`
              : `${markers.length} ${markers.length === 1 ? 'gig' : 'gigs'} near ${locationCity}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.openMapsPill}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Text style={styles.stripRadiusText}>
            {language === 'hi'
              ? `दायरा: ${radiusKm} किमी · रीसेंटर ⟳`
              : `Radius: ${radiusKm} km · Recenter ⟳`}
          </Text>
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
    borderColor: Theme.border,
    backgroundColor: '#F5F5F0',
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mapCanvas: {
    position: 'relative',
    backgroundColor: '#F5F5F0',
    overflow: 'hidden',
  },
  nativeFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F0',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    height: 1,
    backgroundColor: Theme.border,
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '72%',
    height: 1,
    backgroundColor: Theme.border,
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
    borderColor: Theme.border,
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
    borderColor: Theme.border,
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
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: Theme.forestGreen,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  userBadge: {
    backgroundColor: Theme.forestGreen,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    marginTop: 2,
  },
  userBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // ── Floating Zoom Controls (+ / -) ──
  floatingControlsTop: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 900,
    overflow: 'hidden',
  },
  controlPill: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: Theme.border,
    width: '100%',
  },

  // ── Floating Recenter Button ──
  recenterBtn: {
    position: 'absolute',
    bottom: 12,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 900,
  },

  googleWatermark: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.border,
    zIndex: 900,
  },
  googleMapsText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.primary,
  },

  // ── Connected Gig Preview Dock ──
  previewDock: {
    backgroundColor: Theme.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  previewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIconTile: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewInfoCol: {
    flex: 1,
    gap: 3,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  previewTitleText: {
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    color: Theme.ink,
    flex: 1,
    marginRight: 6,
  },
  previewWageBadge: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.accent,
  },
  previewWageUnit: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  previewMetaDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: Theme.sandDark,
    marginHorizontal: 2,
  },
  previewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.accent,
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 8,
  },
  previewActionBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 6,
  },

  // ── Status Strip ──
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
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
    backgroundColor: Theme.forestGreen,
  },
  stripLiveText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.ink,
  },
  openMapsPill: {
    paddingVertical: 2,
  },
  stripRadiusText: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: Theme.accent,
  },
});
