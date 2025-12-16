import { useState, useEffect } from 'react'
import DashboardPage from './pages/dashboard'
import PatientsPage from './pages/patients'
import AppointmentsPage from './pages/appointments'
import CarriersPage from './pages/carriers'
import SettingsPage from './pages/settings'
import ProfilePage from './pages/profile'
import { Messages } from './pages/messages'
import { Notifications } from './pages/notifications'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const getPageFromPath = (path) => {
    if (path === '/patients') return 'patients'
    if (path === '/appointments') return 'appointments'
    if (path === '/carriers') return 'carriers'
    if (path === '/settings') return 'settings'
    if (path === '/profile') return 'profile'
    if (path === '/messages') return 'messages'
    if (path === '/notifications') return 'notifications'
    if (path === '/login') return 'login'
    if (path === '/signup') return 'signup'
    return 'dashboard'
  }

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname
    setCurrentPage(getPageFromPath(path))
  }, [])

  // Handle navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      setCurrentPage(getPageFromPath(path))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a')
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        e.preventDefault()
        const path = new URL(anchor.href).pathname
        window.history.pushState({}, '', path)
        setCurrentPage(getPageFromPath(path))
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'patients' && <PatientsPage />}
      {currentPage === 'appointments' && <AppointmentsPage />}
      {currentPage === 'carriers' && <CarriersPage />}
      {currentPage === 'settings' && <SettingsPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'messages' && <Messages />}
      {currentPage === 'notifications' && <Notifications />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'signup' && <SignupPage />}
    </div>
  )
}

export default App
