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
//import { GabayAPI } from "../../services/gabayApi" // Import GabayAPI

export function AddInsurancePlanDialog({ open, onOpenChange, patientId, onPlanAdded }) {
  const [formData, setFormData] = useState({
    planId: '', // Changed from carrier string to planId
    subscriberId: '',
    coverageType: '',
    notes: ''
  })
  const [coverageStartDate, setCoverageStartDate] = useState()
  const [coverageEndDate, setCoverageEndDate] = useState()
  const [verificationDate, setVerificationDate] = useState()
  
  // State for Dropdown Options
  const [availablePlans, setAvailablePlans] = useState([])

  // Load Plans on Mount using GabayAPI
  useEffect(() => {
    const loadPlans = async () => {
      const plans = await GabayAPI.getInsurancePlans();
      setAvailablePlans(plans);
    };
    loadPlans();
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        planId: '',
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
    return formData.planId && 
           formData.subscriberId && 
           formData.coverageType && 
           coverageStartDate &&
           verificationDate
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    const payload = {
      ...formData,
      coverageStartDate: coverageStartDate?.toISOString(),
      coverageEndDate: coverageEndDate?.toISOString(),
      verificationDate: verificationDate?.toISOString()
    }

    // Use GabayAPI instead of fetch
    const result = await GabayAPI.addPatientInsurance(patientId, payload)

    if (result.success) {
      onOpenChange(false)
      if (onPlanAdded) {
        onPlanAdded() // Refresh insurance plans list
      }
    } else {
      alert('Failed to add insurance plan: ' + result.error)
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
              value={formData.planId}
              onValueChange={(value) => setFormData({ ...formData, planId: value })}
            >
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans.length > 0 ? (
                  availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.carrier} - {plan.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No plans available</SelectItem>
                )}
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
