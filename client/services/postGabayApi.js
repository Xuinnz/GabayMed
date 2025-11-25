import { createClient } from '@supabase/supabase-js';
import { Session } from './session'; // Import Session Service

// Helper to get env vars in both Vite (Frontend) and Node (Test Script)
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key]; // Vite
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key]; // Node.js / Jest
  }
  return '';
};

// Initialize Supabase
// NOTE: In Vite, variables must start with VITE_
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 Supabase keys are missing! Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// TODO: Replace with your Vercel URL (e.g., 'https://gabay-backend.vercel.app/api')
// Use 'http://localhost:3000/api' if testing locally with 'vercel dev'
const API_BASE_URL = 'http://localhost:3000/api'; 

export const POSTGabayAPI = {
  
  async createPatient(patientData) { // Removed facilityId parameter
    const facilityId = Session.getFacilityId(); // Get from Session

    const {
      // Profile Fields
      full_name,
      phone_number,
      address,
      email,
      // Patient Fields
      date_of_birth,
      gender,
      insurance_plan_id
    } = patientData;

    try {
      // VALIDATION: Ensure facilityId is present
      if (!facilityId) {
        throw new Error("Facility ID is required to create a patient.");
      }

      // 1. Insert into Profiles
      // This will fire your DB trigger to create the empty patient row
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name,
          phone_number,
          address,
          email
        }])
        .select('id') // Get the ID to find the linked patient
        .single();

      if (profileError) throw profileError;

      if (!profile) throw new Error("Profile creation failed");

      // 2. Update the automatically created Patient row
      // We use UPDATE, not INSERT, because the trigger already made the row
      const { error: patientError } = await supabase
        .from('patients')
        .update({
          date_of_birth,
          gender,
          insurance_plan_id,
          facility_id: facilityId // Add facility_id here
        })
        .eq('user_id', profile.id); 

      if (patientError) throw patientError;

      return { success: true, id: profile.id };

    } catch (error) {
      console.error("Create Patient Error:", error.message);
      return { success: false, error: error.message };
    }
  }
};