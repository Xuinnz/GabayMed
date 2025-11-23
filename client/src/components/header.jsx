import { useState, useEffect } from "react"
import { Heart, Bell, Search, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

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
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
            </a>

            <nav className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={isHomeActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                  >
                    Home
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
                className={isPatientsActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
              >
                <a href="/patients">Patient</a>
              </Button>

              <Button 
                variant="ghost" 
                asChild
                className={isAppointmentsActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
              >
                <a href="/appointments">Appointments</a>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="/caring-doctor.png" alt="User" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Profile
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
    </header>
  )
}
