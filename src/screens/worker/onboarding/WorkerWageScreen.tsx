// Worker Wage & Expected Daily Rate Screen
// Brand Blue (#6497B2) Palette · Simple & Confident

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../../constants';
import { GigEasyButton } from '../../../components';
import { CURRENT_WORKER } from '../../../data/mockData';
import { useOnboardingStore, useWorkerStore, useAuthStore } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerWage'>;

const B = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryLight: '#D6E6FA',
  primaryMuted: '#EBF3FC',
  money: '#EA580C',
  moneyBg: '#FFEDD5',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

const WAGE_PRESETS = [700, 800, 900, 1000, 1200, 1500];

export const WorkerWageScreen: React.FC<Props> = ({ navigation }) => {
  const { expectedWage, setExpectedWage } = useOnboardingStore();
  const setProfile = useWorkerStore((s) => s.setProfile);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const handleComplete = () => {
    setProfile({ ...CURRENT_WORKER, expectedDailyWage: expectedWage });
    setOnboarded();
    navigation.replace('MainApp', { initialMode: 'worker' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={B.bg} />

      <View style={styles.content}>
        {/* Progress Header */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 3 of 3 · Daily Wage</Text>

          <Text style={styles.title}>Expected daily wage?</Text>
          <Text style={styles.subtitle}>
            This helps us show you relevant jobs in your area.
          </Text>
        </View>

        {/* Big Wage Hero Display */}
        <View style={styles.wageHeroCard}>
          <Text style={styles.wageHeroLabel}>EXPECTED RATE</Text>
          <View style={styles.wageAmountRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.wageAmount}>{expectedWage.toLocaleString('en-IN')}</Text>
            <Text style={styles.perDayText}> / day</Text>
          </View>
        </View>

        {/* Quick Preset Buttons */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Choose a rate:</Text>
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
          <Text style={styles.stepperHint}>Adjust rate</Text>
          <TouchableOpacity
            onPress={() => setExpectedWage(Math.min(5000, expectedWage + 50))}
            style={styles.stepBtn}
          >
            <Text style={styles.stepBtnText}>+ ₹50</Text>
          </TouchableOpacity>
        </View>

        {/* Complete Profile CTA */}
        <View style={styles.ctaSection}>
          <GigEasyButton
            label="Complete & Find Work"
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
  container: { flex: 1, backgroundColor: B.bg },
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
  progressBar: {
    height: 4,
    backgroundColor: B.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: B.primary,
    borderRadius: 2,
  },
  stepIndicator: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: B.textSecondary,
    marginBottom: 16,
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
    fontSize: FontSize.base,
    color: B.textSecondary,
    lineHeight: 22,
  },
  wageHeroCard: {
    backgroundColor: B.primary,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  wageHeroLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: B.primaryMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  wageAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#FFFFFF',
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
    color: B.primaryMuted,
    marginLeft: 4,
  },
  presetsSection: {
    marginTop: 18,
  },
  presetsLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: B.ink,
    marginBottom: 10,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: B.border,
    backgroundColor: B.white,
  },
  presetBtnSelected: {
    borderColor: B.primary,
    backgroundColor: B.primary,
  },
  presetText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: B.ink,
  },
  presetTextSelected: {
    color: '#FFFFFF',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: B.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: B.border,
  },
  stepBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: B.ink,
  },
  stepperHint: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: B.textSecondary,
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
