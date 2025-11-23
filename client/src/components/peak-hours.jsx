import { Card } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { time: "8 AM", visits: 2 },
  { time: "9 AM", visits: 4 },
  { time: "10 AM", visits: 6 },
  { time: "11 AM", visits: 5 },
  { time: "12 PM", visits: 3 },
  { time: "1 PM", visits: 4 },
  { time: "2 PM", visits: 12 },
  { time: "3 PM", visits: 7 },
  { time: "4 PM", visits: 4 },
  { time: "5 PM", visits: 2 },
]

export function PeakHours() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Peak Hours</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium">
                      {payload[0].value}
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="rgb(147, 197, 253)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "rgb(59, 130, 246)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
