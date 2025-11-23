import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Calendar, Eye } from "lucide-react"
import { AddPatientDialog } from "@/components/add-patient-dialog"

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="text-6xl font-light text-primary/40">Mon</h1>
          <div className="text-muted-foreground">
            <div className="text-sm">Nov 24</div>
            <div className="text-sm">2025</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Metropolitan</div>
          <div className="text-sm font-medium">Medical Center</div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm text-muted-foreground">60 Patients in Total</h2>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search for Patients..." className="pl-9 w-[300px]" />
            </div>

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-sm text-muted-foreground">Name</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Age | Sex</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">ID</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Last Visit</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/.jpg?height=32&width=32&query=${patient.name}`} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm">
                    {patient.age} {patient.sex}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{patient.patientId}</td>
                  <td className="py-4 text-sm">{patient.lastVisit}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/appointments?patientId=${patient.id}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule Appointment
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/patients/${patient.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          View Profile
                        </a>
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
