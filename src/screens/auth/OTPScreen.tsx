// OTP Verification Screen — Segmented 4-box Verification
// Deep Teal + Warm Ivory + Electric Lime

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
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

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export const OTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const [digits, setDigits] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = [
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
    const val = text.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = val;
    setDigits(nextDigits);

    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const isComplete = digits.every((d) => d.length === 1);

  const handleVerify = () => {
    if (!isComplete) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      navigation.navigate('Role');
    }, 600);
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

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter the{'\n'}4-digit code</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={styles.phoneBold}>+91 {phoneNumber}</Text>
          </Text>
        </View>

        {/* 4 Segmented OTP Input Boxes */}
        <View style={styles.otpGrid}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={inputRefs[i]}
              style={[
                styles.otpBox,
                digit.length > 0 && styles.otpBoxFilled,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(t) => handleDigitChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Resend Section */}
        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.resendTimerText}>
              Resend code in <Text style={styles.timerCount}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setTimer(30);
                Alert.alert('Code Resent', 'A new verification code has been dispatched.');
              }}
            >
              <Text style={styles.resendActionText}>Resend verification code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify CTA */}
        <View style={styles.ctaSection}>
          <GigEasyButton
            label={isVerifying ? 'Verifying...' : 'Verify & Continue'}
            onPress={handleVerify}
            variant="primary"
            size="lg"
            fullWidth
            showArrow
            disabled={!isComplete || isVerifying}
            loading={isVerifying}
          />
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[3],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  header: {
    marginBottom: Spacing[6],
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
  phoneBold: {
    fontFamily: FontFamily.bold,
    color: '#090D14',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
  },
  otpBox: {
    width: 64,
    height: 68,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#090D14',
    ...Shadow.xs,
  },
  otpBoxFilled: {
    borderColor: '#0D3B3F',
    backgroundColor: '#F3F8F8',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  resendTimerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#5A6578',
  },
  timerCount: {
    fontFamily: FontFamily.bold,
    color: '#090D14',
  },
  resendActionText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#0D3B3F',
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
