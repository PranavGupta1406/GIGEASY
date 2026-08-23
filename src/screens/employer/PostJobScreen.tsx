// Employer Post Job Screen — High-End, Fast Gig Publishing
// Brand Royal Blue (#1A68D5) · Clean Form Layout · Immediate Shared State Publishing

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_SKILLS, WORK_GROUPS } from '../../data/mockData';
import { useEmployerStore, useLanguageStore } from '../../store';
import { Theme } from '../../theme';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';

type Props = NativeStackScreenProps<RootStackParamList, 'PostJob'>;

const PRESET_ROLES = [
  { title: 'Warehouse Loader', category: 'Warehouse', wage: 1000, icon: 'package' },
  { title: 'Mason', category: 'Construction', wage: 1200, icon: 'grid' },
  { title: 'Electrician', category: 'Electrical', wage: 1500, icon: 'zap' },
  { title: 'Auto Driver', category: 'Driving', wage: 900, icon: 'navigation' },
  { title: 'Catering Staff', category: 'Hospitality', wage: 850, icon: 'coffee' },
  { title: 'Packing Worker', category: 'Factory', wage: 800, icon: 'box' },
];

const WAGE_PRESETS = [800, 1000, 1200, 1500];

export const PostJobScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('Warehouse Loader');
  const [selectedCategory, setSelectedCategory] = useState('Warehouse');
  const [locationCity, setLocationCity] = useState('Sector 62, Noida');
  const [wage, setWage] = useState('1000');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  const [shiftDate, setShiftDate] = useState('Tomorrow (25 Aug 2026)');
  const [shiftTime, setShiftTime] = useState('09:00 AM - 06:00 PM');
  const [description, setDescription] = useState('Urgent requirement for dependable daily shift work. Immediate hiring upon application.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postJob = useEmployerStore((s) => s.postJob);
  const { t } = useLanguageStore();

  const handleSelectPreset = (preset: typeof PRESET_ROLES[0]) => {
    setTitle(preset.title);
    setSelectedCategory(preset.category);
    setWage(String(preset.wage));
  };

  const handleSubmit = () => {
    const numWage = parseInt(wage.replace(/\D/g, ''), 10);
    if (!title.trim()) {
      Alert.alert('Job Title Required', 'Please enter a title for the gig.');
      return;
    }
    if (!numWage || numWage < 200) {
      Alert.alert('Valid Wage Required', 'Please enter a valid daily wage (minimum ₹200).');
      return;
    }
    if (!locationCity.trim()) {
      Alert.alert('Location Required', 'Please enter the work location.');
      return;
    }

    setIsSubmitting(true);

    const matchingSkill = MOCK_SKILLS.find(
      (s) => s.name.toLowerCase() === title.trim().toLowerCase()
    ) ?? {
      id: `s_${Date.now()}`,
      name: title.trim(),
      category: selectedCategory,
      icon: 'package',
    };

    const newJob = postJob({
      title: title.trim(),
      description: description.trim(),
      skillRequired: matchingSkill,
      location: {
        lat: 28.6139,
        lng: 77.209,
        address: locationCity.trim(),
        city: locationCity.includes(',') ? locationCity.split(',')[1].trim() : locationCity.trim(),
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      startDate: '2026-08-25',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      workersRequired: workersNeeded,
      minWage: numWage,
      maxWage: numWage,
      requirements: ['Aadhaar Card', 'Punctual', 'Immediate Joiner'],
    });

    setIsSubmitting(false);

    Alert.alert(
      'Gig Published Successfully! 🎉',
      `"${title.trim()}" is now live on the worker feed at ₹${numWage}/day in ${locationCity.trim()}.`,
      [
        {
          text: 'View Gig',
          onPress: () => {
            navigation.replace('JobApplicants', { jobId: newJob.id });
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Post a New Gig</Text>
          <Text style={styles.headerSub}>Find and hire verified workers in minutes</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Presets Carousel */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick Role Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
              {PRESET_ROLES.map((preset) => {
                const isSelected = title === preset.title;
                const visual = getCategoryVisual(preset.category);

                return (
                  <TouchableOpacity
                    key={preset.title}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.presetIconWrap, { backgroundColor: isSelected ? Theme.primaryLight : '#F1F5F9' }]}>
                      <Feather name={preset.icon as any} size={16} color={isSelected ? Theme.primary : Theme.ink} />
                    </View>
                    <Text style={[styles.presetTitle, isSelected && styles.presetTitleSelected]}>{preset.title}</Text>
                    <Text style={styles.presetWage}>₹{preset.wage}/day</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Job Title & Category */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Job Title / Trade</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Warehouse Loader, Mason, Electrician"
              placeholderTextColor={Theme.textMuted}
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Work Category</Text>
            <View style={styles.catGrid}>
              {['Warehouse', 'Construction', 'Factory', 'Driving', 'Hospitality', 'Retail'].map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Daily Pay */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.inputLabel}>Daily Pay (₹ / Day)</Text>
              <Text style={styles.badgeText}>Direct Worker Payout</Text>
            </View>

            <View style={styles.wageInputRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.wageInput}
                value={wage}
                onChangeText={(v) => setWage(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder="1000"
                placeholderTextColor={Theme.textMuted}
                maxLength={6}
              />
              <Text style={styles.perDay}>/ day</Text>
            </View>

            {/* Quick wage chips */}
            <View style={styles.wagePresetRow}>
              {WAGE_PRESETS.map((p) => {
                const isSelected = wage === String(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.wageChip, isSelected && styles.wageChipSelected]}
                    onPress={() => setWage(String(p))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.wageChipText, isSelected && styles.wageChipTextSelected]}>₹{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location & Shift */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Work Location</Text>
            <View style={styles.inputWithIcon}>
              <Feather name="map-pin" size={16} color={Theme.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.iconInput}
                value={locationCity}
                onChangeText={setLocationCity}
                placeholder="e.g. Sector 62, Noida"
                placeholderTextColor={Theme.textMuted}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Shift Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={shiftDate}
                  onChangeText={setShiftDate}
                  placeholder="Date"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Shift Timing</Text>
                <TextInput
                  style={styles.textInput}
                  value={shiftTime}
                  onChangeText={setShiftTime}
                  placeholder="Timings"
                />
              </View>
            </View>
          </View>

          {/* Workers Needed Stepper */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.inputLabel}>Workers Required</Text>
                <Text style={styles.cardHelperText}>Number of people needed for this shift</Text>
              </View>
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setWorkersNeeded(Math.max(1, workersNeeded - 1))}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={16} color={Theme.ink} />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{workersNeeded}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setWorkersNeeded(workersNeeded + 1)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={16} color={Theme.ink} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Optional Short Description */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Job Description & Note (Optional)</Text>
            <TextInput
              style={[styles.textInput, { height: 74, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Brief details about work duties, transport, lunch, etc."
              placeholderTextColor={Theme.textMuted}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Post Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.88}
          disabled={isSubmitting}
        >
          <Feather name="plus-circle" size={18} color={Theme.surface} />
          <Text style={styles.postButtonText}>POST GIG NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: Theme.ink, letterSpacing: -0.4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: 12, color: Theme.textSecondary, marginTop: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  section: { marginBottom: 14 },
  sectionLabel: { fontFamily: FontFamily.bold, fontSize: 11, color: Theme.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  presetScroll: { gap: 10 },
  presetCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    minWidth: 125,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  presetCardSelected: { borderColor: Theme.primary, backgroundColor: Theme.primaryLight },
  presetIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  presetTitle: { fontFamily: FontFamily.bold, fontSize: 12, color: Theme.ink, marginBottom: 2 },
  presetTitleSelected: { color: Theme.primary },
  presetWage: { fontFamily: FontFamily.semiBold, fontSize: 11, color: Theme.primary },

  card: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardHelperText: { fontFamily: FontFamily.regular, fontSize: 11.5, color: Theme.textSecondary, marginTop: 1 },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 10.5, color: Theme.success },
  inputLabel: { fontFamily: FontFamily.bold, fontSize: 13, color: Theme.ink, marginBottom: 8 },
  textInput: {
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Theme.ink,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  iconInput: { flex: 1, paddingVertical: 11, fontFamily: FontFamily.medium, fontSize: 14, color: Theme.ink },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  catChipSelected: { backgroundColor: Theme.primary, borderColor: Theme.primary },
  catChipText: { fontFamily: FontFamily.medium, fontSize: 12, color: Theme.textSecondary },
  catChipTextSelected: { fontFamily: FontFamily.bold, color: Theme.surface },

  wageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Theme.border,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 10,
  },
  rupeeSign: { fontFamily: FontFamily.bold, fontSize: 24, color: Theme.primary, marginRight: 6 },
  wageInput: { flex: 1, fontFamily: FontFamily.extraBold, fontSize: 24, color: Theme.primary },
  perDay: { fontFamily: FontFamily.medium, fontSize: 14, color: Theme.textMuted, marginLeft: 6 },
  wagePresetRow: { flexDirection: 'row', gap: 8 },
  wageChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  wageChipSelected: { backgroundColor: Theme.primaryLight, borderColor: Theme.primary },
  wageChipText: { fontFamily: FontFamily.bold, fontSize: 12, color: Theme.ink },
  wageChipTextSelected: { color: Theme.primary },

  stepperWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: { fontFamily: FontFamily.extraBold, fontSize: 18, color: Theme.ink, minWidth: 20, textAlign: 'center' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 28,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.primary,
    borderRadius: 14,
    height: 52,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  postButtonText: { fontFamily: FontFamily.bold, fontSize: 15, color: Theme.surface, letterSpacing: 0.2 },
});
