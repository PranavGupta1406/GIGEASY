// Firebase Configuration & Initialization for GigEasy
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "gigeasy-13c38.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "gigeasy-13c38",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "gigeasy-13c38.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "985347418410",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:985347418410:web:cd43d7f90fc179f3f8d653",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-W0QQ6E51K5"
};

// Initialize Firebase App Singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore Singletons
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Safe Analytics Initialization
export let analytics: any = null;
if (Platform.OS === 'web') {
  isSupported()
    .then((supported: boolean) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}
