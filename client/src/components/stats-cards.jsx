import { useState, useEffect } from "react"
import { Calendar, Users, DollarSign, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatsCards() {
  const [stats, setStats] = useState({
    appointments: { count: 0, label: "Appointments" },
    staff: { count: 0, label: "Staff Present" },
    income: { amount: 0, label: "Income" },
    transactions: { count: 0, label: "Transactions" }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch stats from backend API
        const response = await fetch('http://localhost:3000/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        
        // Expected API response format:
        // {
        //   appointments: { count: number },
        //   staff: { count: number },
        //   income: { amount: number },
        //   transactions: { count: number }
        // }
        
        setStats({
          appointments: {
            count: data.appointments?.count || 0,
            label: "Appointments"
          },
          staff: {
            count: data.staff?.count || 0,
            label: "Staff Present"
          },
          income: {
            amount: data.income?.amount || 0,
            label: "Income"
          },
          transactions: {
            count: data.transactions?.count || 0,
            label: "Transactions"
          }
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Keep showing 0 values on error
        setStats({
          appointments: { count: 0, label: "Appointments" },
          staff: { count: 0, label: "Staff Present" },
          income: { amount: 0, label: "Income" },
          transactions: { count: 0, label: "Transactions" }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000)
    
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

  const statsData = [
    {
      icon: Calendar,
      value: loading ? "..." : stats.appointments.count.toString(),
      label: stats.appointments.label,
      badge: "Today",
      badgeVariant: "default",
    },
    {
      icon: Users,
      value: loading ? "..." : stats.staff.count.toString(),
      label: stats.staff.label,
      badge: null,
    },
    {
      icon: DollarSign,
      value: loading ? "..." : formatCurrency(stats.income.amount),
      label: stats.income.label,
      badge: "Today",
      badgeVariant: "default",
    },
    {
      icon: FileText,
      value: loading ? "..." : stats.transactions.count.toString(),
      label: stats.transactions.label,
      badge: "New",
      badgeVariant: "secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#f9f9f9] flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[#66BAFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">{stat.value}</span>
                  {stat.badge && (
                    <Badge variant={stat.badgeVariant || "secondary"} className="text-xs text-black bg-[#66BAFF]">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-semibold">{stat.label}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
