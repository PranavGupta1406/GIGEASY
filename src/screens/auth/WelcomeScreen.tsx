/**
 * WelcomeScreen — GigEasy Launch Experience (Cinematic Title Lift Choreography)
 *
 * Cinematic Sequence:
 *   1. [0.0s - 2.5s] Network scene is the living hero.
 *   2. [2.6s] "GigEasy." emerges smoothly from within the central scene.
 *   3. [2.9s] The title block organically travels UPWARD with natural spring physics.
 *   4. [3.4s] Settles into the top hero position while the network remains alive behind it.
 *   5. [3.4s+] Bottom action suite unlocks.
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Shadow } from '../../constants';
import { HeroCanvas, HeroPhase } from '../../components/hero/HeroCanvas';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const C = {
  bg: '#F8F7F4',
  ink: '#090D14',
  teal: '#0D3B3F',
  lime: '#C8F135',
  white: '#FFFFFF',
  textMuted: '#5A6578',
  border: '#E5E2D9',
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [phase, setPhase] = useState<HeroPhase>('SPAWN');
  const [activeTransition, setActiveTransition] = useState<'worker' | 'employer' | null>(null);
  const switchRole = useAuthStore((s) => s.switchRole);

  // ── Animated Values for Cinematic Flow ──
  // Title emergence & upward lift
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.92)).current;
  const brandTranslateY = useRef(new Animated.Value(85)).current; // starts in mid-scene, lifts to 0
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // CTA Reveal
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(24)).current;
  const fadeOutAnim = useRef(new Animated.Value(0)).current;

  // ── Phase Synchronization ──
  const handlePhaseChange = useCallback((p: HeroPhase) => {
    setPhase(p);

    // 1. Logo emerges from the central scene
    if (p === 'EMERGE') {
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(brandScale, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // 2. Logo smoothly and organically travels UPWARD
    if (p === 'LIFT') {
      Animated.parallel([
        Animated.spring(brandTranslateY, {
          toValue: 0,
          tension: 42,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 360,
          delay: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // 3. CTA actions settle in final landing state
    if (p === 'INTERACTIVE') {
      // Ensure title is settled at top
      brandOpacity.setValue(1);
      brandTranslateY.setValue(0);
      taglineOpacity.setValue(1);

      Animated.parallel([
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ctaTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [brandOpacity, brandScale, brandTranslateY, taglineOpacity, ctaOpacity, ctaTranslateY]);

  // Navigate to Firebase Auth with role preset
  const handleSelectMode = (mode: 'worker' | 'employer') => {
    setActiveTransition(mode);
    switchRole(mode);

    Animated.timing(fadeOutAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('FirebaseAuth', { role: mode, mode: 'signup' });
    });
  };

  const isTitleVisible = phase === 'EMERGE' || phase === 'LIFT' || phase === 'INTERACTIVE' || Platform.OS !== 'web';
  const isActionsVisible = phase === 'INTERACTIVE' || Platform.OS !== 'web';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── BACKGROUND LAYER: The Living 2.5D Marketplace Canvas (Continuous Loop) ── */}
      <HeroCanvas
        onPhaseChange={handlePhaseChange}
        activeModeTransition={activeTransition}
      />

      {/* ── FOREGROUND LAYER: Dynamically Emerging & Upward-Lifting Title Block ── */}
      {isTitleVisible && (
        <SafeAreaView style={styles.topTypographyZone} pointerEvents="none">
          <Animated.View
            style={[
              styles.animatedTitleBlock,
              {
                opacity: brandOpacity,
                transform: [
                  { translateY: brandTranslateY },
                  { scale: brandScale },
                ],
              },
            ]}
          >
            {/* Live Marketplace Pill */}
            <View style={styles.liveMarketPill}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.liveMarketText}>Verified Gig Marketplace · NCR</Text>
            </View>

            {/* Locked Wordmark (Single cohesive unit) */}
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitleText}>
                GigEasy<Text style={styles.brandDot}>.</Text>
              </Text>
            </View>

            {/* Editorial Sub-Headline */}
            <Animated.View style={{ opacity: taglineOpacity, alignItems: 'center' }}>
              <Text style={styles.brandTagline}>Work is around you.</Text>
              <Text style={styles.brandSubline}>
                Verified local gigs · Instant daily payouts · Direct hiring
              </Text>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      )}

      {/* ── BOTTOM LAYER: Action Suite ── */}
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
          {/* Primary Action: Find Work Near Me */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleSelectMode('worker')}
            activeOpacity={0.88}
          >
            <View style={styles.btnContent}>
              <Text style={styles.primaryBtnTitle}>Find Work Near Me</Text>
              <Text style={styles.primaryBtnSub}>Instant local gigs · Daily payouts</Text>
            </View>
            <View style={styles.arrowCircle}>
              <Feather name="arrow-right" size={17} color="#090D14" />
            </View>
          </TouchableOpacity>

          {/* Secondary Action: Hire Workers */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleSelectMode('employer')}
            activeOpacity={0.82}
          >
            <View style={styles.secondaryContent}>
              <MaterialCommunityIcons name="briefcase-plus-outline" size={16} color={C.teal} />
              <Text style={styles.secondaryBtnTitle}>
                Looking to hire workers? <Text style={styles.secondaryHighlight}>Post a gig →</Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Trust Guarantees */}
          <View style={styles.trustFooter}>
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="shield-check" size={13} color={C.teal} />
              <Text style={styles.trustText}>Aadhaar Verified</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="lock-check" size={13} color={C.teal} />
              <Text style={styles.trustText}>Escrow Guaranteed</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={13} color={C.teal} />
              <Text style={styles.trustText}>Instant Match</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Screen Exit Fade Layer ── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.exitCover,
          { opacity: fadeOutAnim },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Top Zone ──
  topTypographyZone: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 15,
  },
  animatedTitleBlock: {
    alignItems: 'center',
    width: '100%',
  },
  liveMarketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
    ...Shadow.xs,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  liveMarketText: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: '#090D14',
    letterSpacing: 0.2,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  brandTitleText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 38,
    color: '#090D14',
    letterSpacing: -1.3,
    lineHeight: 42,
  },
  brandDot: {
    color: '#C8F135',
    fontFamily: FontFamily.extraBold,
  },
  brandTagline: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#090D14',
    letterSpacing: -0.3,
    marginBottom: 3,
    textAlign: 'center',
  },
  brandSubline: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: '#5A6578',
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  // ── Bottom Sheet & Actions ──
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    paddingTop: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(248, 247, 244, 0.95)',
    borderTopWidth: 1,
    borderTopColor: C.border,
    zIndex: 20,
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.lime,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
    ...Shadow.sm,
  },
  btnContent: {
    flex: 1,
  },
  primaryBtnTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15.5,
    color: '#090D14',
    letterSpacing: -0.3,
  },
  primaryBtnSub: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: '#2A3C08',
    marginTop: 1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#090D14',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  secondaryBtn: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    ...Shadow.xs,
  },
  secondaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  secondaryBtnTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 12.5,
    color: '#090D14',
  },
  secondaryHighlight: {
    fontFamily: FontFamily.bold,
    color: C.teal,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#5A6578',
  },
  trustDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4D1C8',
    marginHorizontal: 8,
  },
  exitCover: {
    backgroundColor: C.bg,
  },
});
