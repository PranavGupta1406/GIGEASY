import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily } from '../constants';

// Auth screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RoleScreen } from '../screens/auth/RoleScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { UserRole } from '../types';

// Worker onboarding
import { WorkerNameScreen } from '../screens/worker/onboarding/WorkerNameScreen';
import { WorkerSkillsScreen } from '../screens/worker/onboarding/WorkerSkillsScreen';
import { WorkerCategoryScreen } from '../screens/worker/onboarding/WorkerCategoryScreen';
import { WorkerCategoryJobsScreen } from '../screens/worker/onboarding/WorkerCategoryJobsScreen';

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
import { PostJobScreen } from '../screens/employer/PostJobScreen';
import { PaymentScreen } from '../screens/payment/PaymentScreen';

// Shared
import { JobDetailScreen } from '../screens/jobs/JobDetailScreen';
import { JobApplyScreen } from '../screens/jobs/JobApplyScreen';
import { WorkerDetailScreen } from '../screens/employer/WorkerDetailScreen';

// Order Flow & Applicants
import { CategoryServicesScreen } from '../screens/employer/CategoryServicesScreen';
import { ServiceConfigScreen } from '../screens/employer/ServiceConfigScreen';
import { EmployerCartScreen } from '../screens/employer/EmployerCartScreen';
import { ActiveOrderTrackingScreen } from '../screens/employer/ActiveOrderTrackingScreen';
import { JobApplicantsScreen } from '../screens/employer/JobApplicantsScreen';

// Shell components
import { ModeSwitcher } from '../components/ModeSwitcher';
import { BottomNav } from '../components/BottomNav';

export type RootStackParamList = {
  Welcome: undefined;
  Role: undefined;
  Phone: undefined;
  OTP: { phoneNumber: string; verificationId?: string };
  WorkerName: undefined;
  WorkerSkills: undefined;
  WorkerCategory: undefined;
  WorkerCategoryJobs: { categoryId: string; categoryName: string };
  // Employer onboarding
  EmployerName: undefined;
  MainApp: { initialMode?: 'worker' | 'employer' };
  JobDetail: { jobId: string };
  JobApply: { jobId: string };
  JobApplicants: { jobId: string };
  PostJob: undefined;
  Payment: { applicationId: string };
  WorkerDetail: { workerId: string };
  CategoryServices: { categoryId: string };
  ServiceConfig: { serviceId: string };
  EmployerCart: undefined;
  ActiveOrderTracking: { orderId: string };
  Splash: undefined;
  WorkerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
  EmployerTabs: { initialMode?: 'worker' | 'employer' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Mode = 'worker' | 'employer';
type WorkerTab = 'Home' | 'Jobs' | 'Activity' | 'Profile';
type EmployerTab = 'Dashboard' | 'Jobs' | 'Workers' | 'Profile';

import { Theme } from '../theme';

const BRAND = {
  navy: Theme.primaryDark,
  background: Theme.bg,
  border: Theme.border,
};

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
      Animated.timing(fadeAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
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
      <BottomNav mode={mode} activeTab={activeTab as any} onTabPress={handleTabPress} />
    </View>
  );
}

import { useAuthStore } from '../store';

export function RootNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: BRAND.background },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Role" component={RoleScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="Splash" component={SplashScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="WorkerName" component={WorkerNameScreen} />
            <Stack.Screen name="WorkerSkills" component={WorkerSkillsScreen} />
            <Stack.Screen name="WorkerCategory" component={WorkerCategoryScreen} />
            <Stack.Screen name="WorkerCategoryJobs" component={WorkerCategoryJobsScreen} />

            <Stack.Screen name="EmployerName" component={EmployerNameScreen} />
            
            <Stack.Screen name="MainApp" component={MainAppScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="WorkerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="EmployerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />

            {/* Post Job & Payment */}
            <Stack.Screen name="PostJob" component={PostJobScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ animation: 'slide_from_bottom' }} />

            {/* Employer Order Flow */}
            <Stack.Screen name="CategoryServices" component={CategoryServicesScreen} />
            <Stack.Screen name="ServiceConfig" component={ServiceConfigScreen} />
            <Stack.Screen name="EmployerCart" component={EmployerCartScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="ActiveOrderTracking" component={ActiveOrderTrackingScreen} options={{ animation: 'slide_from_bottom' }} />

            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="JobApply" component={JobApplyScreen} />
            <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
            <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: BRAND.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  logoArea: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  wordmark: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: BRAND.navy,
    letterSpacing: -0.8,
  },
  topRight: { flex: 1, alignItems: 'flex-end' },
  topBarBorder: { height: 1, backgroundColor: '#E9ECF0' },
  content: { flex: 1 },
});
