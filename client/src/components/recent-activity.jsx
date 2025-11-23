import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

const activities = [
  { time: "2pm", text: "New Appt. Schedule", color: "text-blue-500" },
  { time: "10am", text: "New Patient Notes", color: "text-red-500" },
  { time: "10am", text: "Red Tagura Overdue", color: "text-red-500" },
  { time: "9am", text: "2 Appt. Rescheduled", color: "text-yellow-500" },
  { time: "9am", text: "2 Appt. Rescheduled", color: "text-yellow-500" },
]

export function RecentActivity() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <Play className={`w-3 h-3 ${activity.color} fill-current`} />
            <span className="text-muted-foreground min-w-[50px]">{activity.time}</span>
            <span>{activity.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
