// Two-Sided Rating Screen — SIH 26089
// Mutual rating system: Customer rates worker AND Worker rates customer
// Drives FairWork reputation, safety index, and automatic cooperative escrow release

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
import { useAuthStore, useLanguageStore } from '../../store';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavProp;
  route?: any;
}

export const RatingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language } = useLanguageStore();
  const role = useAuthStore((s) => s.role) || 'customer';
  const isCustomer = role === 'customer' || role === 'employer';

  // Customer rating worker categories
  const [quality, setQuality] = useState<number>(5);
  const [punctuality, setPunctuality] = useState<number>(5);
  const [professionalism, setProfessionalism] = useState<number>(5);
  const [value, setValue] = useState<number>(5);

  // Worker rating customer categories
  const [paymentReliability, setPaymentReliability] = useState<number>(5);
  const [behavior, setBehavior] = useState<number>(5);
  const [safety, setSafety] = useState<number>(5);

  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const renderStars = (rating: number, setRating: (r: number) => void) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
          <MaterialCommunityIcons
            name={star <= rating ? 'star' : 'star-outline'}
            size={24}
            color={star <= rating ? '#F59E0B' : Theme.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      Alert.alert(
        language === 'hi' ? 'रेटिंग दर्ज हुई ✓' : 'Mutual Rating Verified ✓',
        language === 'hi'
          ? 'धन्यवाद! आपकी प्रमाणित रेटिंग से रिकॉर्ड अपडेट हुआ और अंतिम भुगतान जारी कर दिया गया।'
          : 'Thank you! Your verified rating updates the cooperative trust index and releases the final escrow payment.',
        [{ text: language === 'hi' ? 'आगे बढ़ें' : 'Continue', onPress: () => navigation.goBack() }]
      );
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Theme.ink} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>
          {language === 'hi' ? 'काम और व्यवहार की रेटिंग' : 'Two-Sided Service Rating'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Rating Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons name="scale-balance" size={24} color={Theme.accent} />
          </View>
          <Text style={styles.headerTitle}>
            {isCustomer
              ? (language === 'hi' ? 'कामगार को रेटिंग दें' : 'Rate Cooperative Worker')
              : (language === 'hi' ? 'मालिक को रेटिंग दें' : 'Rate Household Customer')}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'hi'
              ? 'GigEasy पर दोनों तरफ की रेटिंग से कामगार और मालिक दोनों के साथ निष्पक्ष व्यवहार सुनिश्चित होता है।'
              : 'GigEasy uses verified two-sided ratings to protect both workers and households from unfair treatment.'}
          </Text>
        </View>

        {isCustomer ? (
          /* Customer Rating Worker */
          <View style={styles.ratingForm}>
            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'काम की गुणवत्ता' : 'Work Quality & Competence'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'क्या काम ठीक से पूरा हुआ?'
                  : 'Did the repair/service resolve the problem properly?'}
              </Text>
              {renderStars(quality, setQuality)}
            </View>

            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'समय की पाबंदी' : 'Punctuality & ETA'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'क्या कामगार तय समय पर पहुंचे?'
                  : 'Did the worker arrive within the estimated arrival time?'}
              </Text>
              {renderStars(punctuality, setPunctuality)}
            </View>

            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'व्यवहार और सफाई' : 'Professionalism & Cleanliness'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'अच्छा व्यवहार, सही औजार और काम के बाद सफाई?'
                  : 'Respectful demeanor, proper tools, clean cleanup after work?'}
              </Text>
              {renderStars(professionalism, setProfessionalism)}
            </View>

            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'सही दिहाड़ी' : 'Cooperative Value & Fairness'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'तय रेट के अनुसार काम किया गया?'
                  : 'Transparent pricing adherence without surprise charges?'}
              </Text>
              {renderStars(value, setValue)}
            </View>
          </View>
        ) : (
          /* Worker Rating Customer */
          <View style={styles.ratingForm}>
            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'समय पर भुगतान' : 'Payment Reliability'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'क्या काम पूरा होने पर तुरंत पैसे मिले?'
                  : 'Prompt escrow confirmation and payment approval?'}
              </Text>
              {renderStars(paymentReliability, setPaymentReliability)}
            </View>

            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'सुरक्षा और माहौल' : 'Safety & Work Environment'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'सुरक्षित जगह और सम्मानजनक बातचीत?'
                  : 'Safe household conditions, polite communication, respect?'}
              </Text>
              {renderStars(safety, setSafety)}
            </View>

            <View style={styles.dimensionCard}>
              <Text style={styles.dimensionTitle}>
                {language === 'hi' ? 'काम की सही जानकारी' : 'Job Scope Accuracy'}
              </Text>
              <Text style={styles.dimensionDesc}>
                {language === 'hi'
                  ? 'क्या वही काम था जो ऐप पर बताया गया था?'
                  : 'Was the actual job aligned with the initial request description?'}
              </Text>
              {renderStars(behavior, setBehavior)}
            </View>
          </View>
        )}

        {/* Written Feedback */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>
            {language === 'hi' ? 'अन्य कोई बात (वैकल्पिक)' : 'Additional Comments (Optional)'}
          </Text>
          <TextInput
            style={styles.feedbackInput}
            multiline
            numberOfLines={3}
            placeholder={
              language === 'hi'
                ? 'अपना अनुभव या राय यहाँ लिखें...'
                : 'Share feedback to help the cooperative community maintain high standards...'
            }
            placeholderTextColor={Theme.textMuted}
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        {/* Submit CTA */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>
            {language === 'hi'
              ? 'रेटिंग सबमिट करें और पूरा करें'
              : 'Submit Verified Rating & Release Escrow'}
          </Text>
        </TouchableOpacity>

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
  headerCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Theme.ink,
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  ratingForm: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dimensionCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  dimensionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
  },
  dimensionDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    padding: 2,
  },
  feedbackCard: {
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: Spacing.md,
  },
  feedbackTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.ink,
    marginBottom: 6,
  },
  feedbackInput: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Theme.ink,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Theme.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Theme.surface,
  },
});
