// Worker Skills Selection Screen — Visual Skill Tiles with Vector Icons
// Deep Teal + Electric Lime + Warm Ivory

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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
import { MOCK_SKILLS } from '../../../data/mockData';
import { useOnboardingStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerSkills'>;

const getSkillIcon = (category: string): keyof typeof Feather.glyphMap => {
  switch (category) {
    case 'Warehouse':
      return 'package';
    case 'Electrical':
      return 'zap';
    case 'Plumbing':
      return 'tool';
    case 'Carpentry':
      return 'scissors';
    case 'Painting':
      return 'edit-3';
    case 'Construction':
      return 'tool';
    case 'Driving':
      return 'truck';
    case 'Cleaning':
      return 'check-circle';
    case 'Security':
      return 'shield';
    case 'Delivery':
      return 'navigation';
    case 'Events':
      return 'calendar';
    case 'Factory':
      return 'cpu';
    case 'Hospitality':
      return 'coffee';
    default:
      return 'user';
  }
};

export const WorkerSkillsScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedSkillIds, toggleSkill } = useOnboardingStore();

  const handleNext = () => {
    if (selectedSkillIds.length === 0) {
      Alert.alert('Skill Required', 'Please select at least one skill you can perform.');
      return;
    }
    navigation.navigate('WorkerWage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      {/* Progress Header */}
      <View style={styles.headerWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 2 of 3 · Skills & Capabilities</Text>

        <Text style={styles.title}>What work do{'\n'}you do?</Text>
        <Text style={styles.subtitle}>
          Select all skills that match your experience. You can add more later.
        </Text>

        {selectedSkillIds.length > 0 && (
          <View style={styles.selectedCountPill}>
            <Text style={styles.selectedCountText}>
              {selectedSkillIds.length} {selectedSkillIds.length === 1 ? 'skill' : 'skills'} selected
            </Text>
          </View>
        )}
      </View>

      {/* Visual Skill Tiles Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.skillsGrid}
      >
        {MOCK_SKILLS.map((skill) => {
          const isSelected = selectedSkillIds.includes(skill.id);
          const iconName = getSkillIcon(skill.category);

          return (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.skillTile,
                isSelected && styles.skillTileSelected,
              ]}
              onPress={() => toggleSkill(skill.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconWrap,
                  isSelected && styles.iconWrapSelected,
                ]}
              >
                <Feather
                  name={iconName}
                  size={20}
                  color={isSelected ? '#C8F135' : '#090D14'}
                />
              </View>

              <Text
                style={[
                  styles.skillName,
                  isSelected && styles.skillNameSelected,
                ]}
              >
                {skill.name}
              </Text>

              {isSelected && (
                <View style={styles.checkBadge}>
                  <Feather name="check" size={10} color="#090D14" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label="Continue to Wage Benchmark"
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
          showArrow
          disabled={selectedSkillIds.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  headerWrap: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
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
    marginBottom: Spacing[4],
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
    marginBottom: Spacing[3],
  },
  selectedCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F3F4',
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
    marginBottom: Spacing[2],
  },
  selectedCountText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#0D3B3F',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[5],
    gap: Spacing[2.5],
    paddingBottom: Spacing[12],
  },
  skillTile: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing[3.5],
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    alignItems: 'flex-start',
    position: 'relative',
    ...Shadow.xs,
  },
  skillTileSelected: {
    borderColor: '#0D3B3F',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2.5],
  },
  iconWrapSelected: {
    backgroundColor: '#0D3B3F',
  },
  skillName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: '#090D14',
    lineHeight: 16,
  },
  skillNameSelected: {
    color: '#090D14',
    fontFamily: FontFamily.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
  },
});
