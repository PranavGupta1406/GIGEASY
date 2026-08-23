// Google Maps Configuration for GigEasy

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAua-NV6JOylMlEmhIiHw1ncKi4gBKWGF0';

export const DEFAULT_MAP_COORDINATES = {
  // Delhi NCR / Noida default center
  lat: 28.5355,
  lng: 77.3910,
  city: 'Noida',
  state: 'UP',
};

export const MAP_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SATELLITE: 'satellite',
} as const;
