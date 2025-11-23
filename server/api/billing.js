const { createClient } = require('@supabase/supabase-js');
const allowCors = require('./cors'); // Import the helper

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const handler = async (request, response) => {
  const { patient_id } = request.query;

  if (!patient_id) {
    return response.status(400).json({ error: "Patient ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from('ledger')
      .select(`
        ledger_id, total_bill_amount, philhealth_deduction, 
        hmo_deduction, discount_amount, patient_payable_amount, 
        payment_status, created_at,
        appointments (
            appointment_date,
            procedures ( name, code ),
            providers ( name, specialization ),
            facilities ( name )
        )
      `)
      .eq('patient_id', patient_id)
      .eq('payment_status', 'UNPAID')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return response.status(200).json({ count: data.length, bills: data });

  } catch (error) {
    console.error("Billing Error:", error);
    return response.status(500).json({ error: "Failed to fetch billing records." });
  }
}

module.exports = allowCors(handler);