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
      <h3 className="text-2xl font-bold text-[#4B6368] mb-4">Appointments</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No appointments today</div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="flex gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#66BAFF]" />
                <div className="w-0.5 flex-1 bg-[#66BAFF]" />
              </div>
              <div 
                className="flex-1 rounded-lg p-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(168, 213, 255, 0.15) 0%, rgba(122, 184, 232, 0.15) 100%)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#4B6368]" />
                  <span className="font-bold text-sm text-[#4B6368]">{apt.time}</span>
                </div>
                <div className="text-sm font-semibold text-[#4B6368] mb-1">{apt.patient}</div>
                <div className="text-xs text-[#4B6368]/70 mb-2">{apt.room}</div>
                <div className="text-xs text-[#4B6368]/60">
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
