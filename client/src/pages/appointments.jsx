"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { AppHeader } from "@/components/app-header"
import { DateHeader } from "@/components/date-header"
import { AppointmentScheduler } from "@/components/appointment-scheduler"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function AppointmentsPage() {
  const [date, setDate] = React.useState(new Date(2025, 10, 24))

  return (
    <main className="container mx-auto px-6 max-w-7xl pb-10">
      <AppHeader page="appointments" />
      <div className="mb-6">
        <DateHeader date={date} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Schedule</h1>
            <p className="text-gray-500">View and manage provider schedules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-600"
              onClick={() => {
                const newDate = new Date(date || new Date())
                newDate.setDate(newDate.getDate() - 1)
                setDate(newDate)
              }}
            >
              Previous Day
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-600"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-600"
              onClick={() => {
                const newDate = new Date(date || new Date())
                newDate.setDate(newDate.getDate() + 1)
                setDate(newDate)
              }}
            >
              Next Day
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-white hover:bg-gray-50",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <AppointmentScheduler />
      </div>
    </main>
  )
}
