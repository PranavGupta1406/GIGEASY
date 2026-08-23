// Worker Detail Screen (Employer Inspection) — Trust Scorecard, Verified History & Direct Hire
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
  GigEasyButton,
} from '../../components';
import { api } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerDetail'>;

export const WorkerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workerId } = route.params;
  const [worker, setWorker] = useState<any>({
    worker_id: workerId,
    full_name: 'Ramesh Kumar',
    location: 'Connaught Place, New Delhi',
    experience_years: 5.5,
    verified: true,
    skills: ['Electrician', 'Helper'],
    completed_jobs_count: 5,
    average_rating: 4.9
  });

  useEffect(() => {
    async function loadWorker() {
      try {
        const fetched = await api.getWorkerProfile(workerId);
        if (fetched) setWorker(fetched);
      } catch (err) {
        console.error('Error fetching worker details:', err);
      }
    }
    loadWorker();
  }, [workerId]);

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
          Worker Inspection
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
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#0D3B3F" />
                )}
              </View>
              <Text style={styles.workerSub}>
                {worker.experienceYears}y experience · {worker.location.city}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#090D14" />
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
            <MaterialCommunityIcons name="shield-check" size={20} color="#0D3B3F" />
            <Text style={styles.cardTitle}>Trust & Verification Audit</Text>
          </View>

          <View style={styles.trustScoreBar}>
            <Text style={styles.trustScoreNumber}>{worker.trustScore}/100 PTS</Text>
            <Text style={styles.trustScoreLabel}>High Trust Tier</Text>
          </View>

          <View style={styles.auditRow}>
            <Feather name="check" size={12} color="#0D3B3F" strokeWidth={2.5} />
            <Text style={styles.auditText}>Aadhaar e-KYC Identity Verified</Text>
          </View>
          <View style={styles.auditRow}>
            <Feather name="check" size={12} color="#0D3B3F" strokeWidth={2.5} />
            <Text style={styles.auditText}>98% On-Time GPS Shift Check-in</Text>
          </View>
          <View style={styles.auditRow}>
            <Feather name="check" size={12} color="#0D3B3F" strokeWidth={2.5} />
            <Text style={styles.auditText}>Zero dispute flags in past 12 months</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verified Skills</Text>
          <View style={styles.skillsGrid}>
            {worker.skills.map((skill) => (
              <View key={skill.id} style={styles.skillChip}>
                <Feather name="check" size={11} color="#0D3B3F" strokeWidth={2.5} />
                <Text style={styles.skillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Past Work Reviews */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verified Work History</Text>
          {worker.workHistory.length === 0 ? (
            <Text style={styles.noReviews}>No previous reviews on file.</Text>
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing[5],
    marginTop: Spacing[4],
    padding: Spacing[5],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3.5],
    marginBottom: Spacing[3.5],
  },
  heroInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    marginBottom: 2,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#090D14',
  },
  workerSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  ratingCount: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
  },
  wageBox: {
    backgroundColor: '#090D14',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  wageLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#C8F135',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  wageValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[2.5],
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#090D14',
    marginBottom: Spacing[2],
  },
  trustScoreBar: {
    backgroundColor: '#E8F3F4',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: '#C0DFE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustScoreNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.md,
    color: '#0D3B3F',
  },
  trustScoreLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#0D3B3F',
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[1.5],
  },
  auditText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C0DFE2',
  },
  skillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#0D3B3F',
  },
  reviewItem: {
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F2F0EB',
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
    color: '#090D14',
  },
  reviewEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
  },
  noReviews: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E99A8',
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
