import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X, Calendar, Clock, ChevronLeft } from 'lucide-react-native';

export function AppointmentBooking({ onClose, visible = true }) {
  const [step, setStep] = useState("service");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const services = [
    { id: "1", name: "General Check-up", icon: "👨‍⚕️" },
    { id: "2", name: "Neurologist", icon: "🧠" },
    { id: "3", name: "Psychiatric", icon: "🧘" },
    { id: "4", name: "Cardiologist", icon: "❤️" },
    { id: "5", name: "Orthopedic", icon: "🦴" },
    { id: "6", name: "Dermatologist", icon: "💉" },
  ];

  const providers = [
    { id: "p1", name: "Dr. Jasper King Gueco", specialty: "General Physician" },
    { id: "p2", name: "Dr. Maria Santos", specialty: "General Physician" },
    { id: "p3", name: "Dr. Juan Dela Cruz", specialty: "General Physician" },
  ];

  // Mock calendar data - provider availability
  const providerAvailability = {
    p1: ["Nov 28", "Nov 29", "Nov 30", "Dec 1", "Dec 2"],
    p2: ["Nov 27", "Nov 28", "Dec 1", "Dec 3"],
    p3: ["Nov 29", "Nov 30", "Dec 2", "Dec 4"],
  };

  // Mock time slots - some booked (grayed out)
  const timeSlots = [
    { time: "08:00 AM", available: true },
    { time: "09:00 AM", available: true },
    { time: "10:00 AM", available: false },
    { time: "11:00 AM", available: true },
    { time: "02:00 PM", available: false },
    { time: "03:00 PM", available: true },
    { time: "04:00 PM", available: true },
  ];

  const handleSelectService = (serviceId) => {
    setSelectedService(serviceId);
    setStep("provider");
  };

  const handleSkipProvider = () => {
    setStep("time");
  };

  const handleSelectProvider = (providerId) => {
    setSelectedProvider(providerId);
    setStep("calendar");
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setStep("time");
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    console.log("Appointment booked:", { selectedService, selectedProvider, selectedDate, time });
    onClose();
  };

  const handleBack = () => {
    if (step === "provider") setStep("service");
    else if (step === "calendar") setStep("provider");
    else if (step === "time") {
      if (selectedProvider) setStep("calendar");
      else setStep("provider");
    }
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
              {step !== "service" && (
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
            {/* Step 1: Select Service */}
            {step === "service" && (
              <View>
                <Text style={styles.stepDescription}>Which service do you need?</Text>
                <View style={styles.optionsList}>
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => handleSelectService(service.id)}
                      style={styles.optionCard}
                    >
                      <Text style={styles.optionIcon}>{service.icon}</Text>
                      <Text style={styles.optionText}>{service.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Select Provider (Optional) */}
            {step === "provider" && (
              <View>
                <Text style={styles.stepDescription}>Select a provider (optional)</Text>
                <View style={styles.optionsList}>
                  {providers.map((provider) => (
                    <TouchableOpacity
                      key={provider.id}
                      onPress={() => handleSelectProvider(provider.id)}
                      style={styles.providerCard}
                    >
                      <View style={styles.providerAvatar} />
                      <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={handleSkipProvider} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Skip - Choose date instead</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Select Date from Provider Calendar */}
            {step === "calendar" && selectedProvider && (
              <View>
                <Text style={styles.stepDescription}>Select an available date</Text>
                <View style={styles.calendarGrid}>
                  {providerAvailability[selectedProvider]?.map((date) => (
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
                <View style={styles.timeGrid}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => slot.available && handleSelectTime(slot.time)}
                      disabled={!slot.available}
                      style={[
                        styles.timeSlot,
                        !slot.available && styles.timeSlotDisabled,
                        selectedTime === slot.time && styles.timeSlotSelected
                      ]}
                    >
                      <Clock 
                        size={16} 
                        color={slot.available ? "#1f2937" : "#d1d5db"} 
                        style={styles.timeIcon} 
                      />
                      <Text style={[
                        styles.timeText,
                        !slot.available && styles.timeTextDisabled
                      ]}>
                        {slot.time}
                      </Text>
                      {!slot.available && <Text style={styles.bookedText}>Booked</Text>}
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={() => setStep("provider")} style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Change Date or Provider</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Button */}
            {selectedTime && (
              <TouchableOpacity
                onPress={() => handleSelectTime(selectedTime)}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
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
    maxHeight: '90%',
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
    fontSize: 20,
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
    backgroundColor: '#e5e7eb',
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
  skipButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
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
