// Post Job Wizard Screen — Visual Skill Selector, Headcount Stepper & Wage Range
// Brand Blue (#6497B2) Palette · Simple & Confident

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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { MOCK_SKILLS, formatWage } from '../../data/mockData';
import { useEmployerStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'PostJob'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryDark: '#124FA8',
  primaryLight: '#D6E6FA',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export const PostJobScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState(MOCK_SKILLS[0].id);
  const [workersRequired, setWorkersRequired] = useState(5);
  const [minWage, setMinWage] = useState(850);
  const [maxWage, setMaxWage] = useState(1000);
  const [address, setAddress] = useState('Sector 62, Noida');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postJob = useEmployerStore((s) => s.postJob);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Gig Title Required', 'Please enter a title for this gig.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      postJob({
        title: title.trim(),
        description: description.trim() || 'Daily shift support required.',
        skillRequired: MOCK_SKILLS.find((s) => s.id === selectedSkillId) ?? MOCK_SKILLS[0],
        location: {
          lat: 28.6139,
          lng: 77.209,
          address,
          city: 'Noida',
          state: 'Uttar Pradesh',
        },
        startDate: '2026-08-15',
        startTime: '08:00 AM',
        endTime: '05:00 PM',
        workersRequired,
        minWage,
        maxWage,
        requirements: ['Punctual arrival', 'Geofence check-in compliance'],
      });

      Alert.alert(
        'Gig Published & Dispatched',
        `Matching Engine is now dispatching your gig to verified workers nearby.`,
        [{ text: 'View Dashboard', onPress: () => navigation.goBack() }]
      );
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post a New Job</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>JOB TITLE & ROLE</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Warehouse Loading Helper"
            placeholderTextColor={T.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Skill Category Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKILL CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.skillsScroll}
          >
            {MOCK_SKILLS.slice(0, 8).map((skill) => {
              const isSelected = selectedSkillId === skill.id;

              return (
                <TouchableOpacity
                  key={skill.id}
                  onPress={() => setSelectedSkillId(skill.id)}
                  style={[
                    styles.skillChip,
                    isSelected && styles.skillChipSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.skillText,
                      isSelected && styles.skillTextSelected,
                    ]}
                  >
                    {skill.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Headcount Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>WORKERS REQUIRED</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => setWorkersRequired((c) => Math.max(1, c - 1))}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.countDisplay}>
              <Text style={styles.countNum}>{workersRequired}</Text>
              <Text style={styles.countSub}>positions</Text>
            </View>
            <TouchableOpacity
              onPress={() => setWorkersRequired((c) => c + 1)}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Wage Range */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DAILY WAGE BUDGET RANGE</Text>
          <View style={styles.wageHeroDisplayBox}>
            <Text style={styles.wageHeroDisplay}>
              {formatWage(minWage)} – {formatWage(maxWage)} / day
            </Text>
          </View>
          <View style={styles.wageAdjustRow}>
            <TouchableOpacity
              onPress={() => {
                setMinWage((w) => Math.max(500, w - 50));
                setMaxWage((w) => Math.max(600, w - 50));
              }}
              style={styles.wageAdjustBtn}
            >
              <Text style={styles.wageAdjustBtnText}>− ₹50/day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMinWage((w) => w + 50);
                setMaxWage((w) => w + 50);
              }}
              style={styles.wageAdjustBtn}
            >
              <Text style={styles.wageAdjustBtnText}>+ ₹50/day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SITE LOCATION & ADDRESS</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Sector 62, NSEZ, Noida"
            placeholderTextColor={T.textMuted}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Scope */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SHIFT INSTRUCTIONS</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe tasks, timing, safety requirements..."
            placeholderTextColor={T.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={isSubmitting ? 'Publishing...' : 'Publish & Dispatch Job'}
          onPress={handlePublish}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          showArrow
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: Spacing[1] },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: T.ink,
  },
  placeholder: { width: 24 },
  scrollContent: { paddingBottom: 100 },
  card: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: T.ink,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  skillsScroll: {
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: T.border,
  },
  skillChipSelected: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  skillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: T.textSecondary,
  },
  skillTextSelected: {
    color: T.white,
    fontFamily: FontFamily.bold,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  countBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: T.ink,
  },
  countDisplay: {
    alignItems: 'center',
  },
  countNum: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    color: T.ink,
  },
  countSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  wageHeroDisplayBox: {
    backgroundColor: T.primaryMuted,
    borderWidth: 1,
    borderColor: T.primaryLight,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  wageHeroDisplay: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: T.primary,
  },
  wageAdjustRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  wageAdjustBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F0F4F8',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  wageAdjustBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.ink,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
});
