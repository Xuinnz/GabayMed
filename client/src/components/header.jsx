import { useState, useEffect } from "react"
import { Heart, Bell, Search, User, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { GlobalSearch } from "@/components/global-search"

export function Header() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Get current page from URL
    const path = window.location.pathname
    if (path === '/patients') setCurrentPage('patients')
    else if (path === '/appointments') setCurrentPage('appointments')
    else if (path === '/carriers') setCurrentPage('carriers')
    else if (path === '/settings') setCurrentPage('settings')
    else setCurrentPage('dashboard')

    // Listen for navigation changes
    const handleLocationChange = () => {
      const path = window.location.pathname
      if (path === '/patients') setCurrentPage('patients')
      else if (path === '/appointments') setCurrentPage('appointments')
      else if (path === '/carriers') setCurrentPage('carriers')
      else if (path === '/settings') setCurrentPage('settings')
      else setCurrentPage('dashboard')
    }

    window.addEventListener('popstate', handleLocationChange)
    
    // Also listen for custom event from App.jsx navigation
    const observer = new MutationObserver(handleLocationChange)
    observer.observe(document, { subtree: true, childList: true })

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      observer.disconnect()
    }
  }, [])

  const isHomeActive = currentPage === 'dashboard' || currentPage === 'carriers'
  const isPatientsActive = currentPage === 'patients'
  const isAppointmentsActive = currentPage === 'appointments'

  return (
    <header className="py-6">
      <div className="container mx-auto px-6">
        <div className="bg-[#FAFEFF] rounded-full shadow-sm border px-6 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center">
              <img src="/src/assets/Logo.svg" alt="GabayMed" className="w-10 h-10" />
            </a>

            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      style={isHomeActive ? { background: 'linear-gradient(180deg, #A8D5FF 0%, #7AB8E8 100%)' } : {background: '#F4F4F4'}}
                      className={`rounded-full px-6 ${isHomeActive ? "text-white hover:opacity-90" : ""}`}
                    >
                      Home
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <a href="/">Overview</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/carriers">Carrier</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="ghost" 
                  asChild
                  style={isPatientsActive ? { background: 'linear-gradient(180deg, #A8D5FF 0%, #7AB8E8 100%)' } : {background: '#F4F4F4'}}
                  className={`rounded-full px-6 ${isPatientsActive ? "text-white hover:opacity-90" : ""}`}
                >
                  <a href="/patients">Patient</a>
                </Button>

                <Button 
                  variant="ghost" 
                  asChild
                  style={isAppointmentsActive ? { background: 'linear-gradient(180deg, #A8D5FF 0%, #7AB8E8 100%)' } : {background: '#F4F4F4'}}
                  className={`rounded-full px-6 ${isAppointmentsActive ? "text-white hover:opacity-90" : ""}`}
                >
                  <a href="/appointments">Appointments</a>
                </Button>
              </nav>

              <GlobalSearch />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="w-5 h-5" />
                </Button>
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/caring-doctor.png" alt="User" />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Metropolitan Medical Center
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
