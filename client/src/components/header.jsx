import { Heart, Bell, Settings, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
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
                  <Button variant="ghost" className="bg-primary/10 text-primary hover:bg-primary/20">
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

              <Button variant="ghost" asChild>
                <a href="/patients">Patient</a>
              </Button>

              <Button variant="ghost" asChild>
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

            <Button variant="ghost" size="icon" asChild>
              <a href="/settings">
                <Settings className="w-5 h-5" />
              </a>
            </Button>

            <Avatar>
              <AvatarImage src="/caring-doctor.png" alt="User" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
