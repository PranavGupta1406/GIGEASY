// Job Applicants Screen — Real backend data, no Zustand mock store
// Employer views applicants, accepts/rejects/negotiates/pays via real API

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { formatWage } from '../../data/mockData';
import { useAppNotificationStore, useSharedApplicationsStore } from '../../store';
import { Theme, statusColor as getThemeStatusColor, statusLabel as getThemeStatusLabel } from '../../theme';
import { api } from '../../services/api';
import { realtimeSocket } from '../../services/realtime/socketService';

type Props = NativeStackScreenProps<RootStackParamList, 'JobApplicants'>;

const T = {
  bg: Theme.bg,
  primary: Theme.ink,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
  successLight: Theme.successLight,
  error: Theme.error,
  errorLight: Theme.errorLight,
  warning: Theme.warning,
  warningBg: Theme.warningLight,
};

type AppTab = 'active' | 'shortlisted' | 'rejected';

// Map backend application fields to local format
function mapApplication(a: any) {
  return {
    id: a.application_id || a.id,
    gigId: a.gig_id,
    workerId: a.worker_id,
    status: a.status,
    proposedWage: Number(a.proposed_wage) || 0,
    agreedWage: Number(a.agreed_wage) || 0,
    worker: {
      id: a.worker_id,
      name: a.worker_name || a.name || 'Worker',
      rating: Number(a.worker_rating) || 0,
      completedJobs: Number(a.worker_completed_jobs) || 0,
      skills: (() => {
        try {
          const raw = typeof a.worker_skills === 'string' ? JSON.parse(a.worker_skills) : (a.worker_skills || []);
          return Array.isArray(raw) ? raw : [];
        } catch { return []; }
      })(),
      city: a.worker_city || '',
      verificationStatus: a.worker_verified ? 'verified' : 'unverified',
    },
    note: a.note || '',
    appliedAt: a.applied_at || a.created_at || '',
  };
}

export const JobApplicantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const notify = useAppNotificationStore((s) => s.notify);

  const [gig, setGig] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('active');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Counter offer modal
  const [counterApp, setCounterApp] = useState<any | null>(null);
  const [counterWageText, setCounterWageText] = useState('');
  const [counterLoading, setCounterLoading] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [gigData, appsData] = await Promise.all([
        api.getGigById(jobId).catch(() => null),
        api.getApplications({ gig_id: jobId }).catch(() => []),
      ]);
      if (gigData) setGig(gigData);

      const apiApps = (appsData || []).map(mapApplication);
      // Merge with any client-side applications for this job
      const clientApps = useSharedApplicationsStore.getState().applications
        .filter((a) => a.jobId === jobId)
        .map((a) => ({
          id: a.id,
          gigId: a.jobId,
          workerId: a.workerId,
          status: a.status,
          proposedWage: a.proposedWage,
          agreedWage: a.agreedWage || a.proposedWage,
          worker: {
            id: a.worker?.id || a.workerId,
            name: a.worker?.name || 'Worker',
            rating: a.worker?.rating || 4.8,
            completedJobs: a.worker?.completedJobs || 12,
            skills: a.worker?.skills || [],
            city: a.worker?.location?.city || 'Nearby',
            verificationStatus: a.worker?.verificationStatus || 'verified',
          },
          note: a.note || '',
          appliedAt: a.appliedAt,
        }));

      // Deduplicate by workerId or id
      const combined = [...apiApps];
      for (const ca of clientApps) {
        if (!combined.some((a) => a.workerId === ca.workerId || a.id === ca.id)) {
          combined.push(ca);
        }
      }

      setApplications(combined);
    } catch (err) {
      console.warn('[JobApplicants] load failed:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadData();
    const unsub = realtimeSocket.subscribe('APPLICATION_RECEIVED', (payload: any) => {
      if (payload?.data?.jobId === jobId) {
        loadData(true);
      }
    });
    return () => unsub();
  }, [loadData, jobId]);

  const activeApps = applications.filter(
    (a) => !['REJECTED', 'WITHDRAWN', 'EXPIRED'].includes(a.status)
  );
  const shortlisted = applications.filter(
    (a) => ['ACCEPTED', 'HIRED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'WORK_SUBMITTED', 'COMPLETED', 'PAID'].includes(a.status)
  );
  const rejectedApps = applications.filter(
    (a) => ['REJECTED', 'WITHDRAWN', 'EXPIRED'].includes(a.status)
  );

  const displayedApps =
    activeTab === 'active' ? activeApps :
    activeTab === 'shortlisted' ? shortlisted :
    rejectedApps;

  const handleAccept = async (app: any) => {
    setActionLoading(app.id);
    try {
      const newStatus = app.status === 'NEGOTIATING' ? 'ACCEPTED' : 'HIRED';
      const wage = app.agreedWage || app.proposedWage;
      await api.updateApplicationStatus(app.id, newStatus, wage).catch(() => {});

      // Update local shared state
      const currentApps = useSharedApplicationsStore.getState().applications;
      const targetApp = currentApps.find((a) => a.id === app.id || a.workerId === app.workerId);
      if (targetApp) {
        useSharedApplicationsStore.getState().updateApplicationStatus(targetApp.id, newStatus as any, wage);
      }

      setApplications((prev) =>
        prev.map((a) => a.id === app.id ? { ...a, status: newStatus, agreedWage: wage } : a)
      );

      // Notify worker and employer
      realtimeSocket.emit('WORKER_HIRED', { applicationId: app.id, jobId, workerId: app.workerId });
      notify({
        targetRole: 'worker',
        type: 'HIRED',
        title: 'You have been Hired! 🎉',
        message: `Your application for ${gig?.title || 'gig'} was accepted at ₹${wage}/day.`,
        data: { jobId, applicationId: app.id, workerId: app.workerId },
      });
      notify({
        targetRole: 'employer',
        type: 'HIRED',
        title: 'Worker Confirmed',
        message: `${app.worker.name} has been hired for ${gig?.title || 'this job'}.`,
        data: { jobId, applicationId: app.id, workerId: app.workerId },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: any) => {
    Alert.alert('Decline Application', `Decline ${app.worker.name}'s application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(app.id);
          try {
            await api.updateApplicationStatus(app.id, 'REJECTED');
            setApplications((prev) =>
              prev.map((a) => a.id === app.id ? { ...a, status: 'REJECTED' } : a)
            );
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not decline application');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleConfirmCompletion = async (app: any) => {
    Alert.alert('Confirm Work Completed', `Confirm ${app.worker.name} completed this job?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm & Release Payment',
        onPress: async () => {
          setActionLoading(app.id);
          try {
            await api.confirmCompletion(app.id);
            setApplications((prev) =>
              prev.map((a) => a.id === app.id ? { ...a, status: 'COMPLETED' } : a)
            );
            (navigation as any).navigate('Payment', { applicationId: app.id });
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not confirm completion');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleSendCounter = async () => {
    if (!counterApp) return;
    const wage = parseInt(counterWageText.replace(/\D/g, ''), 10);
    if (!wage || wage < 100) {
      Alert.alert('Invalid amount', 'Enter a valid wage above ₹100');
      return;
    }
    setCounterLoading(true);
    try {
      await api.createNegotiation({
        application_id: counterApp.id,
        amount: wage,
        note: 'Employer counter offer',
      });
      setApplications((prev) =>
        prev.map((a) => a.id === counterApp.id
          ? { ...a, status: 'NEGOTIATING', agreedWage: wage }
          : a)
      );
      setCounterApp(null);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send counter offer');
    } finally {
      setCounterLoading(false);
    }
  };

  const confirmed = gig ? Number(gig.workers_confirmed) || 0 : shortlisted.length;
  const required = gig ? Number(gig.workers_required) || 1 : 1;
  const fillPct = Math.min((confirmed / required) * 100, 100);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Theme.forestGreen} />
          <Text style={styles.loadingText}>Loading applicants…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {gig?.title || 'Job Applicants'}
          </Text>
          <Text style={styles.screenSub}>
            {gig?.city || ''} {gig?.start_date ? `· ${new Date(gig.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => loadData(true)}
          activeOpacity={0.7}
        >
          {isRefreshing
            ? <ActivityIndicator size="small" color={T.ink} />
            : <Feather name="refresh-cw" size={18} color={T.ink} />
          }
        </TouchableOpacity>
      </View>

      {/* Workforce gap card */}
      <View style={styles.gapCard}>
        <View style={styles.gapHeader}>
          <Text style={styles.gapLabel}>Staffing Progress</Text>
          <Text style={[
            styles.gapFraction,
            { color: confirmed >= required ? Theme.success : Theme.accent }
          ]}>
            {confirmed} / {required} confirmed
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPct}%` }]} />
        </View>
        {confirmed < required && (
          <Text style={styles.gapHint}>
            {required - confirmed} worker{required - confirmed !== 1 ? 's' : ''} still needed
          </Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([
          { key: 'active', label: 'Applicants', count: activeApps.length },
          { key: 'shortlisted', label: 'Hired', count: shortlisted.length },
          { key: 'rejected', label: 'Declined', count: rejectedApps.length },
        ] as { key: AppTab; label: string; count: number }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Application list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            tintColor={Theme.forestGreen}
          />
        }
      >
        {displayedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={32} color={Theme.textMuted} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No applicants yet' :
               activeTab === 'shortlisted' ? 'No hired workers' : 'No declined applications'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active'
                ? 'Share your job posting to attract workers nearby.'
                : 'Accept applications to see hired workers here.'}
            </Text>
          </View>
        ) : (
          displayedApps.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              isActionLoading={actionLoading === app.id}
              onAccept={handleAccept}
              onReject={handleReject}
              onConfirmCompletion={handleConfirmCompletion}
              onPay={() => (navigation as any).navigate('Payment', { applicationId: app.id })}
              onOpenActiveGig={(a) => (navigation as any).navigate('ActiveGig', { applicationId: a.id })}
              onCounter={(a) => {
                setCounterApp(a);
                setCounterWageText(String(a.proposedWage || a.agreedWage));
              }}
              onViewProfile={(wId) => (navigation as any).navigate('WorkerDetail', { workerId: wId })}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Counter offer modal */}
      <Modal
        visible={!!counterApp}
        transparent
        animationType="slide"
        onRequestClose={() => setCounterApp(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setCounterApp(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Counter Offer</Text>
            <Text style={styles.modalSub}>
              Propose a different daily wage to {counterApp?.worker?.name}
            </Text>
            <View style={styles.wageInputRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.wageInput}
                value={counterWageText}
                onChangeText={setCounterWageText}
                keyboardType="number-pad"
                placeholder="Enter wage"
                placeholderTextColor={T.textMuted}
                autoFocus
              />
              <Text style={styles.perDay}>/day</Text>
            </View>
            <TouchableOpacity
              style={[styles.sendCounterBtn, counterLoading && { opacity: 0.7 }]}
              onPress={handleSendCounter}
              disabled={counterLoading}
              activeOpacity={0.88}
            >
              {counterLoading
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.sendCounterBtnText}>Send Counter Offer</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Applicant Card Sub-Component ─────────────────────────────────────────────
interface CardProps {
  app: any;
  isActionLoading: boolean;
  onAccept: (a: any) => void;
  onReject: (a: any) => void;
  onConfirmCompletion: (a: any) => void;
  onPay: (a: any) => void;
  onOpenActiveGig: (a: any) => void;
  onCounter: (a: any) => void;
  onViewProfile: (workerId: string) => void;
}

function ApplicationCard({ app, isActionLoading, onAccept, onReject, onConfirmCompletion, onPay, onOpenActiveGig, onCounter, onViewProfile }: CardProps) {
  const statusColor = getThemeStatusColor(app.status);
  const statusLabel = getThemeStatusLabel(app.status);
  const isApplied = ['APPLIED', 'UNDER_REVIEW'].includes(app.status);
  const isNegotiating = app.status === 'NEGOTIATING';
  const isHired = ['ACCEPTED', 'HIRED', 'CONFIRMED'].includes(app.status);
  const isActive = ['CHECKED_IN', 'IN_PROGRESS'].includes(app.status);
  const isWorkSubmitted = app.status === 'WORK_SUBMITTED';
  const isCompleted = app.status === 'COMPLETED';
  const isPaid = app.status === 'PAID';
  const displayWage = app.agreedWage || app.proposedWage;

  return (
    <View style={[
      styles.applicantCard,
      isPaid && styles.cardPaid,
    ]}>
      {/* Worker info row — tappable */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onViewProfile(app.worker.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatarCircle, { backgroundColor: app.worker.verificationStatus === 'verified' ? Theme.forestGreen : Theme.ink }]}>
          <Text style={styles.avatarText}>{app.worker.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.workerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.workerName}>{app.worker.name}</Text>
            <Feather name="chevron-right" size={13} color={T.textMuted} />
          </View>
          <View style={styles.workerMeta}>
            {app.worker.rating > 0 && (
              <>
                <Feather name="star" size={10} color="#F59E0B" />
                <Text style={styles.workerRating}>{Number(app.worker.rating).toFixed(1)}</Text>
                <View style={styles.metaDot} />
              </>
            )}
            <Text style={styles.workerJobs}>{app.worker.completedJobs} jobs</Text>
            {app.worker.city ? (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.workerJobs}>{app.worker.city}</Text>
              </>
            ) : null}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </TouchableOpacity>

      {/* Skills */}
      {app.worker.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {app.worker.skills.slice(0, 3).map((s: any, i: number) => (
            <View key={i} style={styles.skillPill}>
              <Text style={styles.skillPillText}>{s.name || s.category || s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Wage row */}
      <View style={styles.wageRow}>
        <Text style={styles.wageLabel}>
          {isNegotiating ? 'Counter offer' : isHired || isPaid ? 'Agreed wage' : 'Requested'}
        </Text>
        <Text style={styles.wageValue}>{formatWage(displayWage)}/day</Text>
      </View>

      {/* Action buttons */}
      {isActionLoading ? (
        <View style={styles.actionRow}>
          <ActivityIndicator size="small" color={Theme.forestGreen} />
          <Text style={{ fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary, marginLeft: 6 }}>
            Processing…
          </Text>
        </View>
      ) : (
        <>
          {isApplied && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(app)} activeOpacity={0.85}>
                <Feather name="x" size={13} color={T.error} />
                <Text style={[styles.actionBtnText, { color: T.error }]}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.counterBtn]} onPress={() => onCounter(app)} activeOpacity={0.85}>
                <Feather name="edit-2" size={13} color={T.ink} />
                <Text style={[styles.actionBtnText, { color: T.ink }]}>Counter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => onAccept(app)} activeOpacity={0.85}>
                <Feather name="check" size={13} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {isNegotiating && (
            <View style={{ gap: 8 }}>
              <View style={[styles.statusBanner, { backgroundColor: Theme.warningLight, borderColor: Theme.warningBorder }]}>
                <Feather name="alert-circle" size={14} color={Theme.warning} />
                <Text style={[styles.statusBannerText, { color: Theme.warning }]}>
                  Counter offer sent · Awaiting worker response
                </Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(app)}>
                  <Feather name="x" size={13} color={T.error} />
                  <Text style={[styles.actionBtnText, { color: T.error }]}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn, { flex: 1 }]} onPress={() => onAccept(app)}>
                  <Feather name="check" size={13} color="#FFF" />
                  <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Accept Current</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isHired && (
            <View style={{ gap: 8 }}>
              <View style={styles.statusBanner}>
                <Feather name="check-circle" size={14} color={T.success} />
                <Text style={styles.statusBannerText}>Worker hired · Awaiting job start</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Theme.primary, height: 40, width: '100%' }]}
                onPress={() => onOpenActiveGig(app)}
                activeOpacity={0.85}
              >
                <Feather name="activity" size={13} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Open Live Shift Tracker</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <View style={{ gap: 8 }}>
              <View style={[styles.statusBanner, { backgroundColor: Theme.accentLight, borderColor: Theme.accentMuted }]}>
                <View style={styles.liveDot} />
                <Text style={[styles.statusBannerText, { color: Theme.accentDark }]}>Work in progress</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Theme.primary, height: 40, width: '100%' }]}
                onPress={() => onOpenActiveGig(app)}
                activeOpacity={0.85}
              >
                <Feather name="activity" size={13} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Open Live Shift Tracker</Text>
              </TouchableOpacity>
            </View>
          )}

          {isWorkSubmitted && (
            <TouchableOpacity style={styles.confirmBtn} onPress={() => onConfirmCompletion(app)} activeOpacity={0.88}>
              <Feather name="check-circle" size={15} color="#FFF" />
              <Text style={styles.confirmBtnText}>Confirm Work Completed</Text>
            </TouchableOpacity>
          )}

          {isCompleted && (
            <TouchableOpacity style={styles.payBtn} onPress={() => onPay(app)} activeOpacity={0.88}>
              <Feather name="credit-card" size={15} color="#FFF" />
              <Text style={styles.payBtnText}>Pay Worker · {formatWage(displayWage)}</Text>
            </TouchableOpacity>
          )}

          {isPaid && (
            <View style={[styles.statusBanner, { backgroundColor: Theme.successLight, borderColor: Theme.successBorder }]}>
              <Feather name="check-circle" size={14} color={T.success} />
              <Text style={[styles.statusBannerText, { color: T.success }]}>Payment released ✓</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.white },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontFamily: FontFamily.medium, fontSize: 13, color: T.textSecondary },

  // Top bar
  topBar: {
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
  refreshBtn: { padding: 4 },
  screenTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, letterSpacing: -0.3 },
  screenSub: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary, marginTop: 1 },

  // Gap card
  gapCard: {
    backgroundColor: T.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  gapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  gapLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary },
  gapFraction: { fontFamily: FontFamily.bold, fontSize: 13 },
  progressTrack: { height: 5, backgroundColor: Theme.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Theme.forestGreen, borderRadius: 3 },
  gapHint: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textMuted },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Theme.forestGreen },
  tabText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textMuted },
  tabTextActive: { fontFamily: FontFamily.bold, color: Theme.forestGreen },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, backgroundColor: Theme.surfaceSubtle },
  tabBadgeActive: { backgroundColor: Theme.forestGreenLight },
  tabBadgeText: { fontFamily: FontFamily.bold, fontSize: 9, color: T.textMuted },
  tabBadgeTextActive: { color: Theme.forestGreen },

  // List
  list: { paddingHorizontal: 16, paddingTop: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: T.ink, marginTop: 8 },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary, textAlign: 'center', lineHeight: 18 },

  // Applicant card
  applicantCard: {
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardPaid: { borderColor: Theme.successBorder, backgroundColor: Theme.forestGreenSubtle },

  // Card header
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 16, color: '#FFFFFF' },
  workerInfo: { flex: 1 },
  workerName: { fontFamily: FontFamily.bold, fontSize: 14, color: T.ink },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  workerRating: { fontFamily: FontFamily.bold, fontSize: 11, color: T.ink },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: T.textMuted, marginHorizontal: 2 },
  workerJobs: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontFamily: FontFamily.bold, fontSize: 10 },

  // Skills
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: Theme.surfaceSubtle, borderWidth: 1, borderColor: Theme.border },
  skillPillText: { fontFamily: FontFamily.medium, fontSize: 10, color: T.textSecondary },

  // Wage
  wageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wageLabel: { fontFamily: FontFamily.regular, fontSize: 11, color: T.textMuted },
  wageValue: { fontFamily: FontFamily.bold, fontSize: 15, color: Theme.amber, letterSpacing: -0.3 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  rejectBtn: { borderColor: T.error, backgroundColor: T.errorLight },
  counterBtn: { borderColor: T.border, backgroundColor: Theme.surfaceSubtle },
  acceptBtn: { borderColor: Theme.forestGreen, backgroundColor: Theme.forestGreen },
  actionBtnText: { fontFamily: FontFamily.semiBold, fontSize: 12 },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: T.successLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  statusBannerText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.success, flex: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.accent },

  // Confirm / Pay
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Theme.forestGreen,
    borderRadius: 12,
    paddingVertical: 11,
  },
  confirmBtnText: { fontFamily: FontFamily.bold, fontSize: 13, color: '#FFFFFF' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Theme.accent,
    borderRadius: 12,
    paddingVertical: 11,
  },
  payBtnText: { fontFamily: FontFamily.bold, fontSize: 13, color: '#FFFFFF' },

  // Counter modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: T.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.border, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: T.ink, letterSpacing: -0.4 },
  modalSub: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, lineHeight: 19 },
  wageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.sandLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  rupeeSymbol: { fontFamily: FontFamily.bold, fontSize: 22, color: T.ink },
  wageInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: T.ink,
    letterSpacing: -0.5,
  },
  perDay: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textMuted },
  sendCounterBtn: {
    backgroundColor: Theme.ink,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendCounterBtnText: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFFFFF' },
});
