// Worker Detail Screen (Employer Inspection) — Trust Scorecard, Verified History & Direct Hire
// Brand Blue (#6497B2) Palette · Simple & Confident

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
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
  GigEasyButton,
} from '../../components';
import { MOCK_WORKERS, formatWage, formatDate } from '../../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerDetail'>;

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

export const WorkerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workerId } = route.params;
  const worker = MOCK_WORKERS.find((w) => w.id === workerId) ?? MOCK_WORKERS[0];

  const handleDirectOffer = () => {
    Alert.alert(
      'Send Direct Job Offer',
      `Dispatch instant job offer to ${worker.name} at their benchmark rate of ${formatWage(worker.expectedDailyWage)}/day?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Offer',
          onPress: () => {
            Alert.alert(
              'Offer Dispatched',
              `${worker.name} has been sent an instant notification with your offer details.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Nav Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Worker Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Worker Hero Profile */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <GigEasyAvatar
              name={worker.name}
              photoUri={worker.profilePhoto}
              size={64}
            />
            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                {worker.verificationStatus === 'verified' && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color={T.primary} />
                )}
              </View>
              <Text style={styles.workerSub}>
                {worker.experienceYears}y experience · {worker.location.city}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#D97706" />
                <Text style={styles.ratingText}>{worker.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({worker.completedJobs} gigs)</Text>
              </View>
            </View>
          </View>

          {/* Wage Benchmark */}
          <View style={styles.wageBox}>
            <Text style={styles.wageLabel}>BENCHMARK DAILY RATE</Text>
            <Text style={styles.wageValue}>{formatWage(worker.expectedDailyWage)}/day</Text>
          </View>
        </View>

        {/* Trust Score Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="shield-check" size={20} color={T.primary} />
            <Text style={styles.cardTitle}>Trust & Verification Audit</Text>
          </View>

          <View style={styles.trustScoreBar}>
            <Text style={styles.trustScoreNumber}>{worker.trustScore}/100 PTS</Text>
            <Text style={styles.trustScoreLabel}>Verified Work Record</Text>
          </View>

          <View style={styles.auditRow}>
            <Feather name="check" size={12} color={T.primary} strokeWidth={2.5} />
            <Text style={styles.auditText}>Aadhaar Identity Verified</Text>
          </View>
          <View style={styles.auditRow}>
            <Feather name="check" size={12} color={T.primary} strokeWidth={2.5} />
            <Text style={styles.auditText}>98% On-Time Shift Attendance</Text>
          </View>
          <View style={styles.auditRow}>
            <Feather name="check" size={12} color={T.primary} strokeWidth={2.5} />
            <Text style={styles.auditText}>Zero dispute flags in past 12 months</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verified Skills</Text>
          <View style={styles.skillsGrid}>
            {worker.skills.map((skill) => (
              <View key={skill.id} style={styles.skillChip}>
                <Feather name="check" size={11} color={T.primary} strokeWidth={2.5} />
                <Text style={styles.skillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Past Work Reviews */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Work History</Text>
          {worker.workHistory.length === 0 ? (
            <Text style={styles.noReviews}>No previous records on file.</Text>
          ) : (
            worker.workHistory.map((item) => (
              <View key={item.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewJob}>{item.jobTitle}</Text>
                  <GigEasyRating rating={item.rating} />
                </View>
                <Text style={styles.reviewEmployer}>{item.employerName} · {formatDate(item.date)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Offer Action */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={`Send Direct Offer (${formatWage(worker.expectedDailyWage)}/day)`}
          onPress={handleDirectOffer}
          variant="primary"
          size="lg"
          fullWidth
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: Spacing[1] },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: T.ink,
  },
  placeholder: { width: 24 },
  scrollContent: { paddingBottom: 100 },
  heroCard: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  heroInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: T.ink,
  },
  workerSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.ink,
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textMuted,
  },
  wageBox: {
    backgroundColor: T.primaryMuted,
    padding: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  wageLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: T.primary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  wageValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: T.primary,
  },
  card: {
    backgroundColor: T.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: BorderRadius.lg,
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
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: T.ink,
    marginBottom: 8,
  },
  trustScoreBar: {
    backgroundColor: T.primaryMuted,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustScoreNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.md,
    color: T.primary,
  },
  trustScoreLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.primary,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  auditText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textSecondary,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: T.primaryLight,
  },
  skillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.primary,
  },
  reviewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewJob: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: T.ink,
  },
  reviewEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: T.textSecondary,
  },
  noReviews: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: T.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: T.border,
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
});
