// GigEasy ModeSwitcher — Segmented Top Mode Switcher
// "Find Work" | "Hire Workers" — Deep Teal + Electric Lime accent

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { FontFamily, FontSize, Colors } from '../constants';

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
      tension: 280,
      friction: 24,
    }).start();
  }, [activeMode, isWorker, slideAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.segmentBackground}>
        {/* Sliding Active Pill */}
        <Animated.View
          style={[
            styles.activeSlider,
            {
              left: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['2%', '51%'],
              }),
            },
          ]}
        />

        {/* Tab 1: Find Work */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onSwitch('worker')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, isWorker && styles.tabTextActive]}>
            Find Work
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Hire Workers */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onSwitch('employer')}
          activeOpacity={0.8}
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
  segmentBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0EB',
    borderRadius: 20,
    padding: 3,
    position: 'relative',
    width: 210,
    height: 36,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  activeSlider: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '47%',
    backgroundColor: '#0D3B3F', // Deep Teal
    borderRadius: 16,
    shadowColor: '#090D14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
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
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: '#5A6578',
    letterSpacing: 0.1,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
});
