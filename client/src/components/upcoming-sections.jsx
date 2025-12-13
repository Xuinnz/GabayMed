import { Card } from "@/components/ui/card"

export function UpcomingSection({ schedule = [], loading = false }) {
  
  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold text-[#4B6368] mb-4">Upcoming</h3>
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading upcoming appointments...</div>
        ) : schedule.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming appointments</div>
        ) : (
          schedule.map((item, index) => {
            // Format date (e.g., "Nov 28")
            const dateLabel = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const countLabel = `${item.count} Appointment${item.count !== 1 ? 's' : ''}`;
            
            // Use dynamic peak hour or fallback
            const peakDisplay = (item.peakHour && item.peakHour !== '-') ? item.peakHour : '12 PM';

            return (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#66BAFF]" />
                <span className="font-medium min-w-[60px] text-[#4B6368]">{dateLabel}</span>
                <span className="text-muted-foreground">{countLabel}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  Peak: {peakDisplay}
                </span>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
