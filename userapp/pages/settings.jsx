import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  User,
  History,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
} from 'lucide-react-native';
import { AppHeader } from '../components/app-header';

export function SettingsPage({ onOpenMessages, onOpenNotifications }) {
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { id: "profile", icon: User, label: "My Profile", action: () => setShowProfile(true) },
    { id: "history", icon: History, label: "History" },
    { id: "help", icon: HelpCircle, label: "Help & Support" },
    { id: "signout", icon: LogOut, label: "Sign Out", danger: true },
  ];

  const profileData = {
    name: "Red Gabriel",
    age: 28,
    birthdate: "March 15, 1996",
    gender: "Male",
    phone: "+63 912 345 6789",
    email: "red.gabriel@email.com",
    address: "123 Taft Avenue, Manila, Philippines",
    bloodType: "O+",
    allergies: "Penicillin, Sulfa drugs",
    medicalHistory: ["Hypertension (2020)", "Appendectomy (2018)", "Asthma (childhood)"],
  };

  if (showProfile) {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={() => setShowProfile(false)}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.profileHeaderTitle}>My Profile</Text>
        </View>

        <ScrollView style={styles.profileContent}>
          <View style={styles.profileAvatarSection}>
            <View style={styles.profileAvatar}>
              <User size={48} color="#0ea5e9" />
            </View>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileSubtitle}>
              {profileData.age} years old, {profileData.gender}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Calendar size={20} color="#0ea5e9" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Birthdate</Text>
                  <Text style={styles.infoValue}>{profileData.birthdate}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Phone size={20} color="#0ea5e9" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profileData.phone}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Mail size={20} color="#0ea5e9" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profileData.email}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={20} color="#0ea5e9" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{profileData.address}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Medical Information</Text>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Heart size={20} color="#ef4444" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Blood Type</Text>
                  <Text style={styles.infoValue}>{profileData.bloodType}</Text>
                </View>
              </View>
              <View style={styles.medicalSection}>
                <Text style={styles.infoLabel}>Allergies</Text>
                <Text style={styles.infoValue}>{profileData.allergies}</Text>
              </View>
              <View style={styles.medicalSection}>
                <Text style={styles.infoLabel}>Medical History</Text>
                {profileData.medicalHistory.map((item, index) => (
                  <Text key={index} style={styles.historyItem}>• {item}</Text>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={item.action}
                style={[
                  styles.menuItem,
                  item.danger ? styles.menuItemDanger : styles.menuItemNormal
                ]}
              >
                <View style={styles.menuItemLeft}>
                  <Icon size={20} color={item.danger ? "#ef4444" : "#0ea5e9"} />
                  <Text style={[
                    styles.menuItemLabel,
                    item.danger && styles.menuItemLabelDanger
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color={item.danger ? "#fca5a5" : "#9ca3af"} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemNormal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuItemDanger: {
    backgroundColor: '#fef2f2',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuItemLabelDanger: {
    color: '#dc2626',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileHeader: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    backgroundColor: '#e0f2fe',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  medicalSection: {
    marginTop: 4,
  },
  historyItem: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 4,
  },
});
