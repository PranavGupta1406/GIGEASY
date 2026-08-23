// GigEasy Navigation — Single unified app shell with mode-aware content
// Flow: Welcome → Role → Phone → OTP → Onboarding → MainApp
// One brand. One color. Two perspectives: Find Work | Hire Workers.

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily } from '../constants';

// Auth screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { FirebaseAuthScreen } from '../screens/auth/FirebaseAuthScreen';
import { RoleScreen } from '../screens/auth/RoleScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
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
  Welcome: undefined;
  FirebaseAuth: { role?: UserRole; mode?: 'signin' | 'signup' } | undefined;
  Role: undefined;
  Phone: undefined;
  OTP: { phoneNumber: string };
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
  // Legacy routes
  Splash: undefined;
  WorkerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
  EmployerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Mode = 'worker' | 'employer';
type WorkerTab = 'Home' | 'Jobs' | 'Activity' | 'Profile';
type EmployerTab = 'Dashboard' | 'Jobs' | 'Workers' | 'Profile';

// Brand constants
const BRAND = {
  navy: '#1A68D5',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

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
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
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
          <Text style={styles.wordmark}>GigEasy</Text>
        </View>
        <ModeSwitcher activeMode={mode} onSwitch={handleModeSwitch} />
        <View style={styles.topRight} />
      </View>

      <View style={styles.topBarBorder} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderContent()}
      </Animated.View>

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
          contentStyle: { backgroundColor: BRAND.background },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="FirebaseAuth" component={FirebaseAuthScreen} />
        <Stack.Screen name="Role" component={RoleScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />

        {/* Legacy splash redirect */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Worker Onboarding */}
        <Stack.Screen name="WorkerName" component={WorkerNameScreen} />
        <Stack.Screen name="WorkerSkills" component={WorkerSkillsScreen} />
        <Stack.Screen name="WorkerWage" component={WorkerWageScreen} />

        {/* Employer Onboarding */}
        <Stack.Screen name="EmployerName" component={EmployerNameScreen} />

        {/* Main App Shell */}
        <Stack.Screen
          name="MainApp"
          component={MainAppScreen}
          options={{ animation: 'fade' }}
        />

        {/* Legacy routes */}
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
    backgroundColor: BRAND.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 11,
  },
  logoArea: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: BRAND.navy,
    letterSpacing: -0.5,
  },
  topRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  topBarBorder: {
    height: 1,
    backgroundColor: BRAND.border,
  },
  content: {
    flex: 1,
  },
});
