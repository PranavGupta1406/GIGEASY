// Job Applicants Screen — Real Accept / Reject / Pay flow
// Reads from shared store — changes instantly visible to workers

import React, { useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, formatWage, getStatusLabel, getStatusColor } from '../../data/mockData';
import { useSharedApplicationsStore, useEmployerStore } from '../../store';
import { JobApplication } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApplicants'>;

const T = {
  bg: '#F8FAFC',
  primary: '#1A68D5',
  primaryMuted: '#EBF3FC',
  ink: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningBg: '#FEF3C7',
};

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;

  const employerJobs = useEmployerStore((s) => s.jobs);
  const job = employerJobs.find((j) => j.id === jobId) ?? MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];

  const { getJobApplications, acceptApplication, rejectApplication, payWorker } = useSharedApplicationsStore();
  const applicants = getJobApplications(jobId);

  // Active (not yet paid/rejected)
  const activeApplicants = applicants.filter(a => !['REJECTED', 'WITHDRAWN', 'EXPIRED'].includes(a.status));
  const rejectedApplicants = applicants.filter(a => a.status === 'REJECTED');

  const handleAccept = (app: JobApplication) => {
    Alert.alert(
      'Accept Worker',
      `Hire ${app.worker.name} for ${formatWage(app.proposedWage)}/day?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Hire',
          style: 'default',
          onPress: () => {
            acceptApplication(app.id);
          },
        },
      ]
    );
  };

  const handleReject = (app: JobApplication) => {
    Alert.alert(
      'Decline Applicant',
      `Decline ${app.worker.name}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => rejectApplication(app.id),
        },
      ]
    );
  };

  const handlePay = (app: JobApplication) => {
    Alert.alert(
      `Pay ${app.worker.name}`,
      `Transfer ${formatWage(app.proposedWage)} via UPI?\n\nAmount will be sent to their registered UPI ID.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ${formatWage(app.proposedWage)}`,
          style: 'default',
          onPress: () => {
            payWorker(app.id);
            Alert.alert('Payment Sent ✓', `${formatWage(app.proposedWage)} has been transferred to ${app.worker.name}.`);
          },
        },
      ]
    );
  };

  const renderApplicantCard = (app: JobApplication) => {
    const statusColor = getStatusColor(app.status);
    const statusLabel = getStatusLabel(app.status);
    const isAccepted = app.status === 'ACCEPTED';
    const isCheckedIn = app.status === 'CHECKED_IN';
    const isCompleted = app.status === 'COMPLETED' || app.status === 'IN_PROGRESS';
    const isPaid = app.status === 'PAID';
    const isApplied = app.status === 'APPLIED' || app.status === 'UNDER_REVIEW';
    const isRejected = app.status === 'REJECTED';

    return (
      <View
        key={app.id}
        style={[
          styles.applicantCard,
          isPaid && styles.cardPaid,
          isRejected && styles.cardRejected,
        ]}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {app.worker.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{app.worker.name}</Text>
            <View style={styles.workerMeta}>
              <Feather name="star" size={11} color="#F59E0B" />
              <Text style={styles.workerRating}>{app.worker.rating}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.workerJobs}>{app.worker.completedJobs} jobs done</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Skills */}
        {app.worker.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {app.worker.skills.slice(0, 2).map((skill) => (
              <View key={skill.id} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill.name}</Text>
              </View>
            ))}
            <View style={styles.locationPill}>
              <Feather name="map-pin" size={10} color={T.textMuted} />
              <Text style={styles.locationPillText}>{app.worker.location.city}</Text>
            </View>
          </View>
        )}

        {/* Proposed wage */}
        <View style={styles.wageRow}>
          <Text style={styles.wageLabel}>Agreed Wage</Text>
          <Text style={styles.wageValue}>{formatWage(app.proposedWage)}/day</Text>
        </View>

        {/* Action buttons based on status */}
        {isApplied && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(app)}
              activeOpacity={0.85}
            >
              <Feather name="x" size={14} color={T.error} />
              <Text style={[styles.actionBtnText, { color: T.error }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleAccept(app)}
              activeOpacity={0.85}
            >
              <Feather name="check" size={14} color={T.white} />
              <Text style={[styles.actionBtnText, { color: T.white }]}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={14} color={T.success} />
            <Text style={styles.statusBannerText}>Hired — waiting for worker to check in</Text>
          </View>
        )}

        {isCheckedIn && (
          <View style={[styles.statusBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.statusBannerText, { color: T.primary }]}>Worker is checked in — shift in progress</Text>
          </View>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => handlePay(app)}
            activeOpacity={0.85}
          >
            <Feather name="credit-card" size={15} color={T.white} />
            <Text style={styles.payBtnText}>Pay {formatWage(app.proposedWage)}</Text>
          </TouchableOpacity>
        )}

        {isPaid && (
          <View style={[styles.statusBanner, { backgroundColor: T.successLight, borderColor: '#86EFAC' }]}>
            <Feather name="check-circle" size={14} color={T.success} />
            <Text style={[styles.statusBannerText, { color: T.success }]}>
              {formatWage(app.proposedWage)} Paid ✓
            </Text>
          </View>
        )}

        {isRejected && (
          <View style={[styles.statusBanner, { backgroundColor: T.errorLight, borderColor: '#FECACA' }]}>
            <Text style={[styles.statusBannerText, { color: T.error }]}>Application Declined</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.navSub}>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {applicants.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySub}>Workers will appear here when they apply for this job.</Text>
          </View>
        ) : (
          <>
            {activeApplicants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Applicants</Text>
                {activeApplicants.map(renderApplicantCard)}
              </View>
            )}
            {rejectedApplicants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Declined</Text>
                {rejectedApplicants.map(renderApplicantCard)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: 4 },
  navTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: T.ink },
  navSub: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, marginTop: 1 },
  scroll: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 },

  section: { marginBottom: 8 },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: T.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Applicant Card
  applicantCard: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPaid: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  cardRejected: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 18, color: T.primary },
  workerInfo: { flex: 1 },
  workerName: { fontFamily: FontFamily.bold, fontSize: 15, color: T.ink, marginBottom: 2 },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerRating: { fontFamily: FontFamily.medium, fontSize: 11, color: T.ink },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 2 },
  workerJobs: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: { fontFamily: FontFamily.bold, fontSize: 10.5 },
  skillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  skillPill: {
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  skillPillText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.primary },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  locationPillText: { fontFamily: FontFamily.medium, fontSize: 11, color: T.textMuted },
  wageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  wageLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary },
  wageValue: { fontFamily: FontFamily.extraBold, fontSize: 16, color: T.primary },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  rejectBtn: { borderColor: '#FECACA', backgroundColor: T.errorLight },
  acceptBtn: { borderColor: T.primary, backgroundColor: T.primary },
  actionBtnText: { fontFamily: FontFamily.bold, fontSize: 13 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  statusBannerText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary, flex: 1 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.primary,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.success,
    borderRadius: 12,
    paddingVertical: 12,
  },
  payBtnText: { fontFamily: FontFamily.bold, fontSize: 14, color: T.white },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, marginTop: 14 },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
});
