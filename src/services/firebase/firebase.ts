// Firebase Initialization for GigEasy
// Configured for Web, iOS, and Android with platform-aware auth persistence

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAjN9HD829PobKsuIF3gvylt9p_DvWTSJc",
  authDomain: "gigeasy-13c38.firebaseapp.com",
  projectId: "gigeasy-13c38",
  storageBucket: "gigeasy-13c38.firebasestorage.app",
  messagingSenderId: "985347418410",
  appId: "1:985347418410:web:cd43d7f90fc179f3f8d653",
  measurementId: "G-W0QQ6E51K5"
};

// Initialize or retrieve existing Firebase App singleton
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with platform-safe persistence
let authInstance: Auth;

try {
  if (Platform.OS === 'web') {
    authInstance = getAuth(app);
  } else {
    try {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      authInstance = getAuth(app);
    }
  }
} catch {
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;

// Firestore Database Instance
export const db: Firestore = getFirestore(app);

// Analytics is safe only on Web client
export let analytics: any = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    })
    .catch(() => {});
}
