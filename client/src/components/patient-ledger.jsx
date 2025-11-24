import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function PatientLedger({ patientId }) {
  const [transactions, setTransactions] = useState([])
  const [financialData, setFinancialData] = useState({
    aging: { '0-30': 0, '31-60': 0, '61-90': 0, '91+': 0 },
    balance: { total: 0, insurance: 0, adjust: 0, patient: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcedureDialogOpen, setIsProcedureDialogOpen] = useState(false)
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: '',
    paidAtVisit: false
  })
  
  // Procedure form state
  const [procedureForm, setProcedureForm] = useState({
    date: new Date().toISOString().split('T')[0],
    provider: '',
    code: '',
    description: '',
    amount: '',
    billToInsurance: false
  })

  // Validation functions
  const isPaymentFormValid = () => {
    return paymentForm.date && 
           paymentForm.amount && 
           parseFloat(paymentForm.amount) > 0 && 
           paymentForm.method
  }

  const isProcedureFormValid = () => {
    return procedureForm.date && 
           procedureForm.provider && 
           procedureForm.code && 
           procedureForm.amount && 
           parseFloat(procedureForm.amount) > 0
  }

  // Fetch transactions from API
  const fetchTransactions = () => {
    if (patientId) {
      setLoading(true)
      fetch(`http://localhost:3000/api/patients/${patientId}/transactions`)
        .then(res => res.json())
        .then(data => {
          if (data.transactions) {
            setTransactions(data.transactions)
          }
          if (data.financial) {
            setFinancialData(data.financial)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch transactions:', err)
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [patientId])

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!isPaymentFormValid()) return

    try {
      const response = await fetch(`http://localhost:3000/api/patients/${patientId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount)
        })
      })
      
      if (response.ok) {
        setIsPaymentDialogOpen(false)
        setPaymentForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          method: '',
          paidAtVisit: false
        })
        fetchTransactions() // Refresh transactions
      }
    } catch (err) {
      console.error('Failed to submit payment:', err)
    }
  }

  // Handle procedure submission
  const handleProcedureSubmit = async () => {
    if (!isProcedureFormValid()) return

    try {
      const response = await fetch(`http://localhost:3000/api/patients/${patientId}/procedures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...procedureForm,
          amount: parseFloat(procedureForm.amount)
        })
      })
      
      if (response.ok) {
        setIsProcedureDialogOpen(false)
        setProcedureForm({
          date: new Date().toISOString().split('T')[0],
          provider: '',
          code: '',
          description: '',
          amount: '',
          billToInsurance: false
        })
        fetchTransactions() // Refresh transactions
      }
    } catch (err) {
      console.error('Failed to submit procedure:', err)
    }
  }

  // Calculate totals from transactions if no financial data from API
  useEffect(() => {
    if (transactions.length > 0 && financialData.balance.total === 0) {
      const total = transactions.reduce((sum, t) => sum + t.amount, 0)
      setFinancialData(prev => ({
        ...prev,
        balance: {
          total: total,
          insurance: total * 0.8,
          adjust: 0,
          patient: total * 0.2
        },
        aging: {
          '0-30': total > 0 ? total : 0,
          '31-60': 0,
          '61-90': 0,
          '91+': 0
        }
      }))
    }
  }, [transactions])

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
                <div className={`font-bold ${financialData.aging['0-30'] > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                  ₱{financialData.aging['0-30'].toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">31-60</div>
                <div className={`font-bold ${financialData.aging['31-60'] > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                  ₱{financialData.aging['31-60'].toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">61-90</div>
                <div className={`font-bold ${financialData.aging['61-90'] > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                  ₱{financialData.aging['61-90'].toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">91+</div>
                <div className={`font-bold ${financialData.aging['91+'] > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                  ₱{financialData.aging['91+'].toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="text-sm text-[#66BAFF] mb-2 font-bold">Balance Breakdown</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="border-r border-blue-200">
                <div className="text-xs text-[#66BAFF] font-bold mb-1">Total</div>
                <div className="font-bold text-blue-900">
                  ₱{financialData.balance.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#66BAFF] font-bold mb-1">Insurance</div>
                <div className="font-bold text-blue-900">
                  ₱{financialData.balance.insurance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#66BAFF] font-bold  mb-1">Adjust</div>
                <div className="font-bold text-blue-900">
                  ₱{financialData.balance.adjust.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white rounded p-1 shadow-sm">
                <div className="text-xs text-[#66BAFF] mb-1 font-bold">Patient</div>
                <div className="font-bold text-[#66BAFF] ">
                  ₱{financialData.balance.patient.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
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
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-200 text-[#66BAFF] hover:bg-blue-50 bg-transparent">
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
                    <Label>Payment Date <span className="text-red-500">*</span></Label>
                    <Input 
                      type="date" 
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                      <Input 
                        className="pl-7" 
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Method <span className="text-red-500">*</span></Label>
                    <Select
                      value={paymentForm.method}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
                    >
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
                      <Checkbox 
                        id="visit"
                        checked={paymentForm.paidAtVisit}
                        onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, paidAtVisit: checked })}
                      />
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
                      {transactions.filter(t => t.amount > 0).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.date}</TableCell>
                          <TableCell>{t.code}</TableCell>
                          <TableCell>₱{t.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <Input className="h-8 w-24" placeholder="0.00" type="number" step="0.01" />
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.filter(t => t.amount > 0).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                            No outstanding charges
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={!isPaymentFormValid()}
                >
                  Post Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isProcedureDialogOpen} onOpenChange={setIsProcedureDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  <Label>Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date"
                    value={procedureForm.date}
                    onChange={(e) => setProcedureForm({ ...procedureForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provider <span className="text-red-500">*</span></Label>
                  <Select
                    value={procedureForm.provider}
                    onValueChange={(value) => setProcedureForm({ ...procedureForm, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                      <SelectItem value="dr-jones">Dr. Jones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Procedure Code <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Enter code..."
                    value={procedureForm.code}
                    onChange={(e) => setProcedureForm({ ...procedureForm, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Procedure description..."
                    value={procedureForm.description}
                    onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Bill to Insurance</Label>
                  <Switch 
                    checked={procedureForm.billToInsurance}
                    onCheckedChange={(checked) => setProcedureForm({ ...procedureForm, billToInsurance: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                    <Input 
                      className="pl-7" 
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      value={procedureForm.amount}
                      onChange={(e) => setProcedureForm({ ...procedureForm, amount: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleProcedureSubmit}
                  disabled={!isProcedureFormValid()}
                >
                  Save Charge
                </Button>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{t.created}</TableCell>
                    <TableCell className="font-mono text-sm">{t.code}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.provider}</TableCell>
                    <TableCell className={`text-right font-medium ${t.amount < 0 ? "text-green-600" : "text-slate-900"}`}>
                      {t.amount < 0 ? "(" : ""}₱{Math.abs(t.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      {t.amount < 0 ? ")" : ""}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
