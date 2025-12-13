import { supabase } from '../lib/supabase';
import Session from './session';

const HomeAPI = {
  async getHomeData() {
    try {
      // Updated: Get all patient IDs associated with the user
      const patientIds = await Session.getAssociatedPatientIds();
      const now = new Date().toISOString();

      if (patientIds.length === 0) {
        return { upcomingAppointment: null };
      }

      // Fetch all dashboard data in parallel
      const [appointmentResult] = await Promise.all([
        // 1. Get nearest upcoming appointment across ALL facilities
        supabase
          .from('appointments')
          .select(`
            appointment_date,
            duration,
            status,
            procedures ( name ),
            providers ( 
              name,
              facilities ( name ) 
            )
          `)
          .in('patient_id', patientIds) // Updated: Use .in() with array
          .gte('appointment_date', now)
          .in('status', ['PENDING', 'CONFIRMED', 'ONGOING'])
          .order('appointment_date', { ascending: true })
          .limit(1)
      ]);

      // Process Appointment Data
      let upcomingAppointment = null;
      
      if (appointmentResult.data && appointmentResult.data.length > 0) {
        const apt = appointmentResult.data[0];
        const dateObj = new Date(apt.appointment_date);
        
        // Format Date: "Thursday, 27 Nov"
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'short' };
        const dateStr = dateObj.toLocaleDateString('en-US', dateOptions);

        // Format Time: "10:30 AM - 11:30 AM"
        const startTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const endTimeObj = new Date(dateObj.getTime() + (apt.duration || 30) * 60000);
        const endTime = endTimeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        upcomingAppointment = {
          hospital: apt.providers?.facilities?.name || apt.providers?.name || 'Medical Center',
          type: apt.procedures?.name || 'Consultation',
          date: dateStr,
          time: `${startTime} - ${endTime}`
        };
      }

      return {
        upcomingAppointment,
      };

    } catch (error) {
      console.error('HomeAPI Error:', error);
      return { upcomingAppointment: null };
    }
  }
};

export default HomeAPI;