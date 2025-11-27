import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded ID for development/testing (Replace with a real UUID from your database if needed)
const FALLBACK_PATIENT_ID = '1'; 

const Session = {
  _cachedId: null,

  /**
   * Initialize session on App startup
   */
  async init() {
    try {
      const id = await AsyncStorage.getItem('gabay_patient_id');
      this._cachedId = id;
      console.log('Session initialized for Patient:', this.getPatientId());
      return this.getPatientId();
    } catch (e) {
      console.warn('Failed to load session:', e);
      return FALLBACK_PATIENT_ID;
    }
  },

  /**
   * Get the current patient ID (Synchronous)
   * Returns the hardcoded fallback if no user is logged in.
   */
  getPatientId() {
    return this._cachedId || FALLBACK_PATIENT_ID;
  },

  /**
   * Set the current patient ID
   */
  async setPatientId(id) {
    this._cachedId = id.toString();
    try {
      await AsyncStorage.setItem('gabay_patient_id', id.toString());
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  /**
   * Clear session (Logout)
   */
  async clear() {
    this._cachedId = null;
    // filepath: c:\Users\Lenovo\Documents\Projects\Hackathon-Projects\GabayMed\userapp\services\session.js
  }
}
export default Session;