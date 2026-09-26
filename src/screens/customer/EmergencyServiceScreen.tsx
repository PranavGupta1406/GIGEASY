// Emergency Household Service Screen — SIH 26089
// Rapid cooperative emergency response: burst pipes, electrical short circuits, lockouts
// Guaranteed zero surge-pricing, priority cooperative dispatch, live ETA

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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { MOCK_WORKERS } from '../../data/mockData';
import { calculateGeospatialDistance } from '../../services/allocation/fairWorkEngine';
import { useServiceRequestStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

const EMERGENCY_TYPES = [
  {
    id: 'em_pipe',
    title: 'Burst Pipe / Major Leak',
    trade: 'Plumbing',
    icon: 'water-alert',
    eta: '12-18 mins',
    desc: 'Uncontrolled water leak or pipe fracture causing household flooding.',
  },
  {
    id: 'em_spark',
    title: 'Electrical Spark / Short',
    trade: 'Electrical',
    icon: 'flash-alert',
    eta: '10-15 mins',
    desc: 'Sparking switchboard, burning wire odor, or sudden localized blackout.',
  },
  {
    id: 'em_lock',
    title: 'Lockout / Broken Key',
    trade: 'Carpentry',
    icon: 'lock-alert',
    eta: '15-20 mins',
    desc: 'Locked outside home or broken main door lock latch.',
  },
  {
    id: 'em_appliance',
    title: 'Refrigeration / Gas Hazard',
    trade: 'Appliance Repair',
    icon: 'gas-cylinder',
    eta: '15-25 mins',
    desc: 'Kitchen appliance spark, gas regulator check, or urgent freezer failure.',
  },
];

export const EmergencyServiceScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedEmergency, setSelectedEmergency] = useState(EMERGENCY_TYPES[0]);
  const [dispatched, setDispatched] = useState<boolean>(false);

  const { createRequest } = useServiceRequestStore();

  // Find nearest available worker
  const customerLoc = { lat: 28.625, lng: 77.215 };
  const nearestWorker = MOCK_WORKERS
    .filter((w) => w.availabilityStatus !== 'unavailable')
    .sort((a, b) => {
      const distA = calculateGeospatialDistance(a.location.lat, a.location.lng, customerLoc.lat, customerLoc.lng);
      const distB = calculateGeospatialDistance(b.location.lat, b.location.lng, customerLoc.lat, customerLoc.lng);
      return distA - distB;
    })[0] || MOCK_WORKERS[0];

  const handleDispatch = () => {
    createRequest({
      serviceCategory: selectedEmergency.trade as any,
      serviceTitle: `EMERGENCY: ${selectedEmergency.title}`,
      description: selectedEmergency.desc,
      urgency: 'emergency',
      assignedWorkerId: nearestWorker.id,
      assignedWorker: nearestWorker,
      status: 'WORKER_ASSIGNED',
      estimatedArrivalMins: 14,
    });

    setDispatched(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Red Emergency Header */}
      <View style={styles.emergencyHeader}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.surface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>EMERGENCY RESPONSE</Text>
          <Text style={styles.headerSub}>Rapid Cooperative Dispatch · No Surge Pricing</Text>
        </View>
        <View style={styles.sirenWrap}>
          <MaterialCommunityIcons name="alarm-light" size={22} color={Theme.surface} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dispatched ? (
          <View style={styles.dispatchedCard}>
            <View style={styles.dispatchedIconCircle}>
              <MaterialCommunityIcons name="truck-fast" size={40} color="#DC2626" />
            </View>
            <Text style={styles.dispatchedTitle}>Emergency Worker Dispatched!</Text>
            <Text style={styles.dispatchedSub}>
              {nearestWorker.name} has been notified and is navigating to your address immediately.
            </Text>

            <View style={styles.etaBox}>
              <Text style={styles.etaBigNumber}>~14</Text>
              <Text style={styles.etaBigLabel}>MINUTES ARRIVAL ETA</Text>
            </View>

            <View style={styles.workerSummary}>
              <Text style={styles.summaryWorkerName}>{nearestWorker.name}</Text>
              <Text style={styles.summaryCoop}>{nearestWorker.cooperativeName}</Text>
              <Text style={styles.summaryPhone}>{nearestWorker.phoneNumber}</Text>
            </View>

            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.returnBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Zero Surge Banner */}
            <View style={styles.zeroSurgeBanner}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.zeroSurgeTitle}>Cooperative Zero-Surge Guarantee</Text>
                <Text style={styles.zeroSurgeDesc}>
                  Unlike private aggregators that charge 2x–3x during emergencies, cooperatives offer fixed standard emergency rates (₹450 callout).
                </Text>
              </View>
            </View>

            {/* Emergency Type Selector */}
            <Text style={styles.sectionLabel}>SELECT EMERGENCY SITUATION</Text>
            <View style={styles.emergencyList}>
              {EMERGENCY_TYPES.map((em) => {
                const isSelected = selectedEmergency.id === em.id;
                return (
                  <TouchableOpacity
                    key={em.id}
                    style={[styles.emCard, isSelected && styles.emCardSelected]}
                    onPress={() => setSelectedEmergency(em)}
                  >
                    <View style={styles.emCardTop}>
                      <View style={[styles.emIconWrap, isSelected && styles.emIconWrapSelected]}>
                        <MaterialCommunityIcons
                          name={em.icon as any}
                          size={22}
                          color={isSelected ? '#DC2626' : Theme.ink}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.emTitle}>{em.title}</Text>
                        <Text style={styles.emDesc}>{em.desc}</Text>
                      </View>
                    </View>
                    <View style={styles.emFooter}>
                      <Text style={styles.emTrade}>{em.trade}</Text>
                      <View style={styles.etaPill}>
                        <Feather name="clock" size={11} color="#DC2626" />
                        <Text style={styles.etaPillText}>ETA: {em.eta}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nearest Worker Standby */}
            <View style={styles.standbyCard}>
              <Text style={styles.standbyTitle}>Fastest Available On-Duty Worker</Text>
              <View style={styles.standbyRow}>
                <View style={styles.standbyAvatar}>
                  <Text style={styles.standbyInitials}>
                    {nearestWorker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.standbyWorkerName}>{nearestWorker.name}</Text>
                  <Text style={styles.standbyCoop}>{nearestWorker.cooperativeName}</Text>
                  <Text style={styles.standbyDist}>1.4 km from your location · Verified Member</Text>
                </View>
              </View>
            </View>

            {/* One Tap Emergency Dispatch CTA */}
            <TouchableOpacity style={styles.dispatchBtn} onPress={handleDispatch}>
              <MaterialCommunityIcons name="alarm-light" size={20} color={Theme.surface} />
              <Text style={styles.dispatchBtnText}>
                DISPATCH EMERGENCY WORKER NOW · ₹450
              </Text>
            </TouchableOpacity>
          </>
        )}

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
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerBackBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.surface,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#FECACA',
    marginTop: 1,
  },
  sirenWrap: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  zeroSurgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  zeroSurgeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#065F46',
  },
  zeroSurgeDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  emergencyList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  emCardSelected: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  emCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emIconWrapSelected: {
    backgroundColor: '#FEE2E2',
  },
  emTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  emDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  emFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  emTrade: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.textMuted,
    textTransform: 'uppercase',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  etaPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#DC2626',
  },
  standbyCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  standbyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
    marginBottom: 8,
  },
  standbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  standbyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standbyInitials: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.surface,
  },
  standbyWorkerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  standbyCoop: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  standbyDist: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.success,
    marginTop: 2,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  dispatchBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
    letterSpacing: 0.5,
  },
  dispatchedCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  dispatchedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dispatchedTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Theme.ink,
    textAlign: 'center',
  },
  dispatchedSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  etaBox: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  etaBigNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: '#DC2626',
  },
  etaBigLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#DC2626',
    letterSpacing: 1,
  },
  workerSummary: {
    width: '100%',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  summaryWorkerName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Theme.ink,
  },
  summaryCoop: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  summaryPhone: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.ink,
    marginTop: 4,
  },
  returnBtn: {
    width: '100%',
    backgroundColor: Theme.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  returnBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
});
