// GigEasy Firebase Authentication Screen
// Email & Password Sign Up & Login with Worker/Employer Role Switching

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { FontFamily, FontSize, BorderRadius, Spacing, Shadow, Colors } from '../../constants';
import { useAuthStore } from '../../store';
import { signUpUser, signInUser } from '../../services/firebase/authService';
import { UserRole } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FirebaseAuth'>;

export const FirebaseAuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialRole: UserRole = route.params?.role ?? 'worker';
  const initialMode: 'signin' | 'signup' = route.params?.mode ?? 'signin';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const switchRole = useAuthStore((s) => s.switchRole);

  const isSignUp = authMode === 'signup';

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    switchRole(newRole);
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both your email address and password.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name to create an account.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { user, profile } = await signUpUser(
          email.trim(),
          password,
          role,
          fullName.trim(),
          phoneNumber.trim()
        );

        setAuthenticated(user.uid, role, profile.name, profile.email, profile.phoneNumber, profile.kycStatus);

        if (role === 'worker') {
          navigation.replace('WorkerName');
        } else {
          navigation.replace('EmployerName');
        }
      } else {
        const { user, profile } = await signInUser(email.trim(), password);

        const targetRole = profile.role || role;
        setAuthenticated(
          user.uid,
          targetRole,
          profile.name || (targetRole === 'worker' ? 'Gig Worker' : 'Gig Employer'),
          user.email || email,
          profile.phoneNumber || '',
          profile.kycStatus || 'unverified'
        );

        navigation.replace('MainApp', { initialMode: targetRole });
      }
    } catch (err: any) {
      console.warn('Firebase Auth Error:', err);
      let errorMsg = 'An error occurred during authentication. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address format.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Network connection failed. Please check your internet connection.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
      } else if (err.message) {
        errorMsg = err.message;
      }

      Alert.alert(
        isSignUp ? 'Registration Error' : 'Sign In Error',
        errorMsg,
        [
          { text: 'Try Again', style: 'cancel' },
          {
            text: 'Use Demo Mode',
            onPress: () => handleDemoBypass(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoBypass = () => {
    const demoName = role === 'worker' ? 'Ramesh Kumar' : 'Amit Sharma (Bharat Logistics)';
    const demoEmail = role === 'worker' ? 'ramesh.worker@gigeasy.app' : 'amit.employer@gigeasy.app';
    const demoUid = role === 'worker' ? 'demo_worker_uid' : 'demo_employer_uid';

    setAuthenticated(demoUid, role, demoName, demoEmail, '9876543210', 'verified');
    navigation.replace('MainApp', { initialMode: role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Back & Title */}
          <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color="#090D14" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>GigEasy Identity</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Role Tabs */}
          <View style={styles.roleTabsContainer}>
            <TouchableOpacity
              onPress={() => handleRoleChange('worker')}
              style={[
                styles.roleTab,
                role === 'worker' ? styles.roleTabActive : styles.roleTabInactive,
              ]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="hard-hat"
                size={18}
                color={role === 'worker' ? '#090D14' : '#5A6578'}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'worker' && styles.roleTabTextActive,
                ]}
              >
                Worker (Find Gigs)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleChange('employer')}
              style={[
                styles.roleTab,
                role === 'employer' ? styles.roleTabActive : styles.roleTabInactive,
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name="briefcase"
                size={16}
                color={role === 'employer' ? '#090D14' : '#5A6578'}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'employer' && styles.roleTabTextActive,
                ]}
              >
                Employer (Hire)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Header Title Banner */}
          <View style={styles.headingSection}>
            <Text style={styles.mainHeading}>
              {isSignUp ? `Create ${role === 'worker' ? 'Worker' : 'Employer'} Account` : `Welcome Back!`}
            </Text>
            <Text style={styles.subHeading}>
              {isSignUp
                ? 'Sign up with Firebase to save your identity and start working.'
                : 'Sign in to access your jobs, earnings, and realtime sync.'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {isSignUp && (
              <>
                <Text style={styles.inputLabel}>FULL NAME / COMPANY NAME</Text>
                <View style={styles.inputWrap}>
                  <Feather name="user" size={17} color="#5A6578" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={role === 'worker' ? 'e.g. Ramesh Kumar' : 'e.g. Bharat Logistics Ltd'}
                    placeholderTextColor="#8E99A8"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={styles.inputLabel}>MOBILE NUMBER (OPTIONAL)</Text>
                <View style={styles.inputWrap}>
                  <Feather name="phone" size={17} color="#5A6578" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#8E99A8"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={17} color="#5A6578" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor="#8E99A8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={17} color="#5A6578" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="At least 6 characters"
                placeholderTextColor="#8E99A8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={17}
                  color="#5A6578"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAuth}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#090D14" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isSignUp ? 'Create Account' : 'Sign In'} →
                </Text>
              )}
            </TouchableOpacity>

            {/* Auth Mode Toggle */}
            <TouchableOpacity
              onPress={() => setAuthMode(isSignUp ? 'signin' : 'signup')}
              style={styles.modeToggleBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modeToggleText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.modeToggleHighlight}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instant Quick Demo Bypass Buttons */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>INSTANT TESTING (DEMO MODE)</Text>
            <View style={styles.demoBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  handleRoleChange('worker');
                  handleDemoBypass();
                }}
                style={styles.demoBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.demoBtnText}>⚡ Demo Worker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleRoleChange('employer');
                  handleDemoBypass();
                }}
                style={styles.demoBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.demoBtnText}>🏢 Demo Employer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.xs,
  },
  topTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#090D14',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECEAE4',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#C8F135',
    ...Shadow.xs,
  },
  roleTabInactive: {
    backgroundColor: 'transparent',
  },
  roleTabText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#5A6578',
  },
  roleTabTextActive: {
    color: '#090D14',
  },
  headingSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  mainHeading: {
    fontFamily: FontFamily.extraBold,
    fontSize: 24,
    color: '#090D14',
    letterSpacing: -0.5,
  },
  subHeading: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#5A6578',
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    ...Shadow.sm,
  },
  inputLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#5A6578',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7F4',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: '#090D14',
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: '#C8F135',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    ...Shadow.xs,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#090D14',
  },
  modeToggleBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 4,
  },
  modeToggleText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: '#5A6578',
  },
  modeToggleHighlight: {
    fontFamily: FontFamily.bold,
    color: '#0D3B3F',
    textDecorationLine: 'underline',
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#8E99A8',
    marginBottom: 10,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D1C8',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  demoBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#090D14',
  },
});
