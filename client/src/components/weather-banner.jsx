import { CloudSun } from "lucide-react"

export function WeatherBanner() {
  return (
    <div className="px-6 pb-6">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-2">
        {/* Date */}
        <div className="flex items-center gap-4 text-blue-400">
          <h1 className="text-5xl font-bold tracking-tight">Mon</h1>
          <div className="flex flex-col border-l-2 border-blue-200 pl-4">
            <span className="text-lg font-bold leading-none">Nov 24</span>
            <span className="text-lg font-bold leading-none opacity-80">2025</span>
          </div>
        </div>

        {/* Weather & Location */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-400">
            <CloudSun className="h-10 w-10" />
            <span className="text-4xl font-bold">29°C</span>
          </div>
          <div className="border-l-2 border-blue-200 pl-6 text-right">
            <div className="text-xl font-bold text-blue-400">Metropolitan</div>
            <div className="text-xl font-bold text-blue-400">Medical Center</div>
          </div>
        </div>
      </div>
    </div>
  )
}
