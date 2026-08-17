// GigEasy Main App Entry Point
// Deep Ink Slate frame + Warm Ivory viewport

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
    backgroundColor: '#F8F7F4',
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
    backgroundColor: '#F8F7F4',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
});
