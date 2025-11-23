import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

const activities = [
  { time: "2pm", title: "New Appt. Schedule", color: "text-green-500" },
  { time: "10am", title: "New Patient Notes", color: "text-green-500" },
  { time: "10am", title: "Red Tagura Overdue", color: "text-red-500" },
  { time: "9am", title: "2 Appt. Rescheduled", color: "text-yellow-500" },
  { time: "9am", title: "2 Appt. Rescheduled", color: "text-yellow-500" },
]

export function RecentActivity() {
  return (
    <Card className="shadow-sm border-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-700">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <ChevronRight className={`w-4 h-4 ${activity.color}`} />
              <span className="text-xs text-gray-500 w-8">{activity.time}</span>
              <span className="text-xs font-medium text-gray-600">{activity.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
