import { useState, useEffect } from "react"
import { Cloud, CloudRain, CloudSun, Sun, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export function DateHeader({ date }) {
  const [weather, setWeather] = useState({ temp: 30, condition: 'sunny' })
  const currentDate = date || new Date()

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = 'demo' 
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Manila,PH&units=metric&appid=${API_KEY}`
        )
        if (response.ok) {
          const data = await response.json()
          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main.toLowerCase()
          })
        } else {
          setWeather({ temp: 30, condition: 'partly-cloudy' })
        }
      } catch (error) {
        setWeather({ temp: 30, condition: 'partly-cloudy' })
      }
    }

    fetchWeather()
  }, [])

  const WeatherIcon = () => {
    switch (weather.condition) {
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-8 h-8" />
      case 'clouds':
      case 'partly-cloudy':
        return <CloudSun className="w-8 h-8" />
      case 'clear':
        return <Sun className="w-8 h-8" />
      default:
        return <Cloud className="w-8 h-8 fill-current" />
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-blue-400">{format(currentDate, "eee")}</h1>
          <div className="border-l-2 border-gray-200 pl-4">
            <div className="text-lg font-bold text-blue-400">{format(currentDate, "MMM d")}</div>
            <div className="text-lg font-bold text-blue-300">{format(currentDate, "yyyy")}</div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-blue-300">
            <WeatherIcon />
            <span className="text-4xl font-light">{weather.temp}°C</span>
          </div>
          <div className="border-l-2 border-gray-200 pl-4 text-right">
            <div className="text-blue-400 font-medium text-lg leading-tight">Metropolitan</div>
            <div className="text-blue-400 font-medium text-lg leading-tight">Medical Center</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-2 flex items-center justify-between shadow-sm">
        <div className="px-4 text-gray-500 font-medium text-sm">60 Patients in Total</div>
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input placeholder="Search for Patients..." className="pl-10 bg-gray-50 border-none rounded-full h-9" />
          </div>
        </div>
        <Button className="bg-blue-400 hover:bg-blue-500 text-white rounded-full px-6 h-9 text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>
    </div>
  )
}
