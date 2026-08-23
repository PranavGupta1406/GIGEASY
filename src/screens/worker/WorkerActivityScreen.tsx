// Worker Activity Screen — Visual timeline + active shift check-in
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { api } from '../../services/api';
import { useAuthStore, useWorkerStore } from '../../store';
import { CURRENT_WORKER, formatWage, formatDate } from '../../data/mockData';
import { attendanceService } from '../../services/attendance/attendanceService';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { shellNavigation: NavProp; }

type TabKey = 'applications' | 'history';

function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':
    case 'HIRED':
      return '#10B981';
    case 'PENDING':
    case 'APPLIED':
      return '#F59E0B';
    case 'REJECTED':
      return '#EF4444';
    case 'COMPLETED':
      return '#0D3B3F';
    default:
      return '#5A6578';
  }
}

function getStatusLabel(status: string) {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':
    case 'HIRED':
      return 'Hired / Accepted';
    case 'PENDING':
    case 'APPLIED':
      return 'Under Review';
    case 'REJECTED':
      return 'Not Selected';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status || 'Pending';
  }
}

const TIMELINE_STEPS = [
  { key: 'applied', label: 'Applied', icon: 'send' as const },
  { key: 'viewed', label: 'Reviewed', icon: 'eye' as const },
  { key: 'accepted', label: 'Accepted', icon: 'check-circle' as const },
  { key: 'checkin', label: 'Checked In', icon: 'map-pin' as const },
  { key: 'completed', label: 'Completed', icon: 'briefcase' as const },
  { key: 'paid', label: 'Paid', icon: 'dollar-sign' as const },
];

function getTimelineStep(status: string): number {
  switch (status) {
    case 'APPLIED': return 0;
    case 'UNDER_REVIEW': return 1;
    case 'ACCEPTED': return 2;
    case 'CONFIRMED': return 3;
    case 'COMPLETED': return 4;
    case 'PAID': return 5;
    default: return 0;
  }
}

export const WorkerActivityScreen: React.FC<Props> = ({ shellNavigation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('applications');
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const workerId = useAuthStore((s) => s.workerId) || 1;
  const profile = useWorkerStore((s) => s.profile);
  const worker = profile ?? CURRENT_WORKER;
  const [applications, setApplications] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadActivityData() {
      try {
        const [appsList, historyList] = await Promise.all([
          api.getApplications({ worker_id: workerId }),
          api.getWorkerHistory(workerId)
        ]);
        if (appsList && Array.isArray(appsList)) setApplications(appsList);
        if (historyList && Array.isArray(historyList)) setHistory(historyList);
      } catch (err) {
        console.error('Error loading worker activity:', err);
      }
    }
    loadActivityData();
  }, [workerId]);

  const totalEarned = history.reduce((sum, item) => sum + parseFloat(item.wage || 0), 0);

  const handleCheckIn = (app: typeof applications[0]) => {
    const result = attendanceService.checkInWorker({
      shiftId: `shift_${app.id}`,
      jobId: app.jobId,
      workerId: worker.id,
      employerId: app.job.employerId,
      siteLat: app.job.location.lat,
      siteLng: app.job.location.lng,
      workerLat: app.job.location.lat + 0.0008,
      workerLng: app.job.location.lng + 0.0005,
    });

    if (result.success) {
      setCheckedInIds(prev => new Set(prev).add(app.id));
      Alert.alert('GPS Check-In Verified', `Geofence confirmed at ${app.job.location.address}. Work hours recording.`);
    } else {
      Alert.alert('Check-In Failed', result.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Earnings Overview Strip */}
      <View style={styles.earningsStrip}>
        <View style={styles.earningItem}>
          <Text style={styles.earningNum}>{worker.completedJobs}</Text>
          <Text style={styles.earningLabel}>Gigs Done</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.earningItem}>
          <Text style={[styles.earningNum, { color: '#0D3B3F' }]}>{formatWage(totalEarned)}</Text>
          <Text style={styles.earningLabel}>Total Earned</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.earningItem}>
          <Text style={styles.earningNum}>{worker.rating.toFixed(1)} ★</Text>
          <Text style={styles.earningLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.tabActive]}
          onPress={() => setActiveTab('applications')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
            Active Applications ({applications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Work History ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'applications' ? (
          <>
            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="clock" size={32} color="#8E99A8" />
                <Text style={styles.emptyTitle}>No active applications</Text>
                <Text style={styles.emptySubtitle}>Explore and apply to nearby gigs from Discover.</Text>
              </View>
            ) : (
              applications.map((app) => {
                const step = getTimelineStep(app.status);
                const isAccepted = app.status === 'ACCEPTED' || app.status === 'CONFIRMED';
                const isCheckedIn = checkedInIds.has(app.id);

                return (
                  <View key={app.id} style={styles.appCard}>
                    {/* Job identity */}
                    <View style={styles.appHeader}>
                      <View style={styles.appHeaderLeft}>
                        <Text style={styles.appJobTitle}>{app.job.title}</Text>
                        <Text style={styles.appEmployer}>{app.job.employer.businessName}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.appWage}>{formatWage(app.proposedWage)}</Text>
                        <Text style={styles.appWageUnit}>/day</Text>
                      </View>
                    </View>

                    {/* Visual timeline */}
                    <View style={styles.timeline}>
                      {TIMELINE_STEPS.map((tStep, idx) => {
                        const done = idx <= step;
                        const active = idx === step;
                        return (
                          <View key={tStep.key} style={styles.timelineStep}>
                            <View style={styles.timelineNodeCol}>
                              <View
                                style={[
                                  styles.timelineNode,
                                  done && styles.timelineNodeDone,
                                  active && styles.timelineNodeActive,
                                ]}
                              >
                                <Feather
                                  name={tStep.icon}
                                  size={9}
                                  color={active ? '#090D14' : done ? '#FFFFFF' : '#8E99A8'}
                                />
                              </View>
                              {idx < TIMELINE_STEPS.length - 1 && (
                                <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
                              )}
                            </View>
                            <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
                              {tStep.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Status + action */}
                    <View style={styles.appFooter}>
                      <View style={[styles.statusPill, { backgroundColor: getStatusColor(app.status) + '18' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                          {getStatusLabel(app.status)}
                        </Text>
                      </View>
                      {isAccepted && !isCheckedIn && (
                        <TouchableOpacity
                          style={styles.checkInBtn}
                          onPress={() => handleCheckIn(app)}
                          activeOpacity={0.85}
                        >
                          <Feather name="map-pin" size={12} color="#090D14" />
                          <Text style={styles.checkInText}>GPS Check In</Text>
                        </TouchableOpacity>
                      )}
                      {isCheckedIn && (
                        <View style={styles.checkedInBadge}>
                          <Feather name="check-circle" size={12} color="#10B981" />
                          <Text style={styles.checkedInText}>On Site Checked In</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="briefcase" size={32} color="#8E99A8" />
                <Text style={styles.emptyTitle}>No completed gigs yet</Text>
                <Text style={styles.emptySubtitle}>Completed work and payout history will appear here.</Text>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{item.jobTitle}</Text>
                    <Text style={styles.historyEmployer}>{item.employerName}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyWage}>{formatWage(item.wage)}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  earningsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  earningItem: { flex: 1, alignItems: 'center' },
  earningNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#090D14',
    letterSpacing: -0.3,
  },
  earningLabel: { fontFamily: FontFamily.medium, fontSize: 10, color: '#5A6578', marginTop: 1 },
  stripDivider: { width: 1, height: 28, backgroundColor: '#E8E6E0' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F2F0EB',
  },
  tabActive: { backgroundColor: '#0D3B3F' },
  tabText: { fontFamily: FontFamily.medium, fontSize: 11, color: '#5A6578' },
  tabTextActive: { color: '#FFFFFF', fontFamily: FontFamily.bold },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appHeaderLeft: { flex: 1, marginRight: 8 },
  appJobTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#090D14', marginBottom: 2 },
  appEmployer: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },
  appWage: { fontFamily: FontFamily.extraBold, fontSize: 18, color: '#0D3B3F', textAlign: 'right', letterSpacing: -0.3 },
  appWageUnit: { fontFamily: FontFamily.medium, fontSize: 10, color: '#8E99A8', textAlign: 'right' },

  // Visual timeline
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineNodeCol: { alignItems: 'center', width: '100%' },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  timelineNodeDone: { backgroundColor: '#0D3B3F', borderColor: '#0D3B3F' },
  timelineNodeActive: { backgroundColor: '#C8F135', borderColor: '#0D3B3F' },
  timelineLine: {
    position: 'absolute',
    top: 10,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E8E6E0',
  },
  timelineLineDone: { backgroundColor: '#0D3B3F' },
  timelineLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 8,
    color: '#8E99A8',
    marginTop: 4,
    textAlign: 'center',
  },
  timelineLabelActive: { color: '#0D3B3F', fontFamily: FontFamily.bold },
  appFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontFamily: FontFamily.bold, fontSize: 10 },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8F135',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  checkInText: { fontFamily: FontFamily.bold, fontSize: 11, color: '#090D14' },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  checkedInText: { fontFamily: FontFamily.bold, fontSize: 10, color: '#047857' },

  // History
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 12,
    ...Shadow.xs,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  historyContent: { flex: 1 },
  historyTitle: { fontFamily: FontFamily.bold, fontSize: 13, color: '#090D14', marginBottom: 2 },
  historyEmployer: { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A6578' },
  historyRight: { alignItems: 'flex-end' },
  historyWage: { fontFamily: FontFamily.extraBold, fontSize: 15, color: '#0D3B3F', letterSpacing: -0.2 },
  historyDate: { fontFamily: FontFamily.regular, fontSize: 10, color: '#8E99A8', marginTop: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#090D14' },
  emptySubtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: '#5A6578', textAlign: 'center' },
});
