// GigAlertOverlay.tsx — Production v2
// Real incoming gig notification — NOT a card variant.
// Role-Based: Renders ONLY when activeRole === 'worker'
// Visual identity: Warm ivory body · Forest green live accent · Orange earning/action
// Physics: Spring entry · Heartbeat pulse · Upward swipe dismiss (follows finger)

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Platform,
  Vibration,
  Easing,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily } from '../constants';
import { useAppNotificationStore, useEmployerStore, useLanguageStore } from '../store';
import { formatWage } from '../data/mockData';
import { getLocalizedCategory, LanguageCode } from '../i18n/translations';

// ─── Trade Icon Config ────────────────────────────────────────────────────────

type TradeConfig = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

function getTradeConfig(category: string): TradeConfig {
  const cat = (category ?? '').toLowerCase();
  if (cat.includes('construct') || cat.includes('mason') || cat.includes('helper')) {
    return { icon: 'tool', label: 'Construction' };
  }
  if (cat.includes('warehouse') || cat.includes('pack') || cat.includes('logist')) {
    return { icon: 'package', label: 'Warehouse' };
  }
  if (cat.includes('electric')) {
    return { icon: 'zap', label: 'Electrical' };
  }
  if (cat.includes('plumb')) {
    return { icon: 'droplet', label: 'Plumbing' };
  }
  if (cat.includes('transport') || cat.includes('deliver') || cat.includes('driver')) {
    return { icon: 'truck', label: 'Delivery' };
  }
  if (cat.includes('clean') || cat.includes('house') || cat.includes('maid')) {
    return { icon: 'wind', label: 'Household' };
  }
  if (cat.includes('factory') || cat.includes('industr')) {
    return { icon: 'settings', label: 'Factory' };
  }
  if (cat.includes('event') || cat.includes('hospit')) {
    return { icon: 'star', label: 'Events' };
  }
  if (cat.includes('security') || cat.includes('guard')) {
    return { icon: 'shield', label: 'Security' };
  }
  return { icon: 'briefcase', label: 'Gig' };
}

// ─── Spots text ───────────────────────────────────────────────────────────────

function getSpotsText(required: number, hired: number, isHi = false): { text: string; urgent: boolean } {
  const left = Math.max(0, required - hired);
  if (left === 0) return { text: isHi ? 'तेज़ी से भर रहा है' : 'Filling fast', urgent: true };
  if (left === 1) return { text: isHi ? '1 जगह बाकी' : '1 spot', urgent: true };
  if (left <= 3) return { text: isHi ? `${left} जगह बाकी` : `${left} spots`, urgent: true };
  return { text: isHi ? `${left} जगह बाकी` : `${left} spots`, urgent: false };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GigAlertOverlayProps {
  activeRole?: 'worker' | 'employer';
  onPressView: (jobId: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const GigAlertOverlay: React.FC<GigAlertOverlayProps> = ({
  activeRole = 'worker',
  onPressView,
}) => {
  // CRITICAL: Gig alerts only for workers
  if (activeRole !== 'worker') {
    return null;
  }

  const insets = useSafeAreaInsets();

  const notifications = useAppNotificationStore((s) => s.notifications);
  const dismissToast = useAppNotificationStore((s) => s.dismissToast);
  const markAsRead = useAppNotificationStore((s) => s.markAsRead);
  const activeToast = useAppNotificationStore((s) => s.activeToast);

  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  const pendingAlerts = notifications.filter(
    (n) => n.type === 'GIG_ALERT' && n.targetRole === 'worker' && !n.read && !shownIds.has(n.id)
  );

  const currentAlert = activeToast?.type === 'GIG_ALERT' ? activeToast : (pendingAlerts[0] ?? null);
  const queueCount = pendingAlerts.length > 1 ? pendingAlerts.length - 1 : 0;

  // ── Animations ───────────────────────────────────────────────────────────────
  const translateY = useRef(new Animated.Value(-360)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const swipeY = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  // Live pulse for the green indicator dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const timerRef = useRef<any>(null);
  const isVisibleRef = useRef(false);
  const pulseLoopRef = useRef<any>(null);

  // Live pulse loop — slow, subtle, never distracting
  const startPulse = useCallback(() => {
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoopRef.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // Slide In — spring entry, then subtle heartbeat settle
  const slideIn = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 30, 40, 30]);
      } catch (_) {}
    }

    opacity.setValue(1);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 72,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtle heartbeat settle — NOT a bounce, just a tiny confirm pulse
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.012, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
      ]).start(() => startPulse());
    });

    // 12-second countdown
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 12000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isVisibleRef.current) {
        handleDismiss();
      }
    });
  }, [translateY, opacity, scale, progressAnim, startPulse]);

  // Slide Out — accelerating upward, fades only near exit
  const slideOut = useCallback(
    (onDone?: () => void) => {
      stopPulse();
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -360,
          duration: 240,
          easing: Easing.bezier(0.32, 0, 0.67, 0),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(110),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 130,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        swipeY.setValue(0);
        isVisibleRef.current = false;
        onDone?.();
      });
    },
    [translateY, opacity, swipeY, stopPulse]
  );

  const handleDismiss = useCallback(() => {
    if (!currentAlert) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    progressAnim.stopAnimation();

    markAsRead(currentAlert.id);
    setShownIds((prev) => new Set([...prev, currentAlert.id]));

    slideOut(() => {
      dismissToast();
    });
  }, [currentAlert, markAsRead, dismissToast, slideOut, progressAnim]);

  const handleView = useCallback(() => {
    if (!currentAlert) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    progressAnim.stopAnimation();

    markAsRead(currentAlert.id);
    setShownIds((prev) => new Set([...prev, currentAlert.id]));

    const jobId = currentAlert.data?.jobId;
    slideOut(() => {
      dismissToast();
      if (jobId) onPressView(jobId);
    });
  }, [currentAlert, markAsRead, dismissToast, slideOut, onPressView, progressAnim]);

  useEffect(() => {
    if (!currentAlert || isVisibleRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    isVisibleRef.current = true;

    swipeY.setValue(0);
    translateY.setValue(-360);
    scale.setValue(0.95);
    opacity.setValue(1);

    slideIn();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentAlert?.id]);

  // ── Swipe-Up PanResponder ─────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy < -5 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy < 0) {
          swipeY.setValue(gs.dy);
          if (gs.dy < -110) {
            opacity.setValue(Math.max(0, 1 + (gs.dy + 110) / 140));
          } else {
            opacity.setValue(1);
          }
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -25 || gs.vy < -0.32) {
          Animated.parallel([
            Animated.timing(swipeY, {
              toValue: -360,
              duration: Math.max(130, 220 - Math.abs(gs.vy) * 60),
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(85),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            handleDismiss();
          });
        } else {
          Animated.parallel([
            Animated.spring(swipeY, {
              toValue: 0,
              friction: 8,
              tension: 70,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 110,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!currentAlert) return null;

  // ── Extract Data ──────────────────────────────────────────────────────────
  const wage = currentAlert.data?.wage ?? currentAlert.data?.amount ?? 1200;
  const location = (currentAlert.data as any)?.location ?? 'Sector 62, Noida';
  const city = (currentAlert.data as any)?.city ?? 'Noida';
  const time = (currentAlert.data as any)?.time ?? '09:00 AM';
  const category = (currentAlert.data as any)?.category ?? 'Construction';
  const spotsRequired = (currentAlert.data as any)?.spotsRequired ?? 2;
  const spotsHired = (currentAlert.data as any)?.spotsHired ?? 0;
  const matchScore = (currentAlert.data as any)?.matchScore ?? 98;
  const distanceKm = (currentAlert.data as any)?.distanceKm ?? 2.4;
  const customReason = (currentAlert.data as any)?.matchReason;

  const rawTitle = currentAlert.title ?? 'Construction Site Helper';
  const displayTitle = rawTitle.startsWith('New High-Match')
    ? currentAlert.message.split('·')[0].trim()
    : rawTitle;

  const { language, t } = useLanguageStore();
  const isHi = language === 'hi';

  const trade = getTradeConfig(category);
  const spots = getSpotsText(spotsRequired, spotsHired, isHi);

  // Match reason — compact, no sentences
  const matchReason = customReason
    ? customReason
    : matchScore >= 95
    ? (isHi ? 'नज़दीक · आपकी स्किल मिलती है' : 'Nearby · Skill match')
    : matchScore >= 88
    ? (isHi ? 'आपकी स्किल मिलती है' : 'Matches your trade')
    : (isHi ? 'आपकी चुनी हुई दूरी के अंदर' : 'Within your radius');

  const distText = distanceKm > 0 ? `${distanceKm.toFixed(1)} ${t('distance')}` : `2.4 ${t('distance')}`;
  const cityText = city || (location.includes(',') ? location.split(',').pop()?.trim() : 'Noida');

  const combinedY = Animated.add(translateY, swipeY);
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20) + 6;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: topInset,
          transform: [{ translateY: combinedY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card} {...panResponder.panHandlers}>
        {/* Deep forest green left spine — primary visual identity signal */}
        <View style={styles.leftSpine} />

        <View style={styles.cardBody}>
          {/* Countdown track — thin orange progress line */}
          <Animated.View
            style={[
              styles.countdownBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />

          {/* Drag handle */}
          <View style={styles.dragArea}>
            <View style={styles.dragPill} />
          </View>

          <TouchableOpacity
            style={styles.innerContent}
            onPress={handleView}
            activeOpacity={0.94}
          >
            {/* Top bar: Live indicator + trade + category • Close */}
            <View style={styles.topBar}>
              <View style={styles.liveCluster}>
                {/* Animated green live pulse dot */}
                <View style={styles.livePulseOuter}>
                  <Animated.View style={[styles.livePulseInner, { opacity: pulseAnim }]} />
                  <View style={styles.livePulseCore} />
                </View>

                {/* Trade icon tile */}
                <View style={styles.tradeIconTile}>
                  <Feather name={trade.icon} size={11} color="#1A6B3C" />
                </View>
                <Text style={styles.tradeLabel}>{getLocalizedCategory(category, language)}</Text>
              </View>

              <View style={styles.topBarRight}>
                {/* Match signal — compact green chip */}
                <View style={styles.matchChip}>
                  <Feather name="check" size={9} color="#1A6B3C" strokeWidth={3} />
                  <Text style={styles.matchChipText}>{matchScore}% {t('matchForYou')}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.closeBtn}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={14} color="#787878" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Core block: Job title (left) + Wage (right) */}
            <View style={styles.coreBlock}>
              <View style={styles.jobInfoCol}>
                <Text style={styles.jobTitle} numberOfLines={1}>{displayTitle}</Text>
                {/* Time + distance — icon row */}
                <View style={styles.metaRow}>
                  <Feather name="clock" size={11} color="#505050" />
                  <Text style={styles.metaText}>{t('today')} · {time}</Text>
                  <View style={styles.metaBullet} />
                  <Feather name="map-pin" size={11} color="#505050" />
                  <Text style={styles.metaText}>{distText} · {cityText}</Text>
                </View>
              </View>

              <View style={styles.wageCol}>
                <Text style={styles.wageAmount}>{formatWage(wage)}</Text>
                <Text style={[styles.spotsText, spots.urgent && styles.spotsTextUrgent]}>
                  {t('perDay')} · {spots.text}
                </Text>
              </View>
            </View>

            {/* Action rail: Match reason (icon+text compact) + View Gig CTA */}
            <View style={styles.actionRail}>
              <View style={styles.whyCluster}>
                <Feather name="check-circle" size={11} color="#1A6B3C" />
                <Text style={styles.whyText} numberOfLines={1}>{matchReason}</Text>
              </View>

              <TouchableOpacity
                style={styles.viewGigBtn}
                onPress={handleView}
                activeOpacity={0.88}
              >
                <Text style={styles.viewGigBtnText}>{t('viewJob')}</Text>
                <Feather name="arrow-right" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Queue indicator — dot stack, not verbose text */}
          {queueCount > 0 && (
            <View style={styles.queueFooter}>
              {Array.from({ length: Math.min(queueCount, 3) }).map((_, i) => (
                <View key={i} style={styles.queueDot} />
              ))}
              {queueCount > 3 && (
                <Text style={styles.queueMoreText}>+{queueCount - 3}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 99999,
  },
  card: {
    backgroundColor: '#FDFCF8',  // Warmer ivory than the page — makes the alert feel "lifted"
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1D4',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 13,
  },
  leftSpine: {
    width: 5,
    backgroundColor: '#1A6B3C',   // Forest green — instantly signals: live opportunity
  },
  cardBody: {
    flex: 1,
  },
  // Thin orange countdown bar at top — shows time remaining
  countdownBar: {
    height: 2.5,
    backgroundColor: '#D4561A',
    alignSelf: 'flex-start',
  },
  dragArea: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  dragPill: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4CFB8',
  },
  innerContent: {
    paddingHorizontal: 13,
    paddingTop: 2,
    paddingBottom: 12,
    gap: 9,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Live pulse — two-ring system: outer translucent ring + solid core
  livePulseOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 107, 60, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  livePulseInner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(26, 107, 60, 0.3)',
  },
  livePulseCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1A6B3C',
  },
  tradeIconTile: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E6F4EC',
    borderWidth: 1,
    borderColor: '#B8DCCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: '#505050',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  matchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F4EC',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B8DCCA',
  },
  matchChipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 9.5,
    color: '#1A6B3C',
  },
  closeBtn: {
    padding: 2,
  },
  // Core block
  coreBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  jobInfoCol: {
    flex: 1,
    gap: 5,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: '#1A1A1A',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: '#505050',
  },
  metaBullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ABABAB',
    marginHorizontal: 3,
  },
  wageCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 21,
    color: '#D4561A',   // Orange — unmistakably money
    letterSpacing: -0.8,
  },
  spotsText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: '#787878',
    marginTop: 1,
    textAlign: 'right',
  },
  spotsTextUrgent: {
    color: '#D4561A',
  },
  // Action rail
  actionRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2EEE3',
    borderRadius: 9,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  whyCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  whyText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#1A6B3C',
  },
  viewGigBtn: {
    backgroundColor: '#D4561A',
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewGigBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  // Queue dots — visual, not verbal
  queueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EDE8DA',
    paddingVertical: 5,
  },
  queueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ABABAB',
  },
  queueMoreText: {
    fontFamily: FontFamily.medium,
    fontSize: 9.5,
    color: '#787878',
  },
});
