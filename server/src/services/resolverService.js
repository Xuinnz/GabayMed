import { supabase } from '../config/supabase.js';

// Now accepts 'userInsurance' (e.g., 'philhealth', 'maxicare', 'none')
export const resolveFacilities = async (specializationSlug, userLat, userLong, userInsurance = 'none') => {
  
  // 1. Get Specialization ID
  const { data: spec } = await supabase
    .from('specializations')
    .select('id')
    .eq('slug', specializationSlug)
    .single();

  if (!spec) return [];

  // 2. Query Facility Services
  const { data: facilities, error } = await supabase
    .from('facility_services')
    .select(`
      base_price,
      avg_wait_time_minutes,
      status,
      facilities (
        id,
        name,
        type,
        is_public,
        location,
        accreditation_status
      )
    `)
    .eq('specialization_id', spec.id)
    .eq('status', 'available'); 

  if (error) {
    console.error("Resolver Error:", error);
    return [];
  }

  // 3. Transform into the "Matrix"
  return facilities.map((f) => {
    const isPublic = f.facilities.is_public;
    const basePrice = f.base_price || 0;
    
    // --- DYNAMIC FINANCIAL LOGIC ---
    let estimatedNetCost = basePrice;
    let coverageLabel = "No Coverage";

    // Scenario A: Public Hospital (Always Free/Cheap for Indigents)
    if (isPublic) {
        estimatedNetCost = 0; 
        coverageLabel = "Fully Subsidized";
    } 
    // Scenario B: Private Hospital + HMO (Maxicare)
    else if (userInsurance.toLowerCase().includes('maxicare') || userInsurance.toLowerCase().includes('hmo')) {
        // Assume HMO covers up to ₱5,000 for standard consults/labs
        estimatedNetCost = Math.max(0, basePrice - 5000); 
        coverageLabel = "HMO Covered";
    }
    // Scenario C: Private Hospital + PhilHealth Only
    else if (userInsurance.toLowerCase().includes('philhealth')) {
        // PhilHealth usually covers a fixed rate (e.g., ₱500 for consult, ₱2600 for dialysis)
        // For the demo, we assume a flat ₱500 deduction for consults
        estimatedNetCost = Math.max(0, basePrice - 500);
        coverageLabel = "PhilHealth Deducted";
    }
    // Scenario D: No Insurance (Cash)
    else {
        estimatedNetCost = basePrice;
        coverageLabel = "Full Price";
    }

    return {
      id: f.facilities.id, // Frontend needs this key
      name: f.facilities.name,
      type: isPublic ? 'Public' : 'Private',
      total_bill: basePrice,           // Show the original price...
      estimated_net_cost: estimatedNetCost, // ...vs what they actually pay
      coverage_label: coverageLabel,   // UI Badge (e.g., "HMO Covered")
      wait_time: f.avg_wait_time_minutes > 60 
        ? `${(f.avg_wait_time_minutes / 60).toFixed(1)} hrs` 
        : `${f.avg_wait_time_minutes} mins`,
      location: f.facilities.location
    };
  }).sort((a, b) => a.estimated_net_cost - b.estimated_net_cost);
};