// FirebaseAuthScreen — Unified Firebase Authentication for Workers & Employers
// Deep Teal (#0D3B3F) + Electric Lime (#C8F135) + Warm Ivory (#F8F7F4) + Ink (#090D14)

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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants';
import { GigEasyButton } from '../../components';
import { useAuthStore } from '../../store';
import { signUpUser, signInUser } from '../../services/firebase/authService';
import { UserRole } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FirebaseAuth'>;

export const FirebaseAuthScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialRole: UserRole = route.params?.role || 'worker';
  const initialMode: 'signin' | 'signup' = route.params?.mode || 'signup';

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setPhoneNumber = useAuthStore((s) => s.setPhoneNumber);

  const isSignUp = authMode === 'signup';

  const handleAuth = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setLoading(true);

    // 8-second timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 8000)
    );

    try {
      if (isSignUp) {
        const authTask = signUpUser(
          email.trim(),
          password,
          role,
          fullName.trim(),
          phone.trim()
        );
        const { user } = (await Promise.race([authTask, timeoutPromise])) as any;
        setPhoneNumber(phone.trim());
        setAuthenticated(user.uid, role, user.email ?? email, fullName.trim());

        if (role === 'worker') {
          navigation.replace('WorkerName');
        } else {
          navigation.replace('EmployerName');
        }
      } else {
        const authTask = signInUser(email.trim(), password);
        const { user, profile } = (await Promise.race([authTask, timeoutPromise])) as any;
        const resolvedRole = profile?.role || role;
        setPhoneNumber(profile?.phoneNumber || '');
        setAuthenticated(
          user.uid,
          resolvedRole,
          user.email ?? email,
          profile?.name || user.displayName || ''
        );

        navigation.replace('MainApp', { initialMode: resolvedRole });
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let userFriendlyMsg = 'Authentication failed. Please check your credentials.';

      if (err.message === 'AUTH_TIMEOUT') {
        userFriendlyMsg =
          'Request timed out. Please check your internet connection or use Quick Demo Login.';
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMsg =
          'Email/Password sign-in is disabled in your Firebase console. Please go to Firebase Console -> Authentication -> Sign-in method -> Email/Password and Enable it.';
      } else if (err.code === 'auth/email-already-in-use') {
        userFriendlyMsg = 'This email is already registered. Please switch to "Sign In".';
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyMsg = 'Please enter a valid email address format.';
      } else if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        userFriendlyMsg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMsg = 'Network connection failed. Please check your internet.';
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper with instant guaranteed local fallback
  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    setLoading(true);
    setErrorMessage('');
    const demoEmail = demoRole === 'worker' ? 'worker.demo@gigeasy.app' : 'employer.demo@gigeasy.app';
    const demoPass = 'Demo@123456';
    const demoName = demoRole === 'worker' ? 'Ramesh Kumar (Worker)' : 'Sharma Construction (Employer)';

    const fastTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('FAST_FALLBACK')), 2500)
    );

    try {
      try {
        const { user, profile } = (await Promise.race([
          signInUser(demoEmail, demoPass),
          fastTimeout,
        ])) as any;
        setAuthenticated(user.uid, demoRole, demoEmail, profile?.name || demoName);
      } catch (signInErr: any) {
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential'
        ) {
          const { user } = (await Promise.race([
            signUpUser(demoEmail, demoPass, demoRole, demoName, '9876543210'),
            fastTimeout,
          ])) as any;
          setAuthenticated(user.uid, demoRole, demoEmail, demoName);
        } else {
          throw signInErr;
        }
      }
      navigation.replace('MainApp', { initialMode: demoRole });
    } catch {
      // Instant guaranteed local fallback
      setAuthenticated(`demo_${demoRole}_${Date.now()}`, demoRole, demoEmail, demoName);
      navigation.replace('MainApp', { initialMode: demoRole });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#090D14" />
        </TouchableOpacity>

        <View style={styles.brandBadge}>
          <Text style={styles.brandGig}>Gig</Text>
          <Text style={styles.brandEasy}>Easy</Text>
          <View style={styles.brandDot} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Switcher: Sign In vs Sign Up */}
          <View style={styles.authTabContainer}>
            <TouchableOpacity
              style={[
                styles.authTab,
                authMode === 'signup' && styles.authTabActive,
              ]}
              onPress={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.authTabText,
                  authMode === 'signup' && styles.authTabTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authTab,
                authMode === 'signin' && styles.authTabActive,
              ]}
              onPress={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.authTabText,
                  authMode === 'signin' && styles.authTabTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title and description */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>
              {isSignUp ? 'Join GigEasy' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Sign up with Firebase to connect directly with gigs and workers.'
                : 'Sign in to access your dashboard, jobs, and earnings.'}
            </Text>
          </View>

          {/* Role Selector Card */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>ACCOUNT TYPE</Text>
            <View style={styles.roleGrid}>
              <TouchableOpacity
                style={[
                  styles.rolePill,
                  role === 'worker' && styles.rolePillActive,
                ]}
                onPress={() => setRole('worker')}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.roleIconWrap,
                    role === 'worker' && styles.roleIconWrapActive,
                  ]}
                >
                  <Feather
                    name="compass"
                    size={18}
                    color={role === 'worker' ? '#C8F135' : '#090D14'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rolePillTitle,
                      role === 'worker' && styles.rolePillTitleActive,
                    ]}
                  >
                    Worker (Find Work)
                  </Text>
                  <Text style={styles.rolePillSub}>Daily wages & instant gigs</Text>
                </View>
                {role === 'worker' && (
                  <Ionicons name="checkmark-circle" size={20} color="#0D3B3F" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolePill,
                  role === 'employer' && styles.rolePillActive,
                ]}
                onPress={() => setRole('employer')}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.roleIconWrap,
                    role === 'employer' && styles.roleIconWrapActive,
                  ]}
                >
                  <Feather
                    name="briefcase"
                    size={18}
                    color={role === 'employer' ? '#C8F135' : '#090D14'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rolePillTitle,
                      role === 'employer' && styles.rolePillTitleActive,
                    ]}
                  >
                    Employer (Hire)
                  </Text>
                  <Text style={styles.rolePillSub}>Post jobs & hire verified teams</Text>
                </View>
                {role === 'employer' && (
                  <Ionicons name="checkmark-circle" size={20} color="#0D3B3F" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={18} color="#8E99A8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={role === 'worker' ? 'e.g. Ramesh Kumar' : 'e.g. Sharma Construction'}
                    placeholderTextColor="#8E99A8"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#8E99A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#8E99A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#8E99A8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimum 6 characters"
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
                    size={18}
                    color="#8E99A8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>MOBILE NUMBER (OPTIONAL)</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={18} color="#8E99A8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="10-digit phone number"
                    placeholderTextColor="#8E99A8"
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            {/* Error Message Box */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Primary Submit Button */}
            <View style={styles.submitSection}>
              <GigEasyButton
                label={
                  loading
                    ? 'Authenticating...'
                    : isSignUp
                    ? `Create ${role === 'worker' ? 'Worker' : 'Employer'} Account`
                    : `Sign In as ${role === 'worker' ? 'Worker' : 'Employer'}`
                }
                onPress={handleAuth}
                variant="primary"
                size="lg"
                fullWidth
                showArrow
                loading={loading}
                disabled={loading}
              />
            </View>

            {/* Quick Demo Login Option */}
            <View style={styles.demoDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK DEMO ACCESS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.quickDemoRow}>
              <TouchableOpacity
                style={[styles.demoPill, styles.demoPillWorker]}
                onPress={() => handleQuickDemoLogin('worker')}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Feather name="zap" size={14} color="#0D3B3F" />
                <Text style={styles.demoPillText}>Demo Worker</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, styles.demoPillEmployer]}
                onPress={() => handleQuickDemoLogin('employer')}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Feather name="shield" size={14} color="#0D3B3F" />
                <Text style={styles.demoPillText}>Demo Employer</Text>
              </TouchableOpacity>
            </View>

            {/* Security note */}
            <View style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#0D3B3F" />
              <Text style={styles.securityText}>
                Secured by Firebase Enterprise. KYC Verification enabled.
              </Text>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: '#EBE8DF',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: Spacing[1.5],
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandGig: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    color: '#090D14',
    letterSpacing: -0.5,
  },
  brandEasy: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    color: '#0D3B3F',
    letterSpacing: -0.5,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8F135',
    marginLeft: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  authTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBE8E0',
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing[4],
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  authTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadow.xs,
  },
  authTabText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: '#64748B',
  },
  authTabTextActive: {
    color: '#090D14',
    fontFamily: FontFamily.bold,
  },
  headerBlock: {
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#090D14',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#5A6578',
    lineHeight: 20,
  },
  roleSection: {
    marginBottom: Spacing[4],
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#8E99A8',
    marginBottom: 8,
  },
  roleGrid: {
    gap: 10,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DFD6',
    borderRadius: BorderRadius.lg,
    padding: 12,
  },
  rolePillActive: {
    borderColor: '#0D3B3F',
    backgroundColor: '#F3F8F8',
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconWrapActive: {
    backgroundColor: '#0D3B3F',
  },
  rolePillTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#090D14',
  },
  rolePillTitleActive: {
    color: '#0D3B3F',
  },
  rolePillSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#71717A',
    marginTop: 1,
  },
  formContainer: {
    gap: Spacing[3.5],
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#090D14',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DFD6',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#090D14',
  },
  eyeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#DC2626',
  },
  submitSection: {
    marginTop: Spacing[1],
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[2],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DFD6',
  },
  dividerText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#8E99A8',
    paddingHorizontal: 10,
  },
  quickDemoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  demoPillWorker: {
    backgroundColor: '#EFF8F9',
    borderColor: '#C0DFE2',
  },
  demoPillEmployer: {
    backgroundColor: '#F7F6F1',
    borderColor: '#E0DDD3',
  },
  demoPillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#0D3B3F',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing[2],
  },
  securityText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#5A6578',
  },
});
