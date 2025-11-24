import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { DateDisplay } from "@/components/date-display"
import { PatientsTable } from "@/components/patient-table"
import { GabayAPI } from "../../services/gabayApi"

// TODO: Replace with the logged-in user's facility ID
const FACILITY_ID = "69ce8db3-fbac-4c16-94cd-d2a6f2385489";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const result = await GabayAPI.getPatients(FACILITY_ID);
        setPatients(result.patients);
      } catch (error) {
        console.error("Failed to load patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <DateDisplay />
        {/* Pass the fetched data to the table */}
        <PatientsTable patients={patients} loading={loading} facilityId = {FACILITY_ID}/>
      </main>
    </div>
  )
}
