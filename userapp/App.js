import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { HomePage } from './components/home-page';
import { BottomNav } from './components/bottom-nav';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleOpenMessages = () => {
    console.log('Open messages');
  };

  const handleOpenNotifications = () => {
    console.log('Open notifications');
  };

  const handleOpenAI = () => {
    console.log('Open AI Triage');
  };

  const handleOpenAppointmentBooking = () => {
    console.log('Open appointment booking');
  };

  const handleTabChange = (tab) => {
    console.log('Tab changed to:', tab);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <HomePage
        onOpenMessages={handleOpenMessages}
        onOpenNotifications={handleOpenNotifications}
        onOpenAI={handleOpenAI}
        onOpenAppointmentBooking={handleOpenAppointmentBooking}
      />
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
