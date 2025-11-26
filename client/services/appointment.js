import { createClient } from '@supabase/supabase-js';
import { Session } from './session'; // Import the session helper

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

export const appointmentAPI = {
  
  // Remove facilityId param or make it optional
  async getTodayAppointments() {
    // Get ID from the central session manager
    const facilityId = Session.getFacilityId();

    const today = new Date().toISOString().split('T')[0];
    const start = `${today}T00:00:00`;
    const end = `${today}T23:59:59`;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          status,
          patients ( full_name ),
          procedures ( name ),
          providers ( name )
        `)
        .eq('facility_id', facilityId) // Uses the ID from session.js
        .gte('appointment_date', start)
        .lte('appointment_date', end)
        // Filter out cancelled appointments if necessary, otherwise remove this line
        .neq('status', 'CANCELLED') 
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error("Get Today's Appointments Error:", error.message);
      return [];
    }
  },

  // 1. Get Providers for the Scheduler Rows
  async getProviders() {
    const facilityId = Session.getFacilityId();
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('provider_id, name, specialization')
        .eq('facility_id', facilityId);
      
      if (error) throw error;
      
      // Map to UI format
      return data.map(p => ({
        id: p.provider_id,
        name: p.name,
        role: p.specialization || 'Provider',
        image: null // Placeholder handled in UI
      }));
    } catch (error) {
      console.error("Get Providers Error:", error.message);
      return [];
    }
  },

  // 2. GET Appointments for a specific date
  async getAppointmentsByDate(date) {
    const facilityId = Session.getFacilityId();
    
    // Ensure date is YYYY-MM-DD string
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const start = `${dateStr}T00:00:00`;
    const end = `${dateStr}T23:59:59`;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          status,
          duration, 
          notes,
          provider_id,
          patients ( full_name ),
          procedures ( name )
        `)
        .eq('facility_id', facilityId)
        .gte('appointment_date', start)
        .lte('appointment_date', end)
        .neq('status', 'CANCELLED');

      if (error) throw error;

      // Transform for Scheduler UI
      return data.map(apt => {
        const dateObj = new Date(apt.appointment_date);
        return {
          id: apt.appointment_id,
          providerId: apt.provider_id,
          time: dateObj.getHours(), // Extract hour (0-23) for grid placement
          patient: apt.patients?.full_name || 'Unknown',
          procedure: apt.procedures?.name || 'General',
          status: apt.status,
          operatory: 'Room 1', // Placeholder if no room column exists yet
          length: apt.duration || 30,
          notes: apt.notes
        };
      });

    } catch (error) {
      console.error("Get Scheduler Appointments Error:", error.message);
      return [];
    }
  },

  // 3. Get Procedures for Dropdown
  async getProcedures() {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('procedure_id, name'); // Fetch ID too
      
      if (error) throw error;
      // Return objects so we have the ID for insertion
      return data.map(p => ({ id: p.procedure_id, name: p.name }));
    } catch (error) {
      return [];
    }
  },

  // 4. Create Appointment
  async createAppointment(newAppointment) {
    const facilityId = Session.getFacilityId();
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          facility_id: facilityId,
          patient_id: newAppointment.patientId,
          provider_id: newAppointment.providerId,
          procedure_id: newAppointment.procedureId,
          appointment_date: newAppointment.date, // ISO String
          duration: parseInt(newAppointment.duration),
          status: newAppointment.status,
          notes: newAppointment.notes
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Create Appointment Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // 5. Search Patients (for the appointment form)
  async searchPatients(query) {
    const facilityId = Session.getFacilityId();
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('patient_id, full_name')
        .eq('facility_id', facilityId)
        .ilike('full_name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data.map(p => ({ id: p.patient_id, name: p.full_name }));
    } catch (error) {
      return [];
    }
  },

  // 6. Get Peak Hours Data (Visits per hour for today)
  async getPeakHoursData() {
    const facilityId = Session.getFacilityId();
    const today = new Date().toISOString().split('T')[0];
    const start = `${today}T00:00:00`;
    const end = `${today}T23:59:59`;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('facility_id', facilityId)
        .gte('appointment_date', start)
        .lte('appointment_date', end)
        .neq('status', 'CANCELLED');

      if (error) throw error;

      // Initialize hours map (8 AM to 5 PM standard clinic hours)
      const hoursMap = {};
      for (let i = 8; i <= 17; i++) {
        hoursMap[i] = 0;
      }

      // Count visits per hour
      data.forEach(app => {
        const date = new Date(app.appointment_date);
        const hour = date.getHours();
        // Only count if within reasonable range or add dynamically
        if (hoursMap[hour] !== undefined) {
          hoursMap[hour]++;
        } else {
          // Optional: Add hours outside standard range if needed
          hoursMap[hour] = (hoursMap[hour] || 0) + 1;
        }
      });

      // Convert to array format for Recharts and sort by time
      const sortedHours = Object.keys(hoursMap).sort((a, b) => parseInt(a) - parseInt(b));
      
      return sortedHours.map(hour => {
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return {
          time: `${displayHour} ${ampm}`,
          visits: hoursMap[hour]
        };
      });

    } catch (error) {
      console.error("Get Peak Hours Error:", error.message);
      return [];
    }
  },

  // 7. Get Upcoming Appointments for a Patient
  async getUpcomingAppointmentsByPatient(patientId) {
    const facilityId = Session.getFacilityId();
    // Use start of today (00:00:00) to ensure today's appointments are included
    const today = new Date().toISOString().split('T')[0];
    const startOfToday = `${today}T00:00:00`;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          status,
          procedures ( name ),
          providers ( name )
        `)
        .eq('facility_id', facilityId)
        .eq('patient_id', patientId)
        .gte('appointment_date', startOfToday)
        .neq('status', 'CANCELLED')
        .order('appointment_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      return data.map(apt => ({
        id: apt.appointment_id,
        date: apt.appointment_date,
        procedure: apt.procedures?.name || 'General Checkup',
        provider: apt.providers?.name || 'Unknown Provider',
        status: apt.status
      }));
    } catch (error) {
      console.error("Get Patient Upcoming Appointments Error:", error.message);
      return [];
    }
  }
};