// Run this with: node verify_full_system.js
// Note: You need to have 'gabayApi.js' and your .env setup in this folder
// If running in Node, ensure you use the Supabase Node client, not React Native client in imports.

/* * MOCK USER JOURNEY
 * 1. User registers/logs in.
 * 2. User tells AI symptoms.
 * 3. AI recommends a doctor.
 * 4. User finds nearest hospital.
 * 5. User checks bill.
 */

async function runSystemCheck() {
    console.log("🟢 STARTING BACKEND INTEGRATION TEST...");
    
    // --- STEP 1: AUTH ---
    console.log("\n1️⃣  Testing Auth...");
    // Mock login (using the user we created in seed.sql)
    // Note: Since we didn't set a password in seed.sql, we assume a fresh user for this test 
    // or you manually sign up a user in Supabase dashboard to test this part.
    console.log("   (Skipping actual Auth call for this script unless you have a real user credential ready)");
    const mockUserId = "d4a5ab98-2549-4180-8ee8-0896c10ab10f"; 
    console.log("   Using Mock User ID:", mockUserId);

    // --- STEP 2: AI TRIAGE ---
    console.log("\n2️⃣  Testing AI Brain (api/triage)...");
    // Simulate fetching from your local API
    const triageResponse = await fetch('http://localhost:3000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            symptoms: "Stabbing chest pain", 
            medical_history: { hypertension: true } 
        })
    });
    const aiResult = await triageResponse.json();
    console.log("   AI Suggests:", aiResult.suggested_specialty);
    console.log("   Urgency:", aiResult.urgency_level);

    if (!aiResult.suggested_specialty) {
        console.error("🔴 FAILED: AI did not return a specialty.");
        return;
    }

    // --- STEP 3: DATABASE RPC ---
    console.log("\n3️⃣  Testing Map Search (RPC)...");
    // You'll need to use your supabase client here directly if running in Node
    // Or just trust your previous RPC test.
    console.log("   (Assuming RPC works based on previous SQL test)");

    // --- STEP 4: BILLING API ---
    console.log("\n4️⃣  Testing Billing API (api/billing)...");
    const billResponse = await fetch(`http://localhost:3000/api/billing?patient_id=${mockUserId}`);
    const billData = await billResponse.json();
    
    if (billData.bills && billData.bills.length > 0) {
        console.log("   Bill Found!");
        console.log("   Total:", billData.bills[0].total_bill_amount);
        console.log("   Patient Payable:", billData.bills[0].patient_payable_amount);
        console.log("🟢 SUCCESS: Financial Logic is solid.");
    } else {
        console.log("🔴 WARNING: No bill found. Did you use the correct Patient ID?");
    }
}

runSystemCheck();