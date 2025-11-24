import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// TODO: Replace with your Vercel URL (e.g., 'https://gabay-backend.vercel.app/api')
// Use 'http://localhost:3000/api' if testing locally with 'vercel dev'
const API_BASE_URL = 'http://localhost:3000/api'; 

export const GabayAPI = {
  // 1. AUTH AND PROFILE

  /**
   * Registers a new user and creates their public profile.
   * @param {string} email 
   * @param {string} password 
   * @param {string} fullName 
   * @param {string} address 
   */
  // POST User
  async register(email, password, fullName, address) {
    try {
      // A. Create the Auth User (Standard Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // B. Create the Profile Entry (Linked to Auth ID)
      // We do this immediately so the user has a name in the app.
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id, // STRICTLY Link to Auth ID
              full_name: fullName,
              address: address,
              // Location defaults to null until permission granted
            }
          ]);

        if (profileError) {
          console.error("Profile Creation Failed:", profileError);
          // Optional: Rollback auth user here if strict consistency is needed
          throw profileError;
        }
      }

      return authData;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  },

  /**
   * Log In
   * @returns {Promise<Object>} Session data
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Log Out
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * GET User Profile
   * @param {string} userId - The UUID from the auth session
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // 2. AI CHATBOT (Calls Vercel Backend)

  /**
   * Sends symptoms to the Llama-3 Triage endpoint.
   * @param {string} symptoms - "Chest pain", "Fever", etc.
   * @param {Object} medicalHistory - { allergies: [], chronic_conditions: [] }
   * @returns {Promise<Object>} { likely_condition, suggested_specialty, urgency_level }
   */
  async submitTriage(symptoms, medicalHistory) {
    try {
      const response = await fetch(`${API_BASE_URL}/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          medical_history: medicalHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Triage Service Error:', error);
      throw error;
    }
  },

  // 3. GEOLOCATION ENGINE (Calls Database RPC)

  /**
   * Finds the nearest medical facilities based on specialization.
   * Uses the 'find_nearest_facilities' SQL function in Supabase.
   * @param {number} userLat 
   * @param {number} userLong 
   * @param {string} specialty - e.g. "Cardiologist" (from AI response)
   */
  async findFacilities(userLat, userLong, specialty) {
    try {
      const { data, error } = await supabase.rpc('find_nearest_facilities', {
        user_lat: userLat,
        user_long: userLong,
        specialty_query: specialty 
      });

      if (error) throw error;
      return data; // Returns array sorted by distance_km
    } catch (error) {
      console.error('Map Service Error:', error);
      return []; // Return empty list gracefully so app doesn't crash
    }
  },
  // 4. FINANCIAL TRANSPARENCY (Calls Vercel Backend)

  /**
   * Fetches the patient's billing ledger with auto-calculated transparency.
   * @param {string} patientId - Note: This is usually the UUID from the 'patients' table
   */
  async getBilling(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/billing?patient_id=${patientId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Billing API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Billing Service Error:', error);
      throw error;
    }
  },

  async getDashboardStats(facilityID){
    const today = new Date().toISOString().split('T')[0];

    try{
        const [patients, appointments, staff, income]  = await Promise.all([
            //Number of Appointments
            supabase.from('appointments').select('*', {count: 'exact', head: true}).eq('facility_id', facilityID),
            //Number of staffs
            supabase.from('providers').select('*', {count: "exact", head: true}).eq('facility_id', facilityID),
            //Total Income
            supabase.from('ledger').select('total_bill_amount').eq('payment_status', 'PAID').eq('appointments.facility_id', facilityID),
            //total patients
            supabase.from('appointments').select('patient_id', {count: 'exact', head: true}).eq('facility_id', facilityID)
        ]);
        const totalIncome = income.data 
        ? income.data.reduce((sum, row) => sum + (row.total_bill_amount || 0), 0): 0;

        return {
        totalPatients: patients.count || 0,
        appointmentsToday: appointments.count || 0,
        staffPresent: staff.count || 0,
        totalIncome: totalIncome
        };

    } catch{
        console.error("Stats Error:", error);
        return { totalPatients: 0, appointmentsToday: 0, staffPresent: 0, totalIncome: 0 };
    }
  },

  async getFacilitySchedule(facilityId, dateString) {
    //get facility schedule for the day
    const start = `${dateString}T00:00:00`;
    const end = `${dateString}T23:59:59`;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        appointment_date,
        status,
        patients ( full_name ), 
        procedures ( name ),
        providers ( name, specialization )
      `)
      .eq('facility_id', facilityId) // <--- CRITICAL FILTER
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  }
};