import { useState } from "react"
import { Plus, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CarrierManagement({ carriers = [], loading = false }) {
  // Calculate active carriers from the passed data
  const activeCarriersCount = carriers.filter(c => c.status === 'ACTIVE').length

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  const [viewMode, setViewMode] = useState("list") // "list" or "manage"
  const [selectedCarrier, setSelectedCarrier] = useState(null)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    carrierName: "",
    planName: "",
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
    payerId: "",
    accreditationNumber: "",
    expirationDate: ""
  })

  // Sample plans data
  const carrierPlans = [
    { id: 1, planName: 'Standard Plan', type: 'Medical' }
  ]

  const handleInputChange = (field, value) => {
    // Validate input based on field type
    let validatedValue = value

    switch (field) {
      case 'carrierName':
      case 'planName':
      case 'city':
      case 'province':
        // Only allow letters, spaces, and common punctuation
        validatedValue = value.replace(/[^a-zA-Z\s.,'-]/g, '')
        break
      case 'zipCode':
        // Only allow numbers, limit to 4 digits (Philippine zip codes)
        validatedValue = value.replace(/[^0-9]/g, '').slice(0, 4)
        break
      case 'payerId':
      case 'accreditationNumber':
        // Allow alphanumeric and hyphens
        validatedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()
        break
      case 'streetAddress':
        // Allow alphanumeric, spaces, and common address characters
        validatedValue = value.replace(/[^a-zA-Z0-9\s.,#-]/g, '')
        break
    }

    setFormData(prev => ({ ...prev, [field]: validatedValue }))
  }

  const isBasicInfoValid = () => {
    return formData.carrierName.trim().length >= 2 && formData.planName.trim().length >= 2
  }

  const isAddressValid = () => {
    return formData.streetAddress.trim().length >= 5 && 
           formData.city.trim().length >= 2 && 
           formData.province.trim().length >= 2 && 
           formData.zipCode.length === 4 && 
           formData.payerId.trim().length >= 3
  }

  const isPhilHealthValid = () => {
    const today = new Date().toISOString().split('T')[0]
    return formData.accreditationNumber.trim().length >= 5 && 
           formData.expirationDate.trim() !== "" &&
           formData.expirationDate >= today
  }

  const handleNext = () => {
    if (currentTab === "basic" && isBasicInfoValid()) {
      setCurrentTab("address")
    } else if (currentTab === "address" && isAddressValid()) {
      setCurrentTab("philhealth")
    }
  }

  const handleSaveCarrier = async () => {
    if (!isPhilHealthValid()) {
      alert('Please fill all required fields correctly')
      return
    }

    // TODO: Implement GabayAPI.addCarrier() to handle the POST request
    console.log("Saving carrier:", formData);
    alert('Carrier saved successfully! (UI Simulation)');
    
    // Reset form and close dialog
    setFormData({
      carrierName: "",
      planName: "",
      streetAddress: "",
      city: "",
      province: "",
      zipCode: "",
      payerId: "",
      accreditationNumber: "",
      expirationDate: ""
    })
    setCurrentTab("basic")
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setFormData({
      carrierName: "",
      planName: "",
      streetAddress: "",
      city: "",
      province: "",
      zipCode: "",
      payerId: "",
      accreditationNumber: "",
      expirationDate: ""
    })
    setCurrentTab("basic")
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier Management</h1>
          <p className="text-muted-foreground">Manage insurance providers and coverage plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Carrier</DialogTitle>
            </DialogHeader>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address" disabled={!isBasicInfoValid()}>
                  Address & Payer ID
                </TabsTrigger>
                <TabsTrigger value="philhealth" disabled={!isBasicInfoValid() || !isAddressValid()}>
                  PhilHealth
                </TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Carrier Name <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Maxicare Healthcare" 
                    value={formData.carrierName}
                    onChange={(e) => handleInputChange('carrierName', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Default Plan Name <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Corporate Standard" 
                    value={formData.planName}
                    onChange={(e) => handleInputChange('planName', e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="address" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Street Address <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Claim mailing address" 
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>City <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Province <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Zip Code <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Payer ID / EDI Number <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="For electronic claims" 
                    value={formData.payerId}
                    onChange={(e) => handleInputChange('payerId', e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="philhealth" className="space-y-4 py-4">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                  These fields are required for PhilHealth accreditation and claims processing.
                </div>
                <div className="grid gap-2">
                  <Label>Accreditation Number (PAN) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="HCI Accreditation Number" 
                    value={formData.accreditationNumber}
                    onChange={(e) => handleInputChange('accreditationNumber', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Expiration Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    value={formData.expirationDate}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              {currentTab === "philhealth" ? (
                <Button 
                  className="bg-blue-500" 
                  onClick={handleSaveCarrier}
                  disabled={!isPhilHealthValid()}
                >
                  Save Carrier
                </Button>
              ) : (
                <Button 
                  className="bg-blue-500" 
                  onClick={handleNext}
                  disabled={currentTab === "basic" ? !isBasicInfoValid() : !isAddressValid()}
                >
                  Next
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Conditional Content */}
      {viewMode === "manage" && selectedCarrier ? (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setViewMode("list")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Carriers
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCarrier.name} Plans</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage insurance plans for this carrier</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Insurance Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Plan Details Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Plan Details</h3>
                  <div className="space-y-2">
                    <Label>Plan Name *</Label>
                    <Input placeholder="e.g. Standard Corporate Plan" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Benefit Renewal Month *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="dental">Dental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Coverage Logic Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-sm">Coverage Table & Limits</h3>
                  <p className="text-xs text-muted-foreground">
                    Define the billing hierarchy and patient responsibility
                  </p>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm">Deductible (First Layer) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                        <Input className="pl-7" placeholder="0.00" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Amount patient must pay before insurance covers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Maximum Limit / LOA (Second Layer) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                        <Input className="pl-7" placeholder="0.00" />
                      </div>
                      <p className="text-xs text-muted-foreground">Maximum amount the insurance will pay</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Co-Pay / Co-Insurance *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Input type="number" placeholder="Amount" />
                        </div>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Fixed or %" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percent">Percentage (%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Patient's share of remaining balance after deductible and LOA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Import Coverage Table
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Manage Exceptions
                  </Button>
                </div>

                <Button className="w-full bg-blue-500">Save Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {carrierPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.planName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {plan.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingPlan(plan)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Insurance Plan</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {/* Plan Details Section */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-sm">Plan Details</h3>
                              <div className="space-y-2">
                                <Label>Plan Name *</Label>
                                <Input placeholder="e.g. Standard Corporate Plan" defaultValue={plan.planName} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Benefit Renewal Month *</Label>
                                  <Select defaultValue="January">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                      ].map((month) => (
                                        <SelectItem key={month} value={month}>
                                          {month}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Type *</Label>
                                  <Select defaultValue={plan.type.toLowerCase()}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="medical">Medical</SelectItem>
                                      <SelectItem value="dental">Dental</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Coverage Logic Section */}
                            <div className="space-y-4 border-t pt-4">
                              <h3 className="font-semibold text-sm">Coverage Table & Limits</h3>
                              <p className="text-xs text-muted-foreground">
                                Define the billing hierarchy and patient responsibility
                              </p>

                              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                  <Label className="text-sm">Deductible (First Layer) *</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                                    <Input className="pl-7" placeholder="0.00" defaultValue="0.00" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Amount patient must pay before insurance covers
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Maximum Limit / LOA (Second Layer) *</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                                    <Input className="pl-7" placeholder="0.00" defaultValue="0.00" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Maximum amount the insurance will pay</p>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Co-Pay / Co-Insurance *</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                      <Input type="number" placeholder="Amount" defaultValue="0" />
                                    </div>
                                    <Select defaultValue="fixed">
                                      <SelectTrigger>
                                        <SelectValue placeholder="Fixed or %" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        <SelectItem value="percent">Percentage (%)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Patient's share of remaining balance after deductible and LOA
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                              <Button variant="outline" className="flex-1 bg-transparent">
                                Import Coverage Table
                              </Button>
                              <Button variant="outline" className="flex-1 bg-transparent">
                                Manage Exceptions
                              </Button>
                            </div>

                            <Button className="w-full bg-blue-500">Update Plan</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Carriers</p>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : activeCarriersCount}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Carriers Library</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading carriers...</div>
          ) : carriers.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No carriers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Active Plans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                <TableRow key={carrier.id}>
                  <TableCell className="font-medium">{carrier.name}</TableCell>
                  <TableCell>{carrier.type}</TableCell>
                  <TableCell>{carrier.plans} Plans</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {carrier.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedCarrier(carrier)
                        setViewMode("manage")
                      }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  )
}
