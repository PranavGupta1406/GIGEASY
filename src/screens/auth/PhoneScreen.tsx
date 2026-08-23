// Phone Screen — Clean Indian Mobile Entry with Firebase Phone Auth

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, Spacing } from '../../constants';
import { useAuthStore, useLanguageStore } from '../../store';
import { Theme } from '../../theme';
import { authService } from '../../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const T = Theme;
export const PhoneScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const setPhoneNumber = useAuthStore((s) => s.setPhoneNumber);
  const { t } = useLanguageStore();

  useEffect(() => {
    // Pre-initialize reCAPTCHA verifier container on web
    if (Platform.OS === 'web') {
      try {
        authService.initRecaptchaVerifier('recaptcha-container');
      } catch (err) {
        console.warn('reCAPTCHA init error:', err);
      }
    }
  }, []);

  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleSendOTP = async () => {
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await authService.sendPhoneOtp(phone, 'recaptcha-container');

      if (result.success) {
        setPhoneNumber(phone);
        navigation.navigate('OTP', {
          phoneNumber: phone,
          verificationId: result.verificationId,
        });
      } else {
        setErrorMsg(result.error || 'Unable to send verification code. Please try again.');
      }
    } catch (err: any) {
      console.error('[PhoneScreen] Error sending OTP:', err);
      // Fallback transition for testing
      setPhoneNumber(phone);
      navigation.navigate('OTP', { phoneNumber: phone });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Hidden container for Web Firebase reCAPTCHA */}
      {Platform.OS === 'web' && (
        <View style={styles.hiddenContainer}>
          <div id="recaptcha-container" />
        </View>
      )}

      {/* Back */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('enterMobile')}</Text>
            <Text style={styles.subtitle}>
              {t('otpSubtitle')}
            </Text>
          </View>

          {/* Phone Input */}
          <View style={[styles.inputContainer, phone.length > 0 && styles.inputContainerActive]}>
            <View style={styles.countryBadge}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>

            <View style={styles.divider} />

            <TextInput
              style={styles.phoneInput}
              placeholder="98765 43210"
              placeholderTextColor={Theme.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => {
                setErrorMsg('');
                setPhone(t.replace(/\D/g, ''));
              }}
              autoFocus
            />

            {phone.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setPhone('');
                  setErrorMsg('');
                }}
                style={styles.clearBtn}
              >
                <Feather name="x-circle" size={16} color={Theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Error Message */}
          {errorMsg.length > 0 && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color={T.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!isValid || isLoading) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={!isValid || isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={Theme.surface} />
                  <Text style={styles.sendBtnText}>Sending Code...</Text>
                </View>
              ) : (
                <>
                  <Text style={[
                    styles.sendBtnText,
                    !isValid && styles.sendBtnTextDisabled,
                  ]}>
                    {t('getCode')}
                  </Text>
                  <Feather
                    name="arrow-right"
                    size={17}
                    color={isValid ? Theme.surface : Theme.textMuted}
                  />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By proceeding, you agree to GigEasy's Terms of Service & Privacy Policy.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  hiddenContainer: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
  navHeader: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
  },
  backBtn: {
    padding: Spacing[1],
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Theme.ink,
    lineHeight: 36,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Theme.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainerActive: {
    borderColor: Theme.primary,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 14,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Theme.ink,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.border,
    marginRight: 14,
  },
  phoneInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Theme.ink,
    letterSpacing: 1,
  },
  clearBtn: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: T.error,
  },
  ctaSection: {
    marginTop: 'auto',
    gap: 14,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.primary,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: Theme.surfaceSubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  sendBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.surface,
    letterSpacing: -0.3,
  },
  sendBtnTextDisabled: {
    color: Theme.textMuted,
  },
  termsText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
