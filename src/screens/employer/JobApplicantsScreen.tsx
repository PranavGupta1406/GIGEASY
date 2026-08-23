// Job Applicants Screen — Match Ranking & Counter-Offer Terminal
// Brand Blue (#6497B2) Palette · Simple & Confident

import React, { useState } from 'react';
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
} from '../../constants';
import {
  GigEasyAvatar,
  GigEasyVerifiedBadge,
  GigEasyRating,
  GigEasyTrustScore,
  GigEasyButton,
} from '../../components';
import {
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  formatWage,
} from '../../data/mockData';
import { computeJobWorkerMatch } from '../../services/matching/matchingEngine';
import { useEmployerStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApplicants'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryDark: '#124FA8',
  primaryLight: '#D6E6FA',
  primaryMuted: '#EBF3FC',
  money: '#EA580C',
  moneyBg: '#FFEDD5',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#10B981',
};

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
  const applicants = MOCK_APPLICATIONS.filter((a) => a.jobId === jobId);

  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<typeof applicants[0] | null>(null);
  const [counterWage, setCounterWage] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const acceptApplicant = useEmployerStore((s) => s.acceptApplicant);
  const counterOffer = useEmployerStore((s) => s.counterOffer);

  const handleHire = (applicant: typeof applicants[0]) => {
    Alert.alert(
      'Confirm Hire',
      `Hire ${applicant.worker.name} for ${formatWage(applicant.proposedWage)}/day?`,
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
        <View style={styles.navTitleWrap}>
          <Text style={styles.navTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.navSub}>Applicants & Match Ranking</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{applicants.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Overview Strip */}
        <View style={styles.overviewStrip}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNum}>{job.workersHired}/{job.workersRequired}</Text>
            <Text style={styles.overviewLabel}>Hired / Needed</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewNum, { color: T.primary }]}>{formatWage(job.maxWage)}</Text>
            <Text style={styles.overviewLabel}>Budget/Day</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNum}>{job.startTime}</Text>
            <Text style={styles.overviewLabel}>Shift Start</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ranked by Compatibility</Text>
          <Text style={styles.sectionSub}>Location · Rating · Verification</Text>
        </View>

        {/* Applicant Cards */}
        {applicants.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Feather name="users" size={32} color={T.textMuted} />
            <Text style={styles.emptyTitle}>No applicants yet</Text>
            <Text style={styles.emptySub}>Matching Engine is dispatching your gig to verified workers nearby.</Text>
          </View>
        ) : (
          applicants.map((app) => {
            const matchResult = computeJobWorkerMatch(job, app.worker);

            return (
              <View key={app.id} style={styles.applicantCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <GigEasyAvatar name={app.worker.name} size={46} showVerified />
                  <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.workerName}>{app.worker.name}</Text>
                      {app.worker.verificationStatus === 'verified' && (
                        <GigEasyVerifiedBadge small />
                      )}
                    </View>
                    <View style={styles.metaRow}>
                      <GigEasyRating rating={app.worker.rating} />
                      <Text style={styles.metaDot}>·</Text>
                      <GigEasyTrustScore score={app.worker.trustScore} />
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{app.worker.experienceYears}y exp</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: T.primaryMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: T.primary }}>{matchResult.totalScore}%</Text>
                  </View>
                </View>

                {/* Proposed Wage Banner */}
                <View style={styles.wageBox}>
                  <Text style={styles.wageBoxLabel}>Proposed Daily Wage</Text>
                  <Text style={styles.wageBoxValue}>{formatWage(app.proposedWage)}/day</Text>
                </View>

                {/* Match signals */}
                <View style={styles.reasonsList}>
                  {matchResult.reasons.slice(0, 2).map((reason: string, idx: number) => (
                    <View key={idx} style={styles.reasonRow}>
                      <Feather name="check-circle" size={12} color={T.primary} />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => {
                      setSelectedApplicant(app);
                      setCounterWage(String(app.proposedWage));
                      setCounterModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.counterBtnText}>Counter Offer</Text>
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
          })
        )}
      </ScrollView>

      {/* Counter-Offer Modal */}
      <Modal
        visible={counterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCounterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Counter-Offer</Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <Feather name="x" size={20} color={T.ink} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Propose a revised daily rate to {selectedApplicant?.worker.name}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Counter Wage (₹ / Day)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="number-pad"
                value={counterWage}
                onChangeText={setCounterWage}
                placeholder="e.g. 950"
                placeholderTextColor={T.textMuted}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                multiline
                numberOfLines={2}
                value={counterMessage}
                onChangeText={setCounterMessage}
                placeholder="e.g. Can do ₹950 if you can arrive 30 mins early"
                placeholderTextColor={T.textMuted}
              />
            </View>

            <GigEasyButton
              label="Send Counter-Offer"
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
  container: { flex: 1, backgroundColor: T.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: Spacing[3],
  },
  backBtn: { padding: Spacing[1] },
  navTitleWrap: { flex: 1 },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: T.ink,
  },
  navSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  countBadge: {
    backgroundColor: T.primaryMuted,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  countBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
  },
  scrollContent: { paddingBottom: Spacing[8] },
  overviewStrip: {
    flexDirection: 'row',
    backgroundColor: T.white,
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: T.ink,
    letterSpacing: -0.3,
  },
  overviewLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: T.textSecondary,
    marginTop: 1,
  },
  stripDivider: { width: 1, height: 28, backgroundColor: T.border },
  sectionHeaderRow: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: T.ink,
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
    marginTop: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing[12],
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: T.ink,
  },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textSecondary,
    textAlign: 'center',
  },
  applicantCard: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    color: T.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: T.textSecondary,
  },
  metaDot: { color: T.textMuted, fontSize: 10 },
  wageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.primaryMuted,
    padding: Spacing[2.5],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: T.primaryLight,
    marginBottom: Spacing[2.5],
  },
  wageBoxLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: T.textSecondary,
  },
  wageBoxValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.base,
    color: T.primary,
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
    color: T.ink,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingTop: Spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  counterBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: T.primary,
    alignItems: 'center',
  },
  counterBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.primary,
  },
  hireBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: T.primary,
    alignItems: 'center',
  },
  hireBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 43, 58, 0.60)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.white,
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
    color: T.ink,
  },
  modalSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textSecondary,
    marginBottom: Spacing[4],
  },
  modalInputGroup: {
    marginBottom: Spacing[4],
  },
  modalInputLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: T.ink,
    marginBottom: Spacing[1],
  },
  modalInput: {
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2.5],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: T.ink,
  },
  modalTextArea: {
    minHeight: 60,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
});
