// Employer Onboarding Screen — Business Name & Sector Details
// Brand Navy (#1E3A5F)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../../constants';
import { GigEasyButton } from '../../../components';
import { CURRENT_EMPLOYER } from '../../../data/mockData';
import { useEmployerStore, useAuthStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'EmployerName'>;

const B = {
  bg: '#F8FAFC',
  navy: '#1A68D5',
  navyLight: '#EBF3FC',
  ink: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

const BUSINESS_TYPES = [
  'Logistics & Warehousing',
  'Construction & Contracting',
  'Events & Hospitality',
  'Manufacturing & Factory',
  'Retail & Facility',
  'Other Enterprise',
];

export const EmployerNameScreen: React.FC<Props> = ({ navigation }) => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [city, setCity] = useState('Noida');
  const setProfile = useEmployerStore((s) => s.setProfile);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const handleComplete = () => {
    if (!businessName.trim()) {
      Alert.alert('Company Name Required', 'Please enter your business or company name.');
      return;
    }

    setProfile({
      ...CURRENT_EMPLOYER,
      businessName: businessName.trim(),
      businessType,
      location: { ...CURRENT_EMPLOYER.location, city },
    });
    setOnboarded();
    navigation.replace('MainApp', { initialMode: 'employer' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={B.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about your{'\n'}business</Text>
            <Text style={styles.subtitle}>
              Set up your employer profile to post jobs and connect with workers nearby.
            </Text>
          </View>

          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company / Business Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Bharat Logistics Pvt Ltd"
              placeholderTextColor="#8A99AB"
              value={businessName}
              onChangeText={setBusinessName}
              autoFocus
            />
          </View>

          {/* Business Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Industry / Sector</Text>
            <View style={styles.typeGrid}>
              {BUSINESS_TYPES.map((type) => {
                const isSelected = businessType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setBusinessType(type)}
                    activeOpacity={0.8}
                    style={[
                      styles.typeChip,
                      isSelected && styles.typeChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        isSelected && styles.typeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Primary Operating City */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Hub City</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Noida, Gurugram, Delhi"
              placeholderTextColor="#8A99AB"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Bottom Action */}
          <View style={styles.ctaSection}>
            <GigEasyButton
              label="Launch Employer Dashboard"
              onPress={handleComplete}
              variant="primary"
              size="lg"
              fullWidth
              showArrow
              disabled={!businessName.trim()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: B.bg },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
  },
  header: {
    marginBottom: 24,
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
    fontSize: FontSize.sm,
    color: B.textMuted,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: B.ink,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: B.border,
    backgroundColor: B.white,
  },
  typeChipSelected: {
    borderColor: B.navy,
    backgroundColor: B.navy,
  },
  typeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: B.ink,
  },
  typeTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
  },
  ctaSection: {
    marginTop: 20,
  },
});
