import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

export function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch recent activities from backend API
        const response = await fetch('http://localhost:3000/api/dashboard/recent-activities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }
        
        const data = await response.json()
        
        // Expected API response format:
        // [
        //   { id: 1, time: "2pm", text: "New Appt. Schedule", type: "appointment" },
        //   { id: 2, time: "10am", text: "New Patient Notes", type: "notes" },
        //   { id: 3, time: "10am", text: "Red Tagura Overdue", type: "overdue" },
        //   { id: 4, time: "9am", text: "2 Appt. Rescheduled", type: "reschedule" }
        // ]
        
        // Map activity types to colors
        const activitiesWithColors = data.map(activity => ({
          ...activity,
          color: getActivityColor(activity.type)
        }))
        
        setActivities(activitiesWithColors)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    
    // Refresh activities every 2 minutes
    const interval = setInterval(fetchActivities, 120000)
    
    return () => clearInterval(interval)
  }, [])

  const getActivityColor = (type) => {
    switch (type) {
      case 'appointment':
      case 'schedule':
        return 'text-blue-500'
      case 'overdue':
      case 'cancelled':
        return 'text-red-500'
      case 'reschedule':
      case 'reminder':
        return 'text-yellow-500'
      case 'completed':
        return 'text-green-500'
      case 'notes':
      case 'update':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent activities</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 text-sm">
              <Play className={`w-3 h-3 ${activity.color} fill-current`} />
              <span className="text-muted-foreground min-w-[50px]">{activity.time}</span>
              <span>{activity.text}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
