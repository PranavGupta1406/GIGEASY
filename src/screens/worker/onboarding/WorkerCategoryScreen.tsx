/**
 * WorkerCategoryScreen — Step 1 of 2 in Worker Onboarding
 *
 * Shows exactly 5 large category cards. Tapping one navigates to
 * WorkerCategoryJobsScreen which shows the specific skills within it.
 *
 * NO individual jobs/skills shown on this screen.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily } from '../../../constants';
import { WORK_GROUPS } from '../../../data/mockData';
import { useLanguageStore } from '../../../store';
import { Theme } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerCategory'>;

// Icon name per category
const CATEGORY_ICONS: Record<string, any> = {
  grp_construction: 'tool',
  grp_factory:      'cpu',
  grp_transport:    'truck',
  grp_retail:       'package',
  grp_hospitality:  'coffee',
};

// Color per category
const CATEGORY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  grp_construction: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  grp_factory:      { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
  grp_transport:    { bg: '#CFFAFE', color: '#0E7490', border: '#A5F3FC' },
  grp_retail:       { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  grp_hospitality:  { bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8' },
};

// Job count per category
const JOB_COUNTS: Record<string, number> = {
  grp_construction: 10,
  grp_factory:      5,
  grp_transport:    5,
  grp_retail:       4,
  grp_hospitality:  6,
};

export const WorkerCategoryScreen: React.FC<Props> = ({ navigation }) => {
  const { language } = useLanguageStore();

  const handleSelect = (groupId: string, groupName: string) => {
    navigation.navigate('WorkerCategoryJobs', {
      categoryId: groupId,
      categoryName: groupName,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.stepLabel}>STEP 2 OF 2 · WORK TYPE</Text>
        <Text style={styles.title}>
          {language === 'hi' ? 'आप किस तरह का काम करते हैं?' : 'What type of work\ndo you do?'}
        </Text>
        <Text style={styles.subtitle}>
          {language === 'hi'
            ? 'अपनी श्रेणी चुनें — फिर आप अपने कौशल चुन सकते हैं।'
            : 'Choose your work category — then pick your exact skills.'}
        </Text>
      </View>

      {/* 5 Category Cards */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {WORK_GROUPS.map((group) => {
          const cs = CATEGORY_STYLES[group.id] ?? { bg: Theme.chipBg, color: Theme.brand, border: Theme.border };
          const iconName = CATEGORY_ICONS[group.id] ?? 'briefcase';
          const count = JOB_COUNTS[group.id] ?? group.skills.length;
          const name = language === 'hi' ? group.nameHi : group.name;

          return (
            <TouchableOpacity
              key={group.id}
              style={[styles.card, { borderColor: cs.border }]}
              onPress={() => handleSelect(group.id, name)}
              activeOpacity={0.82}
            >
              {/* Left: Icon block */}
              <View style={[styles.iconBlock, { backgroundColor: cs.bg }]}>
                <Feather name={iconName} size={32} color={cs.color} />
              </View>

              {/* Middle: Text */}
              <View style={styles.cardText}>
                <Text style={styles.cardName}>{name}</Text>
                <Text style={styles.cardCount}>
                  {count} job type{count !== 1 ? 's' : ''} available
                </Text>
              </View>

              {/* Right: Arrow */}
              <View style={[styles.arrowCircle, { backgroundColor: cs.bg }]}>
                <Feather name="chevron-right" size={18} color={cs.color} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  progressBar: {
    height: 3,
    backgroundColor: Theme.border,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.accent,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.accent,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Theme.ink,
    letterSpacing: -0.8,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 19,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
    padding: 16,
    gap: 14,
    shadowColor: Theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBlock: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardCount: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textMuted,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
