import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { HomePage } from './pages/home';
import { SettingsPage } from './pages/settings';
import { MessagesPage } from './pages/message';
import { SeekMedicalCare } from './pages/seekmedicalcare';
import { MyFacilities } from './pages/facilities';
import { NotificationsPage } from './pages/notifications';
import { BottomNav } from './components/bottom-nav';
import { SintomasAI } from './components/chatbot';
import { AppointmentBooking } from './components/appointment';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showMessages, setShowMessages] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);

  const handleOpenMessages = () => {
    setShowMessages(true);
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleOpenAI = () => {
    setShowChatbot(true);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false);
  };

  const handleOpenAppointmentBooking = () => {
    setShowAppointment(true);
  };

  const handleCloseAppointment = () => {
    setShowAppointment(false);
  };

  const handleTabChange = (tab) => {
    console.log('Tab changed to:', tab);
    setActiveTab(tab);
  };

  if (showMessages) {
    return <MessagesPage onBack={handleCloseMessages} />;
  }

  if (showChatbot) {
    return <SintomasAI onBack={handleCloseChatbot} isModal={false} />;
  }

  if (showNotifications) {
    return <NotificationsPage onBack={handleCloseNotifications} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
            onOpenAI={handleOpenAI}
            onOpenAppointmentBooking={handleOpenAppointmentBooking}
            onNavigateToCases={() => setActiveTab('cases')}
          />
        );
      case 'cases':
        return (
          <SeekMedicalCare
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
          />
        );
      case 'facilities':
        return (
          <MyFacilities
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
          />
        );
      case 'chatbot':
        return (
          <SintomasAI
            onBack={() => setActiveTab('home')}
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
          />
        );
      default:
        return (
          <HomePage
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
            onOpenAI={handleOpenAI}
            onOpenAppointmentBooking={handleOpenAppointmentBooking}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderPage()}
      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAIClick={handleOpenAI}
      />
      <AppointmentBooking 
        visible={showAppointment}
        onClose={handleCloseAppointment}
      />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
