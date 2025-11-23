"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Generate calendar days
  const calendarDays = []
  
  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // Current month's days
  const today = new Date()
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear()
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday
    })
  }

  // Next month's leading days
  const remainingDays = 35 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return (
    <Card className="shadow-sm border-none mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-gray-700">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPrevMonth}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-700">
            {monthNames[month]} <span className="text-gray-400 font-normal">{year}</span>
          </span>
          <button 
            onClick={goToNextMonth}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-[10px] font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((dayInfo, i) => (
            <div 
              key={i} 
              className={`text-xs py-1 rounded cursor-pointer transition-colors ${
                dayInfo.isToday 
                  ? 'bg-blue-400 text-white font-bold' 
                  : dayInfo.isCurrentMonth 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              {dayInfo.day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
