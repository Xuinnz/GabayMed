import { createClient } from '@supabase/supabase-js';
import { Session } from './session';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);


export const ledgerAPI = {
  
  // Get Transactions and Financial Summary
  async getPatientLedger(patientId) {
    // Removed facilityId check as column does not exist
    
    try {
      // Updated Query: Fetch provider, procedure code, and reason via appointments
      const { data, error } = await supabase
        .from('ledger')
        .select(`
          *,
          appointments ( 
            appointment_date,
            reason_for_visit,
            providers ( name ),
            procedures ( code )
          )
        `)
        .eq('patient_id', patientId)
        // .eq('facility_id', facilityId) // REMOVED
        .order('date', { ascending: false });

      if (error) throw error;

      const transactions = data.map(t => ({
        id: t.ledger_id, 
        // Fallback to appointment details if ledger columns are empty
        // Fix: Format the date to remove time component
        date: (t.date || t.appointments?.appointment_date) 
          ? new Date(t.date || t.appointments?.appointment_date).toLocaleDateString() 
          : '-',
        created: new Date(t.created_at).toLocaleDateString(),
        code: t.code || t.appointments?.procedures?.code || '-',
        description: t.description || t.appointments?.reason_for_visit || 'Visit Charge',
        
        provider: t.appointments?.providers?.name || '-',
        appointmentDate: t.appointments?.appointment_date || null,
        amount: parseFloat(t.total_bill_amount),
        type: t.type
      }));

      // Calculate Financials
      const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Simple aging calculation (based on Charges only usually, but simplified here)
      const today = new Date();
      const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '91+': 0 };
      
      transactions.filter(t => t.amount > 0).forEach(t => {
        const transDate = new Date(t.date);
        const diffTime = Math.abs(today - transDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) aging['0-30'] += t.amount;
        else if (diffDays <= 60) aging['31-60'] += t.amount;
        else if (diffDays <= 90) aging['61-90'] += t.amount;
        else aging['91+'] += t.amount;
      });

      return {
        transactions,
        financial: {
          aging,
          balance: {
            total: totalBalance,
            insurance: totalBalance * 0.8, // Mock split
            adjust: 0,
            patient: totalBalance * 0.2  // Mock split
          }
        }
      };

    } catch (error) {
      console.error("Get Ledger Error:", error.message);
      return { transactions: [], financial: { aging: {}, balance: {} } };
    }
  },

  // Add Payment
  async addPayment(patientId, paymentData) {
    try {
      const { error } = await supabase
        .from('ledger')
        .insert([{
          // facility_id: facilityId, // REMOVED
          patient_id: patientId,
          date: paymentData.date,
          type: 'PAYMENT',
          code: paymentData.method, // e.g., 'CASH', 'CHECK'
          description: `Payment - ${paymentData.method}`,
          total_bill_amount: -Math.abs(parseFloat(paymentData.amount)), // Store as negative
          payment_status: 'PAID' // Updated column name
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Add Payment Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // Add Charge (Procedure)
  async addCharge(patientId, chargeData) {
    try {
      const { error } = await supabase
        .from('ledger')
        .insert([{
          // facility_id: facilityId, // REMOVED
          patient_id: patientId,
          appointment_id: chargeData.appointmentId || null, // Link to appointment if provided
          date: chargeData.date,
          type: 'CHARGE',
          code: chargeData.code,
          description: chargeData.description,
          // provider_id: chargeData.provider, // REMOVED
          total_bill_amount: Math.abs(parseFloat(chargeData.amount)), // Store as positive
          payment_status: 'UNPAID' // Updated column name and set logical default for new charge
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Add Charge Error:", error.message);
      return { success: false, error: error.message };
    }
  }
};
