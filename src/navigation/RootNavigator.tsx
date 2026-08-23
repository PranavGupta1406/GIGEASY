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

// Employer main (Marketplace)
import { EmployerMarketplaceScreen } from '../screens/employer/EmployerMarketplaceScreen';
import { EmployerOrderHistoryScreen } from '../screens/employer/EmployerOrderHistoryScreen';
import { EmployerProfileScreen } from '../screens/employer/EmployerProfileScreen';

// Shared
import { JobDetailScreen } from '../screens/jobs/JobDetailScreen';
import { JobApplyScreen } from '../screens/jobs/JobApplyScreen';
import { WorkerDetailScreen } from '../screens/employer/WorkerDetailScreen';

// New Employer Order Flow
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
  OTP: { phoneNumber: string };
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
type EmployerTab = 'Dashboard' | 'History' | 'Cart' | 'Profile';

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
      // Map frontend tab names to actual tabs
      let newTab: EmployerTab = tabKey as EmployerTab;
      if (tabKey === 'Jobs') newTab = 'History'; // Remap old bottom nav strings
      if (tabKey === 'Workers') newTab = 'Cart'; 
      setEmployerTab(newTab);
      
      // If clicking cart, we can also push the cart screen directly instead of embedding in shell
      if (newTab === 'Cart') {
        navigation.navigate('EmployerCart');
        setEmployerTab('Dashboard'); // reset tab back visually
      }
    }
  };

  const activeTab = mode === 'worker' ? workerTab : (
    // Map back for the bottom nav UI
    employerTab === 'History' ? 'Jobs' : 
    employerTab === 'Cart' ? 'Workers' : 
    employerTab
  );

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
        case 'Dashboard': return <EmployerMarketplaceScreen shellNavigation={navigation} />;
        case 'History': return <EmployerOrderHistoryScreen shellNavigation={navigation} />;
        case 'Profile': return <EmployerProfileScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('worker')} />;
        default: return <EmployerMarketplaceScreen shellNavigation={navigation} />;
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

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: BRAND.background } }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Role" component={RoleScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        <Stack.Screen name="WorkerName" component={WorkerNameScreen} />
        <Stack.Screen name="WorkerSkills" component={WorkerSkillsScreen} />
        <Stack.Screen name="WorkerCategory" component={WorkerCategoryScreen} />
        <Stack.Screen name="WorkerCategoryJobs" component={WorkerCategoryJobsScreen} />

        {/* Employer Onboarding */}
        <Stack.Screen name="EmployerName" component={EmployerNameScreen} />
        
        <Stack.Screen name="MainApp" component={MainAppScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="WorkerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="EmployerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />

        {/* New Employer Marketplace Screens */}
        <Stack.Screen name="CategoryServices" component={CategoryServicesScreen} />
        <Stack.Screen name="ServiceConfig" component={ServiceConfigScreen} />
        <Stack.Screen name="EmployerCart" component={EmployerCartScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ActiveOrderTracking" component={ActiveOrderTrackingScreen} options={{ animation: 'slide_from_bottom' }} />

        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="JobApply" component={JobApplyScreen} />
        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
        <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: BRAND.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingBottom: 11 },
  logoArea: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  wordmark: { fontFamily: FontFamily.bold, fontSize: 17, color: BRAND.navy, letterSpacing: -0.5 },
  topRight: { flex: 1, alignItems: 'flex-end' },
  topBarBorder: { height: 1, backgroundColor: BRAND.border },
  content: { flex: 1 },
});
