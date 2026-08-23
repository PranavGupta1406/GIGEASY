// Job Apply & Daily Wage Proposal Screen
// Brand Blue (#1A68D5) · Clean Consumer Flow

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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { MOCK_JOBS, formatWage } from '../../data/mockData';
import { useSharedApplicationsStore, useWorkerStore, useLanguageStore } from '../../store';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { CURRENT_WORKER } from '../../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApply'>;

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
  success: '#10B981',
};

export const JobApplyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
  const { applyForJob } = useSharedApplicationsStore();
  const workerProfile = useWorkerStore((s) => s.profile);
  const { t } = useLanguageStore();

  const [proposedWage, setProposedWage] = useState<number>(job.maxWage);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const catVisual = getCategoryVisual(job.skillRequired.category);

  const wagePresets = [
    job.minWage,
    Math.round((job.minWage + job.maxWage) / 2),
    job.maxWage,
    Math.round(job.maxWage * 1.1),
  ];

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const worker = workerProfile ?? CURRENT_WORKER;
      applyForJob(job.id, proposedWage, worker, job);
      Alert.alert(
        'Application Sent',
        `Your daily wage proposal of ${formatWage(proposedWage)} has been submitted to ${job.employer.businessName}. You'll receive real-time notifications on status updates.`,
        [
          {
            text: 'View Activity',
            onPress: () => navigation.goBack(),
          },
        ]
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
        <Text style={styles.navTitle}>Apply for Gig</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Summary Banner */}
        <View style={styles.jobBanner}>
          <View style={[styles.jobIconBox, { backgroundColor: catVisual.bg }]}>
            <Feather name={catVisual.iconName} size={20} color={catVisual.color} />
          </View>
          <View style={styles.jobBannerInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
            <Text style={styles.employerName}>{job.employer.businessName} · {job.location.city}</Text>
            <Text style={styles.budgetRange}>
              Employer Budget: {formatWage(job.minWage)} – {formatWage(job.maxWage)} / day
            </Text>
          </View>
        </View>

        {/* Wage Proposal Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Propose Your Daily Wage</Text>
          <Text style={styles.cardSubtitle}>
            Disbursed immediately upon shift checkout via GigEasy Escrow.
          </Text>

          {/* Big Interactive Wage Amount */}
          <View style={styles.wageHeroBox}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.wageHeroNumber}>{proposedWage.toLocaleString('en-IN')}</Text>
            <Text style={styles.perDayText}> / day</Text>
          </View>

          {/* Stepper Controls */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setProposedWage((w) => Math.max(job.minWage - 200, w - 50))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>− ₹50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setProposedWage((w) => w + 50)}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>+ ₹50</Text>
            </TouchableOpacity>
          </View>

          {/* Preset Chips */}
          <View style={styles.presetsRow}>
            {wagePresets.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setProposedWage(p)}
                style={[
                  styles.presetChip,
                  proposedWage === p && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    proposedWage === p && styles.presetTextActive,
                  ]}
                >
                  {formatWage(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note / Message to Employer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add a brief note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. 3 years experience with warehouse staging. Ready to start tomorrow."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Escrow Guarantee */}
        <View style={styles.protectionNotice}>
          <MaterialCommunityIcons name="shield-check" size={18} color={T.primary} />
          <View style={styles.protectionTextWrap}>
            <Text style={styles.protectionTitle}>GigEasy Payment Guarantee</Text>
            <Text style={styles.protectionSub}>
              Employer deposit is pre-funded and held in escrow before your shift starts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Apply Button */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={isSubmitting ? 'Sending Application...' : `Submit Application (${formatWage(proposedWage)}/day)`}
          onPress={handleApply}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: 4 },
  navTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: T.ink },
  scrollContent: { paddingBottom: 100 },
  jobBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  jobIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobBannerInfo: { flex: 1 },
  jobTitle: { fontFamily: FontFamily.bold, fontSize: 15, color: T.ink, marginBottom: 2 },
  employerName: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary, marginBottom: 2 },
  budgetRange: { fontFamily: FontFamily.semiBold, fontSize: 11, color: T.primary },
  card: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: T.ink, marginBottom: 2 },
  cardSubtitle: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginBottom: 12 },
  wageHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.primaryMuted,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  currencySymbol: { fontFamily: FontFamily.extraBold, fontSize: 24, color: T.primary, marginRight: 2 },
  wageHeroNumber: { fontFamily: FontFamily.extraBold, fontSize: 36, color: T.primary, letterSpacing: -1 },
  perDayText: { fontFamily: FontFamily.medium, fontSize: 13, color: T.textSecondary, marginLeft: 4 },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  stepBtnText: { fontFamily: FontFamily.bold, fontSize: 12, color: T.ink },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  presetChipActive: { backgroundColor: T.primary },
  presetText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textSecondary },
  presetTextActive: { color: T.white, fontFamily: FontFamily.bold },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: T.ink,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  protectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: T.primaryMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  protectionTextWrap: { flex: 1 },
  protectionTitle: { fontFamily: FontFamily.bold, fontSize: 12, color: T.primary },
  protectionSub: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginTop: 1 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
});
