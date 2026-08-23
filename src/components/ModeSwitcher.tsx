// GigEasy ModeSwitcher — Clean Neutral Segmented Control
// Restrained dark pill (#0F172A) for active selection, neutral background for inactive

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { FontFamily } from '../constants';
import { Theme } from '../theme';

type Mode = 'worker' | 'employer';

interface ModeSwitcherProps {
  activeMode: Mode;
  onSwitch: (mode: Mode) => void;
}

export function ModeSwitcher({ activeMode, onSwitch }: ModeSwitcherProps) {
  const isWorker = activeMode === 'worker';
  const slideAnim = useRef(new Animated.Value(isWorker ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isWorker ? 0 : 1,
      useNativeDriver: false,
      tension: 320,
      friction: 28,
    }).start();
  }, [activeMode]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {/* Animated sliding dark pill */}
        <Animated.View
          style={[
            styles.pill,
            {
              left: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['2%', '50%'],
              }),
            },
          ]}
        />

        <TouchableOpacity
          style={styles.tab}
          onPress={() => onSwitch('worker')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, isWorker && styles.tabTextActive]}>
            Find Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => onSwitch('employer')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, !isWorker && styles.tabTextActive]}>
            Hire Workers
          </Text>
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
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 20,
    padding: 3,
    position: 'relative',
    width: 216,
    height: 36,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '48%',
    backgroundColor: Theme.darkPill,
    borderRadius: 16,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
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
    color: Theme.textSecondary,
    letterSpacing: 0.1,
  },
  tabTextActive: {
    color: Theme.surface,
    fontFamily: FontFamily.bold,
  },
});
