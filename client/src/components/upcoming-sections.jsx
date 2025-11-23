import { Card } from "@/components/ui/card"

const upcoming = [
  { date: "Nov 28", appointments: "18 Appointments", peak: "Peak @2pm" },
  { date: "Nov 28", appointments: "18 Appointments", peak: "Peak @2pm" },
  { date: "Nov 28", appointments: "18 Appointments", peak: "Peak @2pm" },
]

export function UpcomingSection() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming</h3>
      <div className="space-y-3">
        {upcoming.map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium min-w-[60px]">{item.date}</span>
            <span className="text-muted-foreground">{item.appointments}</span>
            <span className="text-muted-foreground">{item.peak}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
