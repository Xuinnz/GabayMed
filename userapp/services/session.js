import { supabase } from '../lib/supabase';

// Hardcoded ID for development/testing (This is now a Profile/User ID)
const FALLBACK_USER_ID = '70e59689-c5ae-4b4b-a690-d3742d1a9432'; 

const Session = {
  _cachedId: null,

  /**
   * Initialize session on App startup
   */
  async init() {
    try {
      const id = await AsyncStorage.getItem('gabay_user_id'); // Changed storage key
      this._cachedId = id;
      console.log('Session initialized for User:', this.getUserId());
      return this.getUserId();
    } catch (e) {
      console.warn('Failed to load session:', e);
      return FALLBACK_USER_ID;
    }
  },

  /**
   * Get the current User/Profile ID (Synchronous)
   */
  getUserId() {
    return this._cachedId || FALLBACK_USER_ID;
  },

  /**
   * Set the current User/Profile ID
   */
  async setUserId(id) {
    this._cachedId = id.toString();
    try {
      await AsyncStorage.setItem('gabay_user_id', id.toString());
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  /**
   * Clear session (Logout)
   */
  async clear() {
    this._cachedId = null;
    try {
      await AsyncStorage.removeItem('gabay_user_id');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },

  /**
   * Fetch User Profile from 'profiles' table
   */
  async getProfile() {
    try {
      const id = this.getUserId();
      // Updated: Query 'profiles' table instead of 'patients'
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, date_of_birth') 
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        initials: `${data.first_name?.[0] || ''}${data.last_name?.[0] || ''}`,
        avatar: null 
      };
    } catch (error) {
      console.error('Get Profile Error:', error.message);
      return null;
    }
  },

  /**
   * Helper: Get all patient_ids associated with this user profile
   * Used to query facility-specific data (like appointments)
   */
  async getAssociatedPatientIds() {
    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(row => row.patient_id);
    } catch (error) {
      console.error('Get Patient IDs Error:', error.message);
      return [];
    }
  },

  /**
   * Get Unread Counts
   * Aggregates counts across all linked patient records
   */
  async getUnreadCounts() {
    try {
      // 1. Get all patient IDs for this user
      const patientIds = await this.getAssociatedPatientIds();
      
      if (patientIds.length === 0) {
        return { messages: 0, notifications: 0 };
      }

      // 2. Count pending appointments for ANY of the user's patient records
      const { count: notifCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('patient_id', patientIds) // Use IN operator for multiple IDs
        .eq('status', 'PENDING');

      return {
        messages: 0, 
        notifications: notifCount || 0
      };
    } catch (error) {
      console.error('Get Counts Error:', error);
      return { messages: 0, notifications: 0 };
    }
  }
};

export default Session;