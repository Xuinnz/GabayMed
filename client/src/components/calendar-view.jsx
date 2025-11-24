import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Get number of days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Calculate calendar grid
  const calendarDays = []
  
  // Previous month's days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i)
    })
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    })
  }
  
  // Next month's days to fill the grid
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[#4B6368]">{monthNames[month]} {year}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToToday} className="text-sm font-bold text-[#4B6368]">
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 text-xs mx-0">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-muted-foreground font-medium pb-1 text-[10px]">
            {day}
          </div>
        ))}
        {calendarDays.map((item, i) => {
          const today = isToday(item.date)
          const selected = isSelected(item.date)
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(item.date)}
              className={`
                aspect-square flex items-center justify-center rounded-md transition-colors text-xs
                ${!item.isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                ${today ? 'bg-[#66BAFF] text-primary-foreground font-semibold' : ''}
                ${selected && !today ? 'bg-accent' : ''}
                ${item.isCurrentMonth && !today && !selected ? 'hover:bg-accent/50' : ''}
              `}
            >
              {item.day}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
