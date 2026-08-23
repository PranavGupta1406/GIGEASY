/**
 * OTP Verification Screen
 * - 4 large centered boxes
 * - Stable on all screen sizes (no overflow, no zoom)
 * - Auto-advance on fill, backspace to previous
 * - Numeric keyboard
 * - Demo autofill: 1234
 * - Working resend countdown
 * - 100% Unified Design Tokens
 */

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
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily } from '../../constants';
import { useAuthStore, useLanguageStore } from '../../store';
import { Theme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export const OTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const phoneNumber = route.params?.phoneNumber ?? '9876543210';

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(30);

  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const role = useAuthStore((s) => s.role);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const { t } = useLanguageStore();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Auto-advance focus
  const handleChange = (text: string, index: number) => {
    setErrorMsg('');
    const cleaned = text.replace(/\D/g, '');

    // Handle paste (all 4 digits at once)
    if (cleaned.length > 1) {
      const next = ['', '', '', ''];
      for (let i = 0; i < 4; i++) next[i] = cleaned[i] ?? '';
      setDigits(next);
      const focus = Math.min(cleaned.length, 3);
      refs[focus].current?.focus();
      return;
    }

    const val = cleaned.slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);

    if (val && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        refs[index - 1].current?.focus();
      }
    }
  };

  const code = digits.join('');
  const isReady = code.length === 4;

  const doVerify = (skipCodeCheck = false) => {
    if (!isReady && !skipCodeCheck) return;
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      const targetRole = role ?? useAuthStore.getState().role ?? 'worker';
      setAuthenticated('u_demo', targetRole);

      if (targetRole === 'employer') {
        navigation.replace('EmployerName');
      } else {
        navigation.replace('WorkerName');
      }
    }, 500);
  };

  const handleAutoFill = () => {
    setDigits(['1', '2', '3', '4']);
    setErrorMsg('');
    setTimeout(() => doVerify(true), 200);
  };

  const handleResend = () => {
    setTimer(30);
    setErrorMsg('');
    setDigits(['', '', '', '']);
    refs[0].current?.focus();
    Alert.alert('Code Sent', `A new 4-digit code has been sent to +91 ${phoneNumber}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={Theme.ink} />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleBlock}>
            <View style={styles.lockIcon}>
              <Feather name="lock" size={22} color={Theme.primary} />
            </View>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to{'\n'}
              <Text style={styles.phone}>+91 {phoneNumber}</Text>
            </Text>
          </View>

          {/* 4 OTP Boxes */}
          <View style={styles.boxesRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={refs[i]}
                style={[
                  styles.box,
                  digit ? styles.boxFilled : null,
                  errorMsg ? styles.boxError : null,
                ]}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={4}
                selectTextOnFocus
                autoFocus={i === 0}
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          {/* Error */}
          {!!errorMsg && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={13} color={Theme.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Demo pill */}
          <TouchableOpacity
            style={styles.demoPill}
            onPress={handleAutoFill}
            activeOpacity={0.8}
          >
            <Feather name="zap" size={13} color={Theme.primary} />
            <Text style={styles.demoText}>Auto-fill demo code (1234)</Text>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.resendTimer}>
                Resend code in <Text style={styles.resendCount}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendAction}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify CTA */}
          <TouchableOpacity
            style={[styles.verifyBtn, (!isReady || isVerifying) && styles.verifyBtnDisabled]}
            onPress={() => doVerify()}
            disabled={!isReady || isVerifying}
            activeOpacity={0.88}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={Theme.surface} />
            ) : (
              <>
                <Text style={[styles.verifyText, !isReady && styles.verifyTextDisabled]}>
                  Verify & Continue
                </Text>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={isReady ? Theme.surface : Theme.textMuted}
                />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const BOX_SIZE = 64;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backBtn: {
    padding: 6,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  titleBlock: {
    marginBottom: 36,
    alignItems: 'flex-start',
  },
  lockIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Theme.ink,
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Theme.textSecondary,
    lineHeight: 21,
  },
  phone: {
    fontFamily: FontFamily.bold,
    color: Theme.ink,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Theme.ink,
    flex: 1,
  },
  boxFilled: {
    borderColor: Theme.primary,
    backgroundColor: Theme.primaryLight,
    color: Theme.primary,
  },
  boxError: {
    borderColor: Theme.error,
    backgroundColor: Theme.errorLight,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.error,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.primaryLight,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoText: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.primary,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendTimer: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textSecondary,
  },
  resendCount: {
    fontFamily: FontFamily.bold,
    color: Theme.ink,
  },
  resendAction: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.primary,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.primary,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  verifyBtnDisabled: {
    backgroundColor: Theme.surfaceSubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.surface,
    letterSpacing: -0.2,
  },
  verifyTextDisabled: {
    color: Theme.textMuted,
  },
});
