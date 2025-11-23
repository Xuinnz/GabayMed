import { useState } from "react"
import { Phone, Mail, MapPin, Edit2, Wallet, ArrowRightFromLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientLedger } from "@/components/patiend-ledger"
import { Badge } from "@/components/ui/badge"
import { AddInsurancePlanDialog } from "@/components/add-insurance-plan-dialog"

export function PatientProfile() {
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>RG</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Red Gabriel Tagura</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span>20 Years Old</span>
                    <span>•</span>
                    <span>Male</span>
                    <span>•</span>
                    <span>ID: PT-2023-8892</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>+63 912 345 6789</span>
                  <Badge variant="secondary" className="text-xs">
                    Preferred
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>red.tagura@email.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Makati City, Philippines</span>
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
          <PatientLedger />
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
    </div>
  )
}
