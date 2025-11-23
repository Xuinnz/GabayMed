import { AppHeader } from "@/components/app-header"
import { DateHeader } from "@/components/date-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { PeakHoursChart } from "@/components/peak-hours-chart"
import { AppointmentsList } from "@/components/appointments-list"
import { CalendarWidget } from "@/components/calendar-widget"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-6 max-w-7xl">
      <AppHeader />
      <DateHeader />
      <DashboardStats />

      <div className="grid grid-cols-12 gap-6 pb-10">
        <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <PeakHoursChart />
            <AppointmentsList />
          </div>
          <RecentActivity />
        </div>
        <div className="col-span-4">
          <CalendarWidget />
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-700 mb-4">Upcoming</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-medium text-gray-600">Nov 28</span>
                  </div>
                  <span className="text-xs text-gray-500">18 Appointments</span>
                  <span className="text-xs text-gray-400">Peak @2pm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
