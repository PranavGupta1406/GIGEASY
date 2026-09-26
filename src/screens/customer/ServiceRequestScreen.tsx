// Customer Household Service Request Screen — SIH 26089
// Household booking flow featuring AI Service Triage, FairWork allocation, and transparent pricing split

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { SkillCategory, WorkerProfile, FairWorkScore } from '../../types';
import { classifyServiceRequest, estimateServicePrice } from '../../services/ai/serviceTriageEngine';
import { rankWorkersWithFairWork, generateAllocationExplanation } from '../../services/allocation/fairWorkEngine';
import { MOCK_WORKERS, formatPaymentBreakdown } from '../../data/mockData';
import { useServiceRequestStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

const CATEGORIES: { category: SkillCategory; icon: string; label: string }[] = [
  { category: 'Plumbing', icon: 'water-pump', label: 'Plumbing' },
  { category: 'Electrical', icon: 'flash', label: 'Electrical' },
  { category: 'Cleaning', icon: 'broom', label: 'Cleaning' },
  { category: 'Appliance Repair', icon: 'tools', label: 'Appliance' },
  { category: 'Caregiving', icon: 'heart-pulse', label: 'Caregiving' },
  { category: 'Carpentry', icon: 'hammer', label: 'Carpentry' },
  { category: 'Painting', icon: 'format-paint', label: 'Painting' },
];

const PRESET_PROBLEMS: Record<string, string[]> = {
  Plumbing: ['Bathroom tap leaking heavily', 'Blocked kitchen drain', 'Water tank overflow', 'Pipe fitting repair'],
  Electrical: ['Switchboard sparking', 'Circuit breaker tripping', 'Ceiling fan installation', 'Inverter wiring check'],
  Cleaning: ['Full 3BHK deep cleaning', 'Sofa and mattress sanitization', 'Kitchen grease clean', 'Post-painting cleanup'],
  'Appliance Repair': ['AC not cooling / gas leak', 'Washing machine drum issue', 'Refrigerator not chilling', 'Microwave repair'],
  Caregiving: ['Elder assistance (8hr shift)', 'Post-hospitalization care', 'Patient mobility support', 'Night nurse assistance'],
};

export const ServiceRequestScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('Plumbing');
  const [description, setDescription] = useState<string>('Kitchen tap is leaking heavily and water pressure is low.');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'emergency'>('normal');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const { createRequest } = useServiceRequestStore();

  // Run AI Triage Engine
  const aiTriage = classifyServiceRequest(description);

  // FairWork Worker Ranking
  const customerLoc = { lat: 28.625, lng: 77.215 }; // Noida Sector 50
  const matchedWorkers = rankWorkersWithFairWork(
    MOCK_WORKERS,
    {
      location: customerLoc,
      skillRequired: {
        id: 'sk_1',
        name: selectedCategory,
        category: selectedCategory,
      },
    },
    urgency === 'emergency' ? 'emergency' : urgency === 'high' ? 'high' : 'medium'
  );

  const activeWorker = matchedWorkers.find((m) => m.worker.id === (selectedWorkerId || matchedWorkers[0]?.worker.id));
  const chosenWorker = activeWorker?.worker || matchedWorkers[0]?.worker;
  const chosenScore = activeWorker?.score || matchedWorkers[0]?.score;

  // Transparent Pricing calculation
  const urgencyLevel = urgency === 'emergency' ? 'emergency' : urgency === 'high' ? 'high' : 'medium';
  const estimatedPrice = estimateServicePrice(
    selectedCategory,
    urgencyLevel,
    aiTriage.estimatedDurationHours
  );
  const totalAmount = estimatedPrice.totalEstimate;
  const priceSplit = formatPaymentBreakdown(totalAmount);

  const handleConfirmBooking = () => {
    if (!chosenWorker) return;

    createRequest({
      serviceCategory: selectedCategory,
      serviceTitle: `${selectedCategory} Service`,
      description,
      urgency: urgencyLevel,
      aiClassification: aiTriage,
      assignedWorkerId: chosenWorker.id,
      assignedWorker: chosenWorker,
      status: 'WORKER_ASSIGNED',
      estimatedArrivalMins: 20,
      estimatedPrice,
    });

    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Feather name="check" size={36} color={Theme.success} />
          </View>
          <Text style={styles.successTitle}>Cooperative Worker Assigned!</Text>
          <Text style={styles.successSub}>
            {chosenWorker.name} ({chosenWorker.cooperativeName}) is on the way.
          </Text>

          {/* Assigned Worker Card */}
          <View style={styles.assignedCard}>
            <View style={styles.assignedHeader}>
              <View style={styles.assignedAvatar}>
                <Text style={styles.assignedInitials}>
                  {chosenWorker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignedName}>{chosenWorker.name}</Text>
                <Text style={styles.assignedCoop}>{chosenWorker.cooperativeName}</Text>
                <Text style={styles.assignedRating}>
                  {chosenWorker.rating}★ · {chosenWorker.completedJobs} verified jobs · Trust: {chosenWorker.trustScore}%
                </Text>
              </View>
            </View>

            <View style={styles.etaRow}>
              <Feather name="clock" size={16} color="#059669" />
              <Text style={styles.etaText}>Estimated Arrival: ~20 Minutes</Text>
            </View>
          </View>

          {/* Price Split Confirmation */}
          <View style={styles.confirmedSplitCard}>
            <Text style={styles.splitHeaderTitle}>Transparent Cooperative Payment</Text>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Total Cost</Text>
              <Text style={styles.splitVal}>₹{priceSplit.totalAmount}</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Worker Direct Earning (82%)</Text>
              <Text style={[styles.splitVal, { color: Theme.success }]}>₹{priceSplit.workerEarning}</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Society Welfare & Insurance (13%)</Text>
              <Text style={styles.splitVal}>₹{priceSplit.cooperativeContribution + priceSplit.welfareContribution}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.ink} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Book Cooperative Service</Text>
        <TouchableOpacity
          style={styles.emergencyPill}
          onPress={() => navigation.navigate('EmergencyService' as any)}
        >
          <Feather name="zap" size={12} color="#DC2626" />
          <Text style={styles.emergencyPillText}>Emergency</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Select Trade Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>1. SELECT SERVICE TRADE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <TouchableOpacity
                  key={cat.category}
                  style={[styles.catCard, isSelected && styles.catCardActive]}
                  onPress={() => setSelectedCategory(cat.category)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={22}
                    color={isSelected ? Theme.surface : Theme.ink}
                  />
                  <Text style={[styles.catLabel, isSelected && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 2: Describe Issue */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>2. DESCRIBE ISSUE (FOR ACCURATE ESTIMATE)</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="Describe what needs to be fixed..."
              placeholderTextColor={Theme.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {/* Quick preset suggestions */}
            <View style={styles.presetsRow}>
              {(PRESET_PROBLEMS[selectedCategory] || PRESET_PROBLEMS['Plumbing']).slice(0, 2).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.presetChip}
                  onPress={() => setDescription(p)}
                >
                  <Text style={styles.presetChipText} numberOfLines={1}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Step 3: Service Scope Assessment Result */}
        <View style={styles.aiTriageCard}>
          <View style={styles.aiTriageHeader}>
            <View style={styles.aiTriageLeft}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={Theme.accent} />
              <Text style={styles.aiTriageTitle}>Service Assessment & Scope</Text>
            </View>
            <View style={styles.confidencePill}>
              <Text style={styles.confidenceText}>
                {Math.round(aiTriage.confidence * 100)}% Confidence
              </Text>
            </View>
          </View>

          <Text style={styles.aiReasoning}>{aiTriage.reasoning}</Text>

          <View style={styles.aiMetaRow}>
            <View style={styles.aiMetaItem}>
              <Text style={styles.aiMetaLabel}>Estimated Time</Text>
              <Text style={styles.aiMetaVal}>{aiTriage.estimatedDurationHours} Hours</Text>
            </View>
            <View style={styles.aiMetaItem}>
              <Text style={styles.aiMetaLabel}>Required Parts</Text>
              <Text style={styles.aiMetaVal}>
                {aiTriage.requiredParts && aiTriage.requiredParts.length > 0
                  ? aiTriage.requiredParts.join(', ')
                  : 'Standard tools'}
              </Text>
            </View>
          </View>
        </View>

        {/* Step 4: FairWork Worker Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>3. FAIRWORK ALLOCATED WORKERS</Text>
            <View style={styles.fairworkTag}>
              <MaterialCommunityIcons name="scale-balance" size={12} color={Theme.olive} />
              <Text style={styles.fairworkTagText}>Equitable Allocation</Text>
            </View>
          </View>

          {matchedWorkers.slice(0, 3).map(({ worker, score }) => {
            const isSelected = (selectedWorkerId || chosenWorker?.id) === worker.id;
            return (
              <TouchableOpacity
                key={worker.id}
                style={[styles.workerCard, isSelected && styles.workerCardSelected]}
                onPress={() => setSelectedWorkerId(worker.id)}
              >
                <View style={styles.workerCardTop}>
                  <View style={styles.workerAvatarWrap}>
                    <Text style={styles.workerInitials}>
                      {worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Text>
                  </View>

                  <View style={styles.workerMainInfo}>
                    <View style={styles.workerNameRow}>
                      <Text style={styles.workerName}>{worker.name}</Text>
                      {score.isRecommendedByFairWork && (
                        <View style={styles.fairworkPriorityBadge}>
                          <Text style={styles.fairworkPriorityText}>FairWork Pick</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.workerCoop}>{worker.cooperativeName}</Text>
                    <Text style={styles.workerRating}>
                      {worker.rating}★ · {worker.completedJobs} jobs · Trust: {worker.trustScore}%
                    </Text>
                  </View>

                  <View style={styles.matchScoreBadge}>
                    <Text style={styles.matchScoreText}>{score.totalScore}%</Text>
                    <Text style={styles.matchScoreTier}>{score.matchTier}</Text>
                  </View>
                </View>

                {/* FairWork Explanation Reason */}
                <View style={styles.fairnessNoteBox}>
                  <Feather name="check" size={12} color={Theme.success} />
                  <Text style={styles.fairnessNoteText}>{score.fairnessNote}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step 5: Transparent Pricing Breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Transparent Pricing Breakdown</Text>
          <Text style={styles.pricingSubtitle}>
            Unlike commercial platforms, no hidden commissions. Workers receive 82% direct.
          </Text>

          <View style={styles.priceRowMain}>
            <Text style={styles.priceMainLabel}>Estimated Total</Text>
            <Text style={styles.priceMainVal}>₹{priceSplit.totalAmount}</Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceSplitRow}>
            <Text style={styles.priceSplitLabel}>Worker Direct Earning (82%)</Text>
            <Text style={[styles.priceSplitVal, { color: Theme.success }]}>
              ₹{priceSplit.workerEarning}
            </Text>
          </View>

          <View style={styles.priceSplitRow}>
            <Text style={styles.priceSplitLabel}>Cooperative Society Fund (8%)</Text>
            <Text style={styles.priceSplitVal}>₹{priceSplit.cooperativeContribution}</Text>
          </View>

          <View style={styles.priceSplitRow}>
            <Text style={styles.priceSplitLabel}>Worker Welfare & Insurance Pool (5%)</Text>
            <Text style={styles.priceSplitVal}>₹{priceSplit.welfareContribution}</Text>
          </View>

          <View style={styles.priceSplitRow}>
            <Text style={styles.priceSplitLabel}>Platform Tech & Server Operations (5%)</Text>
            <Text style={styles.priceSplitVal}>₹{priceSplit.platformFee}</Text>
          </View>
        </View>

        {/* Submit Booking */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking}>
          <Text style={styles.confirmBtnText}>
            Book Verified Cooperative Worker · ₹{priceSplit.totalAmount}
          </Text>
          <Feather name="arrow-right" size={18} color={Theme.surface} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceSubtle,
  },
  topNavTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  emergencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emergencyPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#DC2626',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  catRow: {
    gap: 8,
  },
  catCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    minWidth: 78,
  },
  catCardActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  catLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.ink,
    marginTop: 4,
  },
  catLabelActive: {
    color: Theme.surface,
  },
  inputCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  textInput: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.ink,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
    paddingTop: 8,
  },
  presetChip: {
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  presetChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  aiTriageCard: {
    backgroundColor: Theme.accentLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.accentMuted,
    marginBottom: Spacing.md,
  },
  aiTriageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTriageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTriageTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Theme.accentDark,
  },
  confidencePill: {
    backgroundColor: Theme.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  confidenceText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.accent,
  },
  aiReasoning: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  aiMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.md,
    padding: 8,
  },
  aiMetaItem: {
    flex: 1,
  },
  aiMetaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.textMuted,
  },
  aiMetaVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.ink,
    marginTop: 1,
  },
  fairworkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.oliveLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  fairworkTagText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.olive,
  },
  workerCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.sm,
  },
  workerCardSelected: {
    borderColor: Theme.primary,
    borderWidth: 2,
  },
  workerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workerAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInitials: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.surface,
  },
  workerMainInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  fairworkPriorityBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  fairworkPriorityText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.success,
  },
  workerCoop: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  workerRating: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
  },
  matchScoreBadge: {
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  matchScoreText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  matchScoreTier: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Theme.textMuted,
  },
  fairnessNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  fairnessNoteText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  pricingCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  pricingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  pricingSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
    marginBottom: 8,
  },
  priceRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceMainLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  priceMainVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Theme.ink,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Theme.border,
    marginVertical: 6,
  },
  priceSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  priceSplitLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  priceSplitVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.ink,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  confirmBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
  successContainer: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Theme.ink,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  assignedCard: {
    width: '100%',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  assignedHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  assignedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedInitials: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.surface,
  },
  assignedName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  assignedCoop: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  assignedRating: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  etaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.success,
  },
  confirmedSplitCard: {
    width: '100%',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.lg,
  },
  splitHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
    marginBottom: 6,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  splitLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  splitVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.ink,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Theme.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
});
