import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import ProfileCreatePage  from './pages/ProfileCreatePage'
import DashboardPage      from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const { user, profile } = useAuth()

  if (!user) return <Navigate to="/login" />
  if (!profile?.profile_complete) return <Navigate to="/create-profile" />

  return children
}

function ProfileRoute({ children }) {
  const { user, profile } = useAuth()

  if (!user) return <Navigate to="/login" />
  if (profile?.profile_complete) return <Navigate to="/dashboard" />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<LandingPage />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/create-profile"  element={
        <ProfileRoute>
          <ProfileCreatePage />
        </ProfileRoute>
      } />
      <Route path="/dashboard"       element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}