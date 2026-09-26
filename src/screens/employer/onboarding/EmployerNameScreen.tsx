// Employer Onboarding Screen — Business Name & Sector Details
// Warm Premium Palette (Charcoal & Ivory)

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
import { Theme } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmployerName'>;

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
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

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
              placeholder="e.g. Acme Logistics, Verma Builders"
              placeholderTextColor="#8C7D6E"
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
              placeholderTextColor="#8C7D6E"
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
  container: { flex: 1, backgroundColor: Theme.bg },
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
    color: Theme.ink,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Theme.textSecondary,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: Theme.surface,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Theme.ink,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
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
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  typeChipSelected: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accent,
  },
  typeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  typeTextSelected: {
    color: Theme.textOnAccent,
    fontFamily: FontFamily.semiBold,
  },
  ctaSection: {
    marginTop: 20,
  },
});
