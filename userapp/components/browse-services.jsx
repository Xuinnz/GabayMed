import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Hospital,
  Brain,
  HeartPulse,
  Pill,
  Eye,
  User,
  Bone,
  Droplet,
  Wind,
  Activity,
  Baby
} from 'lucide-react-native';

export function BrowseServices({ showTitle = true, initialShowAll = false, onServiceSelect, onSeeAll }) {
  const [showAllServices, setShowAllServices] = useState(initialShowAll);

  const allServices = [
    { icon: Hospital, label: "General Physician", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Brain, label: "Neurologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: HeartPulse, label: "Cardiologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Pill, label: "Dentist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Eye, label: "Ophthalmologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: User, label: "ENT Specialist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Bone, label: "Orthopedic", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Droplet, label: "Dermatologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Wind, label: "Pulmonologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Pill, label: "Pharmacist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Activity, label: "Hematologist", gradientColors: ['#66BAFF', '#83BFF0'] },
    { icon: Baby, label: "Pediatrician", gradientColors: ['#66BAFF', '#83BFF0'] },
  ];

  const services = showAllServices ? allServices : allServices.slice(0, 4);

  const handleServicePress = (service) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  const handleSeeAllPress = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      setShowAllServices(!showAllServices);
    }
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Services</Text>
          <TouchableOpacity onPress={handleSeeAllPress}>
            <Text style={styles.seeAllText}>{showAllServices ? 'Show Less' : 'See All'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.servicesGrid}>
        {services.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
            >
              <LinearGradient
                colors={service.gradientColors}
                style={styles.serviceIcon}
              >
                <IconComponent size={24} color="#fff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    font: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  serviceLabel: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
  },
});
