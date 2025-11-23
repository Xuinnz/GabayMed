import { useState } from "react"
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
  const [carriers, setCarriers] = useState([
    {
      id: "1",
      name: "Maxicare",
      type: "HMO",
      status: "Active",
      plans: 3,
    },
    {
      id: "2",
      name: "PhilHealth",
      type: "Government",
      status: "Active",
      plans: 1,
    },
    {
      id: "3",
      name: "Intellicare",
      type: "HMO",
      status: "Active",
      plans: 2,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier Management</h1>
          <p className="text-muted-foreground">Manage insurance providers and coverage plans</p>
        </div>
        <Dialog>
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
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address & Payer ID</TabsTrigger>
                <TabsTrigger value="philhealth">PhilHealth</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Carrier Name</Label>
                  <Input placeholder="e.g. Maxicare Healthcare" />
                </div>
                <div className="grid gap-2">
                  <Label>Default Plan Name</Label>
                  <Input placeholder="e.g. Corporate Standard" />
                </div>
              </TabsContent>
              <TabsContent value="address" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Street Address</Label>
                  <Input placeholder="Claim mailing address" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>City</Label>
                    <Input />
                  </div>
                  <div className="grid gap-2">
                    <Label>Province</Label>
                    <Input />
                  </div>
                  <div className="grid gap-2">
                    <Label>Zip Code</Label>
                    <Input />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Payer ID / EDI Number</Label>
                  <Input placeholder="For electronic claims" />
                </div>
              </TabsContent>
              <TabsContent value="philhealth" className="space-y-4 py-4">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                  These fields are required for PhilHealth accreditation and claims processing.
                </div>
                <div className="grid gap-2">
                  <Label>Accreditation Number (PAN)</Label>
                  <Input placeholder="HCI Accreditation Number" />
                </div>
                <div className="grid gap-2">
                  <Label>Expiration Date</Label>
                  <Input type="date" />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-blue-500">Save Carrier</Button>
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
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Carriers Library</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
