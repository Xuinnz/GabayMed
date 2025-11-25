import { Header } from "@/components/header"
import { AppointmentScheduler } from "@/components/appointment-scheduler"

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <AppointmentScheduler />
      </main>
    </div>
  )
}
