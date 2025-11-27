import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Calendar, Clock, Sparkles, Plus, Heart } from 'lucide-react-native';
import GeoAltFill from 'react-native-bootstrap-icons/icons/geo-alt-fill';
import { AppHeader } from '../components/app-header';
import { MapViewSection } from '../components/map-view-section';
import { BrowseServices } from '../components/browse-services';
import HomeAPI from '../services/homeApi'; // Added Import

export function HomePage({ onOpenMessages, onOpenNotifications, onOpenAI, onOpenAppointmentBooking, onNavigateToCases }) {
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [aiTriageQuestion, setAiTriageQuestion] = useState("What's the difference between COVID-19 and flu?");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const data = await HomeAPI.getHomeData();
      
      setUpcomingAppointment(data.upcomingAppointment);
      
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    console.log('Selected service:', service.label);
    // TODO: Navigate to service details or booking
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      {/* Upcoming Appointment Section */}
      <View style={[styles.section, styles.firstSection]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.redDot} />
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          </View>
          <TouchableOpacity onPress={onOpenAppointmentBooking} style={styles.scheduleButton}>
            <Plus size={16} color="#0ea5e9" />
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.card, styles.loadingCard]}>
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : upcomingAppointment ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <GeoAltFill color="#60a5fa" size={32} top={12} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{upcomingAppointment.hospital}</Text>
                <Text style={styles.cardSubtitle}>{upcomingAppointment.type}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.badge}>
                <Calendar size={18} color="#60a5fa" />
                <Text style={styles.badgeText}>{upcomingAppointment.date}</Text>
              </View>
              <View style={styles.badgeSeparator} />
              <View style={styles.badge}>
                <Clock size={18} color="#60a5fa" />
                <Text style={styles.badgeText}>{upcomingAppointment.time}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity onPress={onOpenAppointmentBooking} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Schedule an appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* AI Triage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>

        <TouchableOpacity onPress={onOpenAI} style={styles.aiTriageButton}>
          <View style={styles.aiTriageContent}>
            <LinearGradient
              colors={['#66BAFF', '#83BFF0']}
              locations={[0.5, 1]}
              style={styles.aiTriageBackground}
            />
            <Image 
              source={require('../assets/AITriage.png')}
              style={styles.aiTriageImage}
              resizeMode="cover"
            />
            <View style={styles.aiTriageTitleContainer}>
              <BlurView intensity={10} style={styles.aiTriageBlurView}>
                <Text style={styles.aiTriageTitle}>AI Triage</Text>
              </BlurView>
            </View>
          </View>
          <View style={styles.aiTriageFooter}>
            <View style={styles.aiTriageIconContainer}>
              <Image 
                source={require('../assets/logoblue.png')}
                style={styles.aiTriageLogoIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.aiTriageSubtitle}>{aiTriageQuestion}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Seek Medical Care Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seek Medical Care</Text>
        <MapViewSection />
      </View>

      {/* Browse by Services */}
      <View style={[styles.section, styles.lastSection]}>
        <BrowseServices 
          showTitle={true}
          initialShowAll={false}
          onServiceSelect={handleServiceSelect}
          onSeeAll={onNavigateToCases}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 12,
  },
  firstSection: {
    paddingTop: 24,
  },
  lastSection: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#ef4444',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    font: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleButtonText: {
    color: '#0ea5e9',
    fontWeight: '500',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: -4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#93c5fd',
    marginHorizontal: 12,
  },
  badgeText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  aiTriageButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aiTriageContent: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  aiTriageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  aiTriageImage: {
    position: 'absolute',
    width: '70%',
    height: '100%',
    alignSelf: 'center',
    top: '1%',
  },
  aiTriageTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  aiTriageBlurView: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    top: 20,
    left: -10,
  },
  aiTriageTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aiTriageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
  },
  aiTriageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTriageLogoIcon: {
    width: 32,
    height: 32,
  },
  aiTriageSubtitle: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
  },
});
