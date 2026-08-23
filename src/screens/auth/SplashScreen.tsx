// Splash Screen — Minimal, executive, consumer-tech brand reveal
// Deep Teal + Electric Lime + Ink Identity

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation, opacityAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <Text style={styles.brandName}>
          GigEasy<Text style={styles.brandDot}>.</Text>
        </Text>
        <Text style={styles.tagline}>Work is around you</Text>
      </Animated.View>

      <View style={styles.footerWrap}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.footerText}>Verified Gig Marketplace</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D14', // Ink Slate
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  brandName: {
    fontFamily: FontFamily.bold,
    fontSize: 46,
    color: '#FFFFFF',
    letterSpacing: -1.6,
    marginBottom: 6,
  },
  brandDot: {
    color: '#1A68D5',
    fontFamily: FontFamily.extraBold,
  },
  tagline: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#8E99A8',
    letterSpacing: 0.2,
  },
  footerWrap: {
    position: 'absolute',
    bottom: 52,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121822',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#293547',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A68D5',
    marginRight: 8,
  },
  footerText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#CBD5E1',
    letterSpacing: 0.3,
  },
});
