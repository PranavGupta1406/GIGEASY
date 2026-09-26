// Job Detail Screen — Complete Apply + Counter-Offer Flow
// Applied state guard · Duplicate prevention · Live status from shared store

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_JOBS, formatWage, formatDate, formatDistance } from '../../data/mockData';
import { InteractiveMapVisual } from '../../components/InteractiveMapVisual';
import { getCategoryVisual, GigEasyVerifiedBadge } from '../../components/GigEasyPrimitives';
import { useLanguageStore, useWorkerStore, useSharedApplicationsStore, useEmployerStore } from '../../store';
import { getLocalizedStatus, getLocalizedCategory } from '../../i18n/translations';
import { googleMapsService } from '../../services/maps/googleMapsService';
import { Theme, statusColor, statusLabel } from '../../theme';
import { api } from '../../services/api';
import { apiGigToJob } from '../../services/gigMapper';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

// Use Theme tokens instead of local T
const T = {
  bg: Theme.bg,
  primary: Theme.primary,
  primaryMuted: Theme.primaryLight,
  money: Theme.primary,
  ink: Theme.ink,
  textSecondary: Theme.textSecondary,
  textMuted: Theme.textMuted,
  border: Theme.border,
  white: Theme.surface,
  success: Theme.success,
  successLight: Theme.successLight,
};

export const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;

  const employerJobs = useEmployerStore((s) => s.jobs);
  const storeJob = employerJobs.find((j) => j.id === jobId) ?? MOCK_JOBS.find((j) => j.id === jobId);

  const [apiJob, setApiJob] = useState<any>(null);
  const [isLoadingGig, setIsLoadingGig] = useState(!storeJob);

  useEffect(() => {
    if (!storeJob) {
      // Fetch from real API (UUID-based gig ID)
      api.getGigById(jobId).then((g) => {
        if (g) setApiJob(apiGigToJob(g));
      }).catch(() => {}).finally(() => setIsLoadingGig(false));
    }
  }, [jobId, storeJob]);

  const job = storeJob ?? apiJob ?? MOCK_JOBS[0];

  const { t, language } = useLanguageStore();
  const workerProfile = useWorkerStore((s) => s.profile);
  const { applyForJob, hasApplied, getWorkerApplications, workerCounterOffer } = useSharedApplicationsStore();

  const workerId = workerProfile?.id ?? 'w1';
  const alreadyApplied = hasApplied(jobId, workerId);

  const [justApplied, setJustApplied] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Counter offer modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterWageText, setCounterWageText] = useState(String(job?.minWage || 500));
  const [counterSent, setCounterSent] = useState(false);

  // Get active application for status display
  const existingApp = alreadyApplied
    ? getWorkerApplications(workerId).find((a) => a.jobId === jobId)
    : null;

  if (isLoadingGig) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Theme.accent} size="large" />
        <Text style={{ fontFamily: FontFamily.regular, color: Theme.textSecondary, marginTop: 12 }}>{t('loadingGigs')}</Text>
      </SafeAreaView>
    );
  }

  const catVisual = getCategoryVisual(job.skillRequired?.category || 'General');
  const isFull = (job.workersHired ?? 0) >= (job.workersRequired ?? 1);

  const handleApply = () => {
    if (alreadyApplied || justApplied || isFull) return;

    const worker = workerProfile ?? {
      id: 'w1',
      name: 'Ravi Kumar',
    } as any;

    applyForJob(jobId, job.maxWage, worker, job);
    setJustApplied(true);

    api.applyForGig({ gig_id: jobId, proposed_wage: job.maxWage }).catch((err) => {
      console.log('Background API gig apply note:', err.message);
    });

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleSendCounter = () => {
    if (alreadyApplied || justApplied || isFull) return;

    const wage = parseInt(counterWageText.replace(/\D/g, ''), 10);
    if (!wage || wage < 100) return;

    const worker = workerProfile ?? { id: 'w1', name: 'Ravi Kumar' } as any;

    // Apply first (with counter wage), then immediately transition to NEGOTIATING
    applyForJob(jobId, wage, worker, job);
    setJustApplied(true);

    api.applyForGig({ gig_id: jobId, proposed_wage: wage }).then((res) => {
      if (res?.application_id) {
        api.createNegotiation({ application_id: res.application_id, amount: wage, note: 'Worker proposed counter-wage' }).catch(() => {});
      }
    }).catch((err) => {
      console.log('Background API gig counter note:', err.message);
    });

    // Get the newly created application and counter it
    setTimeout(() => {
      const apps = useSharedApplicationsStore.getState().getWorkerApplications(workerId);
      const newApp = apps.find((a) => a.jobId === jobId);
      if (newApp) workerCounterOffer(newApp.id, wage);
    }, 50);

    setShowCounterModal(false);
    setCounterSent(true);
  };

  const isApplied = alreadyApplied || justApplied;
  const appStatus = existingApp?.status;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* Nav header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{language === 'hi' ? 'काम की जानकारी' : 'Job Details'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. Category Visual Banner */}
        <View style={[styles.categoryBanner, { backgroundColor: catVisual.bg }]}>
          <View style={[styles.categoryIconCircle, { backgroundColor: catVisual.color + '22' }]}>
            <Feather name={catVisual.iconName} size={28} color={catVisual.color} />
          </View>
          <View style={styles.categoryBannerText}>
            <Text style={[styles.categoryLabel, { color: catVisual.color }]}>
              {getLocalizedCategory(job.skillRequired.category, language).toUpperCase()}
            </Text>
            <Text style={styles.bannerJobTitle}>{job.title}</Text>
          </View>
        </View>

        {/* 2. Wage Hero + Key Info */}
        <View style={styles.topSection}>
          <View style={styles.wageRow}>
            <View>
              <Text style={styles.wageAmount}>{formatWage(job.maxWage)}</Text>
              <Text style={styles.wageUnit}>{t('perDay')}</Text>
            </View>
            <View style={styles.wageRange}>
              <Text style={styles.wageRangeText}>
                {language === 'hi' ? 'तय सीमा' : 'Range'}: {formatWage(job.minWage)} – {formatWage(job.maxWage)}
              </Text>
            </View>
          </View>

          {/* Employer row */}
          <View style={styles.employerRow}>
            <Text style={styles.employerName}>{job.employer.businessName}</Text>
            {job.employer.verificationStatus === 'verified' && <GigEasyVerifiedBadge small />}
          </View>

          {/* Key meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color={T.primary} />
              <Text style={styles.metaText}>{job.location.city} · {formatDistance(job.distanceKm ?? 2)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={T.textSecondary} />
              <Text style={styles.metaText}>{formatDate(job.startDate)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="clock" size={13} color={T.textSecondary} />
              <Text style={styles.metaText}>{job.startTime} – {job.endTime}</Text>
            </View>
          </View>
        </View>

        {/* 3. Map Location */}
        <View style={styles.mapSection}>
          <View style={styles.locationHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>{language === 'hi' ? 'काम की जगह' : 'Work Location'}</Text>
              <Text style={styles.locationAddress}>{job.location.address}, {job.location.city}</Text>
            </View>
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => googleMapsService.openDirections({
                destLat: job.location.lat,
                destLng: job.location.lng,
                destLabel: job.title,
              })}
              activeOpacity={0.8}
            >
              <Feather name="navigation" size={13} color={T.white} />
              <Text style={styles.directionsBtnText}>{language === 'hi' ? 'रास्ता देखें' : 'Directions'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapWrap}>
            <InteractiveMapVisual
              markers={[
                { id: job.id, wage: formatWage(job.maxWage), top: '45%', left: '50%', lat: job.location.lat, lng: job.location.lng }
              ]}
              height={160}
              locationCity={job.location.city}
              radiusKm={5}
              centerLat={job.location.lat}
              centerLng={job.location.lng}
            />
          </View>
        </View>

        {/* 4. Shift Overview */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>{language === 'hi' ? 'काम के बारे में' : 'About This Job'}</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>

          {job.requirements && job.requirements.length > 0 && (
            <View style={styles.reqList}>
              {job.requirements.map((req: string, idx: number) => (
                <View key={idx} style={styles.reqItem}>
                  <Feather name="check-circle" size={14} color={T.primary} />
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 5. Staffing Status */}
        <View style={styles.infoSection}>
          <View style={styles.staffingRow}>
            <Text style={styles.sectionHeading}>{language === 'hi' ? 'खाली जगह' : 'Open Positions'}</Text>
            <Text style={styles.staffingCount}>
              {language === 'hi' ? `${job.workersRequired} में से ${job.workersHired} भरे` : `${job.workersHired} of ${job.workersRequired} filled`}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((job.workersHired / job.workersRequired) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* 6. Payment & Escrow Guarantee */}
        <View style={styles.infoSection}>
          <View style={styles.paymentHeaderRow}>
            <View style={styles.paymentIconCircle}>
              <Feather name="shield" size={16} color={Theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>{language === 'hi' ? 'पैसे की पूरी सुरक्षा' : 'Payment & Escrow Protection'}</Text>
              <Text style={styles.paymentSub}>
                {language === 'hi' ? 'काम पूरा होते ही सीधे आपके खाते में भुगतान' : 'Guaranteed direct payout upon shift completion'}
              </Text>
            </View>
          </View>
          <View style={styles.paymentDetailBox}>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>{t('dailyWage')}</Text>
              <Text style={styles.paymentDetailVal}>{formatWage(job.maxWage)}{t('perDay')}</Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>{language === 'hi' ? 'भुगतान का तरीका' : 'Payout Mode'}</Text>
              <Text style={styles.paymentDetailVal}>{language === 'hi' ? 'सीधे UPI / QR / बैंक' : 'Direct UPI / QR / Bank'}</Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>{language === 'hi' ? 'सुरक्षा स्टेटस' : 'Escrow Status'}</Text>
              <Text style={[styles.paymentDetailVal, { color: existingApp?.paymentStatus === 'PAID' ? Theme.success : Theme.primary }]}>
                {existingApp?.paymentStatus === 'PAID'
                  ? (language === 'hi' ? 'भुगतान हो गया ✓' : 'Paid ✓')
                  : existingApp
                  ? (language === 'hi' ? 'सुरक्षित (काम जारी है)' : 'In Escrow (Work in Progress)')
                  : (language === 'hi' ? '100% पहले से सुरक्षित' : '100% Pre-Funded')}
              </Text>
            </View>
          </View>
        </View>

        {/* Applied Success Banner */}
        {isApplied && (
          <View style={styles.appliedBanner}>
            <Feather name="check-circle" size={18} color={counterSent ? Theme.warning : T.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.appliedBannerTitle}>
                {counterSent
                  ? (language === 'hi' ? 'नया ऑफर भेज दिया गया!' : 'Counter Offer Sent!')
                  : (language === 'hi' ? 'आवेदन भेज दिया गया!' : 'Application Sent!')}
              </Text>
              {existingApp && (
                <View style={[styles.statusPill, { backgroundColor: statusColor(existingApp.status) + '18' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(existingApp.status) }]} />
                  <Text style={[styles.statusPillText, { color: statusColor(existingApp.status) }]}>
                    {getLocalizedStatus(existingApp.status, language)}
                  </Text>
                </View>
              )}
              <Text style={styles.appliedBannerSub}>
                {language === 'hi' ? 'स्थिति देखने के लिए "किए गए काम" पर जाएं।' : 'Check your Activity tab to track the status.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

        {/* Counter Offer Modal */}
        <Modal
          visible={showCounterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCounterModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{language === 'hi' ? 'अपनी दिहाड़ी लिखें' : 'Propose Your Wage'}</Text>
              <Text style={styles.modalSub}>
                {language === 'hi' ? `मालिक की तय सीमा: ${formatWage(job.minWage)} – ${formatWage(job.maxWage)}/दिन` : `Employer range: ${formatWage(job.minWage)} – ${formatWage(job.maxWage)}/day`}
              </Text>

              <View style={styles.wageInputRow}>
                <Text style={styles.rupeeSign}>₹</Text>
                <TextInput
                  style={styles.wageInput}
                  value={counterWageText}
                  onChangeText={(v) => setCounterWageText(v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder={String(job.minWage)}
                  placeholderTextColor={Theme.textMuted}
                  autoFocus
                />
                <Text style={styles.perDay}>{t('perDay')}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowCounterModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSend}
                  onPress={handleSendCounter}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSendText}>{language === 'hi' ? 'काम का ऑफर भेजें' : 'Send Offer'}</Text>
                  <Feather name="send" size={14} color={Theme.surface} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        {isApplied ? (
          // Already applied — show status
          <View style={[styles.appliedStatusBar, { backgroundColor: statusColor(appStatus ?? 'APPLIED') + '18', borderColor: statusColor(appStatus ?? 'APPLIED') + '40' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(appStatus ?? 'APPLIED') }]} />
            <Text style={[styles.appliedStatusText, { color: statusColor(appStatus ?? 'APPLIED') }]}>
              {getLocalizedStatus(appStatus ?? 'APPLIED', language)}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainApp', { initialMode: 'worker' })}
              activeOpacity={0.75}
              style={styles.viewActivityBtn}
            >
              <Text style={styles.viewActivityText}>{language === 'hi' ? 'किए गए काम देखें →' : 'View Activity →'}</Text>
            </TouchableOpacity>
          </View>
        ) : isFull ? (
          <View style={styles.fullBar}>
            <Feather name="users" size={16} color={Theme.textMuted} />
            <Text style={styles.fullBarText}>{language === 'hi' ? 'सभी जगह भर चुकी हैं' : 'All Positions Filled'}</Text>
          </View>
        ) : (
          // Not applied yet — two buttons: Apply + Counter Offer
          <Animated.View style={[styles.actionRow, { transform: [{ scale: pulseAnim }] }]}>
            {/* Apply — primary CTA */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.88}
            >
              <Text style={styles.applyBtnText}>
                {language === 'hi' ? `काम के लिए आवेदन करें · ${formatWage(job.maxWage)}/दिन` : `Apply for Gig · ${formatWage(job.maxWage)}/day`}
              </Text>
              <Feather name="arrow-right" size={17} color={Theme.surface} />
            </TouchableOpacity>

            {/* Counter Offer — secondary */}
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => { setCounterWageText(String(job.minWage)); setShowCounterModal(true); }}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={15} color={Theme.ink} />
              <Text style={styles.counterBtnText}>{language === 'hi' ? 'पैसे पर बात करें' : 'Negotiate Wage'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  backBtn: { padding: 4 },
  navTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: T.ink },
  scrollContent: { paddingBottom: 100 },

  // Category Banner
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBannerText: { flex: 1 },
  categoryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  bannerJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: T.ink,
    letterSpacing: -0.3,
  },

  // Top section
  topSection: {
    backgroundColor: T.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  wageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  wageAmount: {
    fontFamily: FontFamily.extraBold,
    fontSize: 34,
    color: Theme.amber,
    letterSpacing: -1,
  },
  wageUnit: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: T.textSecondary,
    marginBottom: 4,
  },
  wageRange: {
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  wageRangeText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.ink,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  employerName: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: T.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.ink },
  metaDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Theme.sandDark },

  // Map
  mapSection: {
    backgroundColor: T.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  directionsBtnText: { fontFamily: FontFamily.bold, fontSize: 11, color: T.white },
  sectionHeading: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: T.ink, marginBottom: 2 },
  locationAddress: { fontFamily: FontFamily.regular, fontSize: 12, color: T.textSecondary },
  mapWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.border },

  // Info sections
  infoSection: {
    backgroundColor: T.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  descriptionText: { fontFamily: FontFamily.regular, fontSize: 13, color: T.textSecondary, lineHeight: 20, marginBottom: 12 },
  reqList: { gap: 8 },
  reqItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reqText: { fontFamily: FontFamily.medium, fontSize: 12, color: T.ink },
  staffingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  staffingCount: { fontFamily: FontFamily.bold, fontSize: 12, color: Theme.accent },
  progressBar: { height: 6, backgroundColor: Theme.surfaceSubtle, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.accent, borderRadius: 3 },
  paymentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  paymentIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: Theme.surfaceSubtle, alignItems: 'center', justifyContent: 'center' },
  paymentSub: { fontFamily: FontFamily.regular, fontSize: 11.5, color: T.textSecondary, marginTop: 1 },
  paymentDetailBox: { backgroundColor: Theme.surfaceSubtle, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border, gap: 8 },
  paymentDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentDetailLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: T.textSecondary },
  paymentDetailVal: { fontFamily: FontFamily.bold, fontSize: 12.5, color: T.ink },

  // Applied banner
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.successLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  appliedBannerTitle: { fontFamily: FontFamily.bold, fontSize: 13.5, color: Theme.success, marginBottom: 2 },
  appliedBannerSub: { fontFamily: FontFamily.regular, fontSize: 11.5, color: Theme.textSecondary },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: T.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: T.ink,
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: T.textMuted,
    marginBottom: 20,
  },
  wageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bg,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  rupeeSign: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: T.ink,
    marginRight: 6,
  },
  wageInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: T.ink,
  },
  perDay: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: T.textMuted,
    marginLeft: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.textMuted,
  },
  modalSend: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: T.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalSendText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.white,
  },

  // Bottom bar
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
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  applyBtn: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.accent,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.textOnAccent,
    letterSpacing: 0.2,
  },
  counterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 14,
    height: 52,
  },
  counterBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.ink,
  },
  appliedStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  appliedStatusText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  viewActivityBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewActivityText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: T.primary,
  },
  fullBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    backgroundColor: T.bg,
    borderRadius: 16,
  },
  fullBarText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: T.textMuted,
  },
});
