import { Calendar, Users, DollarSign, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    icon: Calendar,
    value: "11",
    label: "Appointments",
    badge: "Today",
    badgeVariant: "default",
  },
  {
    icon: Users,
    value: "32",
    label: "Staff Present",
    badge: null,
  },
  {
    icon: DollarSign,
    value: "₱35,000",
    label: "Income",
    badge: "Today",
    badgeVariant: "default",
  },
  {
    icon: FileText,
    value: "7",
    label: "Transactions",
    badge: "New",
    badgeVariant: "secondary",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">{stat.value}</span>
                  {stat.badge && (
                    <Badge variant={stat.badgeVariant || "secondary"} className="text-xs">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
