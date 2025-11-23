import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function PatientLedger() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "Nov 24, 2025",
      created: "Nov 24, 2025",
      code: "D1110",
      description: "Prophylaxis - Adult",
      provider: "Dr. Smith",
      amount: 1500.0,
      type: "charge",
    },
    {
      id: 2,
      date: "Nov 24, 2025",
      created: "Nov 24, 2025",
      code: "PMT",
      description: "Cash Payment",
      provider: "-",
      amount: -500.0,
      type: "payment",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Financial Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Account Aging</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">0-30</div>
                <div className="font-bold text-slate-900">₱1,000</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">31-60</div>
                <div className="font-bold text-slate-400">0.00</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">61-90</div>
                <div className="font-bold text-slate-400">0.00</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">91+</div>
                <div className="font-bold text-slate-400">0.00</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="text-sm text-blue-600 mb-2 font-medium">Balance Breakdown</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="border-r border-blue-200">
                <div className="text-xs text-blue-600 mb-1">Total</div>
                <div className="font-bold text-blue-900">₱1,000</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">Insurance</div>
                <div className="font-bold text-blue-900">₱800</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">Adjust</div>
                <div className="font-bold text-blue-900">₱0.00</div>
              </div>
              <div className="bg-white rounded p-1 shadow-sm">
                <div className="text-xs text-blue-600 mb-1 font-bold">Patient</div>
                <div className="font-bold text-blue-600">₱200</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Transactions</h3>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enter Payment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                      <Input className="pl-7" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cc">Credit Card</SelectItem>
                        <SelectItem value="ins_check">Insurance Check</SelectItem>
                        <SelectItem value="ins_eft">Insurance EFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="visit" />
                      <Label htmlFor="visit">Paid at patient visit</Label>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 mt-2 bg-slate-50">
                  <h4 className="font-medium mb-2 text-sm">Allocation</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Charge</TableHead>
                        <TableHead>Applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Nov 24</TableCell>
                        <TableCell>D1110</TableCell>
                        <TableCell>₱1,500</TableCell>
                        <TableCell>
                          <Input className="h-8 w-24" placeholder="0.00" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Button className="w-full bg-blue-500 mt-2">Post Payment</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Procedure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Procedure</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Procedure Code</Label>
                  <Input placeholder="Search code..." />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Bill to Insurance</Label>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                    <Input className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <Button className="w-full bg-blue-500">Save Charge</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{t.created}</TableCell>
                  <TableCell className="font-mono text-sm">{t.code}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.provider}</TableCell>
                  <TableCell className={`text-right font-medium ${t.amount < 0 ? "text-green-600" : "text-slate-900"}`}>
                    {t.amount < 0 ? "(" : ""}₱{Math.abs(t.amount).toFixed(2)}
                    {t.amount < 0 ? ")" : ""}
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
