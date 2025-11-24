import { useState, useEffect } from "react"
import { Phone, Mail, MapPin, Edit2, Wallet, ArrowRightFromLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientLedger } from "@/components/patient-ledger"
import { Badge } from "@/components/ui/badge"
import { AddInsurancePlanDialog } from "@/components/add-insurance-plan-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PatientProfile({ patient }) {
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [patientData, setPatientData] = useState(patient || {
    name: "Red Gabriel Tagura",
    age: "20",
    sex: "Male",
    patientId: "PT-2023-8892",
    phone: "+63 912 345 6789",
    email: "red.tagura@email.com",
    address: "Makati City, Philippines",
    birthDate: "2005-01-15",
    emergencyContact: "",
    emergencyPhone: ""
  })
  const [editFormData, setEditFormData] = useState({ ...patientData })

  // Fetch full patient details from API
  useEffect(() => {
    if (patient?.id) {
      fetch(`http://localhost:3000/api/patients/${patient.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.patient) {
            setPatientData(data.patient)
            setEditFormData(data.patient)
          }
        })
        .catch(err => console.error('Failed to fetch patient details:', err))
    }
  }, [patient?.id])

  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/patients/${patientData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      const data = await response.json()
      if (data.patient) {
        // Update both patientData and editFormData to ensure UI reflects changes
        setPatientData(data.patient)
        setEditFormData(data.patient)
        setIsEditDialogOpen(false)
      }
    } catch (err) {
      console.error('Failed to update patient:', err)
      alert('Failed to update patient profile. Please try again.')
    }
  }
  
  const isEditFormValid = () => {
    return editFormData.name && 
           editFormData.name.trim().length >= 2 &&
           editFormData.birthDate &&
           editFormData.sex
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={`/.jpg?height=96&width=96&query=${patientData.name}`} />
              <AvatarFallback>{getInitials(patientData.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{patientData.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span>{patientData.age} Years Old</span>
                    <span>•</span>
                    <span>{patientData.sex === 'M' ? 'Male' : patientData.sex === 'F' ? 'Female' : patientData.sex}</span>
                    <span>•</span>
                    <span>ID: {patientData.patientId}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{patientData.phone || 'No phone'}</span>
                  <Badge variant="secondary" className="text-xs">
                    Preferred
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>{patientData.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{patientData.address || 'No address'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ledger" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-4 py-3"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-4 py-3"
          >
            Ledger
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-4 py-3"
          >
            Insurance
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-4 py-3"
          >
            Clinical Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm">No upcoming appointments scheduled.</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start bg-transparent">
                  <Wallet className="w-4 h-4 mr-2" />
                  Walkout Statement
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <ArrowRightFromLine className="w-4 h-4 mr-2" />
                  Send Claim
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ledger">
          <PatientLedger patientId={patientData.id} />
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Insurance Plans</CardTitle>
              <Button size="sm" onClick={() => setIsAddPlanOpen(true)}>
                Add Plan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No active insurance plans found.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddInsurancePlanDialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen} />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={editFormData.patientId || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date <span className="text-red-500">*</span></Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editFormData.birthDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={editFormData.age || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sex <span className="text-red-500">*</span></Label>
                <Select
                  value={editFormData.sex || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, sex: value })}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={editFormData.emergencyContact || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={editFormData.emergencyPhone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setEditFormData({ ...patientData }) // Reset form on cancel
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditSave}
                disabled={!isEditFormValid()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
