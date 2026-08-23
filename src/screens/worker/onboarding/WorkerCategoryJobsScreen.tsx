/**
 * WorkerCategoryJobsScreen — Step 2 of 2 in Worker Onboarding
 *
 * Shows the specific skills within the selected category.
 * Worker selects one or more skills, then continues to the main app.
 *
 * 100% Unified Design Tokens.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily } from '../../../constants';
import { WORK_GROUPS, MOCK_SKILLS, CURRENT_WORKER } from '../../../data/mockData';
import { useOnboardingStore, useLanguageStore, useWorkerStore, useAuthStore } from '../../../store';
import { getCategoryVisual } from '../../../components/GigEasyPrimitives';
import { Theme } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerCategoryJobs'>;

export const WorkerCategoryJobsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const { language } = useLanguageStore();
  const { selectedSkillIds, toggleSkill, workerName } = useOnboardingStore();
  const { setProfile } = useWorkerStore();
  const { setOnboarded } = useAuthStore();

  // Get the skills for this specific category group
  const group = useMemo(() => WORK_GROUPS.find((g) => g.id === categoryId), [categoryId]);
  const skills = group?.skills ?? [];

  const selectedInThisGroup = skills.filter((s) => selectedSkillIds.includes(s.id));

  const handleContinue = () => {
    if (selectedSkillIds.length === 0) {
      Alert.alert(
        'Select a Skill',
        'Please select at least one skill to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedSkills = MOCK_SKILLS.filter((s) => selectedSkillIds.includes(s.id));

    // Create worker profile
    setProfile({
      ...CURRENT_WORKER,
      name: workerName.trim() || CURRENT_WORKER.name,
      skills: selectedSkills.length > 0 ? selectedSkills : CURRENT_WORKER.skills,
    });

    setOnboarded();

    // Navigate directly to main app (worker mode)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp', params: { initialMode: 'worker' } }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Header with back button */}
      <View style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={Theme.ink} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <Text style={styles.stepLabel}>STEP 2 OF 2 · SELECT SKILLS</Text>
        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>
          {language === 'hi'
            ? 'वे कौशल चुनें जो आप कर सकते हैं।'
            : 'Select the skills you can perform.'}
        </Text>

        {selectedInThisGroup.length > 0 && (
          <View style={styles.selectedPill}>
            <Feather name="check-circle" size={12} color={Theme.primary} />
            <Text style={styles.selectedPillText}>
              {selectedInThisGroup.length} skill{selectedInThisGroup.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </View>

      {/* Skills Grid — 2 columns */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {skills.map((skill) => {
          const isSelected = selectedSkillIds.includes(skill.id);
          const visual = getCategoryVisual(skill.category);

          return (
            <TouchableOpacity
              key={skill.id}
              style={[styles.skillCard, isSelected && styles.skillCardActive]}
              onPress={() => toggleSkill(skill.id)}
              activeOpacity={0.8}
            >
              {/* Icon */}
              <View style={[
                styles.skillIcon,
                { backgroundColor: isSelected ? Theme.primaryLight : Theme.surfaceSubtle }
              ]}>
                <Feather
                  name={visual.iconName}
                  size={24}
                  color={isSelected ? Theme.primary : Theme.textSecondary}
                />
              </View>

              {/* Name */}
              <Text
                style={[styles.skillName, isSelected && styles.skillNameActive]}
                numberOfLines={2}
              >
                {skill.name}
              </Text>

              {/* Check badge */}
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Feather name="check" size={9} color={Theme.surface} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selectedSkillIds.length === 0 && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.88}
          disabled={selectedSkillIds.length === 0}
        >
          <Text style={[
            styles.continueBtnText,
            selectedSkillIds.length === 0 && styles.continueBtnTextDisabled,
          ]}>
            {selectedSkillIds.length === 0
              ? 'Select at least 1 skill'
              : `Get Started (${selectedSkillIds.length} selected)`}
          </Text>
          {selectedSkillIds.length > 0 && (
            <Feather name="arrow-right" size={18} color={Theme.surface} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  header: {
    backgroundColor: Theme.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: Theme.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.primary,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textSecondary,
    marginBottom: 6,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  selectedPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.primary,
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillCard: {
    width: '47%',
    backgroundColor: Theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Theme.border,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  skillCardActive: {
    borderColor: Theme.primary,
    backgroundColor: Theme.primaryLight,
  },
  skillIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.ink,
    textAlign: 'center',
    lineHeight: 17,
  },
  skillNameActive: {
    color: Theme.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'android' ? 20 : 32,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.primary,
    borderRadius: 16,
    height: 54,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnDisabled: {
    backgroundColor: Theme.surfaceSubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15.5,
    color: Theme.surface,
    letterSpacing: -0.2,
  },
  continueBtnTextDisabled: {
    color: Theme.textMuted,
  },
});
