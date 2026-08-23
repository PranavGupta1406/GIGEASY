// Worker Name & City Onboarding Screen
// GigEasy Navy Brand · Clean Input

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../../constants';
import { GigEasyButton } from '../../../components';
import { useOnboardingStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerName'>;

const B = {
  bg: '#F8FAFC',
  navy: '#1A68D5',
  ink: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export const WorkerNameScreen: React.FC<Props> = ({ navigation }) => {
  const { workerName, setWorkerName } = useOnboardingStore();
  const [city, setCity] = useState('Noida');

  const handleNext = () => {
    if (!workerName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name to proceed.');
      return;
    }
    navigation.navigate('WorkerCategory');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={B.bg} />

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 1 of 2 · Your Details</Text>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>What is your{'\n'}full name?</Text>
          <Text style={styles.subtitle}>
            Employers will see this name when you apply for gigs.
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Ravi Kumar"
            placeholderTextColor="#8A99AB"
            value={workerName}
            onChangeText={setWorkerName}
            autoFocus
          />
        </View>

        {/* City Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Primary City / Area</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Noida, Delhi, Gurugram"
            placeholderTextColor="#8A99AB"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaSection}>
          <GigEasyButton
            label="Continue to Skills"
            onPress={handleNext}
            variant="primary"
            size="lg"
            fullWidth
            showArrow
            disabled={!workerName.trim()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: B.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: B.navy,
    borderRadius: 2,
  },
  stepIndicator: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: B.textMuted,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: B.ink,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: B.textMuted,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: B.ink,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: B.white,
    borderWidth: 1.5,
    borderColor: B.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: B.ink,
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
