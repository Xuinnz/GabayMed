import { Building2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SettingsTabs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic configuration and preferences</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
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
              <Button className="bg-blue-500">Add New User</Button>
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
                  <TableRow>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>SS</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">Dr. Sarah Smith</div>
                    </TableCell>
                    <TableCell>Dentist</TableCell>
                    <TableCell>PRC-123456</TableCell>
                    <TableCell className="text-muted-foreground text-sm">M-F, 9AM-5PM</TableCell>
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
                  <Label>Clinic Name</Label>
                  <Input defaultValue="Metropolitan Medical Center" />
                </div>
                <div className="space-y-2">
                  <Label>Abbreviation</Label>
                  <Input defaultValue="MMC-01" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Medical Plaza, Makati City" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+63 2 8123 4567" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@metromedical.ph" />
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
                <Button className="bg-blue-500">Add Code</Button>
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
                  <TableRow>
                    <TableCell className="font-mono">D1110</TableCell>
                    <TableCell>Prophylaxis - Adult</TableCell>
                    <TableCell>Preventive</TableCell>
                    <TableCell className="text-right">₱ 1,500.00</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">D0120</TableCell>
                    <TableCell>Periodic Oral Evaluation</TableCell>
                    <TableCell>Diagnostic</TableCell>
                    <TableCell className="text-right">₱ 800.00</TableCell>
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
