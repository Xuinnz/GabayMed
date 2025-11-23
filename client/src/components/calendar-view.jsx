import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarView() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Calendar</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Month
          </Button>
          <Button variant="ghost" size="sm">
            Year
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-muted-foreground font-medium pb-2">
            {day}
          </div>
        ))}
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="aspect-square flex items-center justify-center text-muted-foreground">
            0
          </div>
        ))}
      </div>
    </Card>
  )
}
