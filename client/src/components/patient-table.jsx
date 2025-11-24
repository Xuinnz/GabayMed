import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Calendar, Eye, ArrowLeft } from "lucide-react"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { PatientProfile } from "@/components/patient-profile"

const patients = [
  { id: 1, name: "Red Gabriel Tagura", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 2, name: "Francis Ronan Alfaro", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 3, name: "Red Gabriel Tagura", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 4, name: "Francis Ronan Alfaro", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 5, name: "Tyrone Winter Tolentino", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 6, name: "Tyrone Winter Tolentino", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 7, name: "Tyrone Winter Tolentino", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
  { id: 8, name: "Tyrone Winter Tolentino", age: "21", sex: "M", patientId: "PT-2023-8892", lastVisit: "Oct 24" },
]

export function PatientsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  // If a patient is selected, show their profile
  if (selectedPatient) {
    return (
      <div>
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setSelectedPatient(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>
        <PatientProfile patient={selectedPatient} />
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#4B6368]">{patients.length} Patients in Total</h2>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B6368]" />
              <Input placeholder="Search for Patients..." className="pl-9 w-[300px]" />
            </div>

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pl-20 font-medium text-sm text-muted-foreground w-[28%]">Name</th>
                <th className="pb-3 pr-8 font-medium text-sm text-muted-foreground w-[8%]">Age</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground w-[8%]">Sex</th>
                <th className="pb-3 pl-8 font-medium text-sm text-muted-foreground w-[14%]">ID</th>
                <th className="pb-3 -pl-8 font-medium text-sm text-muted-foreground w-[12%]">Last Visit</th>
                <th className="pb-3 pl-16 font-medium text-sm text-muted-foreground w-[30%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={`/.jpg?height=32&width=32&query=${patient.name}`} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium truncate">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm">
                    {patient.age}
                  </td>
                  <td className="py-4 text-sm">
                    {patient.sex}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{patient.patientId}</td>
                  <td className="py-4 text-sm">{patient.lastVisit}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`/appointments?patientId=${patient.id}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddPatientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
