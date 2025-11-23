"use client"

import { useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700">
          Value: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export function PeakHoursChart() {
  // Generate dynamic data based on current hour
  const data = useMemo(() => {
    const currentHour = new Date().getHours()
    const hours = []
    
    // Generate data for 8 AM to 5 PM (9-hour window)
    for (let i = 8; i <= 17; i++) {
      const hour = i > 12 ? i - 12 : i
      const period = i >= 12 ? 'PM' : 'AM'
      const time = `${hour} ${period}`
      
      // Generate realistic appointment patterns
      let value
      if (i < currentHour) {
        // Past hours - use realistic patterns
        if (i >= 8 && i <= 10) value = Math.floor(Math.random() * 3) + 2 // Morning: 2-4
        else if (i >= 11 && i <= 13) value = Math.floor(Math.random() * 4) + 5 // Lunch: 5-8
        else if (i >= 14 && i <= 16) value = Math.floor(Math.random() * 5) + 8 // Peak: 8-12
        else value = Math.floor(Math.random() * 3) + 4 // Evening: 4-6
      } else if (i === currentHour) {
        // Current hour - show live count (you can replace with actual data)
        value = Math.floor(Math.random() * 4) + 3
      } else {
        // Future hours - predicted or scheduled
        value = Math.floor(Math.random() * 2) + 2
      }
      
      hours.push({ time, value, hour: i })
    }
    
    return hours
  }, [])

  // Find peak hour
  const peakHour = useMemo(() => {
    return data.reduce((max, curr) => curr.value > max.value ? curr : max, data[0])
  }, [data])

  return (
    <Card className="shadow-sm border-none h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-700">Peak Hours</CardTitle>
          <span className="text-xs text-gray-500">
            Peak: <span className="font-bold text-blue-500">{peakHour.time}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#9ca3af" }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#60a5fa', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
