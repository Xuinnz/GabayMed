import { useState, useEffect } from "react"
import { Building2, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [procedures, setProcedures] = useState([])
  const [feeSchedules, setFeeSchedules] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingProcedures, setLoadingProcedures] = useState(true)
  const [loadingFeeSchedules, setLoadingFeeSchedules] = useState(false)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [feeScheduleDialog, setFeeScheduleDialog] = useState(false)
  const [editFeeScheduleDialog, setEditFeeScheduleDialog] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    licenseNo: '',
    schedule: '',
    avatar: ''
  })
  const [locationData, setLocationData] = useState({
    clinicName: '',
    abbreviation: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'Asia/Manila'
  })
  const [feeScheduleFormData, setFeeScheduleFormData] = useState({
    scheduleName: '',
    procedureFees: []
  })

  // Check URL for tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [])

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users')
        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Fetch procedure codes from database
  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/procedures')
        const data = await response.json()
        setProcedures(data.procedures || [])
        // Initialize fee schedule form with procedures
        setFeeScheduleFormData(prev => ({
          ...prev,
          procedureFees: data.procedures?.map(p => ({
            code: p.code,
            name: p.description,
            originalFee: p.officeFee,
            scheduleFee: p.officeFee
          })) || []
        }))
      } catch (error) {
        console.error('Failed to fetch procedures:', error)
      } finally {
        setLoadingProcedures(false)
      }
    }

    fetchProcedures()
  }, [])

  // Fetch fee schedules
  useEffect(() => {
    const fetchFeeSchedules = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/fee-schedules')
        const data = await response.json()
        setFeeSchedules(data.feeSchedules || [])
      } catch (error) {
        console.error('Failed to fetch fee schedules:', error)
      } finally {
        setLoadingFeeSchedules(false)
      }
    }

    fetchFeeSchedules()
  }, [])

  // Fetch location data
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/location')
        const data = await response.json()
        if (data.location) {
          setLocationData(data.location)
        }
      } catch (error) {
        console.error('Failed to fetch location:', error)
      }
    }

    fetchLocation()
  }, [])

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Handle user form input changes
  const handleUserInputChange = (field, value) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle location form input changes
  const handleLocationInputChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle fee schedule form input changes
  const handleFeeScheduleInputChange = (field, value) => {
    setFeeScheduleFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update procedure fee in fee schedule form
  const updateProcedureFee = (code, newFee) => {
    setFeeScheduleFormData(prev => ({
      ...prev,
      procedureFees: prev.procedureFees.map(p =>
        p.code === code ? { ...p, scheduleFee: parseFloat(newFee) || p.originalFee } : p
      )
    }))
  }

  // Validate user form
  const isUserFormValid = () => {
    return userFormData.name.trim().length >= 2 &&
           userFormData.email.trim().length > 0 &&
           userFormData.password.trim().length >= 6 &&
           userFormData.role.length > 0
  }

  // Handle save new user
  const handleSaveUser = async () => {
    if (!isUserFormValid()) {
      alert('Please fill in all required fields. Password must be at least 6 characters.')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      const result = await response.json()
      
      // Add new user to the list
      setUsers(prev => [...prev, result.user])
      
      // Reset form and close dialog
      setUserFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        licenseNo: '',
        schedule: '',
        avatar: ''
      })
      setIsUserDialogOpen(false)
      alert('User created successfully!')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user. Please try again.')
    }
  }

  // Handle save location
  const handleSaveLocation = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationData)
      })

      if (!response.ok) {
        throw new Error('Failed to save location')
      }

      alert('Location updated successfully!')
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Failed to save location. Please try again.')
    }
  }

  // Handle save fee schedule
  const handleSaveFeeSchedule = async () => {
    if (!feeScheduleFormData.scheduleName.trim()) {
      alert('Please enter a schedule name.')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/fee-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feeScheduleFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to create fee schedule')
      }

      const result = await response.json()
      
      // Add new fee schedule to the list
      setFeeSchedules(prev => [...prev, result.feeSchedule])
      
      // Reset form and close dialog
      setFeeScheduleFormData({
        scheduleName: '',
        procedureFees: procedures.map(p => ({
          code: p.code,
          name: p.description,
          originalFee: p.officeFee,
          scheduleFee: p.officeFee
        }))
      })
      setFeeScheduleDialog(false)
      alert('Fee schedule created successfully!')
    } catch (error) {
      console.error('Error creating fee schedule:', error)
      alert('Failed to create fee schedule. Please try again.')
    }
  }

  // Handle open edit fee schedule dialog
  const handleOpenEditFeeSchedule = (schedule) => {
    setEditingScheduleId(schedule.id)
    setFeeScheduleFormData({
      scheduleName: schedule.scheduleName,
      procedureFees: schedule.procedureFees.map(p => ({ ...p }))
    })
    setEditFeeScheduleDialog(true)
  }

  // Handle update fee schedule
  const handleUpdateFeeSchedule = async () => {
    if (!feeScheduleFormData.scheduleName.trim()) {
      alert('Please enter a schedule name.')
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/fee-schedules/${editingScheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feeScheduleFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to update fee schedule')
      }

      const result = await response.json()
      
      // Update fee schedule in the list
      setFeeSchedules(prev => prev.map(fs => 
        fs.id === editingScheduleId ? result.feeSchedule : fs
      ))
      
      // Reset form and close dialog
      setFeeScheduleFormData({
        scheduleName: '',
        procedureFees: procedures.map(p => ({
          code: p.code,
          name: p.description,
          originalFee: p.officeFee,
          scheduleFee: p.officeFee
        }))
      })
      setEditingScheduleId(null)
      setEditFeeScheduleDialog(false)
      alert('Fee schedule updated successfully!')
    } catch (error) {
      console.error('Error updating fee schedule:', error)
      alert('Failed to update fee schedule. Please try again.')
    }
  }

  return (
    <div className="space-y-6 -mt-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic configuration and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        {/* User Accounts Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Accounts & Providers</CardTitle>
                <CardDescription>Manage staff access and provider schedules</CardDescription>
              </div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500">Add New User</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account for staff or provider. Fields marked with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          placeholder="Dr. Juan Dela Cruz"
                          value={userFormData.name}
                          onChange={(e) => handleUserInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="juan.delacruz@clinic.ph"
                          value={userFormData.email}
                          onChange={(e) => handleUserInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={userFormData.password}
                          onChange={(e) => handleUserInputChange('password', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                        <Select
                          value={userFormData.role}
                          onValueChange={(value) => handleUserInputChange('role', value)}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Doctor">Doctor</SelectItem>
                            <SelectItem value="Dentist">Dentist</SelectItem>
                            <SelectItem value="Nurse">Nurse</SelectItem>
                            <SelectItem value="Receptionist">Receptionist</SelectItem>
                            <SelectItem value="Administrator">Administrator</SelectItem>
                            <SelectItem value="Medical Assistant">Medical Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseNo">License Number</Label>
                        <Input
                          id="licenseNo"
                          placeholder="PRC-123456"
                          value={userFormData.licenseNo}
                          onChange={(e) => handleUserInputChange('licenseNo', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule">Schedule</Label>
                        <Input
                          id="schedule"
                          placeholder="M-F, 9AM-5PM"
                          value={userFormData.schedule}
                          onChange={(e) => handleUserInputChange('schedule', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar URL (optional)</Label>
                      <Input
                        id="avatar"
                        placeholder="https://example.com/avatar.jpg"
                        value={userFormData.avatar}
                        onChange={(e) => handleUserInputChange('avatar', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={handleSaveUser}
                      disabled={!isUserFormValid()}
                    >
                      Create User
                    </Button>
                  </div>
                  {!isUserFormValid() && (
                    <p className="text-xs text-muted-foreground text-center">
                      Please fill in all required fields (Name, Email, Password, Role)
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>License No.</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No users found. Click "Add New User" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.name}</div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.licenseNo || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.schedule || 'Not set'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Info Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Clinic details used for billing and correspondence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                  <Building2 className="w-8 h-8 text-slate-300" />
                </div>
                <Button variant="outline">Upload Logo</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Clinic Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={locationData.clinicName} 
                    onChange={(e) => handleLocationInputChange('clinicName', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abbreviation</Label>
                  <Input 
                    value={locationData.abbreviation} 
                    onChange={(e) => handleLocationInputChange('abbreviation', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address <span className="text-red-500">*</span></Label>
                  <Input 
                    value={locationData.address} 
                    onChange={(e) => handleLocationInputChange('address', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone <span className="text-red-500">*</span></Label>
                  <Input 
                    value={locationData.phone} 
                    onChange={(e) => handleLocationInputChange('phone', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input 
                    type="email" 
                    value={locationData.email} 
                    onChange={(e) => handleLocationInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input value={locationData.timezone} disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-500" onClick={handleSaveLocation}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedure Codes Tab */}
        <TabsContent value="procedures">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Procedure Codes</CardTitle>
                <CardDescription>Manage standard procedure codes and base fees</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Import PhilHealth</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Office Fee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProcedures ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading procedures...
                      </TableCell>
                    </TableRow>
                  ) : procedures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No procedures found. Click "Add Procedure" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    procedures.map((procedure) => (
                      <TableRow key={procedure.id}>
                        <TableCell className="font-mono">{procedure.code}</TableCell>
                        <TableCell>{procedure.description}</TableCell>
                        <TableCell>{procedure.category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(procedure.officeFee)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Schedules</CardTitle>
                <CardDescription>Manage different fee structures for insurance plans</CardDescription>
              </div>
              <Button className="bg-blue-500" onClick={() => setFeeScheduleDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Fee Schedule
              </Button>
            </CardHeader>
            
            <Dialog open={feeScheduleDialog} onOpenChange={setFeeScheduleDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Fee Schedule</DialogTitle>
                </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label>Schedule Name <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="e.g. Maxicare Standard" 
                        value={feeScheduleFormData.scheduleName}
                        onChange={(e) => handleFeeScheduleInputChange('scheduleName', e.target.value)}
                      />
                    </div>
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h4 className="font-medium mb-4">Procedure Fees</h4>
                      <div className="text-sm text-muted-foreground mb-3">
                        Original Fees are based on your office fee schedule. Edit the Fee Schedule column to set
                        insurance-specific rates.
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Procedure Name</TableHead>
                            <TableHead className="text-right">Original Fee</TableHead>
                            <TableHead className="text-right">Fee Schedule</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feeScheduleFormData.procedureFees.slice(0, 5).map((procedure) => (
                            <TableRow key={procedure.code}>
                              <TableCell className="font-mono">{procedure.code}</TableCell>
                              <TableCell>{procedure.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(procedure.originalFee)}</TableCell>
                              <TableCell className="text-right">
                                <Input 
                                  className="h-8 text-right" 
                                  value={procedure.scheduleFee}
                                  onChange={(e) => updateProcedureFee(procedure.code, e.target.value)}
                                  type="number"
                                  step="0.01"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          {feeScheduleFormData.procedureFees.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                                + {feeScheduleFormData.procedureFees.length - 5} more procedures
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setFeeScheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-500" onClick={handleSaveFeeSchedule}>
                        Create Schedule
                      </Button>
                    </div>
                  </div>
              </DialogContent>
            </Dialog>

            {/* Edit Fee Schedule Dialog */}
            <Dialog open={editFeeScheduleDialog} onOpenChange={setEditFeeScheduleDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Fee Schedule</DialogTitle>
                </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label>Schedule Name <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="e.g. Maxicare Standard" 
                        value={feeScheduleFormData.scheduleName}
                        onChange={(e) => handleFeeScheduleInputChange('scheduleName', e.target.value)}
                      />
                    </div>
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h4 className="font-medium mb-4">Procedure Fees</h4>
                      <div className="text-sm text-muted-foreground mb-3">
                        Original Fees are based on your office fee schedule. Edit the Fee Schedule column to set
                        insurance-specific rates.
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Procedure Name</TableHead>
                            <TableHead className="text-right">Original Fee</TableHead>
                            <TableHead className="text-right">Fee Schedule</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feeScheduleFormData.procedureFees.map((procedure) => (
                            <TableRow key={procedure.code}>
                              <TableCell className="font-mono">{procedure.code}</TableCell>
                              <TableCell>{procedure.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(procedure.originalFee)}</TableCell>
                              <TableCell className="text-right">
                                <Input 
                                  className="h-8 text-right" 
                                  value={procedure.scheduleFee}
                                  onChange={(e) => updateProcedureFee(procedure.code, e.target.value)}
                                  type="number"
                                  step="0.01"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEditFeeScheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-500" onClick={handleUpdateFeeSchedule}>
                        Update Schedule
                      </Button>
                    </div>
                  </div>
              </DialogContent>
            </Dialog>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule Name</TableHead>
                    <TableHead>Associated Plans</TableHead>
                    <TableHead>Total Procedures</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFeeSchedules ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Loading fee schedules...
                      </TableCell>
                    </TableRow>
                  ) : feeSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No fee schedules found. Click "Add Fee Schedule" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.scheduleName}</TableCell>
                        <TableCell>{schedule.associatedPlans || 'N/A'}</TableCell>
                        <TableCell>{schedule.procedureFees?.length || 0} procedures</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditFeeSchedule(schedule)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
