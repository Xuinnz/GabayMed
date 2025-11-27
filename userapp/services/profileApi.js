import { supabase } from '../lib/supabase';
import Session from './session';

const ProfileAPI = {
  /**
   * Fetches the current user's profile and medical info.
   */
  async getProfile() {
    try {
      const userId = await Session.getUserId();
      if (!userId) throw new Error("User not logged in");

      // Fetch basic profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Calculate age from date_of_birth
      let age = 'N/A';
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        id: profile.id,
        // FIX: Use full_name directly
        name: profile.full_name || 'No Name',
        age: age.toString(),
        // FIX: Use date_of_birth
        birthdate: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set',
        rawBirthdate: profile.date_of_birth, // For editing
        gender: profile.gender || 'Not set',
        phone: profile.phone_number || 'Not set',
        email: profile.email || 'Not set',
        address: profile.address || 'Not set',
        bloodType: profile.blood_type || 'Not set',
        allergies: profile.allergies || 'None',
        medicalHistory: profile.medical_history ? profile.medical_history.split(',') : [] 
      };

    } catch (error) {
      console.error("Get Profile Error:", error);
      throw error;
    }
  },

  /**
   * Updates the user's profile.
   */
  async updateProfile(updates) {
    try {
      const userId = await Session.getUserId();
      if (!userId) throw new Error("User not logged in");

      const dbUpdates = {
        // FIX: Update full_name directly
        full_name: updates.name,
        phone_number: updates.phone,
        address: updates.address,
        blood_type: updates.bloodType,
        allergies: updates.allergies,
        // NEW: Add medical_history to updates
        medical_history: updates.medicalHistory,
      };

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  },
  
  async signOut() {
    return Session.signOut();
  }
};

export default ProfileAPI;