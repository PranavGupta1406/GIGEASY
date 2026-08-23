// Worker Wage & Expected Daily Rate Screen
// Deep Teal + Electric Lime + Warm Ivory

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadow } from '../../../constants';
import { GigEasyButton } from '../../../components';
import { CURRENT_WORKER } from '../../../data/mockData';
import { useOnboardingStore, useWorkerStore, useAuthStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerWage'>;

const WAGE_PRESETS = [700, 800, 900, 1000, 1200, 1500];

export const WorkerWageScreen: React.FC<Props> = ({ navigation }) => {
  const { expectedWage, setExpectedWage, workerName } = useOnboardingStore();
  const setProfile = useWorkerStore((s) => s.setProfile);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const authName = useAuthStore((s) => s.name);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authUserId = useAuthStore((s) => s.userId);

  const handleComplete = () => {
    const resolvedName = workerName.trim() || authName || CURRENT_WORKER.name;
    setProfile({
      ...CURRENT_WORKER,
      id: authUserId || CURRENT_WORKER.id,
      userId: authUserId || CURRENT_WORKER.userId,
      name: resolvedName,
      phoneNumber: authPhone || CURRENT_WORKER.phoneNumber,
      expectedDailyWage: expectedWage,
    });
    setOnboarded();
    navigation.replace('MainApp', { initialMode: 'worker' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <View style={styles.content}>
        {/* Progress Header */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 3 of 3 · Daily Wage Benchmark</Text>

          <Text style={styles.title}>Expected daily wage?</Text>
          <Text style={styles.subtitle}>
            Employers use this to match you. You can still negotiate per gig before accepting.
          </Text>
        </View>

        {/* Big Wage Hero Display */}
        <View style={styles.wageHeroCard}>
          <Text style={styles.wageHeroLabel}>YOUR BENCHMARK</Text>
          <View style={styles.wageAmountRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.wageAmount}>{expectedWage.toLocaleString('en-IN')}</Text>
            <Text style={styles.perDayText}> / day</Text>
          </View>
        </View>

        {/* Quick Preset Buttons */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Quick Presets:</Text>
          <View style={styles.presetsGrid}>
            {WAGE_PRESETS.map((w) => {
              const isSelected = expectedWage === w;

              return (
                <TouchableOpacity
                  key={w}
                  onPress={() => setExpectedWage(w)}
                  activeOpacity={0.8}
                  style={[
                    styles.presetBtn,
                    isSelected && styles.presetBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isSelected && styles.presetTextSelected,
                    ]}
                  >
                    ₹{w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stepper adjustment */}
        <View style={styles.stepperRow}>
          <TouchableOpacity
            onPress={() => setExpectedWage(Math.max(500, expectedWage - 50))}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>− ₹50</Text>
          </TouchableOpacity>
          <Text style={styles.stepperHint}>Adjust precisely</Text>
          <TouchableOpacity
            onPress={() => setExpectedWage(Math.min(5000, expectedWage + 50))}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+ ₹50</Text>
          </TouchableOpacity>
        </View>

        {/* Market Benchmark Hint */}
        <View style={styles.benchmarkNote}>
          <Feather name="trending-up" size={14} color="#0D3B3F" />
          <Text style={styles.benchmarkText}>
            Average verified wage in Noida: ₹850 – ₹1,200/day
          </Text>
        </View>

        {/* Complete Profile CTA */}
        <View style={styles.ctaSection}>
          <GigEasyButton
            label="Complete Profile & Launch Gigs"
            onPress={handleComplete}
            variant="primary"
            size="lg"
            fullWidth
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[5],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  header: {
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
  },
  wageHeroCard: {
    backgroundColor: '#090D14',
    padding: Spacing[5],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#090D14',
    ...Shadow.sm,
  },
  wageHeroLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#C8F135',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  wageAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: '#C8F135',
    marginRight: 4,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 48,
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  perDayText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: '#8E99A8',
    marginLeft: 4,
  },
  presetsSection: {
    marginTop: Spacing[3],
  },
  presetsLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
    marginBottom: Spacing[2],
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  presetBtn: {
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    backgroundColor: '#FFFFFF',
  },
  presetBtnSelected: {
    borderColor: '#0D3B3F',
    backgroundColor: '#0D3B3F',
  },
  presetText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  presetTextSelected: {
    color: '#FFFFFF',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[1.5],
  },
  stepBtn: {
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  stepBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  stepperHint: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#8E99A8',
  },
  benchmarkNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#E8F3F4',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  benchmarkText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#0D3B3F',
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
