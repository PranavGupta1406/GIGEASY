// GigEasy Navigation — Single unified app shell with mode-aware content
// One app, two perspectives: Find Work | Hire Workers
// Deep Teal + Electric Lime + Warm Ivory

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, FontSize } from '../constants';

// Auth screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { RoleScreen } from '../screens/auth/RoleScreen';
import { FirebaseAuthScreen } from '../screens/auth/FirebaseAuthScreen';
import { UserRole } from '../types';

// Worker onboarding
import { WorkerNameScreen } from '../screens/worker/onboarding/WorkerNameScreen';
import { WorkerSkillsScreen } from '../screens/worker/onboarding/WorkerSkillsScreen';
import { WorkerWageScreen } from '../screens/worker/onboarding/WorkerWageScreen';

// Worker main
import { WorkerHomeScreen } from '../screens/worker/WorkerHomeScreen';
import { WorkerJobsScreen } from '../screens/worker/WorkerJobsScreen';
import { WorkerActivityScreen } from '../screens/worker/WorkerActivityScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';

// Employer onboarding
import { EmployerNameScreen } from '../screens/employer/onboarding/EmployerNameScreen';

// Employer main
import { EmployerDashboardScreen } from '../screens/employer/EmployerDashboardScreen';
import { EmployerJobsScreen } from '../screens/employer/EmployerJobsScreen';
import { EmployerWorkersScreen } from '../screens/employer/EmployerWorkersScreen';
import { EmployerProfileScreen } from '../screens/employer/EmployerProfileScreen';

// Shared
import { JobDetailScreen } from '../screens/jobs/JobDetailScreen';
import { JobApplyScreen } from '../screens/jobs/JobApplyScreen';
import { JobApplicantsScreen } from '../screens/employer/JobApplicantsScreen';
import { WorkerDetailScreen } from '../screens/employer/WorkerDetailScreen';
import { PostJobScreen } from '../screens/employer/PostJobScreen';

// Shell components
import { ModeSwitcher } from '../components/ModeSwitcher';
import { BottomNav } from '../components/BottomNav';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  FirebaseAuth: { role?: UserRole; mode?: 'signin' | 'signup' } | undefined;
  Phone: undefined;
  OTP: { phoneNumber: string };
  Role: undefined;
  // Worker onboarding
  WorkerName: undefined;
  WorkerSkills: undefined;
  WorkerWage: undefined;
  // Employer onboarding
  EmployerName: undefined;
  // Main app shell
  MainApp: { initialMode?: 'worker' | 'employer' };
  // Shared push screens
  JobDetail: { jobId: string };
  JobApply: { jobId: string };
  JobApplicants: { jobId: string };
  WorkerDetail: { workerId: string };
  PostJob: undefined;
  // Legacy (kept for any existing navigation calls)
  WorkerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
  EmployerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Mode = 'worker' | 'employer';
type WorkerTab = 'Home' | 'Jobs' | 'Activity' | 'Profile';
type EmployerTab = 'Dashboard' | 'Jobs' | 'Workers' | 'Profile';

// ─── Main App Shell ───────────────────────────────────────────────────────────

function MainAppScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const initialMode: Mode = route?.params?.initialMode ?? 'worker';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [workerTab, setWorkerTab] = useState<WorkerTab>('Home');
  const [employerTab, setEmployerTab] = useState<EmployerTab>('Dashboard');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === mode) return;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setMode(newMode);
  };

  const handleTabPress = (tabKey: string) => {
    if (mode === 'worker') {
      setWorkerTab(tabKey as WorkerTab);
    } else {
      setEmployerTab(tabKey as EmployerTab);
    }
  };

  const activeTab = mode === 'worker' ? workerTab : employerTab;

  const renderContent = () => {
    if (mode === 'worker') {
      switch (workerTab) {
        case 'Home': return <WorkerHomeScreen shellNavigation={navigation} />;
        case 'Jobs': return <WorkerJobsScreen shellNavigation={navigation} />;
        case 'Activity': return <WorkerActivityScreen shellNavigation={navigation} />;
        case 'Profile': return <WorkerProfileScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('employer')} />;
        default: return <WorkerHomeScreen shellNavigation={navigation} />;
      }
    } else {
      switch (employerTab) {
        case 'Dashboard': return <EmployerDashboardScreen shellNavigation={navigation} />;
        case 'Jobs': return <EmployerJobsScreen shellNavigation={navigation} />;
        case 'Workers': return <EmployerWorkersScreen shellNavigation={navigation} />;
        case 'Profile': return <EmployerProfileScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('worker')} />;
        default: return <EmployerDashboardScreen shellNavigation={navigation} />;
      }
    }
  };

  return (
    <View style={styles.shell}>
      {/* Top bar: Logo + ModeSwitcher */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <View style={styles.logoArea}>
          <View style={styles.wordmarkWrap}>
            <Text style={styles.brandGig}>Gig</Text>
            <Text style={styles.brandEasy}>Easy</Text>
            <View style={styles.brandDot} />
          </View>
        </View>
        <ModeSwitcher activeMode={mode} onSwitch={handleModeSwitch} />
        <View style={styles.topRight} />
      </View>

      {/* Mode indicator line */}
      <View style={styles.topBarBorder} />

      {/* Animated content area */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderContent()}
      </Animated.View>

      {/* Bottom navigation */}
      <BottomNav
        mode={mode}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F8F7F4' },
        }}
      >
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="FirebaseAuth" component={FirebaseAuthScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Role" component={RoleScreen} />

        {/* Worker Onboarding */}
        <Stack.Screen name="WorkerName" component={WorkerNameScreen} />
        <Stack.Screen name="WorkerSkills" component={WorkerSkillsScreen} />
        <Stack.Screen name="WorkerWage" component={WorkerWageScreen} />

        {/* Employer Onboarding */}
        <Stack.Screen name="EmployerName" component={EmployerNameScreen} />

        {/* Main App Shell — single screen for both modes */}
        <Stack.Screen
          name="MainApp"
          component={MainAppScreen}
          options={{ animation: 'fade' }}
        />

        {/* Legacy routes — redirect to MainApp */}
        <Stack.Screen
          name="WorkerTabs"
          component={MainAppScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="EmployerTabs"
          component={MainAppScreen}
          options={{ animation: 'fade' }}
        />

        {/* Shared Push Screens */}
        <Stack.Screen
          name="JobDetail"
          component={JobDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="JobApply" component={JobApplyScreen} />
        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
        <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  logoArea: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  wordmarkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandGig: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#090D14',
    letterSpacing: -0.4,
  },
  brandEasy: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#0D3B3F',
    letterSpacing: -0.4,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8F135',
    marginLeft: 2,
    marginTop: -2,
    borderWidth: 1,
    borderColor: '#0D3B3F',
  },
  topRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  topBarBorder: {
    height: 1,
    backgroundColor: '#E8E6E0',
  },
  content: {
    flex: 1,
  },
});
