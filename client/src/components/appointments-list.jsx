import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { appointmentsAPI } from "../../services/appointments"

export function AppointmentsList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Explicitly pass today's date to the service
        const today = new Date();
        const data = await appointmentsAPI.getAppointments(today)
        setAppointments(data)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
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
          appointments.map((apt) => {
            // Format the data from Supabase to match UI needs
            const time = new Date(apt.appointment_date).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            // Handle nested user data for patients
            const patientUser = apt.patients?.users;
            const patientName = patientUser 
              ? `${patientUser.first_name} ${patientUser.last_name}` 
              : "Unknown Patient";
            
            const procedureName = apt.procedures?.name || "General Consultation";
            
            // Handle provider data
            const providerName = apt.providers 
              ? `Dr. ${apt.providers.first_name} ${apt.providers.last_name}`
              : null;

            return (
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
                    <span className="font-bold text-sm text-[#4B6368]">{time}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#4B6368] mb-1">{patientName}</div>
                  {providerName && (
                    <div className="text-xs text-[#4B6368]/70 mb-2">{providerName}</div>
                  )}
                  <div className="text-xs text-[#4B6368]/60">
                    {procedureName}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
