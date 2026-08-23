// Firebase Authentication Service for GigEasy
// Handles Worker and Employer Registration, Login, Session Management, and Role Sync

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRole, VerificationStatus } from '../../types';
import { syncUserToPostgres } from '../db/postgresClient';

export interface UserProfileData {
  uid: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  kycStatus: VerificationStatus;
  isOnboarded: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Helper to prevent hanging on Firestore network latency
function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000, fallbackVal: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackVal), timeoutMs)),
  ]);
}

/**
 * Register a new user with Email, Password, and Role (Worker or Employer)
 */
export async function signUpUser(
  email: string,
  pass: string,
  role: UserRole,
  fullName: string,
  phoneNumber?: string
): Promise<{ user: FirebaseUser; profile: UserProfileData }> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = cred.user;

  // Update auth display name
  if (fullName) {
    updateProfile(user, { displayName: fullName }).catch(() => {});
  }

  // Create initial user document in Firestore with KYC initial state
  const profile: UserProfileData = {
    uid: user.uid,
    email: user.email ?? email,
    name: fullName || (role === 'worker' ? 'Gig Worker' : 'Gig Employer'),
    phoneNumber: phoneNumber || '',
    role,
    kycStatus: 'unverified', // Ready for upcoming KYC verification step
    isOnboarded: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Sync to PostgreSQL database asynchronously
  syncUserToPostgres({
    id: user.uid,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    role: profile.role,
    name: profile.name,
    kycStatus: profile.kycStatus,
  }).catch(() => {});

  // Write to Firestore asynchronously with timeout to prevent blocking auth flow
  withTimeout(
    setDoc(doc(db, 'users', user.uid), {
      ...profile,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    }),
    3000,
    undefined
  ).catch((err) => {
    console.warn('Firestore user doc write fallback:', err);
  });

  return { user, profile };
}

/**
 * Sign in existing user and fetch role + KYC profile
 */
export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: UserProfileData }> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = cred.user;

  // Attempt to fetch profile with timeout
  let profile = await withTimeout(getUserProfile(user.uid), 2500, null);

  if (!profile) {
    // If Firestore document doesn't exist yet or timed out, construct baseline profile
    profile = {
      uid: user.uid,
      email: user.email ?? email,
      name: user.displayName || (email.includes('employer') ? 'Gig Employer' : 'Gig Worker'),
      role: email.includes('employer') ? 'employer' : 'worker',
      kycStatus: 'unverified',
      isOnboarded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Non-blocking fire-and-forget save
    withTimeout(setDoc(doc(db, 'users', user.uid), profile), 2000, undefined).catch(() => {});
  }

  // Ensure user is synced to PostgreSQL database
  syncUserToPostgres({
    id: user.uid,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    role: profile.role,
    name: profile.name,
    kycStatus: profile.kycStatus,
  }).catch(() => {});

  return { user, profile };
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
  }
  return null;
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfileData>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Error updating user profile in Firestore:', err);
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuth(
  callback: (user: FirebaseUser | null, profile: UserProfileData | null) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
}
