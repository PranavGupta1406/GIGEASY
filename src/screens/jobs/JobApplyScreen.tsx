// Job Apply & Daily Wage Proposal Screen
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
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
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { api } from '../../services/api';
import { useWorkerStore, useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApply'>;

export const JobApplyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const workerId = useAuthStore((s) => s.workerId) || 1;
  const [job, setJob] = useState<any>({
    job_id: jobId,
    title: 'Commercial Wiring & Setup',
    wage: 1200,
    location: 'Okhla Phase 3, New Delhi'
  });

  useEffect(() => {
    async function loadJob() {
      try {
        const fetched = await api.getJobById(jobId);
        if (fetched) setJob(fetched);
      } catch (err) {
        console.error('Error fetching job details in apply screen:', err);
      }
    }
    loadJob();
  }, [jobId]);

  const [proposedWage, setProposedWage] = useState<number>(1200);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      await api.applyJob(job.job_id || jobId, workerId);
      Alert.alert(
        'Application Submitted! 🎉',
        'Your application has been registered in the database. The employer will review your profile.',
        [{ text: 'View Applications', onPress: () => navigation.navigate('WorkerActivity') }]
      );
    } catch (err: any) {
      Alert.alert('Application Notice', err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wagePresets = [
    job.minWage,
    Math.round((job.minWage + job.maxWage) / 2),
    job.maxWage,
    Math.round(job.maxWage * 1.1),
  ];

  const handleApply = async () => {
    await handleSubmitApplication();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Nav Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Apply for Gig
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Summary Banner */}
        <View style={styles.jobBanner}>
          <Text style={styles.jobCategory}>{job.skillRequired.category.toUpperCase()}</Text>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobEmployer}>{job.employer.businessName} · {job.location.city}</Text>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Employer Budget:</Text>
            <Text style={styles.budgetValue}>
              {formatWage(job.minWage)} – {formatWage(job.maxWage)} / day
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
            placeholderTextColor="#8E99A8"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Escrow Guarantee */}
        <View style={styles.protectionNotice}>
          <MaterialCommunityIcons name="shield-check" size={18} color="#0D3B3F" />
          <View style={styles.protectionTextWrap}>
            <Text style={styles.protectionTitle}>GigEasy Payment Guarantee</Text>
            <Text style={styles.protectionSub}>
              Employer deposit is pre-funded and held in escrow before your shift starts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Apply Action */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={isSubmitting ? 'Sending Proposal...' : `Send Application (${formatWage(proposedWage)}/day)`}
          onPress={handleApply}
          variant="primary"
          size="lg"
          fullWidth
          showArrow
          loading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  backBtn: { padding: Spacing[1] },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#090D14',
  },
  placeholder: { width: 24 },
  scrollContent: { paddingBottom: Spacing[14] },
  jobBanner: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  jobCategory: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#0D3B3F',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: '#090D14',
    marginBottom: 2,
    letterSpacing: -0.4,
  },
  jobEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    marginBottom: Spacing[3],
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F0EB',
    padding: Spacing[2.5],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  budgetLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
  },
  budgetValue: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#090D14',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing[5],
    marginTop: Spacing[3],
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#090D14',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
    marginBottom: Spacing[3],
  },
  wageHeroBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#090D14',
    paddingVertical: Spacing[3.5],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[3],
  },
  currencySymbol: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: '#C8F135',
    marginRight: 2,
  },
  wageHeroNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  perDayText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#8E99A8',
    marginLeft: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  stepBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    backgroundColor: '#F2F0EB',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    alignItems: 'center',
  },
  stepBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    justifyContent: 'space-between',
  },
  presetChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#F2F0EB',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#0D3B3F',
  },
  presetText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#5A6578',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  noteInput: {
    backgroundColor: '#F8F7F4',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#090D14',
    textAlignVertical: 'top',
    minHeight: 65,
  },
  protectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
    marginHorizontal: Spacing[5],
    marginTop: Spacing[3],
    padding: Spacing[3],
    backgroundColor: '#E8F3F4',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  protectionTextWrap: { flex: 1 },
  protectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#0D3B3F',
  },
  protectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
    ...Shadow.md,
  },
});
