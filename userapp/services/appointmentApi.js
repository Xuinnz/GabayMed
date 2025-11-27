import { supabase } from '../lib/supabase';
import Session from './session'; // Import Session service

const AppointmentAPI = {
  /**
   * Get providers linked to a specific facility
   */
  async getFacilityProviders(facilityId) {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('facility_id', facilityId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get Providers Error:", error.message);
      return [];
    }
  },

  /**
   * Get services offered by a specific facility
   */
  async getFacilityServices(facilityId) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('services_offered')
        .eq('facility_id', facilityId)
        .single();

      if (error) throw error;
      return data?.services_offered || [];
    } catch (error) {
      console.error("Get Facility Services Error:", error.message);
      return [];
    }
  },

  /**
   * Check for existing appointments for a provider on a specific date
   * Returns an array of booked ISO timestamps
   */
  async getProviderSchedule(providerId, dateString) {
    try {
      // Create range for the selected date (00:00 to 23:59)
      const startDate = new Date(dateString);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateString);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('provider_id', providerId)
        .gte('appointment_date', startDate.toISOString())
        .lte('appointment_date', endDate.toISOString())
        .neq('status', 'CANCELLED'); // Ignore cancelled appointments

      if (error) throw error;
      
      // Return array of booked times
      return data.map(a => a.appointment_date);
    } catch (error) {
      console.error("Get Schedule Error:", error.message);
      return [];
    }
  },

  /**
   * Create a new appointment for the current user
   */
  async createAppointment(appointmentData) {
    try {
      // 1. Get current user ID from Session service
      const userId = Session.getUserId();
      if (!userId) throw new Error("User not authenticated");
      
      const facilityId = appointmentData.facilityId;

      // 2. Resolve Patient ID
      // Check if a patient record exists for this user (profile_id) at this facility
      let patientId = null;

      const { data: existingPatient, error: fetchError } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .maybeSingle();

      if (existingPatient) {
        patientId = existingPatient.patient_id;
      } else {
        // Create new patient record linking profile and facility
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert([{
            user_id: userId,
            facility_id: facilityId
          }])
          .select('patient_id')
          .single();
        
        if (createError) throw createError;
        patientId = newPatient.patient_id;
      }

      // 3. Construct timestamp safely
      // appointmentData.date is "YYYY-MM-DD"
      // appointmentData.time is "HH:mm AM/PM"
      
      let appointmentDate;
      try {
        const [year, month, day] = appointmentData.date.split('-').map(Number);
        const [timeStr, modifier] = appointmentData.time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        // Note: Month is 0-indexed in JS Date constructor
        const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
        
        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date constructed");
        }
        
        appointmentDate = dateObj.toISOString();
      } catch (e) {
        console.error("Date parsing error:", e);
        throw new Error("Invalid date or time format");
      }

      // 4. Insert Appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          facility_id: facilityId,
          patient_id: patientId, // Use resolved patient_id
          provider_id: appointmentData.providerId,
          procedure_id: appointmentData.procedureId || '7b54b7db-ff42-4e8d-a147-133cfb5eab16', // Fallback to General Consultation
          notes: `Service: ${appointmentData.serviceName}. ${appointmentData.notes || ''}`, 
          appointment_date: appointmentDate,
          duration: 60, // Default 1 hour
          status: 'PENDING'
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error("Create Appointment Error:", error.message);
      return { success: false, error: error.message };
    }
  }
};

export default AppointmentAPI;