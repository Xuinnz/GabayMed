import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, Calendar, CreditCard, Users, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardStats() {
  const [stats, setStats] = useState({
    appointments: { count: 0, change: 0, trend: 'up' },
    staff: { count: 0 },
    income: { amount: 0, change: 0, trend: 'up' },
    transactions: { count: 0, trend: 'up' }
  })

  useEffect(() => {
    const fetchStats = async () => {
      const mockStats = {
        appointments: { count: 11, change: -0.2, trend: 'up' },
        staff: { count: 32 },
        income: { amount: 35000, change: 2, trend: 'up' },
        transactions: { count: 7, trend: 'up' }
      }
      
      setStats(mockStats)
    }

    fetchStats()
    
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      <Card className="shadow-sm border-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">{stats.appointments.count}</span>
              {stats.appointments.change !== 0 && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  stats.appointments.change > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {stats.appointments.change > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                  Today {stats.appointments.change > 0 ? '+' : ''}{stats.appointments.change}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">Appointments</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">{stats.staff.count}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Staff Present</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">{formatCurrency(stats.income.amount)}</span>
              {stats.income.change !== 0 && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  stats.income.change > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {stats.income.change > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                  {stats.income.change > 0 ? '+' : ''}{stats.income.change}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">Income</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">{stats.transactions.count}</span>
              {stats.transactions.trend === 'up' ? (
                <ArrowUp className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">New Transactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
