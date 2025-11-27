import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import { Search, Star, X, MessageCircle, Calendar, FileText, DollarSign, MapPin } from 'lucide-react-native';
import { AppHeader } from '../components/app-header';
import { MapViewSection } from '../components/map-view-section';
import { BrowseServices } from '../components/browse-services';
import { AppointmentBooking } from '../components/appointment';

export function SeekMedicalCare({ onOpenMessages, onOpenNotifications }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showAllHospitals, setShowAllHospitals] = useState(false);

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
      {
      id: "4",
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
          <MapViewSection />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Proximity</Text>
            <TouchableOpacity onPress={() => setShowAllHospitals(!showAllHospitals)}>
              <Text style={styles.seeAllButton}>{showAllHospitals ? 'Show Less' : 'See All'}</Text>
            </TouchableOpacity>
          </View>

          {!showAllHospitals ? (
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
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{hospital.rating}</Text>
                  </View>
                </View>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                  <Text style={styles.hospitalAddress} numberOfLines={1}>{hospital.address}</Text>
                  <View style={styles.hospitalFooter}>
                    <View style={styles.hospitalDistance}>
                      <MapPin size={12} color="#9ca3af" />
                      <Text style={styles.hospitalDistanceText}>{hospital.distance}</Text>
                    </View>
                    {hospital.isGabay && (
                      <Image 
                        source={require('../assets/logoblue.png')} 
                        style={styles.gabayBadgeSmall}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          ) : (
            <View style={styles.hospitalGrid}>
              {hospitals.map((hospital) => (
                <TouchableOpacity
                  key={hospital.id}
                  style={styles.hospitalCardGrid}
                  onPress={() => hospital.isGabay && setSelectedFacility(hospital.id)}
                >
                  <View style={styles.hospitalImageContainer}>
                    <View style={styles.hospitalImagePlaceholder}>
                      <Text style={styles.hospitalImageText}>🏥</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.ratingText}>{hospital.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                    <Text style={styles.hospitalAddress} numberOfLines={1}>{hospital.address}</Text>
                    <View style={styles.hospitalFooter}>
                      <View style={styles.hospitalDistance}>
                        <MapPin size={12} color="#9ca3af" />
                        <Text style={styles.hospitalDistanceText}>{hospital.distance}</Text>
                      </View>
                      {hospital.isGabay && (
                        <Image 
                          source={require('../assets/logoblue.png')} 
                          style={styles.gabayBadgeSmall}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <BrowseServices 
            showTitle={true} 
            initialShowAll={true} 
            onServiceSelect={(service) => {
              setSelectedService(service);
              setShowAppointmentBooking(true);
            }} 
          />
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
                  <Image 
                    source={require('../assets/logoblue.png')} 
                    style={styles.modalGabayBadgeImage}
                    resizeMode="contain"
                  />
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

      {/* Appointment Booking Component */}
      <AppointmentBooking 
        visible={showAppointmentBooking}
        onClose={() => {
          setShowAppointmentBooking(false);
          setSelectedService(null);
        }}
        initialService={selectedService}
      />
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    font: 'bold',
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
  hospitalList: {
    marginTop: 12,
  },
  hospitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  hospitalCard: {
    width: 250,
    height: 230,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  hospitalCardGrid: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  hospitalImageContainer: {
    position: 'relative',
    height: 156,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gabayBadgeImage: {
    width: 20,
    height: 20,
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
  hospitalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  hospitalDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalDistanceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  gabayBadgeSmall: {
    width: 16,
    height: 16,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalGabayBadgeImage: {
    width: 32,
    height: 32,
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
});
