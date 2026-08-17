// Phone Screen — Clean Indian Mobile Entry
// Warm Ivory + Deep Teal + Electric Lime

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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

export const PhoneScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setPhoneNumber = useAuthStore((s) => s.setPhoneNumber);

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
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      {/* Nav Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>What's your{'\n'}mobile number?</Text>
            <Text style={styles.subtitle}>
              We'll send a 4-digit verification code to keep your account safe.
            </Text>
          </View>

          {/* Phone Input Box */}
          <View style={styles.inputContainer}>
            <View style={styles.countryBadge}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>

            <TextInput
              style={styles.phoneInput}
              placeholder="98765 43210"
              placeholderTextColor="#8E99A8"
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
                <Feather name="x-circle" size={16} color="#8E99A8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Security Guarantee Note */}
          <View style={styles.securityNote}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#0D3B3F" />
            <Text style={styles.securityText}>
              GigEasy uses enterprise encryption. Your phone number stays 100% private.
            </Text>
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <GigEasyButton
              label={isLoading ? 'Sending Code...' : 'Get Verification Code'}
              onPress={handleSendOTP}
              variant="primary"
              size="lg"
              fullWidth
              showArrow
              disabled={!isValid || isLoading}
              loading={isLoading}
            />

            <Text style={styles.termsText}>
              By proceeding, you agree to GigEasy's Terms of Service and Privacy Policy.
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
    backgroundColor: '#F8F7F4',
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
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[3],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  header: {
    marginBottom: Spacing[5],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: '#090D14',
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: '#5A6578',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#090D14',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    height: 58,
    ...Shadow.xs,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: Spacing[3],
    borderRightWidth: 1,
    borderRightColor: '#E8E6E0',
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
  },
  phoneInput: {
    flex: 1,
    paddingLeft: Spacing[3.5],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: '#090D14',
    letterSpacing: 1,
  },
  clearBtn: {
    padding: Spacing[1],
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#E8F3F4',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    marginTop: Spacing[4],
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  securityText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#0D3B3F',
    lineHeight: 18,
  },
  ctaSection: {
    marginTop: 'auto',
    gap: Spacing[3],
  },
  termsText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#8E99A8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
