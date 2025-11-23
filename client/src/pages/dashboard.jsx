import { Header } from "@/components/header"
import { DateDisplay } from "@/components/date-display"
import { StatsCards } from "@/components/stats-cards"
import { PeakHours } from "@/components/peak-hours"
import { AppointmentsList } from "@/components/appointments-list"
import { CalendarView } from "@/components/calendar-view"
import { RecentActivity } from "@/components/recent-activity"
import { UpcomingSection } from "@/components/upcoming-sections"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <DateDisplay />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <PeakHours />
            <RecentActivity />
            <UpcomingSection />
          </div>

          <div className="space-y-6">
            <AppointmentsList />
            <CalendarView />
          </div>
        </div>
      </main>
    </div>
  )
}
