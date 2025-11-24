import { useState, useEffect } from "react"
import { Plus, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CarrierManagement() {
  const [carriers, setCarriers] = useState([])
  const [activeCarriersCount, setActiveCarriersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        // Fetch carriers from backend API
        const response = await fetch('http://localhost:3000/api/carriers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch carriers')
        }
        
        const data = await response.json()
        
        // Expected API response format:
        // {
        //   carriers: [
        //     { id: "1", name: "Maxicare", type: "HMO", status: "Active", plans: 3 }
        //   ],
        //   activeCount: 12
        // }
        
        setCarriers(data.carriers || [])
        setActiveCarriersCount(data.activeCount || 0)
      } catch (error) {
        console.error('Failed to fetch carriers:', error)
        setCarriers([])
        setActiveCarriersCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCarriers()
    
    // Refresh carriers every 5 minutes
    const interval = setInterval(fetchCarriers, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
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

    try {
      // Save carrier to database
      const response = await fetch('http://localhost:3000/api/carriers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.carrierName,
          planName: formData.planName,
          address: {
            street: formData.streetAddress,
            city: formData.city,
            province: formData.province,
            zipCode: formData.zipCode
          },
          payerId: formData.payerId,
          philhealth: {
            accreditationNumber: formData.accreditationNumber,
            expirationDate: formData.expirationDate
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save carrier')
      }

      const newCarrier = await response.json()
      
      // Add new carrier to the list
      setCarriers(prev => [...prev, newCarrier])
      setActiveCarriersCount(prev => prev + 1)

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
      
      alert('Carrier saved successfully!')
    } catch (error) {
      console.error('Failed to save carrier:', error)
      alert('Failed to save carrier. Please try again.')
    }
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
                    <Button variant="ghost" size="sm">
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
  )
}
