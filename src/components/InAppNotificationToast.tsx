// In-App Notification Toast & Notification Drawer Modal
// Real-time synchronization banner between Workers and Employers
// Slides in from top with action button, auto-dismiss, and history drawer

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme';
import { FontFamily } from '../constants';
import { AppNotification, useAppNotificationStore, useLanguageStore } from '../store';
import { getLocalizedNotification } from '../i18n/translations';

interface ToastProps {
  activeRole?: 'worker' | 'employer';
  onPressAction?: (notification: AppNotification) => void;
}

export const InAppNotificationToast: React.FC<ToastProps> = ({ activeRole, onPressAction }) => {
  const { language } = useLanguageStore();
  const activeToast = useAppNotificationStore((s) => s.activeToast);
  const dismissToast = useAppNotificationStore((s) => s.dismissToast);
  const markAsRead = useAppNotificationStore((s) => s.markAsRead);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  const isRoleMatch = Boolean(
    activeToast &&
      activeToast.type !== 'GIG_ALERT' &&
      (!activeRole || activeToast.targetRole === 'all' || activeToast.targetRole === activeRole)
  );

  useEffect(() => {
    if (isRoleMatch) {
      if (timerRef.current) clearTimeout(timerRef.current);

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 60,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 6 seconds
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 6000);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeToast]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissToast();
    });
  };

  const handleAction = () => {
    if (!activeToast) return;
    markAsRead(activeToast.id);
    onPressAction?.(activeToast);
    handleDismiss();
  };

  if (!isRoleMatch || !activeToast) return null;

  const localizedToast = getLocalizedNotification(activeToast, language);

  const getVisual = () => {
    switch (activeToast.type) {
      case 'GIG_ALERT':
        return { icon: 'bell', bg: Theme.accentLight, color: Theme.accent, border: Theme.accentMuted };
      case 'APPLICATION_RECEIVED':
        return { icon: 'users', bg: Theme.surfaceSubtle, color: Theme.ink, border: Theme.border };
      case 'HIRED':
        return { icon: 'check-circle', bg: Theme.successLight, color: Theme.success, border: Theme.successBorder };
      case 'COUNTER_OFFER':
        return { icon: 'repeat', bg: Theme.amberLight, color: Theme.amber, border: '#FDE68A' };
      case 'CHECK_IN':
        return { icon: 'map-pin', bg: Theme.accentLight, color: Theme.accent, border: Theme.accentMuted };
      case 'WORK_COMPLETED':
        return { icon: 'award', bg: Theme.successLight, color: Theme.success, border: Theme.successBorder };
      case 'PAYMENT_RECEIVED':
        return { icon: 'dollar-sign', bg: Theme.successLight, color: Theme.success, border: Theme.successBorder };
      default:
        return { icon: 'bell', bg: Theme.surfaceSubtle, color: Theme.ink, border: Theme.border };
    }
  };

  const visual = getVisual();

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toastContainer, { borderColor: visual.border }]}>
        {/* Event Icon Badge */}
        <View style={[styles.iconCircle, { backgroundColor: visual.bg }]}>
          <Feather name={visual.icon as any} size={18} color={visual.color} />
        </View>

        {/* Text Content */}
        <TouchableOpacity style={styles.textBlock} onPress={handleAction} activeOpacity={0.85}>
          <Text style={styles.toastTitle} numberOfLines={1}>
            {localizedToast.title}
          </Text>
          <Text style={styles.toastMessage} numberOfLines={2}>
            {localizedToast.message}
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleAction} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>{language === 'hi' ? 'देखें' : 'View'}</Text>
          <Feather name="arrow-right" size={12} color={Theme.surface} />
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss} activeOpacity={0.7}>
          <Feather name="x" size={16} color={Theme.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── Notification Drawer Modal ────────────────────────────────────────────────

interface DrawerProps {
  visible: boolean;
  activeRole: 'worker' | 'employer';
  onClose: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationDrawerModal: React.FC<DrawerProps> = ({
  visible,
  activeRole,
  onClose,
  onSelectNotification,
}) => {
  const { language } = useLanguageStore();
  const notifications = useAppNotificationStore((s) => s.notifications);
  const markAsRead = useAppNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useAppNotificationStore((s) => s.markAllAsRead);
  const clearAll = useAppNotificationStore((s) => s.clearAll);

  const roleFiltered = notifications.filter(
    (n) => n.targetRole === activeRole || n.targetRole === 'all'
  );

  const handleSelect = (notif: AppNotification) => {
    markAsRead(notif.id);
    onSelectNotification(notif);
    onClose();
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return language === 'hi' ? 'अभी' : 'Just now';
      if (diffMins < 60) return language === 'hi' ? `${diffMins} मि पहले` : `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
      return language === 'hi' ? `${Math.floor(diffHours / 24)} दिन पहले` : `${Math.floor(diffHours / 24)}d ago`;
    } catch (_) {
      return language === 'hi' ? 'हाल ही में' : 'Recent';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        <SafeAreaView style={styles.drawerContainer}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerTitle}>{language === 'hi' ? 'सूचनाएं' : 'Notifications'}</Text>
              <Text style={styles.drawerSub}>
                {activeRole === 'worker'
                  ? (language === 'hi' ? 'कामगार अलर्ट और काम की जानकारी' : 'Worker alerts & job updates')
                  : (language === 'hi' ? 'मालिक गतिविधि और कामगार' : 'Employer activity & candidates')}
              </Text>
            </View>
            <TouchableOpacity style={styles.drawerCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={20} color={Theme.ink} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.drawerControls}>
            <TouchableOpacity
              style={styles.controlPill}
              onPress={() => markAllAsRead(activeRole)}
              activeOpacity={0.7}
            >
              <Feather name="check" size={13} color={Theme.textSecondary} />
              <Text style={styles.controlPillText}>{language === 'hi' ? 'सब पढ़ा हुआ मार्क करें' : 'Mark all as read'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlPill}
              onPress={clearAll}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={13} color={Theme.textMuted} />
              <Text style={styles.controlPillText}>{language === 'hi' ? 'सब हटाएं' : 'Clear all'}</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerList}>
            {roleFiltered.length === 0 ? (
              <View style={styles.drawerEmpty}>
                <View style={styles.drawerEmptyIcon}>
                  <Feather name="bell-off" size={32} color={Theme.textMuted} />
                </View>
                <Text style={styles.drawerEmptyTitle}>{language === 'hi' ? 'कोई सूचना नहीं है' : 'No Notifications Yet'}</Text>
                <Text style={styles.drawerEmptySub}>
                  {language === 'hi'
                    ? 'आवेदन, नए काम, हाजिरी और भुगतान की सूचनाएं यहाँ दिखेंगी।'
                    : "You'll be alerted here for incoming applications, new gigs, shift updates, and payouts."}
                </Text>
              </View>
            ) : (
              roleFiltered.map((notif) => {
                const localized = getLocalizedNotification(notif, language);
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifItem, !notif.read && styles.notifItemUnread]}
                    onPress={() => handleSelect(notif)}
                    activeOpacity={0.8}
                  >
                    {!notif.read && <View style={styles.unreadDot} />}
                    <View style={styles.notifIconBox}>
                      <Feather
                        name={
                          notif.type === 'GIG_ALERT'
                            ? 'bell'
                            : notif.type === 'HIRED'
                            ? 'check-circle'
                            : notif.type === 'PAYMENT_RECEIVED'
                            ? 'dollar-sign'
                            : notif.type === 'CHECK_IN'
                            ? 'map-pin'
                            : 'users'
                        }
                        size={16}
                        color={Theme.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notifItemTopRow}>
                        <Text style={styles.notifItemTitle} numberOfLines={1}>
                          {localized.title}
                        </Text>
                        <Text style={styles.notifTime}>{getTimeAgo(notif.timestamp)}</Text>
                      </View>
                      <Text style={styles.notifItemMsg} numberOfLines={2}>
                        {localized.message}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={Theme.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 10,
  },
  toastContainer: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  toastTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textSecondary,
    marginTop: 1,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
    color: Theme.surface,
  },
  closeBtn: {
    padding: 4,
  },

  // Drawer Styles
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 400,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  drawerTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  drawerSub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
  },
  drawerControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  controlPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  drawerList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawerEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  drawerEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  drawerEmptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.ink,
    marginBottom: 4,
  },
  drawerEmptySub: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
    marginBottom: 8,
  },
  notifItemUnread: {
    backgroundColor: Theme.surfaceSubtle,
    borderColor: Theme.border,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.accent,
  },
  notifIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifItemTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
    flex: 1,
    marginRight: 6,
  },
  notifTime: {
    fontFamily: FontFamily.regular,
    fontSize: 10.5,
    color: Theme.textMuted,
  },
  notifItemMsg: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textSecondary,
    lineHeight: 16,
  },
});
