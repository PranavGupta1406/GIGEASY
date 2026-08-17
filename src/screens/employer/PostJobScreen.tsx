// Post Job Wizard Screen — Visual Skill Selector, Headcount Stepper & Wage Range
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { MOCK_SKILLS, formatWage } from '../../data/mockData';
import { useEmployerStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'PostJob'>;

export const PostJobScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState(MOCK_SKILLS[0].id);
  const [workersRequired, setWorkersRequired] = useState(5);
  const [minWage, setMinWage] = useState(850);
  const [maxWage, setMaxWage] = useState(1000);
  const [address, setAddress] = useState('Sector 62, Noida');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postJob = useEmployerStore((s) => s.postJob);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Gig Title Required', 'Please enter a title for this gig.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      postJob({
        title: title.trim(),
        description: description.trim() || 'Daily shift support required.',
        skillRequired: MOCK_SKILLS.find((s) => s.id === selectedSkillId) ?? MOCK_SKILLS[0],
        location: {
          lat: 28.6139,
          lng: 77.209,
          address,
          city: 'Noida',
          state: 'Uttar Pradesh',
        },
        startDate: '2026-08-15',
        startTime: '08:00 AM',
        endTime: '05:00 PM',
        workersRequired,
        minWage,
        maxWage,
        requirements: ['Punctual arrival', 'Geofence check-in compliance'],
      });

      Alert.alert(
        'Gig Published & Dispatched',
        `AI Matching Engine is now dispatching your gig to verified workers within 10 km.`,
        [{ text: 'View Dashboard', onPress: () => navigation.goBack() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post a New Gig</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gig Title & Role</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Warehouse Loading Helper"
            placeholderTextColor="#8E99A8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Skill Category Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skill Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.skillsScroll}
          >
            {MOCK_SKILLS.slice(0, 8).map((skill) => {
              const isSelected = selectedSkillId === skill.id;

              return (
                <TouchableOpacity
                  key={skill.id}
                  onPress={() => setSelectedSkillId(skill.id)}
                  style={[
                    styles.skillChip,
                    isSelected && styles.skillChipSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.skillText,
                      isSelected && styles.skillTextSelected,
                    ]}
                  >
                    {skill.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Headcount Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workers Required</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => setWorkersRequired((c) => Math.max(1, c - 1))}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.countDisplay}>
              <Text style={styles.countNum}>{workersRequired}</Text>
              <Text style={styles.countSub}>positions</Text>
            </View>
            <TouchableOpacity
              onPress={() => setWorkersRequired((c) => c + 1)}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Wage Range */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Wage Budget Range</Text>
          <View style={styles.wageHeroDisplayBox}>
            <Text style={styles.wageHeroDisplay}>
              {formatWage(minWage)} – {formatWage(maxWage)} / day
            </Text>
          </View>
          <View style={styles.wageAdjustRow}>
            <TouchableOpacity
              onPress={() => {
                setMinWage((w) => Math.max(500, w - 50));
                setMaxWage((w) => Math.max(600, w - 50));
              }}
              style={styles.wageAdjustBtn}
            >
              <Text style={styles.wageAdjustBtnText}>− ₹50/day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMinWage((w) => w + 50);
                setMaxWage((w) => w + 50);
              }}
              style={styles.wageAdjustBtn}
            >
              <Text style={styles.wageAdjustBtnText}>+ ₹50/day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Site Location & Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Sector 62, NSEZ, Noida"
            placeholderTextColor="#8E99A8"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Scope */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shift Instructions</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe tasks, timing, safety requirements..."
            placeholderTextColor="#8E99A8"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <GigEasyButton
          label={isSubmitting ? 'Publishing Gig...' : 'Publish & Dispatch Gig →'}
          onPress={handlePublish}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  backBtn: { padding: Spacing[1] },
  navTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#090D14',
  },
  placeholder: { width: 24 },
  scrollContent: { paddingBottom: Spacing[14] },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing[5],
    marginTop: Spacing[3],
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
    marginBottom: Spacing[2.5],
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: '#F8F7F4',
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2.5],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#090D14',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  skillsScroll: {
    gap: Spacing[2],
  },
  skillChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F2F0EB',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  skillChipSelected: {
    backgroundColor: '#0D3B3F',
    borderColor: '#0D3B3F',
  },
  skillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#5A6578',
  },
  skillTextSelected: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
    paddingVertical: Spacing[2],
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  countBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: '#090D14',
  },
  countDisplay: {
    alignItems: 'center',
  },
  countNum: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    color: '#090D14',
  },
  countSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#5A6578',
  },
  wageHeroDisplayBox: {
    backgroundColor: '#090D14',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  wageHeroDisplay: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: '#C8F135',
  },
  wageAdjustRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  wageAdjustBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    backgroundColor: '#F2F0EB',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    alignItems: 'center',
  },
  wageAdjustBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#090D14',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
    ...Shadow.md,
  },
});
