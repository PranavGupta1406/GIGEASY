// Employer Post Job Screen — High-End, Workable Gig Publishing
// Warm Premium Palette · Responsive Flex Layout · Real State & Dynamic Pipeline

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize } from '../../constants';
import { MOCK_SKILLS, WORK_GROUPS, MOCK_WORKERS } from '../../data/mockData';
import { useEmployerStore, useLanguageStore, useSharedApplicationsStore } from '../../store';
import { Theme } from '../../theme';
import { getCategoryVisual } from '../../components/GigEasyPrimitives';
import { getEmployerMatchStats, EmployerMatchStats } from '../../services/recommendation/recommendationService';
import { Job, WorkerProfile } from '../../types';
import { api } from '../../services/api';
import {
  GigDatePickerModal,
  GigTimePickerModal,
  getLocalTodayIso,
  formatIsoToHuman,
} from '../../components/GigDateTimePicker';

type Props = NativeStackScreenProps<RootStackParamList, 'PostJob'>;

const PRESET_ROLES = [
  {
    title: 'Warehouse Loader',
    category: 'Warehouse',
    wage: 1000,
    icon: 'package',
    description: 'Urgent requirement for package sorting and vehicle loading. Immediate hiring.',
    requirements: ['Aadhaar Card', 'Physical Fitness', 'Immediate Joiner'],
  },
  {
    title: 'Mason',
    category: 'Construction',
    wage: 1200,
    icon: 'grid',
    description: 'Brickwork and plastering support for ongoing residential site project.',
    requirements: ['Aadhaar Card', 'Prior Experience', 'Safety Shoes'],
  },
  {
    title: 'Electrician',
    category: 'Electrical',
    wage: 1500,
    icon: 'zap',
    description: 'Concealed wiring, MCB installation, and general electrical maintenance.',
    requirements: ['Aadhaar Card', 'Prior Experience', 'Tools Equipped'],
  },
  {
    title: 'Auto / Tempo Driver',
    category: 'Driving',
    wage: 950,
    icon: 'navigation',
    description: 'Intra-city delivery and route transport in Noida-Delhi corridor.',
    requirements: ['Driving License', 'Aadhaar Card', 'Punctual'],
  },
  {
    title: 'Catering Staff',
    category: 'Hospitality',
    wage: 850,
    icon: 'coffee',
    description: 'Buffet service, table clearance, and event support staff for evening banquet.',
    requirements: ['Aadhaar Card', 'Punctual', 'Clean Appearance'],
  },
  {
    title: 'Packing Worker',
    category: 'Factory',
    wage: 800,
    icon: 'box',
    description: 'Product packaging, labeling, and carton packing for manufacturing unit.',
    requirements: ['Aadhaar Card', 'Physical Fitness', 'Punctual'],
  },
];

const WAGE_PRESETS = [800, 1000, 1200, 1500];

const AVAILABLE_CATEGORIES = [
  'Warehouse',
  'Construction',
  'Electrical',
  'Driving',
  'Hospitality',
  'Factory',
  'Cleaning',
  'Carpentry',
];

const COMMON_REQUIREMENTS = [
  'Aadhaar Card',
  'Physical Fitness',
  'Safety Shoes',
  'Immediate Joiner',
  'Punctual',
  'Prior Experience',
  'Own Smartphone',
];

// Helper to get actual dynamic dates
const getRelativeDateString = (offsetDays = 1) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  const dayName = offsetDays === 0 ? 'Today' : offsetDays === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${dayName} (${dateStr})`;
};

export const PostJobScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('Warehouse Loader');
  const [selectedCategory, setSelectedCategory] = useState('Warehouse');
  const [locationCity, setLocationCity] = useState('Sector 62, Noida');
  const [wage, setWage] = useState('1000');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  // Production Date Picker State (Local Timezone Safe — zero manual typing)
  const [shiftDateIso, setShiftDateIso] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [shiftDateDisplay, setShiftDateDisplay] = useState<string>(() => formatIsoToHuman(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })()
  ));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Production Time Picker State
  const [startTimeStr, setStartTimeStr] = useState('09:00 AM');
  const [endTimeStr, setEndTimeStr] = useState('06:00 PM');
  const [shiftTimeDisplay, setShiftTimeDisplay] = useState('09:00 AM - 06:00 PM');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Payment Settlement Method
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');

  const [description, setDescription] = useState(
    'Urgent requirement for dependable daily shift work. Immediate hiring upon application.'
  );
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([
    'Aadhaar Card',
    'Physical Fitness',
    'Immediate Joiner',
  ]);
  const [customReqInput, setCustomReqInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [fairPayRange, setFairPayRange] = useState<{ min: number; max: number } | null>(null);

  // Production Form errors & submission states
  interface FormErrors {
    title?: string;
    category?: string;
    wage?: string;
    location?: string;
    date?: string;
    time?: string;
    workers?: string;
    description?: string;
    requirements?: string;
    submit?: string;
  }
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Success state
  const [postedJob, setPostedJob] = useState<Job | null>(null);
  const [matchStats, setMatchStats] = useState<EmployerMatchStats | null>(null);
  const [notifiedWorkersList, setNotifiedWorkersList] = useState<WorkerProfile[]>([]);

  const postJob = useEmployerStore((s) => s.postJob);
  const applyForJob = useSharedApplicationsStore((s) => s.applyForJob);
  const { t } = useLanguageStore();

  useEffect(() => {
    api.getFairPayEstimate(selectedCategory, 'Noida').then((res) => {
      if (res && res.p25_wage && res.p75_wage) {
        setFairPayRange({ min: Number(res.p25_wage), max: Number(res.p75_wage) });
      }
    }).catch(() => {});
  }, [selectedCategory]);

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const parsed = await api.parseJobFromText(aiPrompt.trim());
      if (parsed) {
        if (parsed.title) setTitle(parsed.title);
        if (parsed.skill_category) setSelectedCategory(parsed.skill_category);
        if (parsed.min_wage) setWage(String(parsed.min_wage));
        if (parsed.workers_required) setWorkersNeeded(Number(parsed.workers_required));
        if (parsed.location) setLocationCity(parsed.location + ', Noida');
        if (parsed.requirements && Array.isArray(parsed.requirements) && parsed.requirements.length > 0) {
          setSelectedRequirements(parsed.requirements);
        }
      }
    } catch (e: any) {
      console.log('AI parse error:', e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ROLES[0]) => {
    setTitle(preset.title);
    setSelectedCategory(preset.category);
    setWage(String(preset.wage));
    setDescription(preset.description);
    setSelectedRequirements(preset.requirements);
    setErrors({});
  };

  const toggleRequirement = (req: string) => {
    if (selectedRequirements.includes(req)) {
      setSelectedRequirements(selectedRequirements.filter((r) => r !== req));
    } else {
      setSelectedRequirements([...selectedRequirements, req]);
    }
  };

  const handleAddCustomReq = () => {
    const trimmed = customReqInput.trim();
    if (trimmed && !selectedRequirements.includes(trimmed)) {
      setSelectedRequirements([...selectedRequirements, trimmed]);
      setCustomReqInput('');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = 'Please enter a trade/job title (min 3 characters)';
    }
    const numWage = parseInt(wage.replace(/\D/g, ''), 10);
    if (!numWage || numWage < 200) {
      newErrors.wage = 'Please enter a daily wage of at least ₹200';
    }
    if (!locationCity.trim() || locationCity.trim().length < 3) {
      newErrors.location = 'Please enter the work address or sector';
    }
    const today = getLocalTodayIso();
    if (!shiftDateIso || shiftDateIso < today) {
      newErrors.date = 'Shift date cannot be in the past';
    }
    if (!startTimeStr || !endTimeStr) {
      newErrors.time = 'Please select shift start and end timings';
    }
    if (!workersNeeded || workersNeeded < 1) {
      newErrors.workers = 'At least 1 worker required';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Please provide shift details (minimum 10 characters)';
    }
    if (selectedRequirements.length === 0) {
      newErrors.requirements = 'Please select or add at least 1 requirement';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitStatus('loading');
    setErrors({});

    const numWage = parseInt(wage.replace(/\D/g, ''), 10);
    const matchingSkill = MOCK_SKILLS.find(
      (s) => s.name.toLowerCase() === title.trim().toLowerCase()
    ) ?? {
      id: `s_${Date.now()}`,
      name: title.trim(),
      category: selectedCategory,
      icon: 'package',
    };

    const city = locationCity.includes(',') ? locationCity.split(',')[1].trim() : locationCity.trim();

    try {
      // 1. Real Backend Creation (validated, authenticated API request)
      const res = await api.createGig({
        title: title.trim(),
        description: description.trim(),
        skill_category: selectedCategory,
        skill_name: title.trim(),
        workers_required: workersNeeded,
        min_wage: numWage,
        max_wage: numWage,
        start_date: shiftDateIso,
        start_time: startTimeStr,
        end_time: endTimeStr,
        address: locationCity.trim(),
        latitude: 28.6139,
        longitude: 77.209,
        city: city || 'Noida',
        state: 'Uttar Pradesh',
        requirements: selectedRequirements,
      });

      const realGigId = res?.data?.gig_id || res?.gig_id || res?.id;
      if (!realGigId) {
        throw new Error(res?.error || 'Server did not return a valid gig ID.');
      }

      // 2. Persist to store with real backend ID
      const newJob = postJob({
        id: realGigId,
        title: title.trim(),
        description: description.trim(),
        skillRequired: matchingSkill,
        location: {
          lat: 28.6139,
          lng: 77.209,
          address: locationCity.trim(),
          city: city || 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
        },
        startDate: shiftDateIso,
        startTime: startTimeStr,
        endTime: endTimeStr,
        workersRequired: workersNeeded,
        minWage: numWage,
        maxWage: numWage,
        requirements: selectedRequirements,
      });

      // 3. Worker match stats & seeded pipeline
      const stats = getEmployerMatchStats(newJob, MOCK_WORKERS);
      const eligibleWorkers = MOCK_WORKERS.filter(
        (w) =>
          w.availabilityStatus === 'available' &&
          (w.skills.some((s) => s.category.toLowerCase() === selectedCategory.toLowerCase()) ||
            w.skills.some((s) => s.name.toLowerCase().includes(title.trim().toLowerCase())))
      );
      const candidates = eligibleWorkers.length >= 2 ? eligibleWorkers.slice(0, 2) : MOCK_WORKERS.slice(0, 2);

      candidates.forEach((worker) => {
        applyForJob(newJob.id, newJob.maxWage, worker, newJob);
      });

      setNotifiedWorkersList(candidates);
      setPostedJob(newJob);
      setMatchStats(stats);
      setSubmitStatus('success');
    } catch (err: any) {
      console.error('Post Gig error:', err);
      setSubmitStatus('error');
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Server failed to publish gig. Please try again.',
      }));
    }
  };

  // ── Post-Success Screen ──────────────────────────────────────────────────
  if (postedJob && matchStats) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.successScrollContent}
        >
          <View style={styles.successCard}>
            {/* Green verified check badge */}
            <View style={styles.successIconWrap}>
              <Feather name="check" size={32} color={Theme.success} />
            </View>
            <Text style={styles.successTitle}>Gig Published Live!</Text>
            <Text style={styles.successJobTitle} numberOfLines={2}>
              {postedJob.title}
            </Text>
            <Text style={styles.successWage}>
              ₹{postedJob.maxWage.toLocaleString('en-IN')}/day · {postedJob.workersRequired} workers needed
            </Text>

            {/* Instant Worker Reach Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsHeading}>INSTANT WORKER REACH</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{matchStats.suitableWorkers}</Text>
                  <Text style={styles.statLabel}>Suitable Found</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Theme.accent }]}>
                    {matchStats.notifiedWorkers}
                  </Text>
                  <Text style={styles.statLabel}>Notified Instantly</Text>
                </View>
              </View>

              <View style={[styles.statsRow, { marginTop: 14 }]}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{matchStats.estimatedViewed}</Text>
                  <Text style={styles.statLabel}>Est. Views Today</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Theme.success }]}>
                    {notifiedWorkersList.length}
                  </Text>
                  <Text style={styles.statLabel}>Instant Applicants</Text>
                </View>
              </View>
            </View>

            {/* Candidate Previews */}
            {notifiedWorkersList.length > 0 && (
              <View style={styles.candidateSection}>
                <Text style={styles.candidateSectionTitle}>INSTANT APPLICANTS READY TO HIRE</Text>
                {notifiedWorkersList.map((worker) => (
                  <View key={worker.id} style={styles.candidateRow}>
                    <View style={styles.candidateAvatar}>
                      <Text style={styles.candidateAvatarText}>
                        {worker.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.candidateName}>{worker.name}</Text>
                      <Text style={styles.candidateMeta}>
                        ★ {worker.rating} · {worker.location.city} · Aadhaar Verified
                      </Text>
                    </View>
                    <View style={styles.candidateStatusPill}>
                      <Text style={styles.candidateStatusText}>Applied</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.successPrimaryBtn}
              onPress={() => navigation.replace('JobApplicants', { jobId: postedJob.id })}
              activeOpacity={0.88}
            >
              <Text style={styles.successPrimaryBtnText}>
                Review Applicants ({notifiedWorkersList.length})
              </Text>
              <Feather name="arrow-right" size={16} color={Theme.textOnAccent} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successSecondaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
            >
              <Text style={styles.successSecondaryBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main Post Job Form ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={Theme.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Post a New Gig</Text>
          <Text style={styles.headerSub}>Publish shift requirements to verified local workers</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI NLP Assistant */}
          <View style={[styles.card, { borderColor: Theme.accent + '40', backgroundColor: Theme.accent + '08' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="zap" size={16} color={Theme.accent} />
              <Text style={[styles.inputLabel, { color: Theme.accent, marginLeft: 6, marginBottom: 0 }]}>
                AI Smart Post (Voice / Natural Language)
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: Theme.textSecondary, marginBottom: 10 }}>
              Type or paste in English or Hindi / Hinglish (e.g. "Need 3 electricians in Sector 62 for 1500 per day tomorrow")
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                style={[styles.textInput, { flex: 1, backgroundColor: Theme.surface, marginBottom: 0 }]}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                placeholder="Describe your job in your own words..."
                placeholderTextColor={Theme.textMuted}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: Theme.accent,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                onPress={handleAiParse}
                disabled={isAiLoading}
                activeOpacity={0.8}
              >
                {isAiLoading ? (
                  <ActivityIndicator size="small" color={Theme.textOnAccent} />
                ) : (
                  <>
                    <Feather name="check" size={14} color={Theme.textOnAccent} />
                    <Text style={{ color: Theme.textOnAccent, fontWeight: '700', fontSize: 13 }}>Fill</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUICK POPULAR ROLES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
              {PRESET_ROLES.map((preset) => {
                const isSelected = title === preset.title && selectedCategory === preset.category;
                return (
                  <TouchableOpacity
                    key={preset.title}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.presetIconWrap, isSelected && styles.presetIconWrapSelected]}>
                      <Feather name={preset.icon as any} size={16} color={isSelected ? Theme.surface : Theme.accent} />
                    </View>
                    <Text style={[styles.presetTitle, isSelected && styles.presetTitleSelected]}>{preset.title}</Text>
                    <Text style={styles.presetWage}>₹{preset.wage}/day</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Role Title & Category */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Gig Title *</Text>
            <TextInput
              style={[styles.textInput, !!errors.title && styles.inputError]}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g. Warehouse Loader, Mason, Electrician"
              placeholderTextColor={Theme.textMuted}
            />
            {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsScroll}>
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Daily Wage */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.inputLabel}>Daily Wage (₹ / Day) *</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>Direct Worker Payout</Text>
              </View>
            </View>

            <View style={[styles.wageInputRow, !!errors.wage && styles.inputError]}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.wageInput}
                value={wage}
                onChangeText={(v) => {
                  setWage(v.replace(/\D/g, ''));
                  if (errors.wage) setErrors({ ...errors, wage: undefined });
                }}
                keyboardType="number-pad"
                placeholder="1000"
                placeholderTextColor={Theme.textMuted}
                maxLength={6}
              />
              <Text style={styles.perDay}>/ day</Text>
            </View>
            {!!errors.wage && <Text style={styles.errorText}>{errors.wage}</Text>}

            {/* Quick wage pills */}
            <View style={styles.wagePresetRow}>
              {WAGE_PRESETS.map((p) => {
                const isSelected = wage === String(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.wageChip, isSelected && styles.wageChipSelected]}
                    onPress={() => {
                      setWage(String(p));
                      if (errors.wage) setErrors({ ...errors, wage: undefined });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.wageChipText, isSelected && styles.wageChipTextSelected]}>₹{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {fairPayRange && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 8, backgroundColor: Theme.surfaceSubtle, borderRadius: 6, gap: 6 }}>
                <Feather name="shield" size={13} color={Theme.primary} />
                <Text style={{ fontSize: 12, color: Theme.textSecondary }}>
                  Fair Pay Benchmark ({selectedCategory}): <Text style={{ fontWeight: '700', color: Theme.ink }}>₹{fairPayRange.min} – ₹{fairPayRange.max} / day</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Location & Shifts */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Work Location / Sector *</Text>
            <View style={[styles.inputWithIcon, !!errors.location && styles.inputError]}>
              <Feather name="map-pin" size={16} color={Theme.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.iconInput}
                value={locationCity}
                onChangeText={(l) => {
                  setLocationCity(l);
                  if (errors.location) setErrors({ ...errors, location: undefined });
                }}
                placeholder="e.g. Sector 62, Noida"
                placeholderTextColor={Theme.textMuted}
              />
            </View>
            {!!errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

            {/* Date & Timing Selection (Zero manual typing — Booking-style calendar & shift selector) */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.pickerBox, !!errors.date && styles.pickerBoxError]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <View style={styles.pickerBoxHeader}>
                  <Feather name="calendar" size={15} color={Theme.accent} />
                  <Text style={styles.pickerBoxLabel}>Shift Date *</Text>
                </View>
                <Text style={styles.pickerBoxValue} numberOfLines={1}>
                  {shiftDateDisplay}
                </Text>
                <Text style={styles.pickerBoxHint}>Tap to pick date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerBox, !!errors.time && styles.pickerBoxError]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <View style={styles.pickerBoxHeader}>
                  <Feather name="clock" size={15} color={Theme.accent} />
                  <Text style={styles.pickerBoxLabel}>Shift Timing *</Text>
                </View>
                <Text style={styles.pickerBoxValue} numberOfLines={1}>
                  {shiftTimeDisplay}
                </Text>
                <Text style={styles.pickerBoxHint}>Tap to choose hours</Text>
              </TouchableOpacity>
            </View>
            {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            {!!errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>

          {/* Workers Needed Stepper */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.inputLabel}>Workers Required</Text>
                <Text style={styles.cardHelperText}>Number of people needed for this shift</Text>
              </View>
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setWorkersNeeded(Math.max(1, workersNeeded - 1))}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={16} color={Theme.ink} />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{workersNeeded}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setWorkersNeeded(Math.min(50, workersNeeded + 1))}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={16} color={Theme.ink} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Requirements & Tags */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Worker Requirements</Text>
            <Text style={styles.cardHelperText}>Tap to select expected credentials or gear</Text>
            <View style={styles.reqTagsWrap}>
              {COMMON_REQUIREMENTS.map((req) => {
                const isSelected = selectedRequirements.includes(req);
                return (
                  <TouchableOpacity
                    key={req}
                    style={[styles.reqTag, isSelected && styles.reqTagSelected]}
                    onPress={() => toggleRequirement(req)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={isSelected ? 'check' : 'plus'}
                      size={12}
                      color={isSelected ? Theme.surface : Theme.textSecondary}
                    />
                    <Text style={[styles.reqTagText, isSelected && styles.reqTagTextSelected]}>
                      {req}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom requirement adder */}
            <View style={styles.customReqRow}>
              <TextInput
                style={styles.customReqInput}
                placeholder="Add other requirement..."
                placeholderTextColor={Theme.textMuted}
                value={customReqInput}
                onChangeText={setCustomReqInput}
                onSubmitEditing={handleAddCustomReq}
              />
              <TouchableOpacity
                style={styles.addReqBtn}
                onPress={handleAddCustomReq}
                activeOpacity={0.8}
              >
                <Text style={styles.addReqBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Work Description *</Text>
            <TextInput
              style={[styles.textArea, !!errors.description && styles.inputError]}
              value={description}
              onChangeText={(d) => {
                setDescription(d);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              multiline
              numberOfLines={3}
              placeholder="Brief details about work duties, transport, lunch, etc. (min 10 chars)"
              placeholderTextColor={Theme.textMuted}
            />
            {!!errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Payment Settlement Preference */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <Text style={styles.cardHelperText}>How you will settle wages with the hired workers</Text>
            <View style={styles.payOptionGrid}>
              <TouchableOpacity
                style={[styles.payOptionCard, paymentMethod === 'CASH' && styles.payOptionCardActive]}
                onPress={() => setPaymentMethod('CASH')}
                activeOpacity={0.8}
              >
                <View style={styles.payOptionHeader}>
                  <View style={[styles.payIconWrap, paymentMethod === 'CASH' && styles.payIconWrapActive]}>
                    <Feather name="dollar-sign" size={17} color={paymentMethod === 'CASH' ? Theme.surface : Theme.accent} />
                  </View>
                  {paymentMethod === 'CASH' && <Feather name="check-circle" size={16} color={Theme.accent} />}
                </View>
                <Text style={[styles.payOptionTitle, paymentMethod === 'CASH' && { color: Theme.accent }]}>
                  Cash on Site
                </Text>
                <Text style={styles.payOptionDesc}>
                  Pay cash at work site. Worker verifies receipt via 6-digit OTP code.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payOptionCard, paymentMethod === 'ONLINE' && styles.payOptionCardActive]}
                onPress={() => setPaymentMethod('ONLINE')}
                activeOpacity={0.8}
              >
                <View style={styles.payOptionHeader}>
                  <View style={[styles.payIconWrap, paymentMethod === 'ONLINE' && styles.payIconWrapActive]}>
                    <Feather name="credit-card" size={17} color={paymentMethod === 'ONLINE' ? Theme.surface : Theme.primary} />
                  </View>
                  {paymentMethod === 'ONLINE' && <Feather name="check-circle" size={16} color={Theme.primary} />}
                </View>
                <Text style={[styles.payOptionTitle, paymentMethod === 'ONLINE' && { color: Theme.primary }]}>
                  Online Escrow
                </Text>
                <Text style={styles.payOptionDesc}>
                  UPI / NetBanking / Razorpay gateway settlement upon job completion.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Post Button — Natural Flex Layout, Guaranteed Clickable */}
      <View style={styles.bottomBar}>
        {!!errors.submit && (
          <View style={styles.submitErrorBanner}>
            <Feather name="alert-triangle" size={15} color={Theme.error} />
            <Text style={styles.submitErrorText}>{errors.submit}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.postButton,
            submitStatus === 'loading' && { opacity: 0.7 },
            submitStatus === 'error' && { backgroundColor: Theme.error },
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitStatus === 'loading'}
        >
          {submitStatus === 'loading' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={Theme.surface} />
              <Text style={styles.postButtonText}>PUBLISHING TO SERVER...</Text>
            </View>
          ) : (
            <>
              <Feather name="plus-circle" size={18} color={Theme.surface} />
              <Text style={styles.postButtonText}>POST GIG NOW</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Production Date & Time Modals (No manual keyboard typing) */}
      <GigDatePickerModal
        visible={showDatePicker}
        selectedDate={shiftDateIso}
        onSelectDate={(iso, display) => {
          setShiftDateIso(iso);
          setShiftDateDisplay(display);
          if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
        }}
        onClose={() => setShowDatePicker(false)}
      />

      <GigTimePickerModal
        visible={showTimePicker}
        startTime={startTimeStr}
        endTime={endTimeStr}
        onSelectTiming={(start, end, display) => {
          setStartTimeStr(start);
          setEndTimeStr(end);
          setShiftTimeDisplay(display);
          if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
        }}
        onClose={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.ink,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  section: { marginBottom: 14 },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  presetScroll: { gap: 10 },
  presetCard: {
    backgroundColor: Theme.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  presetCardSelected: {
    borderColor: Theme.primary,
    backgroundColor: Theme.primaryLight,
  },
  presetIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  presetIconWrapSelected: {
    backgroundColor: Theme.primary,
  },
  presetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.ink,
    marginBottom: 2,
  },
  presetTitleSelected: {
    color: Theme.primary,
  },
  presetWage: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.amber,
  },

  card: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.ink,
    marginBottom: 6,
  },
  cardHelperText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: Theme.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Theme.success,
  },
  textInput: {
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: 13.5,
    color: Theme.ink,
  },
  inputError: {
    borderColor: Theme.error,
    backgroundColor: Theme.errorLight,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.error,
    marginTop: 4,
  },

  catChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  catChipSelected: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  catChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  catChipTextSelected: {
    color: Theme.surface,
    fontFamily: FontFamily.bold,
  },

  wageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    height: 48,
  },
  rupeeSign: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.amber,
    marginRight: 6,
  },
  wageInput: {
    flex: 1,
    fontFamily: FontFamily.extraBold,
    fontSize: 18,
    color: Theme.ink,
  },
  perDay: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textMuted,
  },
  wagePresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  wageChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  wageChipSelected: {
    backgroundColor: Theme.primaryLight,
    borderColor: Theme.primary,
  },
  wageChipText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.ink,
  },
  wageChipTextSelected: {
    color: Theme.primary,
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    height: 44,
  },
  iconInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.ink,
  },

  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: {
    fontFamily: FontFamily.extraBold,
    fontSize: 18,
    color: Theme.ink,
    minWidth: 20,
    textAlign: 'center',
  },

  reqTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  reqTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reqTagSelected: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  reqTagText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  reqTagTextSelected: {
    color: Theme.surface,
    fontFamily: FontFamily.bold,
  },

  customReqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  customReqInput: {
    flex: 1,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Theme.ink,
  },
  addReqBtn: {
    backgroundColor: Theme.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addReqBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Theme.surface,
  },

  textArea: {
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Theme.ink,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Bottom Sticky Post Button (flexbox child, not absolute)
  bottomBar: {
    backgroundColor: Theme.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.primary,
    borderRadius: 14,
    height: 52,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  postButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.surface,
    letterSpacing: 0.3,
  },

  // Success Screen Styles
  successScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: Theme.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    color: Theme.ink,
    marginBottom: 4,
  },
  successJobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  successWage: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.amber,
    marginBottom: 20,
  },

  statsCard: {
    width: '100%',
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 16,
  },
  statsHeading: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.textMuted,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    color: Theme.ink,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Theme.border,
  },

  candidateSection: {
    width: '100%',
    marginBottom: 20,
  },
  candidateSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    color: Theme.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  candidateAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateAvatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Theme.primary,
  },
  candidateName: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.ink,
  },
  candidateMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Theme.textSecondary,
    marginTop: 1,
  },
  candidateStatusPill: {
    backgroundColor: Theme.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  candidateStatusText: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    color: Theme.success,
  },

  successPrimaryBtn: {
    width: '100%',
    backgroundColor: Theme.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  successPrimaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.surface,
  },
  successSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  successSecondaryBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Theme.textSecondary,
  },
  pickerBox: {
    flex: 1,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    padding: 12,
  },
  pickerBoxError: {
    borderColor: Theme.error,
    backgroundColor: Theme.errorLight,
  },
  pickerBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pickerBoxLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pickerBoxValue: {
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    color: Theme.ink,
    marginBottom: 4,
  },
  pickerBoxHint: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.accent,
  },
  payOptionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  payOptionCard: {
    flex: 1,
    backgroundColor: Theme.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    padding: 12,
  },
  payOptionCardActive: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentLight,
  },
  payOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  payIconWrapActive: {
    backgroundColor: Theme.accent,
    borderColor: Theme.accent,
  },
  payOptionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12.5,
    color: Theme.ink,
    marginBottom: 4,
  },
  payOptionDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 10.5,
    color: Theme.textSecondary,
    lineHeight: 14,
  },
  submitErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.errorLight,
    borderWidth: 1,
    borderColor: Theme.error,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  submitErrorText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.error,
  },
});