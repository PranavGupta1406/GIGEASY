import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily } from '../constants';
import { InAppNotificationToast, NotificationDrawerModal } from '../components/InAppNotificationToast';
import { GigAlertOverlay } from '../components/GigAlertOverlay';
import { useAppNotificationStore, AppNotification, useAuthStore, useLanguageStore } from '../store';
import { UserRole } from '../types';

// Auth screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RoleScreen } from '../screens/auth/RoleScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';

// Worker onboarding
import { WorkerNameScreen } from '../screens/worker/onboarding/WorkerNameScreen';
import { WorkerSkillsScreen } from '../screens/worker/onboarding/WorkerSkillsScreen';
import { WorkerCategoryScreen } from '../screens/worker/onboarding/WorkerCategoryScreen';
import { WorkerCategoryJobsScreen } from '../screens/worker/onboarding/WorkerCategoryJobsScreen';

// Worker main
import { WorkerFindWorkScreen } from '../screens/worker/WorkerFindWorkScreen';
import { WorkerMyWorkScreen } from '../screens/worker/WorkerMyWorkScreen';
import { WorkerIdScreen } from '../screens/worker/WorkerIdScreen';
import { WorkerMoreScreen } from '../screens/worker/WorkerMoreScreen';

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

// Cooperative & SIH 26089 screens
import { CooperativeDashboardScreen } from '../screens/cooperative/CooperativeDashboardScreen';
import { DemandForecastScreen } from '../screens/cooperative/DemandForecastScreen';
import { WorkerPassportScreen } from '../screens/worker/WorkerPassportScreen';
import { WorkerWelfareScreen } from '../screens/worker/WorkerWelfareScreen';
import { ServiceRequestScreen } from '../screens/customer/ServiceRequestScreen';
import { EmergencyServiceScreen } from '../screens/customer/EmergencyServiceScreen';
import { RatingScreen } from '../screens/shared/RatingScreen';
import { DisputeScreen } from '../screens/shared/DisputeScreen';
import { ActiveGigScreen } from '../screens/shared/ActiveGigScreen';

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
  MainApp: { initialMode?: 'worker' | 'employer'; employerTab?: EmployerTab; workerTab?: WorkerTab } | undefined;
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
  WorkerTabs: { initialMode?: 'worker' | 'employer'; workerTab?: WorkerTab } | undefined;
  EmployerTabs: { initialMode?: 'worker' | 'employer'; employerTab?: EmployerTab } | undefined;

  // SIH 26089 Cooperative & Worker ID Routes
  WorkerId: undefined;
  WorkerMore: undefined;
  WorkerPassport: undefined;
  WorkerWelfare: undefined;
  CooperativeDashboard: undefined;
  DemandForecast: undefined;
  ServiceRequest: undefined;
  EmergencyService: undefined;
  Rating: { serviceRequestId?: string; workerId?: string } | undefined;
  Dispute: { serviceRequestId?: string } | undefined;
  ActiveGig: { applicationId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Mode = 'worker' | 'employer';
type WorkerTab = 'FindWork' | 'MyWork' | 'WorkerId' | 'More';
type EmployerTab = 'Dashboard' | 'Jobs' | 'Workers' | 'Profile';

import { Theme } from '../theme';

const BRAND = {
  navy: Theme.primaryDark,
  background: Theme.bg,
  border: Theme.border,
};

function MainAppScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();

  // ── Role Routing Fix ────────────────────────────────────────────────────────
  // Read the authenticated role from the store, NOT from route params.
  // Route params are never passed when the navigator auto-transitions from the
  // unauthenticated stack to the authenticated stack after OTP success.
  // Previously this always defaulted to 'worker', causing employer users to
  // land on the worker tab.
  const authRole = useAuthStore((s) => s.role);
  const resolvedInitialMode: Mode =
    (route?.params?.initialMode as Mode) ??
    (authRole === 'employer' ? 'employer' : 'worker');

  const [mode, setMode] = useState<Mode>(resolvedInitialMode);

  // Synchronize mode when authRole changes (e.g. after login or role switch)
  useEffect(() => {
    if (authRole === 'employer' || authRole === 'worker') {
      setMode(authRole);
    }
  }, [authRole]);

  // Synchronize mode if explicitly passed via navigation params
  useEffect(() => {
    if (route?.params?.initialMode) {
      setMode(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  const [workerTab, setWorkerTab] = useState<WorkerTab>('FindWork');
  const [employerTab, setEmployerTab] = useState<EmployerTab>('Dashboard');

  // Handle route param tab switching
  useEffect(() => {
    if (route?.params?.employerTab) {
      setEmployerTab(route.params.employerTab);
      if (mode !== 'employer') setMode('employer');
    }
  }, [route?.params?.employerTab]);

  useEffect(() => {
    if (route?.params?.workerTab) {
      setWorkerTab(route.params.workerTab);
      if (mode !== 'worker') setMode('worker');
    }
  }, [route?.params?.workerTab]);

  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const unreadCount = useAppNotificationStore((s) => s.getUnreadCount(mode));

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

  const handleNotificationNavigate = (notif: AppNotification) => {
    switch (notif.type) {
      case 'GIG_ALERT':
        if (mode !== 'worker') handleModeSwitch('worker');
        if (notif.data?.jobId) {
          navigation.navigate('JobDetail', { jobId: notif.data.jobId });
        }
        break;
      case 'APPLICATION_RECEIVED':
        if (mode !== 'employer') handleModeSwitch('employer');
        if (notif.data?.jobId) {
          navigation.navigate('JobApplicants', { jobId: notif.data.jobId });
        }
        break;
      case 'HIRED':
      case 'ACCEPTED':
      case 'ON_THE_WAY':
      case 'ARRIVED':
      case 'CHECK_IN':
      case 'WORK_COMPLETED':
      case 'PAYMENT_PENDING':
      case 'PAYMENT_RECEIVED':
        navigation.navigate('ActiveGig', { applicationId: notif.data?.applicationId });
        break;
      case 'COUNTER_OFFER':
        if (notif.targetRole === 'worker') {
          if (mode !== 'worker') handleModeSwitch('worker');
          setWorkerTab('MyWork');
        } else {
          if (mode !== 'employer') handleModeSwitch('employer');
          if (notif.data?.jobId) {
            navigation.navigate('JobApplicants', { jobId: notif.data.jobId });
          }
        }
        break;
      default:
        break;
    }
  };

  const activeTab = mode === 'worker' ? workerTab : employerTab;

  const renderContent = () => {
    if (mode === 'worker') {
      switch (workerTab) {
        case 'FindWork': return <WorkerFindWorkScreen shellNavigation={navigation} onNavigateTab={(t) => setWorkerTab(t as WorkerTab)} />;
        case 'MyWork': return <WorkerMyWorkScreen shellNavigation={navigation} onNavigateTab={(t) => setWorkerTab(t as WorkerTab)} />;
        case 'WorkerId': return <WorkerIdScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('employer')} />;
        case 'More': return <WorkerMoreScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('employer')} onNavigateTab={(t) => setWorkerTab(t as WorkerTab)} />;
        default: return <WorkerFindWorkScreen shellNavigation={navigation} onNavigateTab={(t) => setWorkerTab(t as WorkerTab)} />;
      }
    } else {
      switch (employerTab) {
        case 'Dashboard': return <EmployerDashboardScreen shellNavigation={navigation} onNavigateTab={(t) => setEmployerTab(t as EmployerTab)} />;
        case 'Jobs': return <EmployerJobsScreen shellNavigation={navigation} onNavigateTab={(t) => setEmployerTab(t as EmployerTab)} />;
        case 'Workers': return <EmployerWorkersScreen shellNavigation={navigation} onNavigateTab={(t) => setEmployerTab(t as EmployerTab)} />;
        case 'Profile': return <EmployerProfileScreen shellNavigation={navigation} onSwitchMode={() => handleModeSwitch('worker')} />;
        default: return <EmployerDashboardScreen shellNavigation={navigation} onNavigateTab={(t) => setEmployerTab(t as EmployerTab)} />;
      }
    }
  };

  return (
    <View style={styles.shell}>
      {/* Real mobile-style floating gig alert overlay (top slide-in, dismissible) — WORKER ONLY */}
      {mode === 'worker' && (
        <GigAlertOverlay
          activeRole={mode}
          onPressView={(jobId) => {
            navigation.navigate('JobDetail', { jobId });
          }}
        />
      )}

      {/* In-app notification toast for non-gig alerts (applications, hires, check-ins, payments) */}
      <InAppNotificationToast activeRole={mode} onPressAction={handleNotificationNavigate} />

      {/* Clean, balanced top header — NO LANGUAGE PILL */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.logoArea}>
          <Text style={styles.wordmark}>GigEasy</Text>
        </View>

        <View style={styles.centerArea}>
          <ModeSwitcher activeMode={mode} onSwitch={handleModeSwitch} />
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setShowNotificationsDrawer(true)}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={19} color={Theme.ink} />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.topBarBorder} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderContent()}
      </Animated.View>

      <BottomNav mode={mode} activeTab={activeTab as any} onTabPress={handleTabPress} />

      {/* Unified Cross-Role Notification Drawer */}
      <NotificationDrawerModal
        visible={showNotificationsDrawer}
        activeRole={mode}
        onClose={() => setShowNotificationsDrawer(false)}
        onSelectNotification={handleNotificationNavigate}
      />
    </View>
  );
}

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
            <Stack.Screen name="MainApp" component={MainAppScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="WorkerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="EmployerTabs" component={MainAppScreen} options={{ animation: 'fade' }} />

            <Stack.Screen name="WorkerName" component={WorkerNameScreen} />
            <Stack.Screen name="WorkerSkills" component={WorkerSkillsScreen} />
            <Stack.Screen name="WorkerCategory" component={WorkerCategoryScreen} />
            <Stack.Screen name="WorkerCategoryJobs" component={WorkerCategoryJobsScreen} />

            {/* Employer onboarding */}
            <Stack.Screen name="EmployerName" component={EmployerNameScreen} />

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

            {/* SIH 26089 Cooperative & Worker ID Stack Screens */}
            <Stack.Screen name="WorkerId" component={WorkerIdScreen} />
            <Stack.Screen name="WorkerMore" component={WorkerMoreScreen} />
            <Stack.Screen name="WorkerPassport" component={WorkerIdScreen} />
            <Stack.Screen name="WorkerWelfare" component={WorkerWelfareScreen} />
            <Stack.Screen name="CooperativeDashboard" component={CooperativeDashboardScreen} />
            <Stack.Screen name="DemandForecast" component={DemandForecastScreen} />
            <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
            <Stack.Screen name="EmergencyService" component={EmergencyServiceScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Rating" component={RatingScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Dispute" component={DisputeScreen} />
            <Stack.Screen name="ActiveGig" component={ActiveGigScreen} options={{ animation: 'slide_from_bottom' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#FFFFFF' },
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
  centerArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.ink,
    letterSpacing: -0.6,
  },
  topRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F2ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Theme.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Theme.surface,
  },
  topBarBorder: { height: 1, backgroundColor: Theme.border },
  content: { flex: 1 },
});
