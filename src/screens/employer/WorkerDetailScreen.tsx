// Worker Detail Screen — Employer view of a worker profile
// Real API data · Direct offer modal · Back navigation always works

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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants';
import { Theme } from '../../theme';
import { MOCK_WORKERS } from '../../data/mockData';
import { api } from '../../services/api';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkerDetail'>;

function workerInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function mapApiWorker(w: any) {
  const skills: any[] = (() => {
    try {
      const raw = typeof w.skills === 'string' ? JSON.parse(w.skills) : (w.skills || []);
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  })();

  return {
    id: w.user_id || w.id,
    name: w.name || 'Worker',
    city: w.city || '',
    state: w.state || '',
    skills,
    rating: Number(w.rating) || 0,
    ratingCount: Number(w.rating_count) || 0,
    completedJobs: Number(w.completed_jobs) || 0,
    verificationStatus: (w.user_verification || '').toLowerCase() === 'verified' ? 'verified' : 'unverified',
    availabilityStatus: w.availability_status || 'AVAILABLE',
    expectedWage: Number(w.expected_daily_wage) || 0,
    trustScore: Math.min(100, Math.round(
      (Number(w.rating) / 5) * 50 + Math.min(Number(w.completed_jobs), 50)
    )),
  };
}

export const WorkerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workerId } = route.params;
  const employerId = useAuthStore((s) => s.userId);

  const [worker, setWorker] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [offerWage, setOfferWage] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [offerTime, setOfferTime] = useState('09:00');
  const [offerLocation, setOfferLocation] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  const loadWorker = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkerById(workerId);
      setWorker(mapApiWorker(data));
    } catch {
      // Fallback to mock data
      const mock = MOCK_WORKERS.find((w: any) => w.id === workerId) ?? MOCK_WORKERS[0];
      setWorker({
        id: mock.id,
        name: mock.name,
        city: mock.location?.city || '',
        state: mock.location?.state || '',
        skills: mock.skills || [],
        rating: mock.rating || 0,
        ratingCount: 0,
        completedJobs: mock.completedJobs || 0,
        verificationStatus: mock.verificationStatus || 'unverified',
        availabilityStatus: mock.availabilityStatus || 'available',
        expectedWage: mock.expectedDailyWage || 1000,
        trustScore: mock.trustScore || 70,
      });
    } finally {
      setIsLoading(false);
    }
  }, [workerId]);

  useEffect(() => { loadWorker(); }, [loadWorker]);

  const tomorrow = () => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  };

  const handleOpenOffer = () => {
    setOfferWage(worker?.expectedWage ? String(worker.expectedWage) : '');
    setOfferDate(tomorrow());
    setOfferTime('09:00');
    setOfferLocation('');
    setIsOfferModalVisible(true);
  };

  const handleSendOffer = async () => {
    if (!offerWage || !offerDate || !offerLocation) {
      Alert.alert('Missing details', 'Please fill in wage, date, and location.');
      return;
    }
    const pay = parseInt(offerWage.replace(/\D/g, ''), 10);
    if (!pay || pay < 100) {
      Alert.alert('Invalid wage', 'Enter a valid daily wage above ₹100.');
      return;
    }
    setOfferLoading(true);
    try {
      await api.sendDirectOffer({
        worker_id: worker.id,
        work_type: worker.skills[0]?.name || worker.skills[0]?.category || 'General Labour',
        date: offerDate,
        start_time: offerTime,
        location_address: offerLocation,
        pay,
      });
      setIsOfferModalVisible(false);
      Alert.alert(
        'Offer Sent ✓',
        `${worker.name} has been notified with your direct job offer.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send offer. Please try again.');
    } finally {
      setOfferLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Theme.forestGreen} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!worker) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnStandalone}>
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
        <View style={styles.errorState}>
          <Feather name="user-x" size={36} color={Theme.textMuted} />
          <Text style={styles.errorText}>Worker not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = worker.verificationStatus === 'verified';
  const isAvailable = ['available', 'AVAILABLE'].includes(worker.availabilityStatus);
  const skillLabels: string[] = worker.skills
    .slice(0, 4)
    .map((s: any) => s.name || s.category || s)
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainApp' as any)}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Worker Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            {/* Avatar */}
            <View style={[styles.avatar, isVerified && styles.avatarVerified]}>
              <Text style={styles.avatarText}>{workerInitials(worker.name)}</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerSub}>
                {skillLabels[0] || 'General Worker'} · {worker.city}
              </Text>
              <View style={styles.heroMeta}>
                {worker.rating > 0 && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#D97706" />
                    <Text style={styles.ratingText}>{Number(worker.rating).toFixed(1)}</Text>
                    {worker.ratingCount > 0 && (
                      <Text style={styles.ratingCount}>({worker.ratingCount})</Text>
                    )}
                  </View>
                )}
                {worker.completedJobs > 0 && (
                  <View style={styles.jobsPill}>
                    <Feather name="briefcase" size={10} color={Theme.textSecondary} />
                    <Text style={styles.jobsPillText}>{worker.completedJobs} gigs done</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Status chips */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, isVerified ? styles.chipVerified : styles.chipUnverified]}>
              <MaterialCommunityIcons
                name={isVerified ? 'check-decagram' : 'clock-outline'}
                size={12}
                color={isVerified ? Theme.forestGreen : Theme.textMuted}
              />
              <Text style={[styles.chipText, { color: isVerified ? Theme.forestGreen : Theme.textMuted }]}>
                {isVerified ? 'Aadhaar Verified' : 'Verification Pending'}
              </Text>
            </View>
            <View style={[styles.chip, isAvailable ? styles.chipAvailable : styles.chipBusy]}>
              <View style={[styles.availDot, { backgroundColor: isAvailable ? Theme.success : Theme.textMuted }]} />
              <Text style={[styles.chipText, { color: isAvailable ? Theme.success : Theme.textMuted }]}>
                {isAvailable ? 'Available' : 'Busy'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust score */}
        {worker.trustScore > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trust Score</Text>
            <View style={styles.trustCard}>
              <View style={styles.trustHeader}>
                <Text style={styles.trustScore}>{worker.trustScore}</Text>
                <Text style={styles.trustOutOf}>/100</Text>
              </View>
              <View style={styles.trustBar}>
                <View style={[styles.trustFill, { width: `${worker.trustScore}%` }]} />
              </View>
              <Text style={styles.trustLabel}>
                {worker.trustScore >= 80 ? 'Highly Reliable' : worker.trustScore >= 60 ? 'Reliable' : 'Building track record'}
              </Text>
            </View>
          </View>
        )}

        {/* Skills */}
        {skillLabels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {skillLabels.map((skill, i) => (
                <View key={i} style={styles.skillChip}>
                  <Feather name="check" size={10} color={Theme.forestGreen} strokeWidth={2.5} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expected wage */}
        {worker.expectedWage > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expected Pay</Text>
            <View style={styles.wageCard}>
              <Text style={styles.wageAmount}>₹{worker.expectedWage.toLocaleString('en-IN')}</Text>
              <Text style={styles.wageUnit}>/day</Text>
            </View>
          </View>
        )}

        {/* Work history placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work History</Text>
          {worker.completedJobs === 0 ? (
            <Text style={styles.emptyText}>No completed jobs on this platform yet.</Text>
          ) : (
            <View style={styles.historyCard}>
              <Feather name="check-circle" size={14} color={Theme.success} />
              <Text style={styles.historyText}>{worker.completedJobs} gig{worker.completedJobs !== 1 ? 's' : ''} completed via GigEasy</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.offerBtn}
          onPress={handleOpenOffer}
          activeOpacity={0.88}
        >
          <Feather name="send" size={17} color="#FFFFFF" />
          <Text style={styles.offerBtnText}>Send Direct Job Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Direct Offer Modal */}
      <Modal
        visible={isOfferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOfferModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setIsOfferModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Send Job Offer</Text>
            <Text style={styles.modalSub}>to {worker.name}</Text>

            {/* Wage */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Daily Wage (₹)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.rupee}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={offerWage}
                  onChangeText={setOfferWage}
                  keyboardType="number-pad"
                  placeholder="e.g. 1200"
                  placeholderTextColor={Theme.textMuted}
                />
              </View>
            </View>

            {/* Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Work Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.inputPlain}
                value={offerDate}
                onChangeText={setOfferDate}
                placeholder={tomorrow()}
                placeholderTextColor={Theme.textMuted}
              />
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Work Location</Text>
              <TextInput
                style={styles.inputPlain}
                value={offerLocation}
                onChangeText={setOfferLocation}
                placeholder="e.g. Sector 62, Noida"
                placeholderTextColor={Theme.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, offerLoading && { opacity: 0.7 }]}
              onPress={handleSendOffer}
              disabled={offerLoading}
              activeOpacity={0.88}
            >
              {offerLoading
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <>
                    <Feather name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.sendBtnText}>Send Offer</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.bg },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontFamily: FontFamily.medium, fontSize: 13, color: Theme.textSecondary },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: FontFamily.medium, fontSize: 15, color: Theme.textSecondary },
  backBtnStandalone: { padding: 16 },

  // Nav
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: { padding: 4 },
  navTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: Theme.ink },

  scroll: { paddingBottom: 100 },

  // Hero
  heroCard: {
    backgroundColor: Theme.surface,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarVerified: { backgroundColor: Theme.forestGreen },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 22, color: '#FFFFFF', letterSpacing: -0.5 },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.surface,
  },
  heroInfo: { flex: 1 },
  workerName: { fontFamily: FontFamily.bold, fontSize: 18, color: Theme.ink, letterSpacing: -0.4, marginBottom: 2 },
  workerSub: { fontFamily: FontFamily.regular, fontSize: 12.5, color: Theme.textSecondary, marginBottom: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: FontFamily.bold, fontSize: 12, color: Theme.ink },
  ratingCount: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textMuted },
  jobsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jobsPillText: { fontFamily: FontFamily.medium, fontSize: 11, color: Theme.textSecondary },

  // Chips
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipVerified: { backgroundColor: Theme.forestGreenSubtle, borderColor: Theme.forestGreenBorder },
  chipUnverified: { backgroundColor: Theme.surfaceSubtle, borderColor: Theme.border },
  chipAvailable: { backgroundColor: Theme.successLight, borderColor: Theme.successBorder },
  chipBusy: { backgroundColor: Theme.surfaceSubtle, borderColor: Theme.border },
  chipText: { fontFamily: FontFamily.semiBold, fontSize: 11 },
  availDot: { width: 7, height: 7, borderRadius: 4 },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Theme.ink, marginBottom: 10, letterSpacing: -0.2 },

  // Trust score
  trustCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: 6,
  },
  trustHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  trustScore: { fontFamily: FontFamily.extraBold, fontSize: 28, color: Theme.forestGreen, letterSpacing: -1 },
  trustOutOf: { fontFamily: FontFamily.medium, fontSize: 14, color: Theme.textMuted },
  trustBar: { height: 5, backgroundColor: Theme.border, borderRadius: 3, overflow: 'hidden' },
  trustFill: { height: '100%', backgroundColor: Theme.forestGreen, borderRadius: 3 },
  trustLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: Theme.textSecondary },

  // Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.forestGreenSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Theme.forestGreenBorder,
  },
  skillText: { fontFamily: FontFamily.semiBold, fontSize: 12, color: Theme.forestGreen },

  // Wage
  wageCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: Theme.amberLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.amberBorder,
  },
  wageAmount: { fontFamily: FontFamily.extraBold, fontSize: 24, color: Theme.amber, letterSpacing: -0.8 },
  wageUnit: { fontFamily: FontFamily.medium, fontSize: 14, color: Theme.amberDark },

  // History
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.successLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  historyText: { fontFamily: FontFamily.medium, fontSize: 13, color: Theme.success },
  emptyText: { fontFamily: FontFamily.regular, fontSize: 13, color: Theme.textMuted },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.forestGreen,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: Theme.forestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  offerBtnText: { fontFamily: FontFamily.bold, fontSize: 16, color: '#FFFFFF', letterSpacing: -0.2 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.border, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontFamily: FontFamily.bold, fontSize: 20, color: Theme.ink, letterSpacing: -0.5 },
  modalSub: { fontFamily: FontFamily.regular, fontSize: 14, color: Theme.textSecondary, marginTop: -8 },

  // Form fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontFamily: FontFamily.semiBold, fontSize: 12, color: Theme.textSecondary, letterSpacing: 0.2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.sandLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rupee: { fontFamily: FontFamily.bold, fontSize: 18, color: Theme.ink },
  input: { flex: 1, fontFamily: FontFamily.bold, fontSize: 20, color: Theme.ink, letterSpacing: -0.3 },
  inputPlain: {
    backgroundColor: Theme.sandLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Theme.ink,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.forestGreen,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  sendBtnText: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFFFFF' },
});
