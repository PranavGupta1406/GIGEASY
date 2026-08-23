// GigEasy Google Maps Service
// Provides Static Maps URLs, Geocoding, Directions deep-links, and Places helpers

import { Linking, Platform } from 'react-native';
import { GOOGLE_MAPS_API_KEY, DEFAULT_MAP_COORDINATES } from '../../config/maps';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarkerOptions {
  lat: number;
  lng: number;
  label?: string;
  color?: string; // e.g. '0x0D3B3F', '0xC8F135', 'red'
  size?: 'tiny' | 'mid' | 'small';
}

export interface StaticMapOptions {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  width?: number;
  height?: number;
  scale?: 1 | 2;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  theme?: 'dark' | 'light' | 'silver' | 'retro';
  markers?: MapMarkerOptions[];
}

export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  postalCode?: string;
}

export class GoogleMapsService {
  private apiKey: string = GOOGLE_MAPS_API_KEY;

  /**
   * Generates a high-resolution Google Static Maps API image URL
   */
  getStaticMapUrl(options: StaticMapOptions = {}): string {
    const {
      centerLat = DEFAULT_MAP_COORDINATES.lat,
      centerLng = DEFAULT_MAP_COORDINATES.lng,
      zoom = 14,
      width = 600,
      height = 300,
      scale = 2,
      mapType = 'roadmap',
      theme = 'silver',
      markers = [],
    } = options;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params: string[] = [
      `center=${centerLat},${centerLng}`,
      `zoom=${zoom}`,
      `size=${Math.min(width, 640)}x${Math.min(height, 640)}`,
      `scale=${scale}`,
      `maptype=${mapType}`,
      `key=${this.apiKey}`,
    ];

    // Elegant cartographic styling for light/clean UI matching GigEasy brand
    if (theme === 'silver' || theme === 'light') {
      const styles = [
        'feature:all|element:geometry|color:0xf5f3ee',
        'feature:all|element:labels.text.fill|color:0x525b68',
        'feature:all|element:labels.text.stroke|color:0xffffff',
        'feature:administrative|element:geometry.stroke|color:0xd5d1c8',
        'feature:landscape|element:geometry|color:0xf0eee7',
        'feature:poi|element:geometry|color:0xe8e6de',
        'feature:poi.park|element:geometry|color:0xdbe6d8',
        'feature:road|element:geometry|color:0xffffff',
        'feature:road.arterial|element:geometry|color:0xfaf9f5',
        'feature:road.highway|element:geometry|color:0xebe6db',
        'feature:transit|element:geometry|color:0xe3e1d9',
        'feature:water|element:geometry|color:0xcbe0e5',
      ];
      styles.forEach((s) => params.push(`style=${encodeURIComponent(s)}`));
    } else if (theme === 'dark') {
      const styles = [
        'feature:all|element:geometry|color:0x121722',
        'feature:all|element:labels.text.fill|color:0x8e99a8',
        'feature:all|element:labels.text.stroke|color:0x090d14',
        'feature:road|element:geometry|color:0x1e2638',
        'feature:road.highway|element:geometry|color:0x28324a',
        'feature:water|element:geometry|color:0x0d1f2d',
      ];
      styles.forEach((s) => params.push(`style=${encodeURIComponent(s)}`));
    }

    // Add markers
    if (markers.length > 0) {
      markers.forEach((m) => {
        const markerColor = m.color || '0x0D3B3F';
        const markerParams = [`color:${markerColor}`];
        if (m.size) markerParams.push(`size:${m.size}`);
        if (m.label) markerParams.push(`label:${m.label}`);
        markerParams.push(`${m.lat},${m.lng}`);
        params.push(`markers=${encodeURIComponent(markerParams.join('|'))}`);
      });
    } else {
      // Default center marker
      params.push(`markers=${encodeURIComponent(`color:0x0D3B3F|${centerLat},${centerLng}`)}`);
    }

    return `${baseUrl}?${params.join('&')}`;
  }

  /**
   * Opens Google Maps for navigation / directions in the native Google Maps app or browser
   */
  async openDirections(params: {
    destLat: number;
    destLng: number;
    destLabel?: string;
    originLat?: number;
    originLng?: number;
  }): Promise<boolean> {
    const { destLat, destLng, destLabel = 'Job Location', originLat, originLng } = params;

    let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    if (originLat && originLng) {
      url += `&origin=${originLat},${originLng}`;
    }

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return true;
      }
    }

    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      const fallbackUrl = `https://maps.google.com/?q=${destLat},${destLng}(${encodeURIComponent(destLabel)})`;
      await Linking.openURL(fallbackUrl);
      return true;
    }
  }

  /**
   * Opens Google Maps centered on specific coordinates
   */
  async openLocation(lat: number, lng: number, label?: string): Promise<boolean> {
    const query = label ? `${lat},${lng}(${encodeURIComponent(label)})` : `${lat},${lng}`;
    const url = Platform.select({
      ios: `maps://?q=${query}`,
      android: `geo:${lat},${lng}?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        return true;
      }
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // Fallback to web link
    }

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    await Linking.openURL(webUrl);
    return true;
  }

  /**
   * Geocodes an address string using Google Maps Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        let city = '';
        let state = '';
        let postalCode = '';

        for (const comp of result.address_components) {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
          if (comp.types.includes('postal_code')) postalCode = comp.long_name;
        }

        return {
          formattedAddress: result.formatted_address,
          lat: location.lat,
          lng: location.lng,
          city,
          state,
          postalCode,
        };
      }
      return null;
    } catch (err) {
      console.warn('Geocoding error:', err);
      return null;
    }
  }

  /**
   * Reverse geocodes coordinates to a human-readable address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const result = data.results[0];
        let city = '';
        let state = '';
        let postalCode = '';

        for (const comp of result.address_components) {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
          if (comp.types.includes('postal_code')) postalCode = comp.long_name;
        }

        return {
          formattedAddress: result.formatted_address,
          lat,
          lng,
          city,
          state,
          postalCode,
        };
      }
      return null;
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      return null;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
