// Role Selection Screen — Two Immersive Visual Choices (Find Work vs Hire Workers)
// Deep Teal + Electric Lime + Warm Ivory + Ink

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import { useAuthStore } from '../../store';
import { GigEasyButton } from '../../components';

type Props = NativeStackScreenProps<RootStackParamList, 'Role'>;

export const RoleScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<'worker' | 'employer'>('worker');
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const userId = useAuthStore((s) => s.userId);

  const handleContinue = () => {
    setAuthenticated(userId ?? 'u_demo', selectedRole);
    if (selectedRole === 'worker') {
      navigation.replace('WorkerName');
    } else {
      navigation.replace('EmployerName');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <View style={styles.content}>
        {/* Editorial Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How will you use{'\n'}GigEasy?</Text>
          <Text style={styles.subtitle}>
            Choose your perspective. You can toggle between finding work and hiring anytime with one tap.
          </Text>
        </View>

        {/* 2 Visual Immersion Choice Cards */}
        <View style={styles.roleCardsContainer}>
          {/* Worker Card: Find Work */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'worker' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('worker')}
            activeOpacity={0.9}
          >
            <View style={styles.roleCardTop}>
              <View
                style={[
                  styles.iconWrap,
                  selectedRole === 'worker' && styles.iconWrapActive,
                ]}
              >
                <Feather
                  name="compass"
                  size={24}
                  color={selectedRole === 'worker' ? '#C8F135' : '#090D14'}
                />
              </View>

              <View style={styles.metricBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.metricText}>1,420+ Gigs Today</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedRole === 'worker' && styles.radioCircleActive,
                ]}
              >
                {selectedRole === 'worker' && <View style={styles.radioDot} />}
              </View>
            </View>

            <Text style={styles.roleTitle}>Find Work</Text>
            <Text style={styles.roleSub}>
              Discover verified local gigs, negotiate daily rates directly, and receive guaranteed end-of-shift payouts.
            </Text>

            <View style={styles.perksList}>
              <View style={styles.perkRow}>
                <Feather name="check" size={13} color="#0D3B3F" />
                <Text style={styles.perkText}>Instant geofenced job matches</Text>
              </View>
              <View style={styles.perkRow}>
                <Feather name="check" size={13} color="#0D3B3F" />
                <Text style={styles.perkText}>Direct daily wage settlement</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Employer Card: Hire Workers */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'employer' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('employer')}
            activeOpacity={0.9}
          >
            <View style={styles.roleCardTop}>
              <View
                style={[
                  styles.iconWrap,
                  selectedRole === 'employer' && styles.iconWrapActive,
                ]}
              >
                <Feather
                  name="users"
                  size={24}
                  color={selectedRole === 'employer' ? '#C8F135' : '#090D14'}
                />
              </View>

              <View style={styles.metricBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.metricText}>3,800+ Workers</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedRole === 'employer' && styles.radioCircleActive,
                ]}
              >
                {selectedRole === 'employer' && <View style={styles.radioDot} />}
              </View>
            </View>

            <Text style={styles.roleTitle}>Hire Workers</Text>
            <Text style={styles.roleSub}>
              Post gigs in under 60 seconds, connect with verified candidates, and manage shift attendance seamlessly.
            </Text>

            <View style={styles.perksList}>
              <View style={styles.perkRow}>
                <Feather name="check" size={13} color="#0D3B3F" />
                <Text style={styles.perkText}>Verified worker profiles with trust scores</Text>
              </View>
              <View style={styles.perkRow}>
                <Feather name="check" size={13} color="#0D3B3F" />
                <Text style={styles.perkText}>Live geofenced attendance tracking</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaSection}>
          <GigEasyButton
            label={selectedRole === 'worker' ? 'Continue to Find Work' : 'Continue to Hire Workers'}
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[5],
    justifyContent: 'space-between',
    paddingBottom: Spacing[8],
  },
  header: {
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: '#090D14',
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#5A6578',
    lineHeight: 20,
  },
  roleCardsContainer: {
    gap: Spacing[3.5],
    flex: 1,
    justifyContent: 'center',
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  roleCardActive: {
    borderColor: '#0D3B3F',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    ...Shadow.sm,
  },
  roleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2.5],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#0D3B3F',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F3F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  metricText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#0D3B3F',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4D1C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#0D3B3F',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D3B3F',
  },
  roleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#090D14',
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  roleSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#5A6578',
    lineHeight: 18,
    marginBottom: Spacing[2.5],
  },
  perksList: {
    gap: 5,
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#F2F0EB',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  perkText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#090D14',
  },
  ctaSection: {
    marginTop: 'auto',
  },
});
