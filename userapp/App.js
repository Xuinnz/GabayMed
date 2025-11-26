import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { HomePage } from './pages/home';
import { SettingsPage } from './pages/settings';
import { MessagesPage } from './pages/message';
import { SeekMedicalCare } from './pages/seekmedicalcare';
import { BottomNav } from './components/bottom-nav';
import { SintomasAI } from './components/chatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showMessages, setShowMessages] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleOpenMessages = () => {
    setShowMessages(true);
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
  };

  const handleOpenNotifications = () => {
    console.log('Open notifications');
  };

  const handleOpenAI = () => {
    setShowChatbot(true);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false);
  };

  const handleOpenAppointmentBooking = () => {
    console.log('Open appointment booking');
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

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onOpenMessages={handleOpenMessages}
            onOpenNotifications={handleOpenNotifications}
            onOpenAI={handleOpenAI}
            onOpenAppointmentBooking={handleOpenAppointmentBooking}
          />
        );
      case 'facilities':
        return (
          <SeekMedicalCare
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
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
