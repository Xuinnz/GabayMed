import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

export function AppointmentsList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Fetch today's appointments from backend API
        const response = await fetch('http://localhost:3000/api/dashboard/todays-appointments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }
        
        const data = await response.json()
        
        // Expected API response format:
        // [
        //   {
        //     id: 1,
        //     time: "9:00 AM",
        //     patientName: "Red Gabriel Tagura",
        //     patientAge: 20,
        //     room: "Room 101",
        //     procedures: ["Circumcision", "Vasectomy"]
        //   }
        // ]
        
        const formattedAppointments = data.map(apt => ({
          id: apt.id,
          time: apt.time,
          patient: `${apt.patientName}, ${apt.patientAge}`,
          room: apt.room,
          procedures: apt.procedures || []
        }))
        
        setAppointments(formattedAppointments)
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
    
    // Refresh appointments every 2 minutes
    const interval = setInterval(fetchAppointments, 120000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Appointments</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No appointments today</div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="flex gap-3">
              <div className="w-1 bg-primary rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{apt.time}</span>
                </div>
                <div className="text-sm font-medium mb-1">{apt.patient}</div>
                <div className="text-xs text-muted-foreground mb-1">{apt.room}</div>
                <div className="text-xs text-muted-foreground">
                  {apt.procedures.length > 0 ? apt.procedures.join(", ") : "No procedures"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
