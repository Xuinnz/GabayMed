import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Clock, Sparkles, Plus } from 'lucide-react-native';
import { AppHeader } from '../components/app-header';

export function HomePage({ onOpenMessages, onOpenNotifications, onOpenAI, onOpenAppointmentBooking }) {
  const services = [
    { icon: "🏥", label: "General Physician", color: "#e0f2fe" },
    { icon: "🧠", label: "Neurologist", color: "#dbeafe" },
    { icon: "🩺", label: "Cardiologist", color: "#fee2e2" },
    { icon: "🦷", label: "Dentist", color: "#dcfce7" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      {/* Upcoming Appointment Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Sparkles size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          </View>
          <TouchableOpacity onPress={onOpenAppointmentBooking} style={styles.scheduleButton}>
            <Plus size={16} color="#0ea5e9" />
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#0ea5e9" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Philippine General Hospital</Text>
              <Text style={styles.cardSubtitle}>General Check-up</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.badge}>
              <Calendar size={16} color="#4b5563" />
              <Text style={styles.badgeText}>Thursday, 27 Nov</Text>
            </View>
            <View style={styles.badge}>
              <Clock size={16} color="#4b5563" />
              <Text style={styles.badgeText}>10:30 AM - 11:30 AM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* AI Triage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>

        <TouchableOpacity onPress={onOpenAI} style={styles.aiTriageButton}>
          <View style={styles.aiTriageContent}>
            <View style={styles.aiTriageText}>
              <Text style={styles.aiTriageTitle}>AI Triage</Text>
              <Text style={styles.aiTriageSubtitle}>What's the difference between COVID-19 and flu?</Text>
            </View>
            <View style={styles.aiTriageIcon}>
              <Text style={styles.aiTriageIconText}>🩺</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Seek Medical Care Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seek Medical Care</Text>

        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>🗺️ Map View</Text>
          </View>
          <View style={styles.mapOverlay}>
            <View style={styles.mapSearchBar}>
              <MapPin size={20} color="#0ea5e9" />
              <Text style={styles.mapSearchText}>Browse available locations</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Browse by Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Services</Text>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                <Text style={styles.serviceEmoji}>{service.icon}</Text>
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginLeft: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#4b5563',
  },
  aiTriageButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiTriageContent: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTriageText: {
    flex: 1,
  },
  aiTriageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiTriageSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  aiTriageIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTriageIconText: {
    fontSize: 48,
  },
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 176,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 32,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  mapSearchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapSearchText: {
    color: '#6b7280',
    fontSize: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  serviceCard: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceLabel: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
  },
});
