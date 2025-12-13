import { Calendar, Users, DollarSign, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatsCards({ 
  totalPatients = 0, 
  appointmentsToday = 0, 
  staffPresent = 0, 
  totalIncome = 0, 
  loading = false 
}) {

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
      value: loading ? "..." : appointmentsToday.toString(),
      label: "Appointments",
      badge: "Today",
      badgeVariant: "default",
    },
    {
      icon: Users,
      value: loading ? "..." : staffPresent.toString(),
      label: "Staff Present",
      badge: null,
    },
    {
      icon: DollarSign,
      value: loading ? "..." : formatCurrency(totalIncome),
      label: "Income",
      badge: "Today",
      badgeVariant: "default",
    },
    {
      icon: FileText,
      value: loading ? "..." : totalPatients.toString(),
      label: "Total Patients",
      badge: "Active",
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
