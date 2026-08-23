// GigEasy ModeSwitcher — "Find Work" | "Hire Workers"
// Smooth spring-animated sliding pill · Brand #6497B2 · Equal visual weight

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { FontFamily, FontSize } from '../constants';

import { Theme } from '../theme';

type Mode = 'worker' | 'employer';

interface ModeSwitcherProps {
  activeMode: Mode;
  onSwitch: (mode: Mode) => void;
}

const T = {
  primary: Theme.primary,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  muted: Theme.textSecondary,
  bg: Theme.surfaceSubtle,
  border: Theme.border,
  white: Theme.surface,
};

export function ModeSwitcher({ activeMode, onSwitch }: ModeSwitcherProps) {
  const isWorker = activeMode === 'worker';
  const slideAnim = useRef(new Animated.Value(isWorker ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isWorker ? 0 : 1,
      useNativeDriver: false,
      tension: 260,
      friction: 22,
    }).start();
  }, [activeMode]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {/* Animated sliding pill */}
        <Animated.View
          style={[
            styles.pill,
            {
              left: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['1.5%', '50%'],
              }),
            },
          ]}
        />

        <TouchableOpacity style={styles.tab} onPress={() => onSwitch('worker')} activeOpacity={0.8}>
          <Text style={[styles.tabText, isWorker && styles.tabTextActive]}>Find Work</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => onSwitch('employer')} activeOpacity={0.8}>
          <Text style={[styles.tabText, !isWorker && styles.tabTextActive]}>Hire Workers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bg,
    borderRadius: 22,
    padding: 3,
    position: 'relative',
    width: 220,
    height: 38,
    borderWidth: 1,
    borderColor: T.border,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '48%',
    backgroundColor: T.primary,
    borderRadius: 18,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    height: '100%',
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.1,
  },
  tabTextActive: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },
});
