import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

const appointments = [
  {
    time: "9:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedures: ["Circumcision", "Vasectomy", "Appendix Surgery"],
  },
  {
    time: "10:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedures: ["Circumcision", "Vasectomy", "Appendix Surgery"],
  },
  {
    time: "11:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedures: ["Circumcision", "Vasectomy", "Appendix Surgery"],
  },
  {
    time: "1:30 PM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedures: ["Circumcision", "Vasectomy", "Appendix Surgery"],
  },
]

export function AppointmentsList() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Appointments</h3>
      <div className="space-y-4">
        {appointments.map((apt, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-1 bg-primary rounded-full" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{apt.time}</span>
              </div>
              <div className="text-sm font-medium mb-1">{apt.patient}</div>
              <div className="text-xs text-muted-foreground mb-1">{apt.room}</div>
              <div className="text-xs text-muted-foreground">{apt.procedures.join(", ")}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
