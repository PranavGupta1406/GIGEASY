// GigEasy Payment Screen — High-Trust Consumer Payout Flow
// Supports UPI, Dynamic QR Code, and Razorpay Test Mode
// Full interactive processing state, receipt generation, and real-time store update

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
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { formatWage, formatDate } from '../../data/mockData';
import { useSharedApplicationsStore, useEmployerStore } from '../../store';
import { Theme } from '../../theme';
import { GigEasyVerifiedBadge } from '../../components/GigEasyPrimitives';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

type PaymentMethod = 'UPI' | 'QR_CODE' | 'RAZORPAY';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'zap' },
  { id: 'phonepe', name: 'PhonePe', icon: 'smartphone' },
  { id: 'paytm', name: 'Paytm UPI', icon: 'credit-card' },
  { id: 'bhim', name: 'BHIM UPI', icon: 'shield' },
];

export const PaymentScreen: React.FC<Props> = ({ route, navigation }: any) => {
  const { applicationId } = route.params || {};

  const { getApplication, recordPayment } = useSharedApplicationsStore();
  const app = getApplication(applicationId);

  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txReceipt, setTxReceipt] = useState<any>(null);

  const wageAmount = app?.agreedWage ?? app?.proposedWage ?? 1000;
  const workerName = app?.worker?.name ?? 'Ravi Kumar';
  const jobTitle = app?.job?.title ?? 'Warehouse Loader';
  const jobCity = app?.job?.location?.city ?? 'Noida';

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
    }, 900);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1800);

    setTimeout(() => {
      const generatedTxId = `PAY_GIG_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const receipt = recordPayment({
        applicationId: app?.id ?? `app_${Date.now()}`,
        jobId: app?.jobId ?? 'j1',
        jobTitle: jobTitle,
        workerId: app?.workerId ?? 'w1',
        workerName: workerName,
        employerId: app?.job?.employerId ?? 'e1',
        employerName: app?.job?.employer?.businessName ?? 'Bharat Logistics',
        amount: wageAmount,
        method: method,
        transactionId: generatedTxId,
        upiId: `${workerName.toLowerCase().replace(/\s+/g, '')}@icici`,
        status: 'SUCCESS',
      });

      setTxReceipt(receipt);
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2600);
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  if (paymentSuccess && txReceipt) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />
        <View style={styles.successWrapper}>
          <View style={styles.successCheckCircle}>
            <Feather name="check" size={44} color={Theme.surface} />
          </View>

          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            {formatWage(wageAmount)} transferred directly to {workerName}
          </Text>

          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={styles.receiptValHighlight}>{txReceipt.transactionId}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Worker Paid</Text>
              <Text style={styles.receiptVal}>{workerName}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Gig Title</Text>
              <Text style={styles.receiptVal}>{jobTitle}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment Mode</Text>
              <Text style={styles.receiptVal}>{method === 'UPI' ? 'UPI Instant Transfer' : method === 'QR_CODE' ? 'Scan & Pay QR' : 'Razorpay Gateway'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptVal}>{formatDate(txReceipt.paidAt)} · Just now</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { fontFamily: FontFamily.bold, color: Theme.ink }]}>Total Amount</Text>
              <Text style={styles.receiptTotal}>{formatWage(wageAmount)}</Text>
            </View>
          </View>

          <View style={styles.escrowTrustBanner}>
            <Feather name="shield" size={16} color={Theme.success} />
            <Text style={styles.escrowTrustText}>GigEasy Escrow Verified · Instant Payout Confirmed</Text>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={handleFinish} activeOpacity={0.88}>
            <Text style={styles.doneBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Pay Worker</Text>
          <Text style={styles.headerSub}>GigEasy Secure Direct Payout</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Work Completed Badge */}
        <View style={styles.completionBanner}>
          <View style={styles.completionDot} />
          <Text style={styles.completionBannerText}>WORK COMPLETED & CONFIRMED</Text>
        </View>

        {/* Worker Summary Card */}
        <View style={styles.card}>
          <View style={styles.workerSummaryRow}>
            <View style={styles.workerAvatar}>
              <Text style={styles.workerAvatarText}>{workerName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.workerNameText}>{workerName}</Text>
                <GigEasyVerifiedBadge small />
              </View>
              <Text style={styles.jobSubText}>{jobTitle} · {jobCity}</Text>
              <Text style={styles.jobDateText}>Completed Shift · 1 Day Full Attendance</Text>
            </View>
          </View>
        </View>

        {/* Amount Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Agreed Daily Wage</Text>
            <Text style={styles.breakdownVal}>{formatWage(wageAmount)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Escrow Fee</Text>
            <Text style={[styles.breakdownVal, { color: Theme.success }]}>₹0 (Free Demo)</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>TDS / Taxes</Text>
            <Text style={styles.breakdownVal}>₹0</Text>
          </View>

          <View style={styles.breakdownDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable Amount</Text>
              <Text style={styles.totalSub}>100% credited to worker account</Text>
            </View>
            <Text style={styles.totalAmount}>{formatWage(wageAmount)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Payment Method</Text>

          {/* UPI Option */}
          <TouchableOpacity
            style={[styles.methodOption, method === 'UPI' && styles.methodOptionSelected]}
            onPress={() => setMethod('UPI')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodRadio, method === 'UPI' && styles.methodRadioSelected]}>
              {method === 'UPI' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="zap" size={16} color={Theme.primary} />
                <Text style={styles.methodTitle}>Pay with UPI (Instant)</Text>
              </View>
              <Text style={styles.methodDesc}>GPay, PhonePe, Paytm, BHIM</Text>
            </View>
          </TouchableOpacity>

          {method === 'UPI' && (
            <View style={styles.upiAppsRow}>
              {UPI_APPS.map((appItem) => {
                const isSelected = selectedUpiApp === appItem.id;
                return (
                  <TouchableOpacity
                    key={appItem.id}
                    style={[styles.upiAppChip, isSelected && styles.upiAppChipSelected]}
                    onPress={() => setSelectedUpiApp(appItem.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name={appItem.icon as any} size={14} color={isSelected ? Theme.primary : Theme.textSecondary} />
                    <Text style={[styles.upiAppText, isSelected && styles.upiAppTextSelected]}>{appItem.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* QR Code Option */}
          <TouchableOpacity
            style={[styles.methodOption, method === 'QR_CODE' && styles.methodOptionSelected, { marginTop: 10 }]}
            onPress={() => setMethod('QR_CODE')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodRadio, method === 'QR_CODE' && styles.methodRadioSelected]}>
              {method === 'QR_CODE' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="camera" size={16} color={Theme.ink} />
                <Text style={styles.methodTitle}>Scan & Pay Dynamic QR</Text>
              </View>
              <Text style={styles.methodDesc}>Scan with any banking / UPI app</Text>
            </View>
          </TouchableOpacity>

          {method === 'QR_CODE' && (
            <View style={styles.qrDisplayBox}>
              <View style={styles.qrMockFrame}>
                <Feather name="grid" size={100} color={Theme.ink} />
              </View>
              <Text style={styles.qrCaption}>Scan with GPay / PhonePe to pay {formatWage(wageAmount)}</Text>
            </View>
          )}

          {/* Razorpay Test Mode Option */}
          <TouchableOpacity
            style={[styles.methodOption, method === 'RAZORPAY' && styles.methodOptionSelected, { marginTop: 10 }]}
            onPress={() => setMethod('RAZORPAY')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodRadio, method === 'RAZORPAY' && styles.methodRadioSelected]}>
              {method === 'RAZORPAY' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="credit-card" size={16} color="#0C2340" />
                <Text style={styles.methodTitle}>Razorpay Gateway (Test Mode)</Text>
              </View>
              <Text style={styles.methodDesc}>Debit / Credit Card, NetBanking & Corporate</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Processing Modal Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Theme.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.processingTitle}>
              {processingStep === 1 ? 'Connecting Gateway...' : processingStep === 2 ? 'Authorizing Payout...' : 'Finalizing Escrow Release...'}
            </Text>
            <Text style={styles.processingSub}>
              {processingStep === 1
                ? 'Opening secure UPI channel'
                : processingStep === 2
                ? `Verifying bank confirmation for ${formatWage(wageAmount)}`
                : 'Generating transaction receipt'}
            </Text>
          </View>
        </View>
      )}

      {/* Sticky Bottom Pay CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleProcessPayment}
          activeOpacity={0.88}
          disabled={isProcessing}
        >
          <Feather name="lock" size={16} color={Theme.surface} />
          <Text style={styles.payButtonText}>PAY {formatWage(wageAmount)} NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: Theme.ink, letterSpacing: -0.4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: 12, color: Theme.textSecondary, marginTop: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  completionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.success },
  completionBannerText: { fontFamily: FontFamily.bold, fontSize: 11.5, color: '#065F46', letterSpacing: 0.5 },

  card: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: 14, color: Theme.ink, marginBottom: 12 },

  workerSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarText: { fontFamily: FontFamily.bold, fontSize: 20, color: Theme.primary },
  workerNameText: { fontFamily: FontFamily.bold, fontSize: 16, color: Theme.ink },
  jobSubText: { fontFamily: FontFamily.medium, fontSize: 12.5, color: Theme.textSecondary, marginTop: 2 },
  jobDateText: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textMuted, marginTop: 2 },

  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  breakdownLabel: { fontFamily: FontFamily.regular, fontSize: 13, color: Theme.textSecondary },
  breakdownVal: { fontFamily: FontFamily.semiBold, fontSize: 13, color: Theme.ink },
  breakdownDivider: { height: 1, backgroundColor: Theme.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: FontFamily.bold, fontSize: 14, color: Theme.ink },
  totalSub: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textMuted, marginTop: 1 },
  totalAmount: { fontFamily: FontFamily.extraBold, fontSize: 22, color: Theme.primary, letterSpacing: -0.5 },

  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    backgroundColor: Theme.surfaceSubtle,
  },
  methodOptionSelected: { borderColor: Theme.primary, backgroundColor: Theme.primaryLight },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodRadioSelected: { borderColor: Theme.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.primary },
  methodTitle: { fontFamily: FontFamily.bold, fontSize: 13.5, color: Theme.ink },
  methodDesc: { fontFamily: FontFamily.regular, fontSize: 11, color: Theme.textSecondary, marginTop: 1 },

  upiAppsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingLeft: 32 },
  upiAppChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  upiAppChipSelected: { borderColor: Theme.primary, backgroundColor: Theme.primaryLight },
  upiAppText: { fontFamily: FontFamily.medium, fontSize: 11.5, color: Theme.textSecondary },
  upiAppTextSelected: { fontFamily: FontFamily.bold, color: Theme.primary },

  qrDisplayBox: { alignItems: 'center', marginTop: 12, paddingVertical: 10 },
  qrMockFrame: {
    padding: 16,
    backgroundColor: Theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCaption: { fontFamily: FontFamily.medium, fontSize: 11.5, color: Theme.textSecondary, marginTop: 8 },

  processingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 99,
  },
  processingCard: {
    backgroundColor: Theme.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  processingTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: Theme.ink, textAlign: 'center', marginBottom: 4 },
  processingSub: { fontFamily: FontFamily.regular, fontSize: 12, color: Theme.textSecondary, textAlign: 'center' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 28,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.primary,
    borderRadius: 14,
    height: 52,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  payButtonText: { fontFamily: FontFamily.bold, fontSize: 15, color: Theme.surface, letterSpacing: 0.3 },

  // Success screen
  successWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 36, alignItems: 'center' },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: Theme.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: { fontFamily: FontFamily.extraBold, fontSize: 24, color: Theme.ink, letterSpacing: -0.5, marginBottom: 6 },
  successSubtitle: { fontFamily: FontFamily.medium, fontSize: 13.5, color: Theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  receiptCard: {
    width: '100%',
    backgroundColor: Theme.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  receiptLabel: { fontFamily: FontFamily.regular, fontSize: 12.5, color: Theme.textSecondary },
  receiptVal: { fontFamily: FontFamily.semiBold, fontSize: 12.5, color: Theme.ink },
  receiptValHighlight: { fontFamily: FontFamily.bold, fontSize: 12, color: Theme.primary },
  receiptDivider: { height: 1, backgroundColor: Theme.border, marginVertical: 8 },
  receiptTotal: { fontFamily: FontFamily.extraBold, fontSize: 18, color: Theme.success },
  escrowTrustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 24,
  },
  escrowTrustText: { fontFamily: FontFamily.bold, fontSize: 11, color: '#065F46' },
  doneBtn: {
    width: '100%',
    backgroundColor: Theme.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  doneBtnText: { fontFamily: FontFamily.bold, fontSize: 15, color: Theme.surface, letterSpacing: 0.2 },
});
