// Role Selection Screen — "How will you use GigEasy?"
// Comes BEFORE phone verification.
// Two equal, simple cards. Large icon + title + one short line.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, Spacing } from '../../constants';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Role'>;

const B = {
  bg: '#F8FAFC',
  navy: '#1A68D5',
  navyLight: '#EBF3FC',
  ink: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  surface: '#FFFFFF',
};

export const RoleScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<'worker' | 'employer' | null>(null);
  const switchRole = useAuthStore((s) => s.switchRole);

  // Subtle scale animations on press
  const workerScale = useRef(new Animated.Value(1)).current;
  const employerScale = useRef(new Animated.Value(1)).current;

  const pressCard = (role: 'worker' | 'employer') => {
    const anim = role === 'worker' ? workerScale : employerScale;
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }),
    ]).start();
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    switchRole(selectedRole);
    navigation.navigate('Phone');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={B.bg} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How will you use{'\n'}GigEasy?</Text>
          <Text style={styles.subtitle}>Choose your role to get started.</Text>
        </View>

        {/* Two equal role cards */}
        <View style={styles.cardsRow}>
          {/* Find Work */}
          <Animated.View style={[styles.cardWrap, { transform: [{ scale: workerScale }] }]}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'worker' && styles.roleCardActive,
              ]}
              onPress={() => pressCard('worker')}
              activeOpacity={1}
            >
              {/* Selection indicator */}
              {selectedRole === 'worker' && <View style={styles.selectedBar} />}

              <View style={[
                styles.iconCircle,
                selectedRole === 'worker' && styles.iconCircleActive,
              ]}>
                <Feather
                  name="briefcase"
                  size={28}
                  color={selectedRole === 'worker' ? B.white : B.navy}
                />
              </View>

              <Text style={[
                styles.roleTitle,
                selectedRole === 'worker' && styles.roleTitleActive,
              ]}>Find Work</Text>
              <Text style={styles.roleDesc}>Jobs near you</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Hire Workers */}
          <Animated.View style={[styles.cardWrap, { transform: [{ scale: employerScale }] }]}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'employer' && styles.roleCardActive,
              ]}
              onPress={() => pressCard('employer')}
              activeOpacity={1}
            >
              {selectedRole === 'employer' && <View style={styles.selectedBar} />}

              <View style={[
                styles.iconCircle,
                selectedRole === 'employer' && styles.iconCircleActive,
              ]}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={28}
                  color={selectedRole === 'employer' ? B.white : B.navy}
                />
              </View>

              <Text style={[
                styles.roleTitle,
                selectedRole === 'employer' && styles.roleTitleActive,
              ]}>Hire Workers</Text>
              <Text style={styles.roleDesc}>Find workers nearby</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Continue CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !selectedRole && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
            activeOpacity={0.88}
          >
            <Text style={[
              styles.continueBtnText,
              !selectedRole && styles.continueBtnTextDisabled,
            ]}>
              Continue
            </Text>
            <Feather
              name="arrow-right"
              size={17}
              color={selectedRole ? B.white : '#8A99AB'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: B.ink,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: B.textMuted,
    lineHeight: 22,
  },

  // Cards
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    maxHeight: 260,
  },
  cardWrap: {
    flex: 1,
  },
  roleCard: {
    flex: 1,
    backgroundColor: B.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: B.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#0D1421',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: B.navy,
    borderWidth: 2,
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: B.navy,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: B.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleActive: {
    backgroundColor: B.navy,
  },
  roleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: B.ink,
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  roleTitleActive: {
    color: B.navy,
  },
  roleDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: B.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // CTA
  ctaSection: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: B.navy,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 24,
  },
  continueBtnDisabled: {
    backgroundColor: '#E4E8F0',
  },
  continueBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: B.white,
    letterSpacing: -0.3,
  },
  continueBtnTextDisabled: {
    color: '#8A99AB',
  },
});
