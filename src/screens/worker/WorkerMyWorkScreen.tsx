// Worker My Work Screen — Production-Grade MNC Quality Experience
// Purpose: "Show me the work that belongs to me."
// Clean Mathematical Grid · Balanced Hierarchy · Restrained & Trustworthy

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily } from '../../constants';
import { formatWage, formatDate, CURRENT_WORKER } from '../../data/mockData';
import {
  useSharedApplicationsStore,
  useWorkerStore,
  useLanguageStore,
  useDisputeStore,
} from '../../store';
import { getLocalizedStatus } from '../../i18n/translations';
import { JobApplication } from '../../types';
import { Theme } from '../../theme';
import { api } from '../../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  shellNavigation: NavProp;
  /** Called when the screen needs to switch the parent shell tab */
  onNavigateTab?: (tabKey: string) => void;
}

type SectionTab = 'upcoming' | 'active' | 'completed' | 'issues';

const GRID_PADDING = 16;
const CARD_RADIUS = 12;
const CARD_PADDING = 14;

export const WorkerMyWorkScreen: React.FC<Props> = ({ shellNavigation, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, language } = useLanguageStore();

  const workerProfile = useWorkerStore((s) => s.profile);
  const worker = workerProfile ?? CURRENT_WORKER;
  const workerId = worker.id;

  const {
    getWorkerApplications,
    checkIn,
    markComplete,
    workerAcceptCounter,
    workerDeclineCounter,
  } = useSharedApplicationsStore();

  const { disputes } = useDisputeStore();

  const loadApplications = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      await api.getApplications({ worker_id: workerId });
    } catch (_) {
      // Store maintains state
    } finally {
      setIsRefreshing(false);
    }
  }, [workerId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const allApplications = getWorkerApplications(workerId);

  // ── 1. UPCOMING: Accepted, Under Review, Applied, Direct Offers
  const upcomingList = useMemo(() => {
    return allApplications.filter((a) =>
      ['ACCEPTED', 'HIRED', 'UNDER_REVIEW', 'APPLIED'].includes(a.status)
    );
  }, [allApplications]);

  // ── 2. ACTIVE: Starting today, checked-in, in-progress, or on the way
  const activeList = useMemo(() => {
    return allApplications.filter((a) =>
      ['ON_THE_WAY', 'ARRIVED', 'CHECKED_IN', 'IN_PROGRESS', 'WORK_SUBMITTED'].includes(a.status)
    );
  }, [allApplications]);

  // ── 3. COMPLETED: Finished, Paid, Escrow processing
  const completedList = useMemo(() => {
    return allApplications.filter((a) =>
      ['COMPLETED', 'PAID'].includes(a.status)
    );
  }, [allApplications]);

  // ── 4. ISSUES: Disputed, pending payout over time, cancelled
  const issuesList = useMemo(() => {
    const appIssues = allApplications.filter((a) =>
      ['DISPUTED', 'REJECTED', 'EXPIRED'].includes(a.status)
    );
    return {
      apps: appIssues,
      disputes: disputes.filter(
        (d) => d.raisedByUserId === workerId || d.againstUserId === workerId
      ),
    };
  }, [allApplications, disputes, workerId]);

  // Earnings calculation — strictly paid/settled applications
  const totalSettledEarnings = useMemo(() => {
    return allApplications
      .filter((a) => a.status === 'PAID' && a.paymentStatus === 'PAID')
      .reduce((sum, a) => sum + (a.agreedWage ?? a.proposedWage ?? 0), 0);
  }, [allApplications]);

  // ── Handlers ──
  const handleOpenActiveGig = (app: JobApplication) => {
    shellNavigation.navigate('ActiveGig', { applicationId: app.id });
  };

  const handleCheckIn = async (app: JobApplication) => {
    try {
      await api.checkIn(app.id, 28.6139, 77.2090);
      checkIn(app.id);
      shellNavigation.navigate('ActiveGig', { applicationId: app.id });
    } catch (err: any) {
      Alert.alert('Check-In Error', err.message || 'Could not verify check-in');
    }
  };

  const handleMarkComplete = async (app: JobApplication) => {
    try {
      await api.markWorkComplete(app.id);
      markComplete(app.id);
      shellNavigation.navigate('ActiveGig', { applicationId: app.id });
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Could not mark work completed');
    }
  };

  const handleAcceptCounter = (app: JobApplication) => {
    workerAcceptCounter(app.id);
    api.updateApplicationStatus(app.id, 'ACCEPTED', app.currentCounterWage || app.proposedWage).catch(() => {});
    Alert.alert(
      language === 'hi' ? 'ऑफर स्वीकार किया गया ✓' : 'Offer Accepted ✓',
      language === 'hi'
        ? `₹${app.currentCounterWage || app.proposedWage} पर काम तय हो गया है।`
        : `Job confirmed at ₹${app.currentCounterWage || app.proposedWage}/day.`
    );
  };

  const handleDeclineCounter = (app: JobApplication) => {
    workerDeclineCounter(app.id);
    api.updateApplicationStatus(app.id, 'REJECTED').catch(() => {});
  };

  const handleOpenDispute = (appId?: string) => {
    shellNavigation.navigate('Dispute', { serviceRequestId: appId });
  };

  return (
    <View style={styles.container}>
      {/* ─── 1. Header Block (Aligned with Grid) ─── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {language === 'hi' ? 'मेरा काम' : 'MY WORK'}
        </Text>
        <Text style={styles.screenSubtitle}>
          {language === 'hi'
            ? 'सक्रिय काम, आगामी गिग्स और सत्यापित कमाई'
            : 'Active shifts, upcoming gigs & verified earnings'}
        </Text>
      </View>

      {/* ─── 2. Total Earned Summary Row (Minimalist & Premium) ─── */}
      <View style={styles.earningsBanner}>
        <Text style={styles.earningsBannerLabel}>
          {language === 'hi' ? 'कुल कमाई' : 'TOTAL EARNED'}
        </Text>
        <Text style={styles.earningsBannerAmount}>
          ₹{totalSettledEarnings.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* ─── 3. Segmented Navigation Bar ─── */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedTrack}>
          {/* UPCOMING */}
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'upcoming' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.segmentText, activeTab === 'upcoming' && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {language === 'hi' ? 'आगामी' : 'Upcoming'}
            </Text>
            {upcomingList.length > 0 && (
              <View style={[styles.segmentBadge, activeTab === 'upcoming' && styles.segmentBadgeActive]}>
                <Text style={[styles.segmentBadgeText, activeTab === 'upcoming' && styles.segmentBadgeTextActive]}>
                  {upcomingList.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ACTIVE */}
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {language === 'hi' ? 'चालू' : 'Active'}
            </Text>
            {activeList.length > 0 && (
              <View
                style={[
                  styles.segmentBadge,
                  styles.segmentBadgeAlert,
                  activeTab === 'active' && styles.segmentBadgeAlertActive,
                ]}
              >
                <Text style={styles.segmentBadgeAlertText}>{activeList.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* COMPLETED */}
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'completed' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.segmentText, activeTab === 'completed' && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {language === 'hi' ? 'पूरे' : 'Completed'}
            </Text>
            {completedList.length > 0 && (
              <View style={[styles.segmentBadge, activeTab === 'completed' && styles.segmentBadgeActive]}>
                <Text style={[styles.segmentBadgeText, activeTab === 'completed' && styles.segmentBadgeTextActive]}>
                  {completedList.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ISSUES */}
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'issues' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('issues')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.segmentText, activeTab === 'issues' && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {language === 'hi' ? 'समस्या' : 'Issues'}
            </Text>
            {(issuesList.apps.length > 0 || issuesList.disputes.length > 0) && (
              <View style={[styles.segmentBadge, styles.segmentBadgeWarning]}>
                <Text style={styles.segmentBadgeWarningText}>
                  {issuesList.apps.length + issuesList.disputes.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 4. Scroll Content (Strict Content Grid) ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadApplications(true)}
            tintColor={Theme.accent}
          />
        }
      >
        {/* ═══════════════ TAB 1: UPCOMING ═══════════════ */}
        {activeTab === 'upcoming' && (
          <View style={styles.sectionBody}>
            {upcomingList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="calendar" size={32} color={Theme.textMuted} />
                <Text style={styles.emptyTitle}>
                  {language === 'hi' ? 'कोई आगामी काम नहीं है' : 'No Upcoming Jobs'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {language === 'hi'
                    ? 'काम खोजें में जाएं और नई दिहाड़ी के लिए आवेदन करें।'
                    : 'Explore Find Work to discover suitable opportunities near you.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => {
                    if (onNavigateTab) onNavigateTab('FindWork');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBtnText}>
                    {language === 'hi' ? 'काम खोजें' : 'Find Work'}
                  </Text>
                  <Feather name="arrow-right" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              upcomingList.map((app) => {
                const job = app.job;
                const wage = app.agreedWage ?? app.proposedWage ?? 1000;
                const isAccepted = app.status === 'ACCEPTED' || app.status === 'HIRED';
                const hasCounter = Boolean(app.currentCounterWage && app.counterBy === 'employer');

                return (
                  <View key={app.id} style={styles.card}>
                    {/* Header: Title + Status */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {job?.title || 'General Worker'}
                        </Text>
                        <Text style={styles.cardEmployer} numberOfLines={1}>
                          {job?.employer?.businessName || 'Verified Employer'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isAccepted ? styles.statusBadgeSuccess : styles.statusBadgeNeutral,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isAccepted ? styles.statusTextSuccess : styles.statusTextNeutral,
                          ]}
                        >
                          {getLocalizedStatus(app.status, language)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* Metadata Row: Time · Location · Pay */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaCol}>
                        <Feather name="clock" size={12} color={Theme.textMuted} />
                        <Text style={styles.metaLabel} numberOfLines={1}>
                          {job?.startTime || '09:00 AM'}
                        </Text>
                      </View>

                      <View style={styles.metaCol}>
                        <Feather name="map-pin" size={12} color={Theme.textMuted} />
                        <Text style={styles.metaLabel} numberOfLines={1}>
                          {job?.location?.city || 'Noida'}
                        </Text>
                      </View>

                      <View style={styles.payCol}>
                        <Text style={styles.payAmount}>{formatWage(wage)}</Text>
                        <Text style={styles.payUnit}>/day</Text>
                      </View>
                    </View>

                    {/* Counter Offer Prompt if pending from Employer */}
                    {hasCounter && (
                      <View style={styles.counterBox}>
                        <View style={styles.counterHeader}>
                          <Feather name="repeat" size={13} color={Theme.accent} />
                          <Text style={styles.counterTitle}>
                            {language === 'hi' ? 'मालिक का नया ऑफर:' : 'Employer Counter-Offer:'}{' '}
                            <Text style={styles.counterWage}>
                              {formatWage(app.currentCounterWage!)}
                            </Text>
                          </Text>
                        </View>
                        <View style={styles.counterActions}>
                          <TouchableOpacity
                            style={styles.declineBtn}
                            onPress={() => handleDeclineCounter(app)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.declineBtnText}>
                              {language === 'hi' ? 'मना करें' : 'Decline'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleAcceptCounter(app)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.acceptBtnText}>
                              {language === 'hi' ? 'स्वीकार करें' : 'Accept Offer'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.cardDivider} />

                    {/* Action Bar */}
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => shellNavigation.navigate('JobDetail', { jobId: app.jobId })}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.viewDetailsText}>
                          {language === 'hi' ? 'काम देखें' : 'View Gig Details'}
                        </Text>
                        <Feather name="arrow-right" size={13} color={Theme.ink} />
                      </TouchableOpacity>

                      {isAccepted && (
                        <TouchableOpacity
                          style={styles.primaryActionBtn}
                          onPress={() => handleOpenActiveGig(app)}
                          activeOpacity={0.85}
                        >
                          <Feather name="activity" size={12} color="#FFFFFF" />
                          <Text style={styles.primaryActionText}>
                            {language === 'hi' ? 'लाइव शिफ्ट ट्रैक करें' : 'Open Active Shift'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══════════════ TAB 2: ACTIVE ═══════════════ */}
        {activeTab === 'active' && (
          <View style={styles.sectionBody}>
            {activeList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="activity" size={32} color={Theme.textMuted} />
                <Text style={styles.emptyTitle}>
                  {language === 'hi' ? 'कोई काम अभी चालू नहीं है' : 'No Active Shifts Right Now'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {language === 'hi'
                    ? 'जब आप साइट पर पहुंच कर हाजिरी लगाएंगे, काम यहाँ दिखाई देगा।'
                    : 'Accepted jobs that have been checked into on-site will appear here.'}
                </Text>
              </View>
            ) : (
              activeList.map((app) => {
                const job = app.job;
                const wage = app.agreedWage ?? app.proposedWage ?? 1000;

                return (
                  <View key={app.id} style={[styles.card, styles.activeCard]}>
                    <View style={styles.activeStrip}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activeStripText}>
                        {language === 'hi'
                          ? 'काम चल रहा है · उपस्थिति प्रमाणित'
                          : 'Work In Progress · Attendance Confirmed'}
                      </Text>
                    </View>

                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {job?.title || 'Assigned Gig'}
                        </Text>
                        <Text style={styles.cardEmployer} numberOfLines={1}>
                          {job?.employer?.businessName || 'Employer'}
                        </Text>
                      </View>
                      <View style={styles.payCol}>
                        <Text style={styles.payAmountLarge}>{formatWage(wage)}</Text>
                        <Text style={styles.payUnit}>/day</Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.metaRow}>
                      <View style={styles.metaCol}>
                        <Feather name="map-pin" size={12} color={Theme.textMuted} />
                        <Text style={styles.metaLabel} numberOfLines={1}>
                          {job?.location?.address || job?.location?.city || 'Site Location'}
                        </Text>
                      </View>
                      <View style={styles.metaCol}>
                        <Feather name="shield" size={12} color={Theme.forestGreen} />
                        <Text style={[styles.metaLabel, { color: Theme.forestGreen }]}>
                          {language === 'hi' ? 'एस्क्रो सुरक्षित' : 'Escrow Secured'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.completeBtn, { flex: 1, backgroundColor: Theme.primary }]}
                        onPress={() => handleOpenActiveGig(app)}
                        activeOpacity={0.88}
                      >
                        <Feather name="activity" size={14} color="#FFFFFF" />
                        <Text style={styles.completeBtnText}>
                          {language === 'hi' ? 'लाइव शिफ्ट ट्रैकर' : 'Live Shift Tracker'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.completeBtn, { flex: 1, backgroundColor: Theme.success }]}
                        onPress={() => handleMarkComplete(app)}
                        activeOpacity={0.88}
                      >
                        <Feather name="check-circle" size={14} color="#FFFFFF" />
                        <Text style={styles.completeBtnText}>
                          {language === 'hi' ? 'काम पूरा करें' : 'Complete Work'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══════════════ TAB 3: COMPLETED ═══════════════ */}
        {activeTab === 'completed' && (
          <View style={styles.sectionBody}>
            {completedList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="check-circle" size={32} color={Theme.textMuted} />
                <Text style={styles.emptyTitle}>
                  {language === 'hi' ? 'कोई पूरा किया काम नहीं है' : 'No Completed Jobs Yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {language === 'hi'
                    ? 'जब आप काम पूरा करेंगे, आपके भुगतान और रसीदें यहाँ दिखेंगी।'
                    : 'Completed shifts and verified payment receipts will appear here.'}
                </Text>
              </View>
            ) : (
              completedList.map((app) => {
                const job = app.job;
                const wage = app.agreedWage ?? app.proposedWage ?? 1000;
                const isPaid = app.status === 'PAID';

                return (
                  <View key={app.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {job?.title || 'Completed Job'}
                        </Text>
                        <Text style={styles.cardEmployer} numberOfLines={1}>
                          {job?.employer?.businessName || 'Client'} · {formatDate(app.appliedAt)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isPaid ? styles.statusBadgeSuccess : styles.statusBadgeNeutral,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isPaid ? styles.statusTextSuccess : styles.statusTextNeutral,
                          ]}
                        >
                          {isPaid
                            ? (language === 'hi' ? 'भुगतान प्राप्त ✓' : 'Paid ✓')
                            : (language === 'hi' ? 'प्रक्रिया में' : 'Processing')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.metaRow}>
                      <View style={styles.payCol}>
                        <Text style={[styles.payAmount, { color: Theme.forestGreen }]}>
                          {formatWage(wage)}
                        </Text>
                        <Text style={styles.payUnit}>
                          {isPaid
                            ? (language === 'hi' ? ' · UPI जमा' : ' · UPI Direct')
                            : (language === 'hi' ? ' · एस्क्रो में' : ' · In Escrow')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => shellNavigation.navigate('Rating', { serviceRequestId: app.id })}
                        activeOpacity={0.75}
                      >
                        <Feather name="star" size={13} color={Theme.accent} />
                        <Text style={styles.viewDetailsText}>
                          {language === 'hi' ? 'रेटिंग दें' : 'Rate Employer'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.receiptBtn}
                        onPress={() => {
                          Alert.alert(
                            language === 'hi' ? 'डिजिटल रसीद' : 'Digital Work Receipt',
                            `Gig: ${job?.title}\nWage: ${formatWage(wage)}\nTransaction: PAY_GIG_${app.id.substring(0, 8)}\nStatus: ${isPaid ? 'PAID' : 'ESCROW_SETTLED'}`
                          );
                        }}
                        activeOpacity={0.75}
                      >
                        <Feather name="file-text" size={13} color={Theme.textSecondary} />
                        <Text style={styles.receiptBtnText}>
                          {language === 'hi' ? 'रसीद देखें' : 'View Receipt'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══════════════ TAB 4: ISSUES ═══════════════ */}
        {activeTab === 'issues' && (
          <View style={styles.sectionBody}>
            {/* Cooperative Notice Banner (Grid Aligned) */}
            <View style={styles.coopBanner}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={Theme.forestGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.coopTitle}>
                  {language === 'hi' ? 'सहकारी विवाद संरक्षण' : 'Cooperative Protection Guarantee'}
                </Text>
                <Text style={styles.coopSub}>
                  {language === 'hi'
                    ? '24 घंटे में निष्पक्ष समाधान · 1800-266-7327 पर कॉल करें'
                    : '24-hour fair dispute resolution · Toll-free 1800-266-7327'}
                </Text>
              </View>
            </View>

            {issuesList.apps.length === 0 && issuesList.disputes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="shield" size={32} color={Theme.forestGreen} />
                <Text style={styles.emptyTitle}>
                  {language === 'hi' ? 'कोई समस्या नहीं है' : 'Zero Issues Reported'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {language === 'hi'
                    ? 'आपके सभी काम और भुगतान सही चल रहे हैं।'
                    : 'All your shifts, attendance, and escrow payouts are in good standing.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => handleOpenDispute()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBtnText}>
                    {language === 'hi' ? 'समस्या बताएं' : 'Report an Issue'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* List of active disputes */}
                {issuesList.disputes.map((d) => (
                  <View key={d.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle}>
                          {d.type.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        <Text style={styles.cardEmployer}>
                          {formatDate(d.createdAt)} · ID: {d.id}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
                        <Text style={[styles.statusBadgeText, styles.statusTextWarning]}>
                          {d.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />
                    <Text style={styles.issueDescText}>{d.description}</Text>

                    {d.cooperativeAdminNote && (
                      <View style={styles.officerNoteBox}>
                        <Text style={styles.officerNoteTitle}>
                          {language === 'hi' ? 'अधिकारी टिप्पणी:' : 'Officer Review Note:'}
                        </Text>
                        <Text style={styles.officerNoteText}>{d.cooperativeAdminNote}</Text>
                      </View>
                    )}

                    <View style={styles.cardDivider} />

                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => handleOpenDispute(d.serviceRequestId)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.viewDetailsText}>
                        {language === 'hi' ? 'विवरण देखें' : 'View Dispute Details'}
                      </Text>
                      <Feather name="arrow-right" size={13} color={Theme.ink} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* List of rejected or disputed applications */}
                {issuesList.apps.map((app) => (
                  <View key={app.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle}>{app.job?.title || 'Application'}</Text>
                        <Text style={styles.cardEmployer}>
                          {app.job?.employer?.businessName || 'Employer'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
                        <Text style={[styles.statusBadgeText, styles.statusTextWarning]}>
                          {getLocalizedStatus(app.status, language)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => handleOpenDispute(app.id)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.viewDetailsText}>
                          {language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report Issue to Cooperative'}
                        </Text>
                        <Feather name="arrow-right" size={13} color={Theme.ink} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },

  // ── 1. Header Block ──
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  // ── 2. Total Earned Summary Row ──
  earningsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.border,
  },
  earningsBannerLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11.5,
    color: Theme.textSecondary,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  earningsBannerAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Theme.forestGreen,
    letterSpacing: -0.6,
  },

  // ── 3. Segmented Navigation Bar ──
  segmentedContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: '#F3F2ED',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    gap: 4,
    paddingHorizontal: 2,
  },
  segmentBtnActive: {
    backgroundColor: Theme.ink,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  segmentTextActive: {
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
  },
  segmentBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#E4E0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  segmentBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: Theme.ink,
  },
  segmentBadgeTextActive: {
    color: '#FFFFFF',
  },
  segmentBadgeAlert: {
    backgroundColor: Theme.forestGreen,
  },
  segmentBadgeAlertActive: {
    backgroundColor: '#34D399',
  },
  segmentBadgeAlertText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  segmentBadgeWarning: {
    backgroundColor: Theme.amber,
  },
  segmentBadgeWarningText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
  },

  // ── 4. Content Scroll ──
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 14,
    paddingBottom: 96,
  },
  sectionBody: {
    gap: 12,
  },

  // ── Job Cards (Production System) ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: '#E8E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  activeCard: {
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
  },
  activeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.forestGreen,
  },
  activeStripText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.forestGreen,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    letterSpacing: -0.2,
  },
  cardEmployer: {
    fontFamily: FontFamily.medium,
    fontSize: 12.5,
    color: Theme.textSecondary,
    marginTop: 2,
  },

  // Status Badges (Subtle & Secondary)
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  statusBadgeNeutral: {
    backgroundColor: '#F3F2ED',
  },
  statusBadgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
  },
  statusTextNeutral: {
    color: Theme.textSecondary,
  },
  statusTextSuccess: {
    color: Theme.forestGreen,
  },
  statusTextWarning: {
    color: '#92400E',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0ECE4',
    marginVertical: 10,
  },

  // Metadata Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  payCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  payAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.accent,
  },
  payAmountLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Theme.accent,
  },
  payUnit: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
  },

  // Actions & Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewDetailsText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Theme.ink,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryActionText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.forestGreen,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F2ED',
  },
  receiptBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },

  // Counter Offer Box
  counterBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  counterTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#92400E',
  },
  counterWage: {
    fontFamily: FontFamily.bold,
    color: '#92400E',
  },
  counterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declineBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.ink,
  },
  acceptBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Theme.accent,
  },
  acceptBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },

  // Cooperative Protection Banner (Issues Tab)
  coopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  coopTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: Theme.forestGreen,
  },
  coopSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  issueDescText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    lineHeight: 17,
  },
  officerNoteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.accent,
  },
  officerNoteTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.ink,
  },
  officerNoteText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E5DC',
    marginVertical: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.accent,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
