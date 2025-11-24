import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

/**
 * CalendarView - A reusable calendar component
 * @param {Object} props
 * @param {Date} props.value - The selected date (controlled component)
 * @param {Function} props.onChange - Callback when date is selected
 * @param {boolean} props.showTodayButton - Whether to show the "Today" button (default: true)
 * @param {boolean} props.highlightToday - Whether to highlight today's date with blue background (default: true)
 * @param {string} props.mode - "display" mode locks calendar on today, "picker" mode allows date selection (default: "picker")
 * @param {string} props.className - Additional classes for the Card wrapper
 */
export function CalendarView({ 
  value, 
  onChange, 
  showTodayButton = true,
  highlightToday = true,
  mode = "picker",
  className = ""
}) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(mode === "display" ? today : (value || new Date()))
  const [selectedDate, setSelectedDate] = useState(mode === "display" ? today : (value || new Date()))

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
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    if (onChange) onChange(today)
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

  const handleSelect = (date) => {
    if (mode === "display") return // Don't allow date selection in display mode
    setSelectedDate(date)
    if (onChange) onChange(date)
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[#4B6368]">{monthNames[month]} {year}</h3>
        <div className="flex items-center gap-2">
          {showTodayButton && (
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-sm font-bold text-[#4B6368]">
              Today
            </Button>
          )}
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
              onClick={() => handleSelect(item.date)}
              className={`
                aspect-square flex items-center justify-center rounded-md transition-colors text-xs
                ${!item.isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                ${selected ? 'bg-[#66BAFF] text-primary-foreground font-semibold' : ''}
                ${today && highlightToday && !selected ? 'ring-1 ring-[#66BAFF] ring-inset' : ''}
                ${item.isCurrentMonth && !selected && mode === 'picker' ? 'hover:bg-accent/50' : ''}
                ${mode === 'display' ? 'cursor-default' : 'cursor-pointer'}
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
