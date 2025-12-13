import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { appointmentAPI } from "../../services/appointment" // Import API

export function PeakHours() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const data = await appointmentAPI.getPeakHoursData();
      setChartData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold text-[#4B6368] mb-4">Peak Hours</h3>
      <div className="h-[240px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading chart...
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={15} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={15} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium">
                        {payload[0].value} Visits
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
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No appointments scheduled for today.
          </div>
        )}
      </div>
    </Card>
  )
}
