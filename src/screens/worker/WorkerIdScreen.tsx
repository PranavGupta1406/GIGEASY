// Worker ID Screen — Single Unified Professional Worker Identity
// Replaces previous separate Passport + Profile tabs into one authoritative, practical worker record.
// White-First · Information-First · Zero AI Gimmicks · Production Ready

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily } from '../../constants';
import { CURRENT_WORKER, formatWage } from '../../data/mockData';
import { useWorkerStore, useAuthStore, useWelfareStore, useSharedApplicationsStore, useLanguageStore } from '../../store';
import { getLocalizedCategory } from '../../i18n/translations';
import { WorkerProfile, WorkHistoryItem } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  shellNavigation?: NavProp;
  navigation?: NavProp;
  onSwitchMode?: () => void;
}

export const WorkerIdScreen: React.FC<Props> = ({ shellNavigation, navigation }) => {
  const activeNav = shellNavigation || navigation;
  const { t, language } = useLanguageStore();
  const storeProfile = useWorkerStore((s) => s.profile);
  const isAvailableStore = useWorkerStore((s) => s.isAvailable);
  const { setAvailability, updateProfile } = useWorkerStore();

  const authName = useAuthStore((s) => s.name);
  const authPhone = useAuthStore((s) => s.phoneNumber);
  const authKyc = useAuthStore((s) => s.kycStatus);

  const worker: WorkerProfile = storeProfile ?? {
    ...CURRENT_WORKER,
    name: authName || CURRENT_WORKER.name,
    phoneNumber: authPhone || CURRENT_WORKER.phoneNumber,
    verificationStatus: (authKyc as any) || CURRENT_WORKER.verificationStatus,
  };

  const { getWorkerWelfare } = useWelfareStore();
  const welfare = worker.welfare ?? getWorkerWelfare(worker.id);

  // Completed jobs from shared applications store
  const { getWorkerApplications } = useSharedApplicationsStore();
  const workerApps = getWorkerApplications(worker.id);
  const completedFromStore = workerApps
    .filter((a) => a.status === 'COMPLETED' || a.status === 'PAID')
    .map((a) => ({
      id: a.id,
      jobTitle: a.job?.title || 'Completed Gig',
      employerName: a.job?.employer?.businessName || 'Employer',
      wage: a.agreedWage ?? a.proposedWage,
      date: new Date(a.appliedAt).toISOString().split('T')[0],
      rating: 5,
      status: 'completed' as const,
      serviceCategory: undefined,
    }));

  const combinedWorkHistory: WorkHistoryItem[] = [
    ...completedFromStore,
    ...(worker.workHistory || []),
  ];

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(worker.name);
  const [editTrade, setEditTrade] = useState(worker.primaryTrade || 'Electrician');
  const [editPhone, setEditPhone] = useState(worker.phoneNumber);
  const [editCity, setEditCity] = useState(worker.location.city);
  const [editState, setEditState] = useState(worker.location.state);
  const [editWage, setEditWage] = useState(String(worker.expectedDailyWage || 1200));
  const [editRadius, setEditRadius] = useState(String(worker.preferredRadius || 15));
  const [editBio, setEditBio] = useState(worker.bio || '');

  const handleToggleAvailability = (val: boolean) => {
    setAvailability(val);
    updateProfile({
      availabilityStatus: val ? 'available' : 'busy',
    });
  };

  const handleSaveEdit = () => {
    const numWage = parseInt(editWage, 10) || 1200;
    const numRadius = parseInt(editRadius, 10) || 15;

    updateProfile({
      name: editName.trim() || worker.name,
      primaryTrade: editTrade.trim() || 'Electrician',
      phoneNumber: editPhone.trim() || worker.phoneNumber,
      bio: editBio.trim() || worker.bio,
      expectedDailyWage: numWage,
      preferredRadius: numRadius,
      location: {
        ...worker.location,
        city: editCity.trim() || worker.location.city,
        state: editState.trim() || worker.location.state,
      },
    });

    setIsEditModalOpen(false);
    Alert.alert('Worker ID Updated', 'Your profile and work preferences have been saved.');
  };

  const isAvailable = worker.availabilityStatus === 'available' && isAvailableStore;
  const primaryTrade = worker.primaryTrade || worker.skills?.[0]?.name || 'Skilled Worker';

  return (
    <View style={styles.container}>
      {/* ─── Top Screen Bar ─── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>{language === 'hi' ? 'मेरा Worker ID' : 'Worker ID'}</Text>
          <Text style={styles.screenSubtitle}>
            {language === 'hi' ? 'प्रमाणित कामगार पहचान व रिकॉर्ड' : 'Professional Worker Record & Credentials'}
          </Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => setIsQrModalOpen(true)}
            activeOpacity={0.8}
            accessibilityLabel="Show QR Code"
          >
            <MaterialCommunityIcons name="qrcode-scan" size={17} color={Theme.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setEditName(worker.name);
              setEditTrade(primaryTrade);
              setEditPhone(worker.phoneNumber);
              setEditCity(worker.location.city);
              setEditState(worker.location.state);
              setEditWage(String(worker.expectedDailyWage || 1200));
              setEditRadius(String(worker.preferredRadius || 15));
              setEditBio(worker.bio || '');
              setIsEditModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Feather name="edit-2" size={13} color={Theme.ink} />
            <Text style={styles.editBtnText}>{language === 'hi' ? 'बदलें' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── 1. Identity Card ─── */}
        <View style={styles.identityCard}>
          <View style={styles.identityMainRow}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {worker.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
              <View style={[styles.avatarStatusDot, isAvailable ? styles.dotGreen : styles.dotGrey]} />
            </View>

            {/* Info */}
            <View style={styles.identityInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.primaryTrade}>{primaryTrade}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={11} color={Theme.textSecondary} />
                <Text style={styles.locationText}>
                  {worker.location.city}, {worker.location.state}
                </Text>
              </View>
            </View>
          </View>

          {/* Availability Toggle Strip */}
          <View style={styles.availabilityStrip}>
            <View style={styles.availabilityStatusLeft}>
              <View style={[styles.statusIndicatorCircle, isAvailable ? styles.bgSuccess : styles.bgGrey]} />
              <Text style={styles.availabilityLabel}>
                {isAvailable
                  ? (language === 'hi' ? 'काम के लिए उपलब्ध हैं' : 'Available for work')
                  : (language === 'hi' ? 'अभी उपलब्ध नहीं हैं' : 'Currently unavailable')}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: Theme.border, true: Theme.successLight }}
              thumbColor={isAvailable ? Theme.success : '#A1A1AA'}
              style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
            />
          </View>

          {/* Cooperative Endorsement Section */}
          <View style={styles.coopSection}>
            <View style={styles.coopBadgeHeader}>
              <MaterialCommunityIcons name="shield-check" size={15} color={Theme.success} />
              <Text style={styles.coopBadgeTitle}>
                {language === 'hi' ? 'प्रमाणित कोऑपरेटिव कामगार' : 'Verified Cooperative Worker'}
              </Text>
            </View>
            <Text style={styles.coopNameText}>
              {language === 'hi' ? 'कोऑपरेटिव समिति: ' : 'Cooperative: '}
              {worker.cooperativeName || 'Delhi Plumbing & Electrical Workers Cooperative'}
            </Text>
            {worker.cooperativeMemberSince && (
              <Text style={styles.coopMemberSince}>
                {language === 'hi' ? 'सदस्य: ' : 'Member since '}
                {new Date(worker.cooperativeMemberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </Text>
            )}
          </View>

          {/* Verification Badges Grid (Genuine & Useful) */}
          <View style={styles.verificationsGrid}>
            <View style={styles.verificationPill}>
              <Feather name="check-circle" size={13} color={Theme.success} />
              <Text style={styles.verificationText}>{language === 'hi' ? 'पहचान जांच पूरी' : 'Identity Verified'}</Text>
            </View>
            <View style={styles.verificationPill}>
              <Feather name="check-circle" size={13} color={Theme.success} />
              <Text style={styles.verificationText}>{language === 'hi' ? 'कोऑपरेटिव सदस्य' : 'Cooperative Verified'}</Text>
            </View>
            <View style={styles.verificationPill}>
              <Feather name="check-circle" size={13} color={Theme.success} />
              <Text style={styles.verificationText}>{language === 'hi' ? 'स्किल प्रमाणित' : 'Skill Verified'}</Text>
            </View>
            <View style={styles.verificationPill}>
              <Feather name="check-circle" size={13} color={Theme.success} />
              <Text style={styles.verificationText}>{language === 'hi' ? 'बीमा सक्रिय' : 'Insurance Active'}</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. Professional Summary (Employment Metrics) ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{language === 'hi' ? 'काम का रिकॉर्ड' : 'Professional Summary'}</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{worker.completedJobs}</Text>
              <Text style={styles.metricLabel}>{language === 'hi' ? 'किए गए काम' : 'Jobs completed'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{worker.rating.toFixed(1)} ★</Text>
              <Text style={styles.metricLabel}>{language === 'hi' ? 'रेटिंग' : 'Rating'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{worker.experienceYears} {language === 'hi' ? 'साल' : 'yrs'}</Text>
              <Text style={styles.metricLabel}>{language === 'hi' ? 'काम का अनुभव' : 'Experience'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Theme.success }]}>{worker.trustScore}</Text>
              <Text style={styles.metricLabel}>{language === 'hi' ? 'भरोसा स्कोर' : 'Trust Score'}</Text>
            </View>
          </View>
        </View>

        {/* ─── 3. Skills & Certifications ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>{language === 'hi' ? 'स्किल व प्रमाणपत्र' : 'Skills & Certifications'}</Text>

          {/* Verified Skills */}
          <Text style={styles.subsectionSubtitle}>{language === 'hi' ? 'प्रमाणित स्किल' : 'Verified Skills'}</Text>
          <View style={styles.skillsChipsWrap}>
            {worker.skills.map((skill) => (
              <View key={skill.id} style={styles.skillChip}>
                <Feather name="check" size={11} color={Theme.success} />
                <Text style={styles.skillChipText}>{skill.name}</Text>
              </View>
            ))}
          </View>

          {/* Certifications List */}
          <Text style={[styles.subsectionSubtitle, { marginTop: 16 }]}>{language === 'hi' ? 'प्रमाणपत्र' : 'Certifications'}</Text>
          {worker.certifications && worker.certifications.length > 0 ? (
            <View style={styles.certList}>
              {worker.certifications.map((cert) => (
                <View key={cert.id} style={styles.certItem}>
                  <View style={styles.certIconWrap}>
                    <MaterialCommunityIcons name="certificate-outline" size={18} color={Theme.primary} />
                  </View>
                  <View style={styles.certContent}>
                    <View style={styles.certTitleRow}>
                      <Text style={styles.certName}>{cert.name}</Text>
                      {cert.verified && (
                        <View style={styles.verifiedTag}>
                          <Text style={styles.verifiedTagText}>{language === 'hi' ? 'जांच पूरी है' : 'Verified'}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.certIssuer}>{language === 'hi' ? 'जारीकर्ता: ' : 'Issued by: '}{cert.issuedBy}</Text>
                    <Text style={styles.certDate}>
                      {language === 'hi' ? 'वैधता: ' : 'Valid: '}{cert.issueDate ? new Date(cert.issueDate).getFullYear() : '2022'} –{' '}
                      {cert.expiryDate ? new Date(cert.expiryDate).getFullYear() : (language === 'hi' ? 'सक्रिय' : 'Active')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>{language === 'hi' ? 'कोई प्रमाणपत्र नहीं है।' : 'No certifications listed yet.'}</Text>
          )}
        </View>

        {/* ─── 4. Work History ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>{language === 'hi' ? 'किए गए काम' : 'Work History'}</Text>
            <Text style={styles.sectionCountText}>{combinedWorkHistory.length} {language === 'hi' ? 'काम पूरे हुए' : 'completed'}</Text>
          </View>

          <View style={styles.workHistoryList}>
            {combinedWorkHistory.slice(0, 5).map((item, idx) => (
              <View
                key={item.id || `wh_${idx}`}
                style={[
                  styles.historyItem,
                  idx !== combinedWorkHistory.slice(0, 5).length - 1 && styles.historyItemBorder,
                ]}
              >
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyJobTitle}>{item.jobTitle}</Text>
                  <Text style={styles.historyWage}>{formatWage(item.wage)}</Text>
                </View>

                <Text style={styles.historyEmployer}>{item.employerName}</Text>

                <View style={styles.historyBottomRow}>
                  <Text style={styles.historyMeta}>
                    {worker.location.city} · {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <View style={styles.historyStatusBadge}>
                    <Feather name="check" size={11} color={Theme.success} />
                    <Text style={styles.historyStatusText}>{language === 'hi' ? 'पूरा हुआ ✓' : 'Completed ✓'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 5. Welfare & Support ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>{language === 'hi' ? 'कल्याण व सुरक्षा सहायता' : 'Welfare & Support'}</Text>
            <TouchableOpacity onPress={() => setIsBenefitsModalOpen(true)}>
              <Text style={styles.linkText}>{language === 'hi' ? 'फायदे देखें →' : 'View benefits →'}</Text>
            </TouchableOpacity>
          </View>

          {/* Insurance Row */}
          <View style={styles.welfareRow}>
            <View style={styles.welfareIconBox}>
              <Feather name="shield" size={16} color={Theme.success} />
            </View>
            <View style={styles.welfareRowContent}>
              <View style={styles.welfareRowHeader}>
                <Text style={styles.welfareItemTitle}>{language === 'hi' ? 'बीमा सुरक्षा' : 'Insurance Coverage'}</Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>{language === 'hi' ? 'सक्रिय' : 'Active'}</Text>
                </View>
              </View>
              <Text style={styles.welfareItemDetail}>
                {language === 'hi' ? '₹2,00,000 दुर्घटना व जीवन बीमा (PMSBY + PMJJBY कोऑपरेटिव द्वारा)' : '₹2,00,000 Accidental & Life Cover (PMSBY + PMJJBY via Cooperative)'}
              </Text>
            </View>
          </View>

          {/* Welfare Schemes */}
          <View style={styles.welfareRow}>
            <View style={styles.welfareIconBox}>
              <MaterialCommunityIcons name="hospital-box-outline" size={17} color={Theme.primary} />
            </View>
            <View style={styles.welfareRowContent}>
              <Text style={styles.welfareItemTitle}>{language === 'hi' ? 'कोऑपरेटिव स्वास्थ्य व अनुदान' : 'Cooperative Health & Grant'}</Text>
              <Text style={styles.welfareItemDetail}>
                {language === 'hi' ? 'मासिक स्वास्थ्य जांच (OPD) व ₹5,000 सालाना स्किल ट्रेनिंग अनुदान' : 'Monthly health support (OPD) & up to ₹5,000 annual skill training grant'}
              </Text>
            </View>
          </View>

          {/* Training Credits */}
          <View style={styles.welfareRow}>
            <View style={styles.welfareIconBox}>
              <Feather name="book-open" size={16} color={Theme.accent} />
            </View>
            <View style={styles.welfareRowContent}>
              <Text style={styles.welfareItemTitle}>{language === 'hi' ? 'मुफ्त ट्रेनिंग सुविधा' : 'Training Eligibility'}</Text>
              <Text style={styles.welfareItemDetail}>
                {welfare?.trainingCredits ?? 24} {language === 'hi' ? 'घंटे की सरकारी प्रमाणित ट्रेनिंग उपलब्ध' : 'hours free certified upskilling available'}
              </Text>
            </View>
          </View>

          {/* Emergency Support */}
          <View style={[styles.welfareRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.welfareIconBox}>
              <Feather name="phone-call" size={16} color={Theme.ink} />
            </View>
            <View style={styles.welfareRowContent}>
              <Text style={styles.welfareItemTitle}>{language === 'hi' ? 'आपातकालीन सहायता कोष' : 'Emergency Support & Fund'}</Text>
              <Text style={styles.welfareItemDetail}>
                {language === 'hi' ? `कोऑपरेटिव आपात कोष: ₹${welfare?.emergencyFundBalance ?? 8500} बैलेंस · हेल्पलाइन: 1800-266-7327` : `Cooperative Emergency Fund: ₹${welfare?.emergencyFundBalance ?? 8500} balance · Helpline: 1800-266-7327`}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 6. Work Preferences ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>{language === 'hi' ? 'काम की पसंद' : 'Work Preferences'}</Text>
            <TouchableOpacity
              onPress={() => {
                setEditName(worker.name);
                setEditTrade(primaryTrade);
                setEditPhone(worker.phoneNumber);
                setEditCity(worker.location.city);
                setEditState(worker.location.state);
                setEditWage(String(worker.expectedDailyWage || 1200));
                setEditRadius(String(worker.preferredRadius || 15));
                setEditBio(worker.bio || '');
                setIsEditModalOpen(true);
              }}
            >
              <Text style={styles.linkText}>{language === 'hi' ? 'बदलें →' : 'Manage →'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.prefGrid}>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{language === 'hi' ? 'स्थिति' : 'Status'}</Text>
              <Text style={styles.prefVal}>
                {isAvailable
                  ? (language === 'hi' ? 'काम के लिए उपलब्ध' : 'Available for work')
                  : (language === 'hi' ? 'उपलब्ध नहीं' : 'Unavailable')}
              </Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{language === 'hi' ? 'रोज़ की दिहाड़ी' : 'Expected Daily Rate'}</Text>
              <Text style={[styles.prefVal, { color: Theme.amber }]}>
                {formatWage(worker.expectedDailyWage || 1200)}{t('perDay')}
              </Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{language === 'hi' ? 'काम की दूरी' : 'Service Radius'}</Text>
              <Text style={styles.prefVal}>{worker.preferredRadius || 15} {language === 'hi' ? 'किमी' : 'km'}</Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{language === 'hi' ? 'भाषा' : 'Languages'}</Text>
              <Text style={styles.prefVal}>{(worker.languages || ['Hindi', 'English']).join(', ')}</Text>
            </View>
          </View>

          {/* Preferred Locations */}
          <Text style={[styles.subsectionSubtitle, { marginTop: 14 }]}>{language === 'hi' ? 'पसंदीदा इलाके' : 'Preferred Locations'}</Text>
          <View style={styles.prefTagsWrap}>
            {(worker.preferredLocations || [
              'Noida Sector 15',
              'Noida Sector 62',
              'Indirapuram',
              'Mayur Vihar',
            ]).map((loc, idx) => (
              <View key={idx} style={styles.prefTag}>
                <Feather name="map-pin" size={10} color={Theme.textSecondary} />
                <Text style={styles.prefTagText}>{loc}</Text>
              </View>
            ))}
          </View>

          {/* Preferred Categories */}
          <Text style={[styles.subsectionSubtitle, { marginTop: 12 }]}>{language === 'hi' ? 'पसंदीदा काम के प्रकार' : 'Preferred Work Types'}</Text>
          <View style={styles.prefTagsWrap}>
            {(worker.preferredCategories || ['Electrical', 'Appliance Repair', 'Warehouse']).map(
              (cat, idx) => (
                <View key={idx} style={styles.prefTag}>
                  <Feather name="briefcase" size={10} color={Theme.textSecondary} />
                  <Text style={styles.prefTagText}>{getLocalizedCategory(cat, language)}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* ─── Edit Profile & Preferences Modal ─── */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{language === 'hi' ? 'Worker ID व पसंद बदलें' : 'Edit Worker ID & Preferences'}</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.inputLabel}>{language === 'hi' ? 'पूरा नाम' : 'Full Name'}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={language === 'hi' ? 'अपना पूरा नाम लिखें' : 'Your full name'}
                placeholderTextColor={Theme.textMuted}
              />

              <Text style={styles.inputLabel}>{language === 'hi' ? 'मुख्य काम / पेशा' : 'Primary Trade / Profession'}</Text>
              <TextInput
                style={styles.textInput}
                value={editTrade}
                onChangeText={setEditTrade}
                placeholder={language === 'hi' ? 'जैसे: इलेक्ट्रीशियन, प्लंबर, राजमिस्त्री' : 'e.g. Electrician, Plumber, Mason'}
                placeholderTextColor={Theme.textMuted}
              />

              <Text style={styles.inputLabel}>{language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</Text>
              <TextInput
                style={styles.textInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={Theme.textMuted}
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{language === 'hi' ? 'शहर' : 'City'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="e.g. Noida"
                    placeholderTextColor={Theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.inputLabel}>{language === 'hi' ? 'राज्य' : 'State'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editState}
                    onChangeText={setEditState}
                    placeholder="e.g. Uttar Pradesh"
                    placeholderTextColor={Theme.textMuted}
                  />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{language === 'hi' ? 'रोज़ की दिहाड़ी (₹)' : 'Expected Daily Rate (₹)'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editWage}
                    onChangeText={setEditWage}
                    keyboardType="numeric"
                    placeholder="1200"
                    placeholderTextColor={Theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.inputLabel}>{language === 'hi' ? 'काम की दूरी (किमी)' : 'Service Radius (km)'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editRadius}
                    onChangeText={setEditRadius}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={Theme.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>{language === 'hi' ? 'अपने बारे में' : 'Professional Bio'}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
                placeholder={language === 'hi' ? 'अपने काम और अनुभव के बारे में संक्षेप में लिखें' : 'Brief summary of your skills and experience'}
                placeholderTextColor={Theme.textMuted}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{language === 'hi' ? 'बदलाव सुरक्षित करें' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Welfare Benefits Details Modal ─── */}
      <Modal
        visible={isBenefitsModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsBenefitsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Welfare & Insurance Benefits</Text>
              <TouchableOpacity
                onPress={() => setIsBenefitsModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Pradhan Mantri Suraksha Bima Yojana (PMSBY)</Text>
                <Text style={styles.benefitDetail}>Coverage: ₹2,00,000 for accidental death or total disability.</Text>
                <Text style={styles.benefitSub}>Policy: PMSBY-W1-2026 · Premium paid by Cooperative welfare pool</Text>
              </View>

              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)</Text>
                <Text style={styles.benefitDetail}>Coverage: ₹2,00,000 life insurance cover.</Text>
                <Text style={styles.benefitSub}>Policy: PMJJBY-W1-2026 · Active till March 2027</Text>
              </View>

              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Cooperative Emergency Relief Fund</Text>
                <Text style={styles.benefitDetail}>Instant zero-interest emergency advance up to ₹10,000 for medical or family emergencies.</Text>
                <Text style={styles.benefitSub}>Available Balance: ₹8,500</Text>
              </View>

              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Skill Upgrade & Certification Grant</Text>
                <Text style={styles.benefitDetail}>Government-certified NSDC and ITI upskilling funded by the cooperative federation.</Text>
                <Text style={styles.benefitSub}>Eligibility: 24 free training hours available</Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsBenefitsModalOpen(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Household Verification QR Modal ─── */}
      <Modal
        visible={isQrModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsQrModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 360, alignItems: 'center' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <Text style={styles.modalTitle}>On-Site Verification</Text>
              <TouchableOpacity
                onPress={() => setIsQrModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCard}>
              <MaterialCommunityIcons name="qrcode" size={160} color={Theme.ink} />
              <Text style={styles.qrIdText}>ID: PASS-{worker.id.toUpperCase()}-2026</Text>
              <Text style={styles.qrNote}>
                Households scan this official QR to verify worker identity, Aadhaar clearance, and ₹2L safety insurance on site.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsQrModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
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
    backgroundColor: Theme.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  editBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: Theme.ink,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // 1. Identity Card
  identityCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  identityMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Theme.ink,
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Theme.surface,
  },
  dotGreen: { backgroundColor: Theme.success },
  dotGrey: { backgroundColor: '#9CA3AF' },
  identityInfo: {
    flex: 1,
  },
  workerName: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Theme.ink,
    letterSpacing: -0.2,
  },
  primaryTrade: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Theme.accent,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.textSecondary,
  },

  // Availability Strip
  availabilityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  availabilityStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicatorCircle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  bgSuccess: { backgroundColor: Theme.success },
  bgGrey: { backgroundColor: '#9CA3AF' },
  availabilityLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },

  // Cooperative Endorsement
  coopSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Theme.borderSubtle,
  },
  coopBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  coopBadgeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.success,
    letterSpacing: 0.2,
  },
  coopNameText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.ink,
  },
  coopMemberSince: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textMuted,
    marginTop: 2,
  },

  // Verifications Grid
  verificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  verificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.successLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  verificationText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.success,
  },

  // 2. Section Cards
  sectionCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: Theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionCountText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  subsectionSubtitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: Theme.textSecondary,
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  linkText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: Theme.accent,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Theme.ink,
  },
  metricLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Theme.border,
  },

  // Skills
  skillsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  skillChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.ink,
  },

  // Certifications
  certList: {
    gap: 10,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Theme.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  certIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  certContent: {
    flex: 1,
  },
  certTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  certName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },
  verifiedTag: {
    backgroundColor: Theme.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.success,
  },
  certIssuer: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  certDate: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  emptyNote: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textMuted,
    fontStyle: 'italic',
  },

  // 4. Work History
  workHistoryList: {
    marginTop: 4,
  },
  historyItem: {
    paddingVertical: 12,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyJobTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13.5,
    color: Theme.ink,
    flex: 1,
    marginRight: 8,
  },
  historyWage: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.amber,
  },
  historyEmployer: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  historyBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    color: Theme.textMuted,
  },
  historyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatusText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.success,
  },

  // 5. Welfare & Support
  welfareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderSubtle,
  },
  welfareIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welfareRowContent: {
    flex: 1,
  },
  welfareRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welfareItemTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },
  activeTag: {
    backgroundColor: Theme.successLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.successBorder,
  },
  activeTagText: {
    fontFamily: FontFamily.medium,
    fontSize: 10.5,
    color: Theme.success,
  },
  welfareItemDetail: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  // 6. Work Preferences
  prefGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  prefItem: {
    width: '47%',
    backgroundColor: Theme.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  prefLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
  },
  prefVal: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12.5,
    color: Theme.ink,
    marginTop: 3,
  },
  prefTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prefTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.surfaceSubtle,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  prefTagText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.ink,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  inputLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.ink,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: Theme.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.textOnAccent,
  },

  // Benefits Modal
  benefitCard: {
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  benefitTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13.5,
    color: Theme.ink,
  },
  benefitDetail: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  benefitSub: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.success,
    marginTop: 5,
  },
  closeBtn: {
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },

  // QR Modal
  qrCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrIdText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  qrNote: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
