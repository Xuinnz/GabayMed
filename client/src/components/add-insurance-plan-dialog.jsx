import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarView } from "@/components/calendar-view"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function AddInsurancePlanDialog({ open, onOpenChange, patientId, onPlanAdded }) {
  const [formData, setFormData] = useState({
    carrier: '',
    subscriberId: '',
    coverageType: '',
    notes: ''
  })
  const [coverageStartDate, setCoverageStartDate] = useState()
  const [coverageEndDate, setCoverageEndDate] = useState()
  const [verificationDate, setVerificationDate] = useState()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        carrier: '',
        subscriberId: '',
        coverageType: '',
        notes: ''
      })
      setCoverageStartDate(undefined)
      setCoverageEndDate(undefined)
      setVerificationDate(undefined)
    }
  }, [open])

  const isFormValid = () => {
    return formData.carrier && 
           formData.subscriberId && 
           formData.coverageType && 
           coverageStartDate &&
           verificationDate
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    try {
      const response = await fetch(`http://localhost:3000/api/patients/${patientId}/insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coverageStartDate: coverageStartDate?.toISOString(),
          coverageEndDate: coverageEndDate?.toISOString(),
          verificationDate: verificationDate?.toISOString()
        })
      })

      if (response.ok) {
        onOpenChange(false)
        if (onPlanAdded) {
          onPlanAdded() // Refresh insurance plans list
        }
      }
    } catch (err) {
      console.error('Failed to add insurance plan:', err)
      alert('Failed to add insurance plan. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Insurance Plan</DialogTitle>
          <DialogDescription>Add insurance coverage information for this patient</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Insurance Carrier / Plan Name <span className="text-red-500">*</span></Label>
            <Select
              value={formData.carrier}
              onValueChange={(value) => setFormData({ ...formData, carrier: value })}
            >
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="philhealth">PhilHealth</SelectItem>
                <SelectItem value="maxicare">Maxicare</SelectItem>
                <SelectItem value="philcare">Philcare</SelectItem>
                <SelectItem value="icare">iCare</SelectItem>
                <SelectItem value="medicard">Medicard</SelectItem>
                <SelectItem value="valucare">Valucare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriberId">Subscriber ID / PhilHealth Identification Number (PIN) <span className="text-red-500">*</span></Label>
            <Input
              id="subscriberId"
              placeholder="Enter 12-digit PIN for PhilHealth or Member ID for HMO"
              value={formData.subscriberId}
              onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              For PhilHealth: 12-digit PIN. For private HMOs: Member ID or Policy Number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageType">Coverage Type <span className="text-red-500">*</span></Label>
            <Select
              value={formData.coverageType}
              onValueChange={(value) => setFormData({ ...formData, coverageType: value })}
            >
              <SelectTrigger id="coverageType">
                <SelectValue placeholder="Select coverage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="tertiary">Tertiary</SelectItem>
                <SelectItem value="hmo">HMO (Health Maintenance Organization)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This establishes the order of billing responsibility</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coverage Start Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {coverageStartDate ? format(coverageStartDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarView value={coverageStartDate} onChange={setCoverageStartDate} highlightToday={false} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Coverage End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {coverageEndDate ? format(coverageEndDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarView value={coverageEndDate} onChange={setCoverageEndDate} highlightToday={false} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Verification Date <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {verificationDate ? format(verificationDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarView value={verificationDate} onChange={setVerificationDate} highlightToday={false} />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              The date the office last confirmed eligibility and benefits with the carrier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add patient-specific insurance details (e.g., 'Maxicare is only for out-patient', 'Requires Letter of Authorization for all procedures')"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-500" 
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Add Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
