"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8 AM to 5 PM
const providers = [
  { id: 1, name: "Dr. Sarah Smith", role: "Dentist", image: "/placeholder-user.jpg" },
  { id: 2, name: "Dr. James Wilson", role: "Orthodontist", image: "/placeholder-user.jpg" },
]

const bookedAppointments = [
  {
    id: 1,
    providerId: 1,
    time: 9,
    patient: "Red Gabriel Tagura",
    procedure: "Prophylaxis - Adult",
    status: "Confirmed",
    operatory: "Room 101",
    length: 60,
  },
  {
    id: 2,
    providerId: 1,
    time: 14,
    patient: "Francis Ronan Alfaro",
    procedure: "Extraction",
    status: "Here",
    operatory: "Room 102",
    length: 90,
  },
  {
    id: 3,
    providerId: 2,
    time: 10,
    patient: "Tyrone Winter Tolentino",
    procedure: "Consultation",
    status: "Arriving",
    operatory: "Room 103",
    length: 30,
  },
]

export function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)

  const getAppointmentForSlot = (providerId, time) => {
    return bookedAppointments.find((apt) => apt.providerId === providerId && apt.time === time)
  }

  const handleNewAppointment = () => {
    setSelectedSlot({ providerId: providers[0].id, time: 8, date: selectedDate, appointment: null })
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={goToPreviousDay}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={goToToday}>
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={goToNextDay}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleNewAppointment}>New Appointment</Button>
        </div>

        <div className="flex-1 border rounded-lg overflow-auto bg-white">
          <div className="grid grid-cols-[80px_1fr_1fr] min-w-[800px]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4"></div>
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="sticky top-0 z-10 bg-white border-b border-l p-4 flex items-center gap-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={provider.image || "/placeholder.svg"} />
                  <AvatarFallback>{provider.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-muted-foreground">{provider.role}</div>
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {hours.map((hour) => (
              <>
                <div
                  key={`time-${hour}`}
                  className="border-b p-4 text-sm text-muted-foreground text-right sticky left-0 bg-white"
                >
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
                {providers.map((provider) => {
                  const appointment = getAppointmentForSlot(provider.id, hour)
                  return (
                    <div
                      key={`slot-${provider.id}-${hour}`}
                      className={`border-b border-l min-h-[100px] p-2 relative group cursor-pointer transition-colors ${
                        appointment ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        setSelectedSlot({ providerId: provider.id, time: hour, date: selectedDate, appointment })
                      }
                    >
                      {appointment ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{appointment.patient}</div>
                          <div className="text-xs text-muted-foreground">{appointment.procedure}</div>
                          <Badge variant="secondary" className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Appointment Details */}
      {selectedSlot && (
        <Card className="w-[400px] h-full border-l shadow-none rounded-none border-y-0 border-r-0">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {selectedSlot?.appointment ? "Appointment Details" : "New Appointment"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSlot(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedSlot && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date & Time</Label>
                <div className="flex items-center gap-2 font-medium">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  {selectedDate.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {selectedSlot.time > 12
                    ? `${selectedSlot.time - 12}:00 PM`
                    : selectedSlot.time === 12
                      ? "12:00 PM"
                      : `${selectedSlot.time}:00 AM`}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Patient *</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search patient..."
                    defaultValue={selectedSlot.appointment?.patient}
                    disabled={!!selectedSlot.appointment}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select defaultValue={selectedSlot.appointment?.status || "unconfirmed"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="arriving">Arriving</SelectItem>
                    <SelectItem value="here">Here</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="chair">Chair</SelectItem>
                    <SelectItem value="checkout">Checkout</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Procedures *</Label>
                <Select defaultValue={selectedSlot.appointment?.procedure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select procedure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Prophylaxis - Adult">Prophylaxis (Cleaning)</SelectItem>
                    <SelectItem value="Extraction">Extraction</SelectItem>
                    <SelectItem value="Filling">Filling</SelectItem>
                    <SelectItem value="Root Canal">Root Canal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Operatory *</Label>
                <Select defaultValue={selectedSlot.appointment?.operatory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Room 101">Room 101</SelectItem>
                    <SelectItem value="Room 102">Room 102</SelectItem>
                    <SelectItem value="Room 103">Room 103</SelectItem>
                    <SelectItem value="Room 104">Room 104</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Provider *</Label>
                <Select defaultValue={selectedSlot.providerId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Provider (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length (minutes) *</Label>
                <Select defaultValue={selectedSlot.appointment?.length?.toString() || "30"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Add appointment notes..." rows={3} />
              </div>

              <div className="pt-4 flex gap-2">
                {selectedSlot.appointment ? (
                  <>
                    <Button className="w-full bg-blue-500">Update</Button>
                    <Button variant="destructive" className="w-full">
                      Cancel Appointment
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full">Save</Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedSlot(null)}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
