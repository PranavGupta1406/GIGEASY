// GigEasy BottomNav — Floating elevated navigation bar
// Worker: Home · Discover · Activity · Profile
// Employer: Home · Jobs · Workers · Profile

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Colors } from '../constants';

type Mode = 'worker' | 'employer';

interface NavTab {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const WORKER_TABS: NavTab[] = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Jobs', label: 'Discover', icon: 'compass' },
  { key: 'Activity', label: 'Activity', icon: 'clock' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

const EMPLOYER_TABS: NavTab[] = [
  { key: 'Dashboard', label: 'Home', icon: 'home' },
  { key: 'Jobs', label: 'Jobs', icon: 'briefcase' },
  { key: 'Workers', label: 'Workers', icon: 'users' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

interface BottomNavProps {
  mode: Mode;
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

function NavItem({
  tab,
  focused,
  onPress,
}: {
  tab: NavTab;
  focused: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 16,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.navItemInner, { transform: [{ scale: scaleAnim }] }]}>
        {focused && <View style={styles.activeDot} />}
        <Feather
          name={tab.icon}
          size={20}
          color={focused ? '#0D3B3F' : '#8E99A8'}
          strokeWidth={focused ? 2.4 : 1.6}
        />
        <Text style={[styles.navLabel, focused && styles.navLabelActive]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function BottomNav({ mode, activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const tabs = mode === 'worker' ? WORKER_TABS : EMPLOYER_TABS;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => (
        <NavItem
          key={tab.key}
          tab={tab}
          focused={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#090D14',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
      web: {
        boxShadow: '0 -4px 16px rgba(9, 13, 20, 0.04)',
      } as any,
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 3,
    backgroundColor: '#0D3B3F',
    borderRadius: 2,
  },
  navLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#8E99A8',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: '#0D3B3F',
    fontFamily: FontFamily.bold,
  },
});
