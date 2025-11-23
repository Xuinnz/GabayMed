import { Cloud } from "lucide-react"

export function DateDisplay() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-4">
        <h1 className="text-6xl font-light text-primary/40">Mon</h1>
        <div className="text-muted-foreground">
          <div className="text-sm">Nov 24</div>
          <div className="text-sm">2025</div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Cloud className="w-8 h-8 text-primary/60" />
          <span className="text-4xl font-light text-primary/60">29°C</span>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Metropolitan</div>
          <div className="text-sm font-medium">Medical Center</div>
        </div>
      </div>
    </div>
  )
}
