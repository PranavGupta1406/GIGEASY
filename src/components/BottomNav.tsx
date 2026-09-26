// GigEasy BottomNav — Warm Premium Navigation
// Cream background · Terracotta active indicator · Warm brown inactive icons

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
import { FontFamily } from '../constants';
import { useLanguageStore } from '../store';
import { Theme } from '../theme';

type Mode = 'worker' | 'employer';

interface NavTab {
  key: string;
  labelEn: string;
  labelHi: string;
  icon: keyof typeof Feather.glyphMap;
}

const WORKER_TABS: NavTab[] = [
  { key: 'FindWork', labelEn: 'Find Work', labelHi: 'काम खोजें', icon: 'search' },
  { key: 'MyWork',   labelEn: 'My Work',   labelHi: 'मेरा काम',   icon: 'briefcase' },
  { key: 'WorkerId', labelEn: 'Worker ID', labelHi: 'Worker ID',  icon: 'user-check' },
  { key: 'More',     labelEn: 'More',      labelHi: 'अधिक',       icon: 'grid' },
];

const EMPLOYER_TABS: NavTab[] = [
  { key: 'Dashboard', labelEn: 'Home',    labelHi: 'होम',        icon: 'home' },
  { key: 'Jobs',      labelEn: 'My Jobs', labelHi: 'नौकरियां',   icon: 'briefcase' },
  { key: 'Workers',  labelEn: 'Workers',  labelHi: 'कामगार',     icon: 'users' },
  { key: 'Profile',  labelEn: 'Profile',  labelHi: 'प्रोफ़ाइल',  icon: 'user' },
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
  const { language } = useLanguageStore();

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.9, tension: 450, friction: 14, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,   tension: 280, friction: 14, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const label = language === 'hi' ? tab.labelHi : tab.labelEn;

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Animated.View style={[styles.navItemInner, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconBox, focused ? styles.iconBoxActive : styles.iconBoxInactive]}>
          <Feather
            name={tab.icon}
            size={focused ? 19 : 20}
            color={focused ? Theme.accent : Theme.tabInactive}
            strokeWidth={focused ? 2.2 : 1.7}
          />
        </View>
        <Text style={[styles.navLabel, focused && styles.navLabelActive]} numberOfLines={1}>
          {label}
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
        { paddingBottom: Math.max(insets.bottom, 8) },
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
    backgroundColor: Theme.tabBackground,
    borderTopWidth: 1,
    borderTopColor: Theme.tabBorder,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBox: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconBoxActive: {
    backgroundColor: Theme.accentLight,
  },
  iconBoxInactive: {
    backgroundColor: 'transparent',
  },
  navLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.tabInactive,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: Theme.tabActive,
    fontFamily: FontFamily.bold,
    fontSize: 10,
  },
});
