import './global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { HomePage } from './pages/home';
import { SettingsPage } from './pages/settings';
import { MessagesPage } from './pages/message';
import { SeekMedicalCare } from './pages/seekmedicalcare';
import { MyFacilities } from './pages/facilities';
import { NotificationsPage } from './pages/notifications';
import { BottomNav } from './components/bottom-nav';
import { AppointmentBooking } from './components/appointment';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { OnboardingPage } from './pages/auth/onboarding';
import Session from './services/session';
import 'react-native-url-polyfill/auto';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(() => Session.current());
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [prefillEmail, setPrefillEmail] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);

  useEffect(() => {
    const unsubscribe = Session.subscribe(next => {
      setSession(next);
      if (!next) {
        setShowMessages(false);
        setShowNotifications(false);
        setShowAppointment(false);
        setActiveTab('home');
      }
    });
    Session.restore()
      .catch(() => {})
      .finally(() => setBooting(false));
    return unsubscribe;
  }, []);

  if (booting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3BA5EC" />
        <StatusBar style="dark" />
      </View>
    );
  }

  // 1. Unauthenticated: Login, Registration, or Forgot Password flow
  if (!session) {
    return (
      <View style={styles.container}>
        {authScreen === 'register' ? (
          <RegisterPage
            onBack={() => setAuthScreen('login')}
            onRegistered={registeredEmail => {
              setPrefillEmail(registeredEmail || '');
              setAuthScreen('login');
            }}
          />
        ) : authScreen === 'forgot' ? (
          <ForgotPasswordPage
            onBack={() => setAuthScreen('login')}
            onResetDone={resetEmail => {
              setPrefillEmail(resetEmail || '');
              setAuthScreen('login');
            }}
          />
        ) : (
          <LoginPage
            initialEmail={prefillEmail}
            onSignUp={() => setAuthScreen('register')}
            onForgotPassword={() => setAuthScreen('forgot')}
          />
        )}
        <StatusBar style="dark" />
      </View>
    );
  }

  // 2. First-time user: Onboarding walkthrough + care profile setup
  if (!session.profile?.onboardingCompleted) {
    return (
      <View style={styles.container}>
        <OnboardingPage
          onComplete={() => {
            Session.setProfile({ ...session.profile, onboardingCompleted: true });
          }}
        />
        <StatusBar style="dark" />
      </View>
    );
  }

  // 3. Authenticated & onboarded: Main patient app
  if (showMessages) {
    return <MessagesPage onBack={() => setShowMessages(false)} />;
  }

  if (showNotifications) {
    return <NotificationsPage onBack={() => setShowNotifications(false)} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onOpenMessages={() => setShowMessages(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenAppointmentBooking={() => setShowAppointment(true)}
            onNavigateToCases={() => setActiveTab('cases')}
          />
        );
      case 'cases':
        return (
          <SeekMedicalCare
            onOpenMessages={() => setShowMessages(true)}
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
      case 'facilities':
        return (
          <MyFacilities
            onOpenMessages={() => setShowMessages(true)}
            onOpenNotifications={() => setShowNotifications(true)}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            onOpenMessages={() => setShowMessages(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onSignOut={() => setAuthScreen('login')}
          />
        );
      default:
        return (
          <HomePage
            onOpenMessages={() => setShowMessages(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenAppointmentBooking={() => setShowAppointment(true)}
            onNavigateToCases={() => setActiveTab('cases')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <AppointmentBooking visible={showAppointment} onClose={() => setShowAppointment(false)} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
