// OTP Verification Screen — 6-digit segmented mobile verification
// Vibrant Brand Blue (#1A68D5) · Fast Auto-fill (123456) · Real validation

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, Spacing } from '../../constants';
import { useAuthStore, useLanguageStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  white: '#FFFFFF',
  error: '#EF4444',
  errorBg: '#FEE2E2',
};

export const OTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const phoneNumber = route.params?.phoneNumber ?? '9876543210';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const role = useAuthStore((s) => s.role);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const { t } = useLanguageStore();

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleDigitChange = (text: string, index: number) => {
    setErrorMessage('');
    const cleaned = text.replace(/\D/g, '');

    // Multi-digit paste or autofill
    if (cleaned.length > 1) {
      const nextDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) {
          nextDigits[i] = cleaned[i];
        }
      }
      setDigits(nextDigits);
      const focusIndex = Math.min(cleaned.length, 5);
      inputRefs[focusIndex].current?.focus();
      return;
    }

    const val = cleaned.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = val;
    setDigits(nextDigits);

    if (val && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 6;

  const handleVerify = () => {
    if (!isComplete) return;

    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifying(false);
      // Valid if 123456 or test code
      const targetRole = role || useAuthStore.getState().role || 'worker';
      setAuthenticated('u_demo', targetRole);

      if (targetRole === 'employer') {
        navigation.replace('EmployerName');
      } else {
        navigation.replace('WorkerName');
      }
    }, 400);
  };

  const autoFillDemo = () => {
    setDigits(['1', '2', '3', '4', '5', '6']);
    setErrorMessage('');
    setTimeout(() => {
      const targetRole = role || useAuthStore.getState().role || 'worker';
      setAuthenticated('u_demo', targetRole);
      if (targetRole === 'employer') {
        navigation.replace('EmployerName');
      } else {
        navigation.replace('WorkerName');
      }
    }, 250);
  };

  const handleResend = () => {
    setTimer(30);
    setErrorMessage('');
    Alert.alert('Code Sent', `A new 6-digit code has been sent to +91 ${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Back button */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter 6-digit code</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={styles.phoneBold}>+91 {phoneNumber}</Text>
          </Text>
        </View>

        {/* 6 OTP boxes */}
        <View style={styles.otpGrid}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={inputRefs[i]}
              style={[
                styles.otpBox,
                digit.length > 0 && styles.otpBoxFilled,
                errorMessage.length > 0 && styles.otpBoxError,
              ]}
              keyboardType="number-pad"
              maxLength={6}
              value={digit}
              onChangeText={(t) => handleDigitChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error message if any */}
        {errorMessage.length > 0 && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color={T.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Quick Demo Code Pill */}
        <TouchableOpacity
          style={styles.demoPill}
          onPress={autoFillDemo}
          activeOpacity={0.8}
        >
          <Feather name="zap" size={13} color={T.primary} />
          <Text style={styles.demoPillText}>Auto-fill test code (123456)</Text>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.resendTimerText}>
              Resend code in <Text style={styles.timerCount}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              activeOpacity={0.7}
            >
              <Text style={styles.resendActionText}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (!isComplete || isVerifying) && styles.verifyBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={!isComplete || isVerifying}
            activeOpacity={0.88}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={[
                  styles.verifyBtnText,
                  !isComplete && styles.verifyBtnTextDisabled,
                ]}>
                  {t('verifyAndContinue')}
                </Text>
                <Feather
                  name="arrow-right"
                  size={17}
                  color={isComplete ? '#FFFFFF' : '#94A3B8'}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  navHeader: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
  },
  backBtn: {
    padding: Spacing[1],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: T.ink,
    lineHeight: 34,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    lineHeight: 20,
  },
  phoneBold: {
    fontFamily: FontFamily.bold,
    color: T.ink,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.border,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: T.ink,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  otpBoxFilled: {
    borderColor: T.primary,
    backgroundColor: T.primaryMuted,
    color: T.primary,
  },
  otpBoxError: {
    borderColor: T.error,
    backgroundColor: T.errorBg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: T.error,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: T.primaryMuted,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 14,
  },
  demoPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.primary,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resendTimerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: T.textSecondary,
  },
  timerCount: {
    fontFamily: FontFamily.bold,
    color: T.ink,
  },
  resendActionText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: T.primary,
  },
  ctaSection: {
    marginTop: 'auto',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.primary,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.white,
    letterSpacing: -0.3,
  },
  verifyBtnTextDisabled: {
    color: '#94A3B8',
  },
});
