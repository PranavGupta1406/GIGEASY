// Dispute Mediation Screen — SIH 26089
// Cooperative mediation mechanism for fair grievance resolution without costly litigation
// Real-time timeline, cooperative officer mediation notes, and transparent escrow release

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Theme } from '../../theme';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../../constants';
import { useDisputeStore, useAuthStore } from '../../store';
import { DisputeType, Dispute } from '../../types';
import { api } from '../../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
}

const DISPUTE_TYPES: { type: DisputeType; label: string; icon: string }[] = [
  { type: 'payment_not_received', label: 'Payment / Wage Issue', icon: 'cash-remove' },
  { type: 'work_quality', label: 'Quality / Incomplete Work', icon: 'wrench-outline' },
  { type: 'worker_no_show', label: 'No-Show / Late Arrival', icon: 'account-clock-outline' },
  { type: 'safety_concern', label: 'Safety / Conduct Issue', icon: 'shield-alert-outline' },
  { type: 'other', label: 'Other Discrepancy', icon: 'help-circle-outline' },
];

export const DisputeScreen: React.FC<Props> = ({ navigation }) => {
  const { disputes, fileDispute, resolveDispute } = useDisputeStore();
  const userId = useAuthStore((s) => s.userId) || 'usr_w1';
  const role = useAuthStore((s) => s.role) || 'worker';

  const [activeTab, setActiveTab] = useState<'active' | 'file'>('active');
  const [selectedType, setSelectedType] = useState<DisputeType>('work_quality');
  const [description, setDescription] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('sr1');

  const handleFileDispute = () => {
    if (!description.trim()) {
      Alert.alert('Missing Details', 'Please describe the issue for the cooperative mediation panel.');
      return;
    }

    fileDispute({
      serviceRequestId: targetId,
      raisedBy: role === 'worker' ? 'worker' : 'customer',
      raisedByUserId: userId,
      againstUserId: role === 'worker' ? 'cust_1' : 'w1',
      type: selectedType,
      description,
      cooperativeAdminNote: 'Received by Delhi Cooperative Mediation Panel. Assigned to Welfare Officer.',
    });

    api.createDispute({
      application_id: targetId,
      raised_by_role: role === 'worker' ? 'worker' : 'employer',
      issue_type: selectedType,
      description,
    }).catch((err) => {
      console.log('API dispute sync note:', err.message);
    });

    Alert.alert(
      'Grievance Filed ✓',
      'Your dispute has been logged with the Cooperative Mediation Board. An officer will review this within 24 hours.'
    );
    setDescription('');
    setActiveTab('active');
  };

  const handleResolve = (disputeId: string) => {
    Alert.alert(
      'Accept Proposed Resolution',
      'Do you accept the cooperative mediation resolution? This will close the grievance and release escrow funds accordingly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Close',
          onPress: () => {
            resolveDispute(
              disputeId,
              'Mutual resolution accepted by all parties. Settlement released.',
              'Closed by user with mutual consensus.'
            );
            Alert.alert('Resolved ✓', 'Dispute closed successfully.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.ink} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Cooperative Mediation Board</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mediation Notice */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <MaterialCommunityIcons name="scale-balance" size={20} color={Theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Democratic Dispute Mediation</Text>
            <Text style={styles.bannerDesc}>
              Labour cooperatives mediate issues between workers and customers transparently, avoiding predatory account bans and court delays.
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active Disputes ({disputes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'file' && styles.tabBtnActive]}
            onPress={() => setActiveTab('file')}
          >
            <Text style={[styles.tabText, activeTab === 'file' && styles.tabTextActive]}>
              File New Grievance
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Active Disputes */}
        {activeTab === 'active' && (
          <View style={styles.disputeList}>
            {disputes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="check-circle" size={32} color={Theme.success} />
                <Text style={styles.emptyTitle}>No Open Disputes</Text>
                <Text style={styles.emptySub}>All gigs and earnings are settled smoothly.</Text>
              </View>
            ) : (
              disputes.map((d) => (
                <View key={d.id} style={styles.disputeCard}>
                  <View style={styles.disputeCardTop}>
                    <View style={styles.disputeTypeWrap}>
                      <Text style={styles.disputeType}>
                        {d.type.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.disputeDate}>
                        Ref: {d.serviceRequestId || d.jobApplicationId || 'GIG-2026'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor:
                            d.status === 'resolved'
                              ? Theme.successLight
                              : d.status === 'resolution_proposed'
                              ? Theme.surfaceSubtle
                              : Theme.amberLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              d.status === 'resolved'
                                ? Theme.success
                                : d.status === 'resolution_proposed'
                                ? Theme.primary
                                : Theme.amberDark,
                          },
                        ]}
                      >
                        {d.status.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.disputeDesc}>{d.description}</Text>

                  {/* Cooperative Admin Mediation Note */}
                  {d.cooperativeAdminNote && (
                    <View style={styles.officerNoteBox}>
                      <View style={styles.officerNoteHeader}>
                        <MaterialCommunityIcons name="account-tie" size={14} color={Theme.olive} />
                        <Text style={styles.officerNoteTitle}>Cooperative Officer Review</Text>
                      </View>
                      <Text style={styles.officerNoteContent}>{d.cooperativeAdminNote}</Text>
                    </View>
                  )}

                  {/* Proposed Resolution */}
                  {d.resolution && (
                    <View style={styles.resolutionBox}>
                      <Text style={styles.resolutionTitle}>Proposed Settlement:</Text>
                      <Text style={styles.resolutionText}>{d.resolution}</Text>
                    </View>
                  )}

                  {/* Action */}
                  {d.status === 'resolution_proposed' && (
                    <TouchableOpacity
                      style={styles.acceptResolutionBtn}
                      onPress={() => handleResolve(d.id)}
                    >
                      <Feather name="check" size={14} color={Theme.surface} />
                      <Text style={styles.acceptResolutionText}>Accept Proposed Settlement</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: File New Grievance */}
        {activeTab === 'file' && (
          <View style={styles.fileForm}>
            <Text style={styles.formSectionTitle}>1. SELECT DISPUTE CATEGORY</Text>
            <View style={styles.typeGrid}>
              {DISPUTE_TYPES.map((t) => {
                const isSelected = selectedType === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    style={[styles.typeBtn, isSelected && styles.typeBtnSelected]}
                    onPress={() => setSelectedType(t.type)}
                  >
                    <MaterialCommunityIcons
                      name={t.icon as any}
                      size={20}
                      color={isSelected ? Theme.surface : Theme.ink}
                    />
                    <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.formSectionTitle, { marginTop: Spacing.md }]}>
              2. DETAILED DESCRIPTION
            </Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Explain what happened, relevant times, and what resolution you are requesting..."
                placeholderTextColor={Theme.textMuted}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity style={styles.fileSubmitBtn} onPress={handleFileDispute}>
              <Text style={styles.fileSubmitBtnText}>Submit to Cooperative Mediation Board</Text>
            </TouchableOpacity>
          </View>
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceSubtle,
  },
  topNavTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.accentLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.accentMuted,
    marginBottom: Spacing.md,
  },
  bannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.accentDark,
  },
  bannerDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  tabBtnActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.textSecondary,
  },
  tabTextActive: {
    color: Theme.surface,
  },
  disputeList: {
    gap: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
    marginTop: 10,
  },
  emptySub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.textMuted,
    marginTop: 2,
  },
  disputeCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  disputeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  disputeTypeWrap: {
    flex: 1,
  },
  disputeType: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  disputeDate: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
  },
  disputeDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  officerNoteBox: {
    backgroundColor: Theme.oliveLight,
    borderRadius: BorderRadius.md,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.olive,
    marginBottom: 8,
  },
  officerNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  officerNoteTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.oliveDark,
  },
  officerNoteContent: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  resolutionBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    padding: 8,
    marginBottom: 8,
  },
  resolutionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#065F46',
  },
  resolutionText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  acceptResolutionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.success,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  acceptResolutionText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
  fileForm: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  formSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  typeGrid: {
    gap: 6,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  typeBtnSelected: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  typeBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  typeBtnTextSelected: {
    color: Theme.surface,
  },
  inputCard: {
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  textInput: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fileSubmitBtn: {
    backgroundColor: Theme.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  fileSubmitBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
});
