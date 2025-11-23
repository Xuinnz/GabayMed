import { useState, useEffect } from 'react'
import './App.css'
import DashboardPage from './pages/dashboard'
import PatientsPage from './pages/patients'
import AppointmentsPage from './pages/appointments'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/patients') setCurrentPage('patients')
    else if (path === '/appointments') setCurrentPage('appointments')
    else setCurrentPage('dashboard')
  }, [])

  // Handle navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/patients') setCurrentPage('patients')
      else if (path === '/appointments') setCurrentPage('appointments')
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
        else setCurrentPage('dashboard')
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'patients' && <PatientsPage />}
      {currentPage === 'appointments' && <AppointmentsPage />}
    </div>
  )
}

export default App
