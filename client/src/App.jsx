import { useState, useEffect } from 'react'
import DashboardPage from './pages/dashboard'
import PatientsPage from './pages/patients'
import AppointmentsPage from './pages/appointments'
import CarriersPage from './pages/carriers'
import SettingsPage from './pages/settings'
import ProfilePage from './pages/profile'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/patients') setCurrentPage('patients')
    else if (path === '/appointments') setCurrentPage('appointments')
    else if (path === '/carriers') setCurrentPage('carriers')
    else if (path === '/settings') setCurrentPage('settings')
    else if (path === '/profile') setCurrentPage('profile')
    else setCurrentPage('dashboard')
  }, [])

  // Handle navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/patients') setCurrentPage('patients')
      else if (path === '/appointments') setCurrentPage('appointments')
      else if (path === '/carriers') setCurrentPage('carriers')
      else if (path === '/settings') setCurrentPage('settings')
      else if (path === '/profile') setCurrentPage('profile')
      else setCurrentPage('dashboard')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Intercept link clicks
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault()
        const path = new URL(e.target.href).pathname
        window.history.pushState({}, '', path)
        
        if (path === '/patients') setCurrentPage('patients')
        else if (path === '/appointments') setCurrentPage('appointments')
        else if (path === '/carriers') setCurrentPage('carriers')
        else if (path === '/settings') setCurrentPage('settings')
        else if (path === '/profile') setCurrentPage('profile')
        else setCurrentPage('dashboard')
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
    </div>
  )
}

export default App
