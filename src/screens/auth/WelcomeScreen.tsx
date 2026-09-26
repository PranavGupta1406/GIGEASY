/**
 * WelcomeScreen — GigEasy Unified Consumer Launch Experience
 *
 * Balanced, centered global-consumer composition:
 *   - Balanced GigEasy wordmark + natural tagline
 *   - Clean top-right language switcher [ EN | हिंदी ]
 *   - Living Network Canvas (Worker ↔ Job ↔ Employer)
 *   - Dual equal-weight CTAs in the SAME brand language:
 *     [ FIND WORK NEAR ME / आस-पास काम खोजें ]
 *     [ HIRE WORKERS NEAR ME / कर्मचारी खोजें ]
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { HeroCanvas, HeroPhase } from '../../components/hero/HeroCanvas';
import { useAuthStore, useLanguageStore } from '../../store';
import { Theme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [phase, setPhase] = useState<HeroPhase>('SPAWN');
  const [activeTransition, setActiveTransition] = useState<'worker' | 'employer' | null>(null);
  const switchRole = useAuthStore((s) => s.switchRole);
  const { language, toggleLanguage, t } = useLanguageStore();

  const brandOpacity    = useRef(new Animated.Value(0)).current;
  const brandScale      = useRef(new Animated.Value(0.94)).current;
  const brandTranslateY = useRef(new Animated.Value(24)).current;
  const taglineOpacity  = useRef(new Animated.Value(0)).current;
  const ctaOpacity      = useRef(new Animated.Value(0)).current;
  const ctaTranslateY   = useRef(new Animated.Value(20)).current;
  const fadeOutAnim     = useRef(new Animated.Value(0)).current;

  const handlePhaseChange = useCallback((p: HeroPhase) => {
    setPhase(p);

    if (p === 'EMERGE') {
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(brandScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      ]).start();
    }

    if (p === 'LIFT') {
      Animated.parallel([
        Animated.spring(brandTranslateY, { toValue: 0, tension: 40, friction: 9, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 320, delay: 50, useNativeDriver: true }),
      ]).start();
    }

    if (p === 'INTERACTIVE') {
      brandOpacity.setValue(1);
      brandTranslateY.setValue(0);
      taglineOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(ctaTranslateY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  // Direct Role Selection -> Proceed straight to Phone verification
  const handleSelectMode = (mode: 'worker' | 'employer') => {
    setActiveTransition(mode);
    switchRole(mode);
    Animated.timing(fadeOutAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => {
      navigation.navigate('Phone');
    });
  };

  const isTitleVisible = ['EMERGE', 'LIFT', 'INTERACTIVE'].includes(phase) || Platform.OS !== 'web';
  const isActionsVisible = phase === 'INTERACTIVE' || Platform.OS !== 'web';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Living Network Canvas */}
      <HeroCanvas onPhaseChange={handlePhaseChange} activeModeTransition={activeTransition} />

      {/* Top Header Row with Centered Brand & Language Switch */}
      <SafeAreaView style={styles.topContainer}>
        {/* Language switch button in top-right */}
        <View style={styles.langRow}>
          <TouchableOpacity
            style={styles.langPill}
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Feather name="globe" size={13} color={Theme.primary} />
            <Text style={styles.langText}>
              {language === 'en' ? 'हिंदी' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Centered, balanced GigEasy Brand & Tagline */}
        {isTitleVisible && (
          <Animated.View
            style={[
              styles.centeredBrandBlock,
              {
                opacity: brandOpacity,
                transform: [{ translateY: brandTranslateY }, { scale: brandScale }],
              },
            ]}
          >
            <Text style={styles.brandName}>GigEasy</Text>
            <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
              {t('brandTagline')}
            </Animated.Text>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* Bottom Sheet: Role Selection CTAs — Unified Premium Brand Language */}
      {isActionsVisible && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslateY }],
            },
          ]}
        >
          <Text style={styles.questionPrompt}>{t('needWorkQuestion')}</Text>

          {/* Option 1: Find Work (Primary Solid Cobalt) */}
          <TouchableOpacity
            style={styles.roleCTAPrimary}
            onPress={() => handleSelectMode('worker')}
            activeOpacity={0.88}
          >
            <View style={styles.roleCTAInner}>
              <View style={styles.iconCirclePrimary}>
                <Feather name="briefcase" size={18} color={Theme.surface} />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitlePrimary}>{t('findWork')}</Text>
                <Text style={styles.roleSubPrimary}>{t('findWorkSub')}</Text>
              </View>
            </View>
            <View style={styles.arrowCirclePrimary}>
              <Feather name="arrow-right" size={16} color={Theme.surface} />
            </View>
          </TouchableOpacity>

          {/* Option 2: Hire Workers (Secondary Surface with Crisp Navy Border) */}
          <TouchableOpacity
            style={styles.roleCTASecondary}
            onPress={() => handleSelectMode('employer')}
            activeOpacity={0.88}
          >
            <View style={styles.roleCTAInner}>
              <View style={styles.iconCircleSecondary}>
                <Feather name="users" size={18} color={Theme.ink} />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitleSecondary}>{t('hireWorkers')}</Text>
                <Text style={styles.roleSubSecondary}>{t('hireWorkersSub')}</Text>
              </View>
            </View>
            <View style={styles.arrowCircleSecondary}>
              <Feather name="arrow-right" size={16} color={Theme.primaryDark} />
            </View>
          </TouchableOpacity>

          <Text style={styles.trustFooter}>{t('trustedTagline')}</Text>
        </Animated.View>
      )}

      {/* Exit fade overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.exitCover, { opacity: fadeOutAnim }]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.bg,
  },

  // Top Area
  topContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 8,
    left: 0,
    right: 0,
    zIndex: 25,
    paddingHorizontal: 20,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 4,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  langText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.primary,
  },

  // Centered Brand Title & Tagline Block
  centeredBrandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingVertical: 4,
  },
  brandName: {
    fontFamily: FontFamily.extraBold,
    fontSize: 34,
    color: Theme.ink,
    letterSpacing: -1.2,
    lineHeight: 38,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.textSecondary,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  // Bottom CTAs Sheet — Clean White-First Surface with Crisp Taupe Border
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    zIndex: 20,
    gap: 10,
  },
  questionPrompt: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Role CTA 1: Find Work (Primary Burnt Orange / Terracotta)
  roleCTAPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCirclePrimary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitlePrimary: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.textOnAccent,
    letterSpacing: -0.3,
  },
  roleSubPrimary: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 1,
  },
  arrowCirclePrimary: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Role CTA 2: Hire Workers (Tactile White Surface with 1px Taupe Border)
  roleCTASecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircleSecondary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitleSecondary: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    letterSpacing: -0.3,
  },
  roleSubSecondary: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  arrowCircleSecondary: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Theme.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shared Inner Row
  roleCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  roleTextCol: {
    flex: 1,
  },

  trustFooter: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  exitCover: {
    backgroundColor: Theme.bg,
  },
});
