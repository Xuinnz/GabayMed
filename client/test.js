import 'dotenv/config';
import { GabayAPI } from './services/gabayApi.js'; 

async function runManualTest(){
    console.log("🧪 STARTING MANUAL API TEST...");

    try {
        console.log("\n3️⃣  Fetching Dashboard Stats...");
        const stats = await GabayAPI.getDashboardStats("69ce8db3-fbac-4c16-94cd-d2a6f2385489");
        
        console.log("📊 DASHBOARD DATA RECEIVED:");
        console.log({
            "Total Patients": stats.totalPatients,
            "Appointments Today": stats.appointmentsToday,
            "Staff Present": stats.staffPresent,
            "Total Income": stats.totalIncome
        });

        console.log("\n4️⃣  Fetching Today's Schedule...");
        const today = new Date().toISOString().split('T')[0];
        const schedule = await GabayAPI.getFacilitySchedule("69ce8db3-fbac-4c16-94cd-d2a6f2385489", today);
        
        console.log(`✅ Found ${schedule.length} appointments for today.`);
        if(schedule.length > 0) {
            console.log("Sample Appt:", schedule[0].patients.full_name, "for", schedule[0].procedures.name);
        }
    }
    catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
        if (error.cause) console.error(error.cause);
    }
    
}

runManualTest();