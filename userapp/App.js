import './global.css';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { HomePage } from './components/home-page';

export default function App() {
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

  return (
    <>
      <HomePage
        onOpenMessages={handleOpenMessages}
        onOpenNotifications={handleOpenNotifications}
        onOpenAI={handleOpenAI}
        onOpenAppointmentBooking={handleOpenAppointmentBooking}
      />
      <StatusBar style="dark" />
    </>
  );
}
