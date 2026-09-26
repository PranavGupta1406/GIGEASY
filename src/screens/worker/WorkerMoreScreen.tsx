// Worker More Screen — Refined Architecture & UX
// Clean grouping: Account · Settings (Language: English / हिंदी) · Payments · Help & Disputes · Legal · Logout
// Strictly minimal, trustworthy, and worker-friendly

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily } from '../../constants';
import { useLanguageStore, useAuthStore, useWorkerStore, useRecommendationStore } from '../../store';
import { CURRENT_WORKER } from '../../data/mockData';
import { authService } from '../../services/firebase';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  shellNavigation?: NavProp;
  navigation?: NavProp;
  onSwitchMode?: () => void;
  onNavigateTab?: (tabKey: string) => void;
}

export const WorkerMoreScreen: React.FC<Props> = ({
  shellNavigation,
  navigation,
  onSwitchMode,
  onNavigateTab,
}) => {
  const activeNav = shellNavigation || navigation;
  const { language, setLanguage, t } = useLanguageStore();
  const logout = useAuthStore((s) => s.logout);
  const workerProfile = useWorkerStore((s) => s.profile);
  const worker = workerProfile ?? CURRENT_WORKER;

  const {
    preferences: recPrefs,
    setAlertsEnabled,
    setMinAlertScore,
    setMaxDistanceKm,
    setMinPayPerDay,
  } = useRecommendationStore();

  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleSelectLanguage = (lang: 'en' | 'hi') => {
    if (language === lang) return;
    setLanguage(lang);
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'hi' ? 'लॉग आउट' : 'Sign Out',
      language === 'hi'
        ? 'क्या आप वाकई GigEasy से लॉग आउट करना चाहते हैं?'
        : 'Are you sure you want to sign out of GigEasy?',
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'लॉग आउट करें' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOutFirebase();
            } catch (_) {}
            logout();
            activeNav?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ]
    );
  };

  const handleHelpDesk = () => {
    Alert.alert(
      language === 'hi' ? 'मजदूर सहायता केंद्र' : 'Worker Cooperative Support',
      language === 'hi'
        ? 'टोल-फ्री हेल्पलाइन: 1800-266-7327\n(सोमवार से शनिवार, सुबह 8 बजे से रात 8 बजे तक)\n\nआपातकालीन सुरक्षा: 112\nसहकारी कार्यालय: सेक्टर 15 नोएडा'
        : 'Toll-Free Helpline: 1800-266-7327\n(Mon-Sat, 8:00 AM - 8:00 PM)\n\nEmergency Helpline: 112\nCooperative Society Desk: Sector 15 Noida Office',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {language === 'hi' ? 'अधिक' : 'More'}
        </Text>
        <Text style={styles.screenSubtitle}>
          {language === 'hi' ? 'खाता, सेटिंग्स और सहायता' : 'Account, Settings & Support'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── 1. Worker Identity Compact Card ─── */}
        <TouchableOpacity
          style={styles.profileSummaryCard}
          onPress={() => activeNav?.navigate('WorkerId')}
          activeOpacity={0.85}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {worker.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{worker.name}</Text>
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={10} color={Theme.forestGreen} />
                <Text style={styles.verifiedText}>
                  {language === 'hi' ? 'प्रमाणित' : 'Verified'}
                </Text>
              </View>
            </View>
            <Text style={styles.profileRole}>
              {worker.primaryTrade || 'Electrician'} · {worker.location.city}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={Theme.textMuted} />
        </TouchableOpacity>

        {/* ─── 2. SETTINGS & LANGUAGE (Dedicated Section) ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'hi' ? 'ऐप सेटिंग्स और भाषा' : 'APP SETTINGS & LANGUAGE'}
          </Text>

          {/* Explicit Language Cards */}
          <View style={styles.langSelectorBox}>
            <Text style={styles.langLabel}>
              {language === 'hi' ? 'भाषा चुनें (Select Language)' : 'Select Language'}
            </Text>
            <View style={styles.langOptionsRow}>
              <TouchableOpacity
                style={[styles.langOptionCard, language === 'en' && styles.langOptionCardActive]}
                onPress={() => handleSelectLanguage('en')}
                activeOpacity={0.8}
              >
                <View style={styles.langOptionLeft}>
                  <Text style={[styles.langOptionTitle, language === 'en' && styles.langOptionTitleActive]}>
                    English
                  </Text>
                  <Text style={styles.langOptionSubtitle}>Default</Text>
                </View>
                {language === 'en' && (
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langOptionCard, language === 'hi' && styles.langOptionCardActive]}
                onPress={() => handleSelectLanguage('hi')}
                activeOpacity={0.8}
              >
                <View style={styles.langOptionLeft}>
                  <Text style={[styles.langOptionTitle, language === 'hi' && styles.langOptionTitleActive]}>
                    हिंदी
                  </Text>
                  <Text style={styles.langOptionSubtitle}>Hindi</Text>
                </View>
                {language === 'hi' && (
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Instant Gig Alerts Switch */}
          <View style={styles.menuRow}>
            <View style={styles.iconCircle}>
              <Feather name="bell" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'तुरंत काम का अलर्ट' : 'Instant Gig Alerts'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'बेहतरीन मेल खाने वाले काम की सूचना' : 'Banner alerts for top-matched jobs'}
              </Text>
            </View>
            <Switch
              value={recPrefs.alertsEnabled}
              onValueChange={setAlertsEnabled}
              trackColor={{ false: Theme.border, true: Theme.forestGreenLight }}
              thumbColor={recPrefs.alertsEnabled ? Theme.forestGreen : '#A1A1AA'}
            />
          </View>

          {/* Instant Payment Notifications Switch */}
          <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircle}>
              <Feather name="dollar-sign" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'भुगतान सूचनाएं' : 'Payment Notifications'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'पैसे जमा होते ही सूचना पाएं' : 'Instant alerts for bank & UPI transfers'}
              </Text>
            </View>
            <Switch
              value={paymentAlerts}
              onValueChange={setPaymentAlerts}
              trackColor={{ false: Theme.border, true: Theme.forestGreenLight }}
              thumbColor={paymentAlerts ? Theme.forestGreen : '#A1A1AA'}
            />
          </View>
        </View>

        {/* ─── 3. PAYMENTS & EARNINGS ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'hi' ? 'पैसे और बैंक खाता' : 'PAYMENTS & PAYOUTS'}
          </Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              Alert.alert(
                language === 'hi' ? 'UPI और बैंक खाता' : 'UPI & Bank Account',
                language === 'hi'
                  ? `सत्यापित UPI ID: ${worker.phoneNumber.replace(/\D/g, '')}@icici\nभुगतान सीधे आपके खाते में जमा होता है।`
                  : `Verified UPI ID: ${worker.phoneNumber.replace(/\D/g, '')}@icici\nPayouts are transferred directly upon job completion.`
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Feather name="credit-card" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'बैंक खाता / UPI ID' : 'Bank Account & UPI'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {worker.phoneNumber.replace(/\D/g, '')}@icici · {language === 'hi' ? 'सत्यापित' : 'Active'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => {
              if (onNavigateTab) {
                onNavigateTab('MyWork');
              } else {
                activeNav?.navigate('WorkerTabs' as any);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Feather name="clock" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'कमाई का हिसाब' : 'Earnings Breakdown'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'किए गए काम और भुगतान रसीदें' : 'View completed gigs and digital receipts'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── 4. SUPPORT & WELFARE ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'hi' ? 'सहायता और सुरक्षा' : 'SUPPORT & DISPUTES'}
          </Text>

          <TouchableOpacity style={styles.menuRow} onPress={handleHelpDesk} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
              <Feather name="headphones" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'मजदूर सहायता हेल्पलाइन' : 'Cooperative Help Desk'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                1800-266-7327 ({language === 'hi' ? 'टोल-फ्री' : 'Toll-Free'})
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => activeNav?.navigate('Dispute')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="scale-balance" size={18} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'विवाद समाधान बोर्ड' : 'Dispute Mediation Board'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'पैसे या काम की समस्या का समाधान' : 'Resolve wage issues within 24 hours'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => activeNav?.navigate('WorkerWelfare')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Feather name="shield" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'बीमा और कल्याण योजनाएं' : 'Insurance & Welfare Benefits'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'दुर्घटना बीमा और सहायता' : 'Accident coverage & cooperative welfare'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── 5. LEGAL & TERMS ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'hi' ? 'नियम व शर्तें' : 'TERMS & PRIVACY'}
          </Text>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => setShowLegalModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Feather name="file-text" size={16} color={Theme.ink} />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={styles.menuRowTitle}>
                {language === 'hi' ? 'सेवा की शर्तें और गोपनीयता' : 'Terms of Service & Privacy'}
              </Text>
              <Text style={styles.menuRowSubtitle}>GigEasy FairWork Protocol v2.4</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── 6. ACCOUNT ACTIONS ─── */}
        <View style={[styles.sectionCard, { marginBottom: 12 }]}>
          {onSwitchMode && (
            <TouchableOpacity
              style={styles.menuRow}
              onPress={onSwitchMode}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Feather name="briefcase" size={16} color={Theme.ink} />
              </View>
              <View style={styles.menuRowContent}>
                <Text style={styles.menuRowTitle}>
                  {language === 'hi' ? 'मालिक मोड में बदलें' : 'Switch to Employer Mode'}
                </Text>
                <Text style={styles.menuRowSubtitle}>
                  {language === 'hi' ? 'कामगारों को काम पर रखने के लिए' : 'Hire workers for your jobs'}
                </Text>
              </View>
              <Feather name="repeat" size={16} color={Theme.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="log-out" size={16} color="#B91C1C" />
            </View>
            <View style={styles.menuRowContent}>
              <Text style={[styles.menuRowTitle, { color: '#B91C1C' }]}>
                {language === 'hi' ? 'लॉग आउट' : 'Sign Out'}
              </Text>
              <Text style={styles.menuRowSubtitle}>
                {language === 'hi' ? 'GigEasy खाते से बाहर निकलें' : 'Sign out of your account'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Legal Terms Modal ─── */}
      <Modal
        visible={showLegalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLegalModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'hi' ? 'नियम और गोपनीयता' : 'Terms & Privacy'}
              </Text>
              <TouchableOpacity onPress={() => setShowLegalModal(false)} style={{ padding: 4 }}>
                <Feather name="x" size={20} color={Theme.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.legalBody}>
                {language === 'hi'
                  ? 'GigEasy भारत के कामगारों और मालिकों के बीच निष्पक्ष, पारदर्शी और सुरक्षित काम का मंच प्रदान करता है।\n\n1. दिहाड़ी सुरक्षा: काम शुरू होने से पहले दिहाड़ी सुरक्षित एस्क्रो में जमा की जाती है।\n2. हाजिरी प्रमाण: GPS हाजिरी से कामगार की उपस्थिति दर्ज होती है।\n3. निष्पक्ष विवाद समाधान: श्रम सहकारी समिति द्वारा 24 घंटे में विवादों का निपटारा किया जाता है।\n4. डेटा गोपनीयता: कामगारों और मालिकों का व्यक्तिगत विवरण पूरी तरह सुरक्षित रखा जाता है।'
                  : 'GigEasy operates under the FairWork Cooperative Protocol ensuring transparency, safety, and escrow-backed wage guarantees.\n\n1. Wage Guarantee: All employer deposits are locked in escrow prior to shift commencement.\n2. Verified Attendance: GPS timestamping validates on-site presence.\n3. Democratic Dispute Resolution: Managed cooperatively without predatory account terminations.\n4. Data Privacy: Worker and employer credentials are encrypted and strictly protected.'}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowLegalModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseBtnText}>
                {language === 'hi' ? 'समझ गया' : 'Understood'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },

  // Profile Card
  profileSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.accent,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  verifiedText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: Theme.forestGreen,
  },
  profileRole: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 2,
  },

  // Grouped Card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  sectionHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  // Language Selector
  langSelectorBox: {
    backgroundColor: '#F9F9F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  langLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11.5,
    color: Theme.ink,
  },
  langOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langOptionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  langOptionCardActive: {
    borderColor: Theme.forestGreen,
    backgroundColor: '#F0FDF4',
  },
  langOptionLeft: {
    gap: 1,
  },
  langOptionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
  },
  langOptionTitleActive: {
    color: Theme.forestGreen,
  },
  langOptionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F2ED',
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F2ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowContent: {
    flex: 1,
    gap: 2,
  },
  menuRowTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },
  menuRowSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.ink,
  },
  legalBody: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.ink,
    lineHeight: 18,
  },
  modalCloseBtn: {
    backgroundColor: Theme.ink,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
