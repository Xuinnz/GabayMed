import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function UpcomingSection() {
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        // Fetch upcoming appointment summaries from backend API
        const response = await fetch('http://localhost:3000/api/dashboard/upcoming-appointments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming appointments')
        }
        
        const data = await response.json()
        
        // Expected API response format:
        // [
        //   { id: 1, date: "Nov 28", appointmentCount: 18, peakHour: "2pm" },
        //   { id: 2, date: "Nov 29", appointmentCount: 15, peakHour: "10am" },
        //   { id: 3, date: "Nov 30", appointmentCount: 20, peakHour: "3pm" }
        // ]
        
        const formattedData = data.map(item => ({
          id: item.id,
          date: item.date,
          appointments: `${item.appointmentCount} Appointment${item.appointmentCount !== 1 ? 's' : ''}`,
          peak: item.peakHour ? `Peak @${item.peakHour}` : 'No peak'
        }))
        
        setUpcoming(formattedData)
      } catch (error) {
        console.error('Failed to fetch upcoming appointments:', error)
        setUpcoming([])
      } finally {
        setLoading(false)
      }
    }

    fetchUpcoming()
    
    // Refresh upcoming appointments every 5 minutes
    const interval = setInterval(fetchUpcoming, 300000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold text-[#4B6368] mb-4">Upcoming</h3>
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading upcoming appointments...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming appointments</div>
        ) : (
          upcoming.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium min-w-[60px]">{item.date}</span>
              <span className="text-muted-foreground">{item.appointments}</span>
              <span className="text-muted-foreground">{item.peak}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
