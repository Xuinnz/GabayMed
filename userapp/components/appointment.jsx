import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Calendar, 
  Clock, 
  ChevronLeft,
  Hospital,
  Brain,
  User,
  HeartPulse,
  Bone,
  Droplet,
  Stethoscope
} from 'lucide-react-native';
import AppointmentAPI from '../services/appointmentApi';

export function AppointmentBooking({ onClose, visible = true, initialService = null, facilityId }) {
  // DEBUG LOG: Check what props are coming in
  console.log("AppointmentBooking Props:", { visible, initialService, facilityId });

  const [step, setStep] = useState(initialService ? "provider" : "service");
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedServiceName, setSelectedServiceName] = useState(initialService || "");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [facilityServices, setFacilityServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // DEBUG LOG: Check current state on every render
  console.log("Current State:", { step, loading, servicesCount: facilityServices.length });

  // Static UI Config for Services (Icons & Colors)
  const serviceUIConfig = {
    "General Check-up": { icon: Hospital, colors: ['#66BAFF', '#83BFF0'] },
    "Neurologist": { icon: Brain, colors: ['#66BAFF', '#83BFF0'] },
    "Psychiatric": { icon: User, colors: ['#66BAFF', '#83BFF0'] },
    "Cardiologist": { icon: HeartPulse, colors: ['#66BAFF', '#83BFF0'] },
    "Orthopedic": { icon: Bone, colors: ['#66BAFF', '#83BFF0'] },
    "Dermatologist": { icon: Droplet, colors: ['#66BAFF', '#83BFF0'] },
    "default": { icon: Stethoscope, colors: ['#66BAFF', '#83BFF0'] }
  };

  // Generate next 7 days for calendar
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return dates;
  };
  const availableDates = generateDates();

  // Static Time Slots Definition
  const baseTimeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  // 1. Load Services on Mount
  useEffect(() => {
    if (visible && facilityId) {
      loadServices();
    }
  }, [visible, facilityId]);

  // 2. Load Providers when step becomes 'provider'
  useEffect(() => {
    if (step === 'provider' && facilityId) {
      loadProviders();
    }
  }, [step, facilityId]);

  // 3. Load Schedule when date is selected
  useEffect(() => {
    if (step === 'time' && selectedProvider && selectedDate) {
      loadSchedule();
    }
  }, [step, selectedProvider, selectedDate]);

  const loadServices = async () => {
    console.log("Starting loadServices for facility:", facilityId);
    setLoading(true);
    try {
      let services = await AppointmentAPI.getFacilityServices(facilityId);
      console.log("Raw services from API:", services);
      
      // Handle case where services might be a string representation of an array
      if (typeof services === 'string') {
        try {
          // Remove curly braces if present (Postgres array format sometimes)
          if (services.startsWith('{') && services.endsWith('}')) {
             services = services.slice(1, -1).split(',').map(s => s.replace(/"/g, '').trim());
          } 
          // Handle JSON string format
          else if (services.startsWith('[') && services.endsWith(']')) {
             services = JSON.parse(services);
          }
          else {
             // Comma separated string
             services = services.split(',').map(s => s.trim());
          }
        } catch (e) {
          console.error("Error parsing services:", e);
          services = [];
        }
      }

      // Ensure it's an array and filter out empty strings
      const validServices = Array.isArray(services) 
        ? services.filter(s => s && typeof s === 'string' && s.trim() !== '') 
        : [];

      console.log("Processed Valid Services:", validServices);
      setFacilityServices(validServices.length > 0 ? validServices : ["General Check-up"]);
    } catch (error) {
      console.error("Load Services Error:", error);
      setFacilityServices(["General Check-up"]);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    setLoading(true);
    const data = await AppointmentAPI.getFacilityProviders(facilityId);
    setProviders(data);
    setLoading(false);
  };

  const loadSchedule = async () => {
    // FIX: Handle both 'id' and 'provider_id' depending on DB schema
    const providerId = selectedProvider?.id || selectedProvider?.provider_id;
    
    if (!providerId) {
      console.error("Cannot load schedule: Missing provider ID", selectedProvider);
      return;
    }

    setLoading(true);
    const booked = await AppointmentAPI.getProviderSchedule(providerId, selectedDate);
    setBookedSlots(booked);
    setLoading(false);
  };

  const isTimeSlotAvailable = (timeStr) => {
    if (!selectedDate) return false;
    
    // Robust parsing for "08:00 AM" format manually to avoid Invalid Date errors in RN
    try {
      let [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      // Check against booked slots
      return !bookedSlots.some(bookedIso => {
        const bookedDate = new Date(bookedIso);
        // Compare using local time components
        return bookedDate.getHours() === hours && 
               bookedDate.getMinutes() === minutes;
      });
    } catch (e) {
      console.error("Time parsing error", e);
      return true; // Fallback to available if parsing fails
    }
  };

  const handleSelectService = (serviceName) => {
    setSelectedService(serviceName);
    setSelectedServiceName(serviceName);
    setStep("provider");
  };

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setStep("calendar");
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setStep("time");
  };

  const handleConfirmBooking = async () => {
    const providerId = selectedProvider?.id || selectedProvider?.provider_id;

    if (!selectedTime || !providerId || !facilityId) {
      console.error("Missing booking data:", { selectedTime, providerId, facilityId });
      return;
    }

    setLoading(true);
    const result = await AppointmentAPI.createAppointment({
      facilityId,
      providerId: providerId, // Use resolved ID
      date: selectedDate,
      time: selectedTime,
      serviceName: selectedServiceName,
      notes: "Booked via GabayMed App"
    });
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Appointment booked successfully!", [
        { text: "OK", onPress: onClose }
      ]);
    } else {
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === "provider") {
      // Allow going back to service selection even if initialService was set
      // This fixes the issue if you want to change the pre-selected service
      setStep("service"); 
    }
    else if (step === "calendar") setStep("provider");
    else if (step === "time") setStep("calendar");
  };

  // Helper to get UI config for a service string
  const getServiceUI = (name) => {
    if (serviceUIConfig[name]) return serviceUIConfig[name];
    const key = Object.keys(serviceUIConfig).find(k => name.includes(k) || k.includes(name));
    return key ? serviceUIConfig[key] : serviceUIConfig["default"];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Always show back button if not in first step OR if we want to allow changing service */}
              {(step !== "service") && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronLeft size={20} color="#1f2937" />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>Schedule Appointment</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading && step !== 'time' && (
              <ActivityIndicator size="large" color="#0ea5e9" style={{ marginVertical: 20 }} />
            )}

            {/* Step 1: Select Service */}
            {/* Logic: Show if step is service AND not loading */}
            {step === "service" && !loading && (
              <View>
                <Text style={styles.stepDescription}>Which service do you need?</Text>
                <View style={styles.optionsList}>
                  {facilityServices.map((serviceName, index) => {
                    const ui = getServiceUI(serviceName);
                    const IconComponent = ui.icon;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelectService(serviceName)}
                        style={styles.optionCard}
                      >
                        <LinearGradient
                          colors={ui.colors}
                          style={styles.optionIcon}
                        >
                          <IconComponent size={24} color="#fff" strokeWidth={2} />
                        </LinearGradient>
                        <Text style={styles.optionText}>{serviceName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Step 2: Select Provider */}
            {step === "provider" && !loading && (
              <View>
                <Text style={styles.stepDescription}>Select a provider</Text>
                {providers.length === 0 ? (
                  <Text style={styles.emptyText}>No providers available for this facility.</Text>
                ) : (
                  <View style={styles.optionsList}>
                    {providers.map((provider) => (
                      <TouchableOpacity
                        key={provider.id || provider.provider_id} // FIX: Safe key
                        onPress={() => handleSelectProvider(provider)}
                        style={styles.providerCard}
                      >
                        <View style={styles.providerAvatar}>
                           <Text style={{fontSize: 18}}>👨‍⚕️</Text>
                        </View>
                        <View style={styles.providerInfo}>
                          <Text style={styles.providerName}>{provider.name}</Text>
                          <Text style={styles.providerSpecialty}>{provider.specialty || 'General Physician'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Step 3: Select Date */}
            {step === "calendar" && selectedProvider && (
              <View>
                <Text style={styles.stepDescription}>Select an available date</Text>
                <View style={styles.calendarGrid}>
                  {availableDates.map((date) => (
                    <TouchableOpacity
                      key={date}
                      onPress={() => handleSelectDate(date)}
                      style={styles.dateCard}
                    >
                      <Calendar size={16} color="#0ea5e9" style={styles.dateIcon} />
                      <Text style={styles.dateText}>{date}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 4: Select Time Slot */}
            {step === "time" && (
              <View>
                <Text style={styles.stepDescription}>
                  {selectedDate ? `Select time for ${selectedDate}` : "Select your preferred time"}
                </Text>
                
                {loading ? (
                   <ActivityIndicator size="small" color="#0ea5e9" />
                ) : (
                  <View style={styles.timeGrid}>
                    {baseTimeSlots.map((time, index) => {
                      const available = isTimeSlotAvailable(time);
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => available && setSelectedTime(time)}
                          disabled={!available}
                          style={[
                            styles.timeSlot,
                            !available && styles.timeSlotDisabled,
                            selectedTime === time && styles.timeSlotSelected
                          ]}
                        >
                          <Clock 
                            size={16} 
                            color={available ? "#1f2937" : "#d1d5db"} 
                            style={styles.timeIcon} 
                          />
                          <Text style={[
                            styles.timeText,
                            !available && styles.timeTextDisabled
                          ]}>
                            {time}
                          </Text>
                          {!available && <Text style={styles.bookedText}>Booked</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <TouchableOpacity onPress={() => setStep("provider")} style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Change Date or Provider</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Button */}
            {selectedTime && step === 'time' && (
              <TouchableOpacity
                onPress={handleConfirmBooking}
                style={styles.confirmButton}
                disabled={loading}
              >
                {loading ? (
                   <ActivityIndicator color="#fff" />
                ) : (
                   <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 16,
  },
  stepDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  providerSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
    fontStyle: 'italic',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateCard: {
    width: '31%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  dateIcon: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
  timeSlotSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#0ea5e9',
  },
  timeIcon: {
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  timeTextDisabled: {
    color: '#d1d5db',
  },
  bookedText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  changeButton: {
    marginTop: 24,
    padding: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  confirmButton: {
    marginTop: 24,
    backgroundColor: '#0ea5e9',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
