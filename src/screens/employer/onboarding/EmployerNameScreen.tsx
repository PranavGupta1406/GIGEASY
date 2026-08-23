// Employer Onboarding Screen — Business Name & Sector Details
// Deep Teal + Electric Lime + Warm Ivory

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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
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
import { CURRENT_EMPLOYER } from '../../../data/mockData';
import { useEmployerStore, useAuthStore } from '../../../store';

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
  const authName = useAuthStore((s) => s.name);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authEmail = useAuthStore((s) => s.email);
  const authUserId = useAuthStore((s) => s.userId);

  const [businessName, setBusinessName] = useState(authName || '');
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
      id: authUserId || CURRENT_EMPLOYER.id,
      userId: authUserId || CURRENT_EMPLOYER.userId,
      businessName: businessName.trim(),
      contactName: authName || businessName.trim(),
      contactPhone: authPhone || CURRENT_EMPLOYER.contactPhone,
      contactEmail: authEmail || CURRENT_EMPLOYER.contactEmail,
      businessType,
      location: { ...CURRENT_EMPLOYER.location, city },
    });
    setOnboarded();
    navigation.replace('MainApp', { initialMode: 'employer' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EMPLOYER ONBOARDING</Text>
            </View>
            <Text style={styles.title}>Tell us about your{'\n'}business</Text>
            <Text style={styles.subtitle}>
              Set up your employer identity to post gigs and discover verified workers near you.
            </Text>
          </View>

          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company / Business Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Bharat Logistics Pvt Ltd"
              placeholderTextColor="#8E99A8"
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
              placeholderTextColor="#8E99A8"
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
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[5],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  header: {
    marginBottom: Spacing[5],
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F3F4',
    paddingHorizontal: Spacing[2.5],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
    marginBottom: Spacing[2.5],
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#0D3B3F',
    letterSpacing: 0.6,
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
    fontSize: FontSize.sm,
    color: '#5A6578',
    lineHeight: 20,
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
    fontSize: FontSize.base,
    color: '#090D14',
    ...Shadow.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  typeChip: {
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    backgroundColor: '#FFFFFF',
  },
  typeChipSelected: {
    borderColor: '#0D3B3F',
    backgroundColor: '#0D3B3F',
  },
  typeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  typeTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
  },
  ctaSection: {
    marginTop: Spacing[4],
  },
});
