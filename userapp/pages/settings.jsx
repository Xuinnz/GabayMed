import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
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
  Edit3,
  Save,
  X,
} from 'lucide-react-native';
import { AppHeader } from '../components/app-header';
import ProfileAPI from '../services/profileApi'; // Import ProfileAPI

export function SettingsPage({ onOpenMessages, onOpenNotifications, onSignOut }) { // Added onSignOut prop
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  const menuItems = [
    { id: "profile", icon: User, label: "My Profile", action: () => handleOpenProfile() },
    { id: "history", icon: History, label: "History", action: () => handleHistory() },
    { id: "help", icon: HelpCircle, label: "Help & Support", action: () => handleHelp() },
    { id: "signout", icon: LogOut, label: "Sign Out", danger: true, action: () => handleSignOut() },
  ];

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Use ProfileAPI instead of simulation
      const data = await ProfileAPI.getProfile();
      setProfileData(data);
      setShowProfile(true);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = () => {
    fetchProfileData();
  };

  const handleHistory = () => {
    Alert.alert("History", "Medical history feature coming soon!");
  };

  const handleHelp = () => {
    Alert.alert("Help & Support", "Contact us at support@gabaymed.com or call +63 2 1234 5678");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await ProfileAPI.signOut();
              if (onSignOut) onSignOut(); // Callback to parent to switch screens
            } catch (error) {
              Alert.alert("Error", "Failed to sign out");
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // Convert array to comma-separated string for editing
    setEditedData({ 
      ...profileData,
      medicalHistory: Array.isArray(profileData.medicalHistory) 
        ? profileData.medicalHistory.join(', ') 
        : ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Use ProfileAPI to update (sends string for medicalHistory)
      await ProfileAPI.updateProfile(editedData);
      
      // Refresh local data
      // Convert string back to array for display
      const updatedProfile = {
        ...editedData,
        medicalHistory: typeof editedData.medicalHistory === 'string'
          ? editedData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      setProfileData(updatedProfile);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
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
          {!isEditing && profileData && (
            <TouchableOpacity
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              <Edit3 size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {!profileData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
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
                {profileData.medicalHistory.length > 0 ? (
                  profileData.medicalHistory.map((item, index) => (
                    <Text key={index} style={styles.historyItem}>• {item.trim()}</Text>
                  ))
                ) : (
                  <Text style={styles.historyItem}>No medical history recorded.</Text>
                )}
              </View>
            </View>
          </View>
          </ScrollView>
        )}

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditing}
          animationType="slide"
          transparent={false}
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.modalButton}>
                <X size={24} color="#ef4444" />
              </TouchableOpacity>
              <Text style={styles.editModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.modalButton} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0ea5e9" />
                ) : (
                  <Save size={24} color="#0ea5e9" />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalContent}>
              <View style={styles.editSection}>
                <Text style={styles.editSectionTitle}>Personal Information</Text>
                
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Full Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedData?.name}
                    onChangeText={(text) => setEditedData({...editedData, name: text})}
                    placeholder="Enter full name"
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Phone</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedData?.phone}
                    onChangeText={(text) => setEditedData({...editedData, phone: text})}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Email is usually read-only in profile edits for security, but keeping editable if desired */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Email</Text>
                  <TextInput
                    style={[styles.editInput, { backgroundColor: '#f3f4f6', color: '#9ca3af' }]}
                    value={editedData?.email}
                    editable={false} 
                    placeholder="Enter email"
                  />
                  <Text style={{fontSize: 10, color: '#9ca3af', marginTop: 4}}>Email cannot be changed here.</Text>
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Address</Text>
                  <TextInput
                    style={[styles.editInput, styles.editInputMultiline]}
                    value={editedData?.address}
                    onChangeText={(text) => setEditedData({...editedData, address: text})}
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editSectionTitle}>Medical Information</Text>
                
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Blood Type</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedData?.bloodType}
                    onChangeText={(text) => setEditedData({...editedData, bloodType: text})}
                    placeholder="Enter blood type"
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Allergies</Text>
                  <TextInput
                    style={[styles.editInput, styles.editInputMultiline]}
                    value={editedData?.allergies}
                    onChangeText={(text) => setEditedData({...editedData, allergies: text})}
                    placeholder="Enter allergies"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* NEW: Medical History Input */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Medical History (comma separated)</Text>
                  <TextInput
                    style={[styles.editInput, styles.editInputMultiline]}
                    value={editedData?.medicalHistory}
                    onChangeText={(text) => setEditedData({...editedData, medicalHistory: text})}
                    placeholder="e.g. Hypertension, Asthma, Diabetes"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        )}

        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={item.action}
                disabled={loading}
                style={[
                  styles.menuItem,
                  item.danger ? styles.menuItemDanger : styles.menuItemNormal,
                  loading && styles.menuItemDisabled
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
  menuItemDisabled: {
    opacity: 0.5,
  },
  loadingOverlay: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  editModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  modalButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    flex: 1,
    padding: 16,
  },
  editSection: {
    marginBottom: 24,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

