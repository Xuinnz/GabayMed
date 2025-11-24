import { Header } from "@/components/header"
import { DateDisplay } from "@/components/date-display"
import { PatientsTable } from "@/components/patient-table"

export default function PatientsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <DateDisplay />
        <PatientsTable />
      </main>
    </div>
  )
}
