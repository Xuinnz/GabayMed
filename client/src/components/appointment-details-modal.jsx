"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, MessageSquare, Plus, Search } from "lucide-react"
import { format } from "date-fns"

export function AppointmentDetailsModal({ isOpen, onClose, appointment }) {
  if (!appointment) return null

  // Calculate age from a mock DOB for demo
  const mockDOB = "1994-05-15"
  const age = 30 // hardcoded for demo based on 2024

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">{appointment.patientName}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  DOB: {format(new Date(mockDOB), "MM/dd/yyyy")} ({age}y)
                </span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 font-medium">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Text messages
                </Button>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 pt-1">
                <span>
                  Pref. Days: <span className="font-medium text-gray-700">Mon, Wed</span>
                </span>
                <span>
                  Pref. Time: <span className="font-medium text-gray-700">Morning</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="bg-transparent p-0 h-auto border-b w-full justify-start rounded-none">
                <TabsTrigger
                  value="chart"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Chart
                </TabsTrigger>
                <TabsTrigger
                  value="ledger"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Ledger
                </TabsTrigger>
                <TabsTrigger
                  value="tx-planner"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Tx Planner
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Contact Info
                </TabsTrigger>
                <TabsTrigger
                  value="rel-appts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Rel. Appts
                </TabsTrigger>
                <TabsTrigger
                  value="med-alerts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2"
                >
                  Med. Alerts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Status and Flags */}
          <section className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Select defaultValue={appointment.status}>
                <SelectTrigger className="w-[180px] border-l-4 border-l-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="needs-action">Needs Action</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="asap" />
                <label
                  htmlFor="asap"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-600"
                >
                  ASAP
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="follow-up" />
                <label
                  htmlFor="follow-up"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Needs Follow-Up
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="premed" />
                <label
                  htmlFor="premed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Premedicate
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pinned" />
                <label
                  htmlFor="pinned"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pinned
                </label>
              </div>
            </div>
          </section>

          {/* Procedure and Treatment */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Procedures</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 h-auto p-0 hover:bg-transparent hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Tx Planner
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    className="w-full bg-white border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Procedure search..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                {appointment.procedures.map((proc, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-3 rounded border">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{proc}</p>
                      <p className="text-xs text-gray-500">Case 4 V1: {proc} Details...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Appointment Logistics */}
          <section className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase">Operatory</label>
              <Select defaultValue={appointment.operatory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operatory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OP-1">OP-1</SelectItem>
                  <SelectItem value="OP-2">OP-2</SelectItem>
                  <SelectItem value="OP-3">OP-3</SelectItem>
                  <SelectItem value="OP-HYG">OP-HYG</SelectItem>
                  <SelectItem value="OP-HYG-2">OP-HYG-2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase">Appointment Provider</label>
              <Select defaultValue={appointment.providerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Dr. Smith</SelectItem>
                  <SelectItem value="p2">Dr. Jones</SelectItem>
                  <SelectItem value="p3">Hygienist Ann</SelectItem>
                  <SelectItem value="p4">Dr. Garcia</SelectItem>
                  <SelectItem value="p5">Hygienist Mike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase">Additional Provider</label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">[None]</SelectItem>
                  <SelectItem value="p1">Dr. Smith</SelectItem>
                  <SelectItem value="p3">Hygienist Ann</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                <div className="relative">
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    11/24/2025
                  </div>
                  <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase">Start Time</label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
                  {appointment.time}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase">Length</label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-gray-500">
                  {appointment.duration * 30} min
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900">Note</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
              >
                Insert Date
              </Button>
            </div>
            <Textarea className="min-h-[100px] resize-none" placeholder="Enter appointment specific notes..." />
          </section>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
