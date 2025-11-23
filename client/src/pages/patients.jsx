import { AppHeader } from "@/components/app-header"
import { DateHeader } from "@/components/date-header"
import { Button } from "@/components/ui/button"
import { Eye, Calendar } from "lucide-react"

const patients = Array.from({ length: 10 }).map((_, i) => ({
  name: i % 2 === 0 ? "Red Gabriel Tagura" : "Francis Ronan Alfaro",
  image: "/placeholder.svg",
  age: "21",
  gender: "M",
  id: "PT-2023-8892",
  lastVisit: "Oct 24",
}))

export default function PatientsPage() {
  return (
    <main className="container mx-auto px-6 max-w-7xl">
      <AppHeader page="patients" />
      <DateHeader />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-500">
          <div className="col-span-3 pl-4">Name</div>
          <div className="col-span-2">Age & Gender</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-2">Last Visit</div>
          <div className="col-span-3 text-center">Actions</div>
        </div>

        <div className="divide-y divide-gray-50">
          {patients.map((patient, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50">
              <div className="col-span-3 flex items-center gap-3 pl-4">
                <img
                  src={patient.image || "/placeholder.svg"}
                  alt={patient.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-bold text-gray-700">{patient.name}</span>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {patient.age} <span className="text-gray-400">{patient.gender}</span>
              </div>
              <div className="col-span-2 text-sm text-gray-500 font-mono">{patient.id}</div>
              <div className="col-span-2 text-sm text-gray-600">{patient.lastVisit}</div>
              <div className="col-span-3 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 h-8 text-xs font-medium rounded-full px-3"
                >
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Schedule Appointment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 h-8 text-xs font-medium rounded-full px-3"
                >
                  <Eye className="w-3 h-3 mr-1.5" />
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
