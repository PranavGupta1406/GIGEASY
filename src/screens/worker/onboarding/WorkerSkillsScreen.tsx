// Worker Skills Selection Screen — Visual Category & Subcategory Matrix
// 5 Major Work Groups with Visual Subcategory Grid & Search Filter

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../../constants';
import { GigEasyButton } from '../../../components';
import { WORK_GROUPS, MOCK_SKILLS } from '../../../data/mockData';
import { getCategoryVisual } from '../../../components/GigEasyPrimitives';
import { useOnboardingStore, useLanguageStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerSkills'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  primaryLight: '#D6E6FA',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
};

export const WorkerSkillsScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedSkillIds, toggleSkill } = useOnboardingStore();
  const { language, t } = useLanguageStore();
  const [search, setSearch] = useState('');

  const handleNext = () => {
    if (selectedSkillIds.length === 0) {
      Alert.alert('Skill Required', 'Please select at least one skill you can perform.');
      return;
    }
    navigation.navigate('WorkerWage');
  };

  // Filter skills by search query
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return WORK_GROUPS;

    const q = search.toLowerCase();
    return WORK_GROUPS.map((grp) => ({
      ...grp,
      skills: grp.skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      ),
    })).filter((grp) => grp.skills.length > 0);
  }, [search]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Progress Header */}
      <View style={styles.headerWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 2 of 3 · Skills</Text>

        <Text style={styles.title}>
          {language === 'hi' ? 'आप क्या काम करते हैं?' : 'What work do you do?'}
        </Text>
        <Text style={styles.subtitle}>
          {language === 'hi'
            ? 'अपने अनुभव के अनुसार एक या अधिक कौशल चुनें।'
            : 'Select one or more skills that match your experience.'}
        </Text>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'hi' ? 'काम खोजें...' : 'Search work / skills...'}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {selectedSkillIds.length > 0 && (
          <View style={styles.selectedCountPill}>
            <Text style={styles.selectedCountText}>
              ✓ {selectedSkillIds.length} {selectedSkillIds.length === 1 ? 'skill' : 'skills'} selected
            </Text>
          </View>
        )}
      </View>

      {/* Visual Work Categories Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredGroups.map((group) => (
          <View key={group.id} style={styles.groupSection}>
            {/* Group Title Header */}
            <View style={styles.groupHeaderRow}>
              <Text style={styles.groupTitle}>
                {language === 'hi' ? group.nameHi.toUpperCase() : group.name.toUpperCase()}
              </Text>
              <Text style={styles.groupCount}>({group.skills.length})</Text>
            </View>

            {/* Visual Skill Cards 2-Column Grid */}
            <View style={styles.skillsGrid}>
              {group.skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                const visual = getCategoryVisual(skill.category);

                return (
                  <TouchableOpacity
                    key={skill.id}
                    style={[
                      styles.skillCard,
                      isSelected && styles.skillCardSelected,
                    ]}
                    onPress={() => toggleSkill(skill.id)}
                    activeOpacity={0.82}
                  >
                    {/* Visual Illustration / Thumbnail Box */}
                    <View
                      style={[
                        styles.visualBox,
                        { backgroundColor: isSelected ? T.primaryMuted : visual.bg },
                      ]}
                    >
                      <Feather
                        name={visual.iconName}
                        size={24}
                        color={isSelected ? T.primary : visual.color}
                      />
                    </View>

                    {/* Skill Label Below */}
                    <Text
                      style={[
                        styles.skillName,
                        isSelected && styles.skillNameSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {skill.name}
                    </Text>

                    {/* Selected Indicator Checkmark */}
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={10} color={T.white} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Sticky Bottom Next CTA */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={`Continue ${selectedSkillIds.length > 0 ? `(${selectedSkillIds.length} Selected)` : ''}`}
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
          disabled={selectedSkillIds.length === 0}
          showArrow
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: T.primary,
    borderRadius: 2,
  },
  stepIndicator: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: T.ink,
    lineHeight: 30,
    letterSpacing: -0.6,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: T.ink,
  },
  selectedCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: T.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  selectedCountText: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
    color: T.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  groupSection: {
    marginBottom: 22,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  groupTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: T.ink,
    letterSpacing: 0.6,
  },
  groupCount: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: T.textMuted,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillCard: {
    width: '48%',
    backgroundColor: T.cardBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  skillCardSelected: {
    borderColor: T.primary,
    backgroundColor: '#F8FAFF',
  },
  visualBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: T.ink,
    textAlign: 'center',
    lineHeight: 16,
  },
  skillNameSelected: {
    color: T.primary,
    fontFamily: FontFamily.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 30,
    borderTopWidth: 1,
    borderTopColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
});
