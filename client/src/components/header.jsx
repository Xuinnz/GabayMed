"use client"

import { Bell, ChevronDown, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = window.location.pathname

  const navItems = [
    { name: "Home", href: "/", hasDropdown: true },
    { name: "Patient", href: "/patients", hasDropdown: false },
    { name: "Appointments", href: "/appointments", hasDropdown: false },
  ]

  return (
    <header className="px-6 py-4">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full bg-white px-6 shadow-sm">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 rounded-full bg-gray-50/50 p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 rounded-full px-6 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-400 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
                )}
              </a>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200">
            <Search className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Search</span>
          </Button>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
              <img src="/caring-doctor.png" alt="Profile" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
