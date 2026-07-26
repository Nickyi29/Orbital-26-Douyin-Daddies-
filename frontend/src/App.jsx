import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfileCreatePage from './pages/ProfileCreatePage'
import DashboardPage from './pages/DashboardPage'
import InboxPage from './pages/InboxPage'
import CreditsPage from './pages/CreditsPage'
import ReviewPage from './pages/ReviewPage'


function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div style={loadingStyle}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (profile && profile.profile_complete === false) return <Navigate to="/create-profile" />
  if (!profile) return <div style={loadingStyle}>Loading...</div>

  return children
}

function ProfileRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div style={loadingStyle}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (profile && profile.profile_complete === true) return <Navigate to="/dashboard" />

  return children
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
       
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

  
          <Route path="/create-profile" element={
            <ProfileRoute>
              <ProfileCreatePage />
            </ProfileRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileCreatePage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/inbox" element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          } />

          <Route path="/credits" element={
            <ProtectedRoute>
              <CreditsPage />
            </ProtectedRoute>
          } />

          <Route path="/review/:sessionId" element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

const loadingStyle = {
  minHeight: '100vh',
  background: '#F8FBFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748B',
  fontSize: '0.95rem',
}