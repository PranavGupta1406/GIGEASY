// Worker Name & City Onboarding Screen
// Warm Ivory + Deep Teal + Electric Lime

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../../constants';
import { GigEasyButton } from '../../../components';
import { useOnboardingStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerName'>;

export const WorkerNameScreen: React.FC<Props> = ({ navigation }) => {
  const { workerName, setWorkerName } = useOnboardingStore();
  const [city, setCity] = useState('Noida');

  const handleNext = () => {
    if (!workerName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name to proceed.');
      return;
    }
    navigation.navigate('WorkerSkills');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 1 of 2 · Digital Identity</Text>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>What is your{'\n'}full name?</Text>
          <Text style={styles.subtitle}>
            This will appear on your verified digital work identity card.
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Ravi Kumar"
            placeholderTextColor="#8E99A8"
            value={workerName}
            onChangeText={setWorkerName}
            autoFocus
          />
        </View>

        {/* City Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Primary Work Area / City</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Noida, Delhi, Gurugram"
            placeholderTextColor="#8E99A8"
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
    backgroundColor: '#F8F7F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[5],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  progressSection: {
    marginBottom: Spacing[4],
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8E6E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D3B3F',
    borderRadius: 2,
  },
  stepIndicator: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
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
  inputGroup: {
    marginBottom: Spacing[4],
  },
  inputLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: '#090D14',
    marginBottom: Spacing[1.5],
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#090D14',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: '#090D14',
    ...Shadow.xs,
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
