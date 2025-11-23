"use client"

import { useState } from "react"
import { Check, Paperclip, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppointmentDetailsModal } from "@/components/appointment-details-modal"

const providers = [
  { id: "p1", name: "Dr. Smith", role: "Surgeon" },
  { id: "p2", name: "Dr. Jones", role: "Specialist" },
  { id: "p3", name: "Nurse Ann", role: "Assistant" },
  { id: "p4", name: "Dr. Garcia", role: "Urologist" },
  { id: "p5", name: "Nurse Mike", role: "Assistant" },
]

const timeSlots = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
]

const appointments = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    time: "08:00 AM",
    duration: 2,
    operatory: "OP-1",
    procedures: ["Pre-op Consult", "Bloodwork"],
    status: "checked-in",
    providerId: "p1",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  {
    id: "2",
    patientName: "Mike Peters",
    time: "09:30 AM",
    duration: 3,
    operatory: "OP-1",
    procedures: ["Vasectomy"],
    status: "confirmed",
    providerId: "p1",
    color: "bg-green-100 border-green-200 text-green-800",
  },
  {
    id: "3",
    patientName: "Emily Davis",
    time: "08:30 AM",
    duration: 2,
    operatory: "OP-2",
    procedures: ["Appendectomy Follow-up"],
    status: "confirmed",
    providerId: "p2",
    color: "bg-purple-100 border-purple-200 text-purple-800",
  },
  {
    id: "4",
    patientName: "James Wilson",
    time: "11:00 AM",
    duration: 3,
    operatory: "OP-HYG",
    procedures: ["Hernia Repair", "Anesthesia"],
    status: "needs-action",
    providerId: "p3",
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
  {
    id: "5",
    patientName: "Robert Taylor",
    time: "09:00 AM",
    duration: 1,
    operatory: "OP-3",
    procedures: ["Suture Removal"],
    status: "completed",
    providerId: "p4",
    color: "bg-red-100 border-red-200 text-red-800",
  },
  {
    id: "6",
    patientName: "Linda Anderson",
    time: "10:30 AM",
    duration: 2,
    operatory: "OP-3",
    procedures: ["Gallbladder Consult"],
    status: "confirmed",
    providerId: "p4",
    color: "bg-indigo-100 border-indigo-200 text-indigo-800",
  },
  {
    id: "7",
    patientName: "Tom Brown",
    time: "08:00 AM",
    duration: 1,
    operatory: "OP-HYG-2",
    procedures: ["Vitals Check"],
    status: "checked-in",
    providerId: "p5",
    color: "bg-teal-100 border-teal-200 text-teal-800",
  },
  {
    id: "8",
    patientName: "Lisa White",
    time: "09:00 AM",
    duration: 2,
    operatory: "OP-HYG-2",
    procedures: ["Post-op Care", "Wound Dressing"],
    status: "confirmed",
    providerId: "p5",
    color: "bg-teal-100 border-teal-200 text-teal-800",
  },
]

export function AppointmentScheduler() {
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Row - Providers */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-gray-200 divide-x divide-gray-200">
          <div className="p-4 bg-gray-50 flex items-center justify-center font-semibold text-gray-500 text-sm">
            Time
          </div>
          {providers.map((provider) => (
            <div key={provider.id} className="p-4 bg-gray-50 text-center">
              <h3 className="font-bold text-gray-800">{provider.name}</h3>
              <span className="text-xs text-gray-500 uppercase tracking-wider">{provider.role}</span>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] divide-x divide-gray-200 relative">
          {/* Time Column */}
          <div className="divide-y divide-gray-200">
            {timeSlots.map((time) => (
              <div key={time} className="h-32 p-2 text-xs font-medium text-gray-500 text-right pr-4 pt-4 relative">
                {time}
                <div className="absolute top-0 right-0 w-2 h-[1px] bg-gray-200"></div>
              </div>
            ))}
          </div>

          {/* Provider Columns */}
          {providers.map((provider) => (
            <div key={provider.id} className="relative divide-y divide-gray-200/50">
              {/* Background grid lines matching time slots */}
              <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                {timeSlots.map((time) => (
                  <div key={time} className="h-32 border-b border-gray-100 border-dashed w-full"></div>
                ))}
              </div>

              {/* Appointments */}
              <div className="relative z-10 w-full h-full">
                {appointments
                  .filter((apt) => apt.providerId === provider.id)
                  .map((apt) => {
                    // Calculate position based on time
                    const startIndex = timeSlots.indexOf(apt.time)
                    if (startIndex === -1) return null

                    const top = startIndex * 128 // 128px = h-32
                    const height = apt.duration * 128

                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={cn(
                          "absolute left-2 right-2 rounded-lg p-3 border shadow-sm transition-all hover:shadow-md cursor-pointer",
                          apt.color,
                        )}
                        style={{
                          top: `${top + 4}px`, // +4 for padding top
                          height: `${height - 8}px`, // -8 for padding (top+bottom)
                        }}
                      >
                        <div className="flex flex-col h-full gap-1">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-sm truncate">{apt.patientName}</span>
                            <div className="flex gap-1">
                              {apt.status === "checked-in" && <Check className="w-4 h-4" />}
                              {apt.status === "needs-action" && <AlertCircle className="w-4 h-4 text-orange-600" />}
                              <Paperclip className="w-3.5 h-3.5 opacity-50" />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs opacity-90">
                            <Clock className="w-3 h-3" />
                            <span>
                              {apt.time} ({apt.operatory})
                            </span>
                          </div>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1">
                              {apt.procedures.map((proc, i) => (
                                <span key={i} className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded-sm font-medium">
                                  {proc}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
      />
    </>
  )
}
