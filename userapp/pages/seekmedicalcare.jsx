import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import { Search, Star, X, MessageCircle, Calendar, FileText, DollarSign, MapPin } from 'lucide-react-native';
import { AppHeader } from '../components/app-header';

export function SeekMedicalCare({ onOpenMessages, onOpenNotifications }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);

  const hospitals = [
    {
      id: "1",
      name: "UERM Medical Center",
      address: "64 Aurora Blvd",
      rating: 4.8,
      isOpen: true,
      isGabay: true,
      image: "/uerm-medical-center-hospital-building.jpg",
      distance: "1.2 km",
      openHours: "Open 24 hours",
    },
    {
      id: "2",
      name: "Philippine General Hospital",
      address: "Taft Ave, Manila",
      rating: 4.6,
      isOpen: true,
      isGabay: true,
      image: "/philippine-general-hospital-building.jpg",
      distance: "2.1 km",
      openHours: "Open 24 hours",
    },
    {
      id: "3",
      name: "Manila Doctors Hospital",
      address: "667 United Nations Ave",
      rating: 4.5,
      isOpen: true,
      isGabay: false,
      image: "/manila-doctors-hospital-building.jpg",
      distance: "3.4 km",
      openHours: "Open 24 hours",
    },
  ];

  const services = [
    { id: "general", icon: "👨‍⚕️", label: "General Physician" },
    { id: "neuro", icon: "🧠", label: "Neurologist" },
    { id: "psych", icon: "🧘", label: "Psychiatric" },
    { id: "cardio", icon: "❤️", label: "Cardiologist" },
    { id: "ortho", icon: "🦴", label: "Orthopedic" },
    { id: "optho", icon: "👁️", label: "Ophthalmologist" },
    { id: "dent", icon: "🦷", label: "Dentist" },
    { id: "peds", icon: "👶", label: "Pediatrician" },
    { id: "obgyn", icon: "🤰", label: "OB-GYN" },
    { id: "path", icon: "🧪", label: "Pathologist" },
    { id: "radio", icon: "🩻", label: "Radiologist" },
    { id: "derm", icon: "💉", label: "Dermatologist" },
  ];

  const gabayPerks = [
    { icon: FileText, label: "View Your Ledger" },
    { icon: Calendar, label: "Book Appointments" },
    { icon: DollarSign, label: "Real-time Bill Estimates" },
    { icon: MessageCircle, label: "Direct Facility Chat" },
  ];

  return (
    <View style={styles.container}>
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seek Medical Care</Text>

          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>🗺️</Text>
            </View>

            {/* GABAY Partner Pins */}
            <TouchableOpacity
              style={[styles.mapPin, styles.gabayPin, { top: '33%', left: '25%' }]}
              onPress={() => setSelectedFacility("1")}
            >
              <Text style={styles.gabayPinText}>G</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapPin, styles.gabayPin, { top: '50%', left: '50%' }]}
              onPress={() => setSelectedFacility("2")}
            >
              <Text style={styles.gabayPinText}>G</Text>
            </TouchableOpacity>

            {/* Non-GABAY Pin */}
            <View style={[styles.mapPin, styles.standardPin, { top: '66%', right: '25%' }]} />

            {/* Search Bar */}
            <View style={styles.mapSearchBar}>
              <Search size={20} color="#9ca3af" />
              <TextInput
                style={styles.mapSearchInput}
                placeholder="Browse available healthcare"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Proximity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hospitalList}>
            {hospitals.map((hospital) => (
              <TouchableOpacity
                key={hospital.id}
                style={styles.hospitalCard}
                onPress={() => hospital.isGabay && setSelectedFacility(hospital.id)}
              >
                <View style={styles.hospitalImageContainer}>
                  <View style={styles.hospitalImagePlaceholder}>
                    <Text style={styles.hospitalImageText}>🏥</Text>
                  </View>
                  {hospital.isGabay && (
                    <View style={styles.gabayBadge}>
                      <Text style={styles.gabayBadgeText}>G</Text>
                    </View>
                  )}
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{hospital.rating}</Text>
                  </View>
                </View>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                  <Text style={styles.hospitalAddress} numberOfLines={1}>{hospital.address}</Text>
                  <View style={styles.hospitalDistance}>
                    <MapPin size={12} color="#9ca3af" />
                    <Text style={styles.hospitalDistanceText}>{hospital.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Services</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => setShowAppointmentBooking(true)}
              >
                <View style={styles.serviceIcon}>
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* GABAY Partner Modal */}
      <Modal
        visible={selectedFacility !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedFacility(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalGabayBadge}>
                  <Text style={styles.modalGabayBadgeText}>G</Text>
                </View>
                <View>
                  <Text style={styles.modalTitle}>GABAY 2.0 Partner</Text>
                  <Text style={styles.modalSubtitle}>
                    {hospitals.find((h) => h.id === selectedFacility)?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFacility(null)}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Exclusive perks available at this GABAY partner:
            </Text>

            <View style={styles.perksGrid}>
              {gabayPerks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <View key={index} style={styles.perkCard}>
                    <Icon size={20} color="#0ea5e9" />
                    <Text style={styles.perkLabel}>{perk.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => {
                  setSelectedFacility(null);
                  setShowAppointmentBooking(true);
                }}
              >
                <Calendar size={16} color="#fff" />
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Appointment Booking Modal Placeholder */}
      <Modal
        visible={showAppointmentBooking}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAppointmentBooking(false)}
      >
        <View style={styles.appointmentModalOverlay}>
          <View style={styles.appointmentModalContent}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowAppointmentBooking(false)}>
                <X size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentPlaceholder}>
              <Calendar size={48} color="#0ea5e9" />
              <Text style={styles.appointmentPlaceholderText}>
                Appointment booking coming soon...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  lastSection: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    marginTop: 12,
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 64,
  },
  mapPin: {
    position: 'absolute',
  },
  gabayPin: {
    width: 32,
    height: 40,
    backgroundColor: '#22c55e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gabayPinText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  standardPin: {
    width: 24,
    height: 32,
    backgroundColor: '#ef4444',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapSearchBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
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
  mapSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  hospitalList: {
    marginTop: 12,
  },
  hospitalCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  hospitalImageContainer: {
    position: 'relative',
    height: 96,
  },
  hospitalImagePlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalImageText: {
    fontSize: 40,
  },
  gabayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gabayBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
  },
  hospitalInfo: {
    padding: 8,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  hospitalDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  hospitalDistanceText: {
    fontSize: 12,
    color: '#6b7280',
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
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceEmoji: {
    fontSize: 20,
  },
  serviceLabel: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalGabayBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#22c55e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGabayBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 16,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  perkCard: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  perkLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appointmentPlaceholder: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  appointmentPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
