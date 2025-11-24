import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarView } from "@/components/calendar-view"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function AddPatientDialog({ open, onOpenChange }) {
  const [preferredContact, setPreferredContact] = useState("")
    const [dob, setDob] = useState()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
              <Input id="firstName" placeholder="Enter first name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
              <Input id="lastName" placeholder="Enter last name" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarView value={dob} onChange={setDob} highlightToday={false} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex <span className="text-red-500">*</span></Label>
              <Select required>
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
              <Label htmlFor="phone">Contact Number <span className="text-red-500">*</span></Label>
              <Input id="phone" placeholder="+63" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="patient@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter full address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method</Label>
            <Select value={preferredContact} onValueChange={setPreferredContact}>
              <SelectTrigger id="preferredContact">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preferredContact && (
            <div className="space-y-2">
              <Label htmlFor="preferredContactValue">
                {preferredContact === "phone" && "Phone Number"}
                {preferredContact === "email" && "Email Address"}
                {preferredContact === "sms" && "Mobile Number"}
              </Label>
              <Input id="preferredContactValue" placeholder={`Enter ${preferredContact}`} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Information</Label>
            <Select>
              <SelectTrigger id="insurance">
                <SelectValue placeholder="Select insurance provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="philhealth">PhilHealth</SelectItem>
                <SelectItem value="maxicare">Maxicare</SelectItem>
                <SelectItem value="philcare">Philcare</SelectItem>
                <SelectItem value="icare">iCare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save Patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
