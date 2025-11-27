import { supabase } from '../lib/supabase';
import Session from './session';

const FacilitiesAPI = {
  async getFacilitiesPageData() {
    try {
      const patientIds = await Session.getAssociatedPatientIds();
      
      if (patientIds.length === 0) {
        return { facilities: [], schedules: [], activities: [], balances: [] };
      }

      // Fetch Appointments and Ledger in parallel
      const [appointmentsResult, ledgerResult] = await Promise.all([
        // 1. Appointments (Source for Facilities list and Schedules)
        supabase
          .from('appointments')
          .select(`
            appointment_id,
            appointment_date,
            status,
            notes,
            patient_id,
            procedures ( name ),
            providers ( 
              name,
              facilities ( facility_id, name, address ) 
            )
          `)
          .in('patient_id', patientIds)
          .order('appointment_date', { ascending: false }),

        // 2. Ledger (Updated to match facility-side logic and include payments)
        supabase
          .from('ledger')
          .select(`
            ledger_id,
            created_at,
            date,
            code,
            description,
            total_bill_amount,
            payment_status,
            type,
            patient_id,
            appointments (
              appointment_date,
              reason_for_visit,
              procedures ( name, code ),
              providers ( 
                name,
                facilities ( facility_id, name ) 
              )
            )
          `)
          .in('patient_id', patientIds) // Filter by ledger.patient_id directly
          .order('date', { ascending: false })
      ]);

      const appointments = appointmentsResult.data || [];
      const ledger = ledgerResult.data || [];

      // Helper: Map patient_id to facility_id (to handle ledger entries without appointments)
      const patientFacilityMap = {};
      appointments.forEach(apt => {
        if (apt.patient_id && apt.providers?.facilities?.facility_id) {
          patientFacilityMap[apt.patient_id] = apt.providers.facilities.facility_id;
        }
      });

      // --- PROCESS FACILITIES ---
      const facilitiesMap = new Map();
      
      appointments.forEach(apt => {
        const facility = apt.providers?.facilities;
        if (facility && facility.facility_id) {
          const fId = facility.facility_id;

          if (!facilitiesMap.has(fId)) {
            facilitiesMap.set(fId, {
              id: fId,
              name: facility.name,
              address: facility.address,
              insurancePlan: 'Maxicare', 
              lastVisit: 'No visits yet'
            });
          }

          // Update Last Visit only if appointment is COMPLETED
          const existing = facilitiesMap.get(fId);
          if (apt.status === 'COMPLETED' && existing.lastVisit === 'No visits yet') {
             existing.lastVisit = new Date(apt.appointment_date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
          }
        }
      });
      const facilitiesData = Array.from(facilitiesMap.values());

      // --- PROCESS SCHEDULES ---
      const schedulesData = appointments.map(apt => {
        const dateObj = new Date(apt.appointment_date);
        return {
          id: apt.appointment_id,
          facilityId: apt.providers?.facilities?.facility_id, 
          month: dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          date: dateObj.getDate().toString(),
          fullDate: dateObj.toLocaleDateString(),
          status: apt.status === 'CONFIRMED' ? 'Scheduled' : 
                  apt.status === 'COMPLETED' ? 'Done' : 
                  apt.status === 'CANCELLED' ? 'Cancelled' : apt.status,
          procedure: apt.procedures?.name || 'Consultation',
          doctor: apt.providers?.name || 'Unknown Provider',
          room: apt.notes || 'General Area'
        };
      });

      // --- PROCESS ACTIVITIES (All Ledger Entries) ---
      const activitiesData = ledger.map(entry => {
        // Logic from snippet:
        // Date fallback: entry.date -> appointment.date -> created_at
        const rawDate = entry.date || entry.appointments?.appointment_date || entry.created_at;
        const dateObj = new Date(rawDate);
        
        // Description fallback
        const description = entry.description || entry.appointments?.reason_for_visit || 'Transaction';
        
        // Facility ID fallback
        const facilityId = entry.appointments?.providers?.facilities?.facility_id || patientFacilityMap[entry.patient_id];

        return {
          id: entry.ledger_id,
          facilityId: facilityId,
          description: description,
          time: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: parseFloat(entry.total_bill_amount),
          type: parseFloat(entry.total_bill_amount) < 0 ? 'payment' : 'charge',
          code: entry.code || entry.appointments?.procedures?.code || '-'
        };
      });

      // --- PROCESS BALANCES (Unpaid Charges) ---
      const balancesData = ledger
        .filter(entry => entry.payment_status !== 'PAID' && parseFloat(entry.total_bill_amount) > 0)
        .map(entry => {
            const facilityId = entry.appointments?.providers?.facilities?.facility_id || patientFacilityMap[entry.patient_id];
            return {
              id: entry.ledger_id,
              patientId: entry.patient_id, // ADDED: Needed for payment
              facilityId: facilityId,
              procedure: entry.appointments?.procedures?.name || entry.description || 'Service Charge',
              date: new Date(entry.created_at).toLocaleDateString(),
              amount: parseFloat(entry.total_bill_amount)
            };
        });

      // Calculate Total Pending Balance
      // FIX: Sum all ledger entries (Charges are positive, Payments are negative) to get the net balance
      const totalPendingBalance = ledger.reduce((sum, entry) => sum + parseFloat(entry.total_bill_amount), 0);

      return {
        facilities: facilitiesData,
        schedules: schedulesData,
        activities: activitiesData,
        balances: balancesData,
        totalPendingBalance
      };

    } catch (error) {
      console.error('FacilitiesAPI Error:', error);
      return { facilities: [], schedules: [], activities: [], balances: [], totalPendingBalance: 0 };
    }
  },

  async addPayment(paymentData) {
    try {
      const { error } = await supabase
        .from('ledger')
        .insert([{
          patient_id: paymentData.patientId,
          date: new Date().toISOString(),
          type: 'PAYMENT',
          code: paymentData.method, // e.g., 'GCash', 'Credit Card'
          description: `Payment via ${paymentData.method}`,
          total_bill_amount: -Math.abs(parseFloat(paymentData.amount)), // Store as negative
          payment_status: 'PAID' 
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Add Payment Error:", error.message);
      return { success: false, error: error.message };
    }
  }
};

export default FacilitiesAPI;