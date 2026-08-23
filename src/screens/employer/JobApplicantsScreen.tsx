// Job Applicants Screen — Match Ranking & Counter-Offer Terminal
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import {
  GigEasyAvatar,
  GigEasyVerifiedBadge,
  GigEasyRating,
  GigEasyTrustScore,
  GigEasyMatchBadge,
  GigEasyButton,
} from '../../components';
import { api } from '../../services/api';
import { useEmployerStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApplicants'>;

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState<any>({
    job_id: jobId,
    title: 'Commercial Wiring & Setup',
    wage: 1200,
    location: 'Okhla Phase 3, New Delhi'
  });
  const [applications, setApplications] = useState<any[]>([]);

  const loadApplicants = async () => {
    try {
      const [fetchedJob, fetchedApps] = await Promise.all([
        api.getJobById(jobId).catch(() => null),
        api.getApplications({ job_id: jobId })
      ]);
      if (fetchedJob) setJob(fetchedJob);
      if (fetchedApps && Array.isArray(fetchedApps)) setApplications(fetchedApps);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [counterWage, setCounterWage] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const acceptApplicant = useEmployerStore((s) => s.acceptApplicant);
  const counterOffer = useEmployerStore((s) => s.counterOffer);

  const handleHire = (applicant: typeof applicants[0]) => {
    Alert.alert(
      'Confirm Hire & Lock Escrow',
      `Hire ${applicant.worker.name} for ${formatWage(applicant.proposedWage)}/day? Funds will be locked into GigEasy Escrow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hire Worker',
          onPress: () => {
            acceptApplicant(applicant.id);
            Alert.alert(
              'Worker Hired',
              `${applicant.worker.name} has been notified and scheduled for shift at ${job.startTime}.`
            );
          },
        },
      ]
    );
  };

  const handleSendCounter = () => {
    const wage = parseInt(counterWage.replace(/\D/g, ''), 10);
    if (!wage || !selectedApplicant) return;

    counterOffer(selectedApplicant.id, wage, counterMessage);
    setCounterModalVisible(false);
    Alert.alert(
      'Counter-Offer Dispatched',
      `Sent counter-offer of ${formatWage(wage)}/day to ${selectedApplicant.worker.name}.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Applicants ({applicants.length})
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Mini Summary */}
        <View style={styles.jobSummary}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobMeta}>
            {job.workersHired} of {job.workersRequired} hired · Budget: {formatWage(job.minWage)} – {formatWage(job.maxWage)}/day
          </Text>
        </View>

        {/* Applicants List */}
        <View style={styles.listSection}>
          {applicants.map((app) => {
            const match = computeJobWorkerMatch(job, app.worker);

            return (
              <View key={app.id} style={styles.applicantCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <GigEasyAvatar
                    name={app.worker.name}
                    photoUri={app.worker.profilePhoto}
                    size={48}
                  />
                  <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.workerName}>{app.worker.name}</Text>
                      {app.worker.verificationStatus === 'verified' && (
                        <MaterialCommunityIcons name="check-decagram" size={12} color="#0D3B3F" />
                      )}
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="star" size={11} color="#090D14" />
                      <Text style={styles.metaText}>{app.worker.rating.toFixed(1)}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <MaterialCommunityIcons name="shield-check" size={12} color="#10B981" />
                      <Text style={[styles.metaText, { color: '#047857' }]}>{app.worker.trustScore}% trust</Text>
                    </View>
                  </View>

                  <GigEasyMatchBadge score={match.totalScore} />
                </View>

                {/* Proposed Wage Banner */}
                <View style={styles.wageBox}>
                  <Text style={styles.wageBoxLabel}>Asking Daily Wage:</Text>
                  <Text style={styles.wageBoxValue}>{formatWage(app.proposedWage)}/day</Text>
                </View>

                {/* Reasons */}
                <View style={styles.reasonsList}>
                  {match.reasons.map((r, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <Feather name="check" size={11} color="#0D3B3F" strokeWidth={2.5} />
                      <Text style={styles.reasonText}>{r}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => {
                      setSelectedApplicant(app);
                      setCounterWage(String(job.minWage));
                      setCounterModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.counterBtnText}>Counter-Offer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hireBtn}
                    onPress={() => handleHire(app)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.hireBtnText}>Hire Worker</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Counter Offer Modal */}
      <Modal
        visible={counterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCounterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Wage Counter-Offer</Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <Feather name="x" size={20} color="#090D14" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Propose a new daily rate to {selectedApplicant?.worker.name}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Counter Daily Wage (₹)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 900"
                placeholderTextColor="#8E99A8"
                keyboardType="number-pad"
                value={counterWage}
                onChangeText={setCounterWage}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="e.g. We can offer ₹900/day for on-time morning arrival."
                placeholderTextColor="#8E99A8"
                multiline
                value={counterMessage}
                onChangeText={setCounterMessage}
              />
            </View>

            <GigEasyButton
              label="Dispatch Counter-Offer"
              onPress={handleSendCounter}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  scrollContent: { paddingBottom: Spacing[10] },
  jobSummary: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    letterSpacing: -0.3,
  },
  jobMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    marginTop: 2,
  },
  listSection: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
  },
  applicantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  headerInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    marginBottom: 2,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: '#5A6578',
  },
  metaDot: { color: '#D4D1C8', fontSize: 10 },
  wageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F0EB',
    padding: Spacing[2.5],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    marginBottom: Spacing[2.5],
  },
  wageBoxLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  wageBoxValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.base,
    color: '#0D3B3F',
  },
  reasonsList: {
    gap: 4,
    marginBottom: Spacing[3],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reasonText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#090D14',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingTop: Spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  counterBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#090D14',
    alignItems: 'center',
  },
  counterBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  hireBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: '#0D3B3F',
    alignItems: 'center',
  },
  hireBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    paddingBottom: Spacing[10],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#090D14',
  },
  modalSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    marginBottom: Spacing[4],
  },
  modalInputGroup: {
    marginBottom: Spacing[4],
  },
  modalInputLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: '#090D14',
    marginBottom: Spacing[1],
  },
  modalInput: {
    backgroundColor: '#F8F7F4',
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2.5],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
  },
  modalTextArea: {
    minHeight: 60,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
});
