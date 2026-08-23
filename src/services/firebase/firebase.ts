// Firebase Configuration & Initialization for GigEasy
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAjN9HD829PobKsuIF3gvylt9p_DvWTSJc",
  authDomain: "gigeasy-13c38.firebaseapp.com",
  projectId: "gigeasy-13c38",
  storageBucket: "gigeasy-13c38.firebasestorage.app",
  messagingSenderId: "985347418410",
  appId: "1:985347418410:web:cd43d7f90fc179f3f8d653",
  measurementId: "G-W0QQ6E51K5"
};

// Initialize Firebase App Singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth Singleton
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Safe Analytics Initialization
export let analytics: any = null;
if (Platform.OS === 'web') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}
