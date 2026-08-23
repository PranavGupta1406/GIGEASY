/**
 * WelcomeScreen — GigEasy Consumer Launch Experience
 *
 * Balanced, centered global-consumer composition:
 *   - Balanced GigEasy wordmark + natural tagline
 *   - Clean top-right language switcher [ EN | हिंदी ]
 *   - Living Network Canvas (Worker ↔ Job ↔ Employer)
 *   - Dual equal-weight CTAs:
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

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryDark: '#124FA8',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  white: '#FFFFFF',
  sheetBg: 'rgba(248, 250, 252, 0.98)',
};

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

  // Direct Role Selection -> Proceed straight to Firebase Auth
  const handleSelectMode = (mode: 'worker' | 'employer') => {
    setActiveTransition(mode);
    switchRole(mode);
    Animated.timing(fadeOutAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => {
      navigation.navigate('FirebaseAuth', { role: mode, mode: 'signin' });
    });
  };

  const isTitleVisible = ['EMERGE', 'LIFT', 'INTERACTIVE'].includes(phase) || Platform.OS !== 'web';
  const isActionsVisible = phase === 'INTERACTIVE' || Platform.OS !== 'web';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Living Network Canvas */}
      <HeroCanvas onPhaseChange={handlePhaseChange} activeModeTransition={activeTransition} />

      {/* Top Header Row with Balanced Centered Brand & Language Switch */}
      <SafeAreaView style={styles.topContainer}>
        {/* Language switch button in top-right */}
        <View style={styles.langRow}>
          <TouchableOpacity
            style={styles.langPill}
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Feather name="globe" size={13} color={T.primary} />
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

      {/* Bottom Sheet: Role Selection CTAs */}
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

          {/* Option 1: Find Work (Equal Weight Primary) */}
          <TouchableOpacity
            style={styles.roleCTA}
            onPress={() => handleSelectMode('worker')}
            activeOpacity={0.88}
          >
            <View style={styles.roleCTAInner}>
              <View style={styles.iconCircle}>
                <Feather name="briefcase" size={18} color={T.white} />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitle}>{t('findWork')}</Text>
                <Text style={styles.roleSub}>{t('findWorkSub')}</Text>
              </View>
            </View>
            <View style={styles.arrowCircle}>
              <Feather name="arrow-right" size={16} color={T.white} />
            </View>
          </TouchableOpacity>

          {/* Option 2: Hire Workers (Equal Weight Primary) */}
          <TouchableOpacity
            style={styles.roleCTASecondary}
            onPress={() => handleSelectMode('employer')}
            activeOpacity={0.88}
          >
            <View style={styles.roleCTAInner}>
              <View style={styles.iconCircleSecondary}>
                <Feather name="users" size={18} color={T.primary} />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitleSecondary}>{t('hireWorkers')}</Text>
                <Text style={styles.roleSubSecondary}>{t('hireWorkersSub')}</Text>
              </View>
            </View>
            <View style={styles.arrowCircleSecondary}>
              <Feather name="arrow-right" size={16} color={T.primary} />
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
    backgroundColor: T.bg,
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
    backgroundColor: T.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },

  // Centered Brand Title & Tagline Block
  centeredBrandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  brandName: {
    fontFamily: FontFamily.extraBold,
    fontSize: 34,
    color: T.primary,
    letterSpacing: -1.2,
    lineHeight: 38,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: T.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },

  // Bottom CTAs Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    paddingTop: 16,
    backgroundColor: T.sheetBg,
    borderTopWidth: 1,
    borderTopColor: T.border,
    zIndex: 20,
    gap: 10,
  },
  questionPrompt: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: T.ink,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Equal Role CTA 1: Find Work
  roleCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.primary,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 58,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 3,
  },
  roleCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.white,
    letterSpacing: -0.3,
  },
  roleSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Equal Role CTA 2: Hire Workers
  roleCTASecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.white,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: T.primary,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircleSecondary: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitleSecondary: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: T.primary,
    letterSpacing: -0.3,
  },
  roleSubSecondary: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
    marginTop: 1,
  },
  arrowCircleSecondary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  trustFooter: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: T.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  exitCover: {
    backgroundColor: T.bg,
  },
});
