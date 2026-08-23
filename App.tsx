// GigEasy Main App Entry Point
// Mobile-first viewport lock, Inter typography, and safe layout boundaries

import React, { useEffect } from 'react';
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { RootNavigator } from './src/navigation/RootNavigator';

// Keep the splash screen visible while fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Mobile Web Viewport Lockdown & Anti-Zoom Configuration
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // 1. Enforce strict non-scalable mobile viewport
      let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover';

      // 2. Prevent gesture zooming & rubber-band overflow on document root
      document.documentElement.style.touchAction = 'pan-y';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'pan-y';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // 3. Disable double-tap to zoom
      const preventTouchZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };
      document.addEventListener('touchstart', preventTouchZoom, { passive: false });

      return () => {
        document.removeEventListener('touchstart', preventTouchZoom);
      };
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const isDesktopWeb = Platform.OS === 'web' && width > 600;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={isDesktopWeb ? styles.desktopWrapper : styles.fullContainer}>
          <View style={isDesktopWeb ? styles.phoneFrame : styles.fullContainer}>
            <RootNavigator />
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090D14',
  },
  fullContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  desktopWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D14',
    paddingVertical: 16,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    maxHeight: 900,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
});
