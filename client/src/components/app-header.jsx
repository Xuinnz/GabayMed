import { Bell, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GlobalSearch } from "@/components/global-search"
import { cn } from "@/lib/utils"

export function AppHeader({ page = "home" }) {
  return (
    <header className="flex items-center justify-between py-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 p-2 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-blue-500"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
          <a
            href="/"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              page === "home" ? "text-white bg-blue-400 shadow-sm" : "text-gray-600 hover:text-gray-900",
            )}
          >
            Home
          </a>
          <a
            href="/patients"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              page === "patients" ? "text-white bg-blue-400 shadow-sm" : "text-gray-600 hover:text-gray-900",
            )}
          >
            Patient
          </a>
          <a
            href="/appointments"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              page === "appointments" ? "text-white bg-blue-400 shadow-sm" : "text-gray-600 hover:text-gray-900",
            )}
          >
            Appointments
          </a>
        </div>

        <GlobalSearch />
      </nav>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <Settings className="w-5 h-5" />
        </button>
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
