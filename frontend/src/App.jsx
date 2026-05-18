import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './hooks/useAuthStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import BookAppointmentPage from './pages/BookAppointmentPage'
import DoctorsPage from './pages/DoctorsPage'
import PatientsPage from './pages/PatientsPage'
import AIAssistantPage from './pages/AIAssistantPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => { initAuth() }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="book-appointment" element={<BookAppointmentPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="patients" element={<PrivateRoute roles={['admin','doctor']}><PatientsPage /></PrivateRoute>} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="analytics" element={<PrivateRoute roles={['admin','doctor']}><AnalyticsPage /></PrivateRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
