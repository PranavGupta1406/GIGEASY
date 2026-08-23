// Phone Screen — Clean Indian Mobile Entry
// Vibrant Brand Blue (#1A68D5) · Multilingual

import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants';
import { useAuthStore, useLanguageStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export const PhoneScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setPhoneNumber = useAuthStore((s) => s.setPhoneNumber);
  const { t } = useLanguageStore();

  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleSendOTP = () => {
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPhoneNumber(phone);
      navigation.navigate('OTP', { phoneNumber: phone });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Back */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
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
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              autoFocus
            />

            {phone.length > 0 && (
              <TouchableOpacity
                onPress={() => setPhone('')}
                style={styles.clearBtn}
              >
                <Feather name="x-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

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
              <Text style={[
                styles.sendBtnText,
                (!isValid || isLoading) && styles.sendBtnTextDisabled,
              ]}>
                {isLoading ? 'Sending Code...' : t('getCode')}
              </Text>
              {!isLoading && (
                <Feather
                  name="arrow-right"
                  size={17}
                  color={isValid ? '#FFFFFF' : '#94A3B8'}
                />
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By proceeding, you agree to GigEasy's Terms of Service.
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
    backgroundColor: T.bg,
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
    color: T.ink,
    lineHeight: 36,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: T.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainerActive: {
    borderColor: T.primary,
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
    color: T.ink,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: T.border,
    marginRight: 14,
  },
  phoneInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: T.ink,
    letterSpacing: 1,
  },
  clearBtn: {
    padding: 4,
  },
  ctaSection: {
    marginTop: 'auto',
    gap: 14,
  },
  sendBtn: {
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
  sendBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: T.white,
    letterSpacing: -0.3,
  },
  sendBtnTextDisabled: {
    color: '#94A3B8',
  },
  termsText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
