import { useState, useEffect } from "react"
import { Building2 } from "lucide-react"
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
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingProcedures, setLoadingProcedures] = useState(true)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    licenseNo: '',
    schedule: '',
    avatar: ''
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
      } catch (error) {
        console.error('Failed to fetch procedures:', error)
      } finally {
        setLoadingProcedures(false)
      }
    }

    fetchProcedures()
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

  // Validate user form
  const isUserFormValid = () => {
    const isValid = userFormData.name.trim().length >= 2 &&
           userFormData.email.trim().length > 0 &&
           userFormData.password.trim().length >= 6 &&
           userFormData.role.length > 0
    
    console.log('Form validation:', {
      name: userFormData.name.trim().length >= 2,
      email: userFormData.email.trim().length > 0,
      password: userFormData.password.trim().length >= 6,
      role: userFormData.role.length > 0,
      isValid
    })
    
    return isValid
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

  return (
    <div className="space-y-6">
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
                  <Input defaultValue="Metropolitan Medical Center" required />
                </div>
                <div className="space-y-2">
                  <Label>Abbreviation</Label>
                  <Input defaultValue="MMC-01" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address <span className="text-red-500">*</span></Label>
                  <Input defaultValue="123 Medical Plaza, Makati City" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone <span className="text-red-500">*</span></Label>
                  <Input defaultValue="+63 2 8123 4567" required />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input type="email" defaultValue="info@metromedical.ph" required />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input defaultValue="Asia/Manila" disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-500">Save Changes</Button>
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
              <Button className="bg-blue-500">Add Fee Schedule</Button>
            </CardHeader>
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
                  <TableRow>
                    <TableCell className="font-medium">Standard Fee Schedule</TableCell>
                    <TableCell>Maxicare, Philcare</TableCell>
                    <TableCell>156 procedures</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PhilHealth Case Rates</TableCell>
                    <TableCell>PhilHealth</TableCell>
                    <TableCell>89 procedures</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
