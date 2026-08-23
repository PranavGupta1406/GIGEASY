// Google Maps JavaScript API Dynamic Loader & Geolocation Helper
import { Platform } from 'react-native';

// Configurable API key with multiple fallback environment variable names
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  '';

let googleMapsPromise: Promise<any> | null = null;

/**
 * Modern Clean Map Styling for GigEasy (Deep Ink Slate + Minimalist Urban Grid)
 */
export const GIGEASY_MAP_STYLE = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#F3F2EE' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#C0DFE2' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#EAE8E1' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#DFDBD2' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#E5E2DA' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#E4E0D6' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#DDE9D2' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#E8E5DD' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5A6578' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#717D91' }],
  },
];

/**
 * Dynamically loads the Google Maps JavaScript API
 */
export function loadGoogleMapsScript(): Promise<any> {
  if (Platform.OS !== 'web') {
    return Promise.reject(new Error('Google Maps script loading only applicable on Web'));
  }

  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    try {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        if ((window as any).google?.maps) {
          return resolve((window as any).google.maps);
        }
        existingScript.addEventListener('load', () => resolve((window as any).google?.maps));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      const keyParam = GOOGLE_MAPS_API_KEY ? `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry${keyParam}`;

      script.onload = () => {
        if ((window as any).google?.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error('Google Maps API failed to load'));
        }
      };

      script.onerror = (err) => {
        googleMapsPromise = null;
        reject(err);
      };

      document.head.appendChild(script);
    } catch (err) {
      googleMapsPromise = null;
      reject(err);
    }
  });

  return googleMapsPromise;
}

/**
 * Get device GPS coordinates (with default fallback to Noida / NCR)
 */
export function getCurrentCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default: Noida Sector 62
          resolve({ lat: 28.6139, lng: 77.209 });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      resolve({ lat: 28.6139, lng: 77.209 });
    }
  });
}
