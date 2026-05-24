import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }) {
const { user } = useAuth()
return user ? children : <Navigate to='/login' />
}

function AppRoutes() {
return (
<Routes>
<Route path='/' element={<LandingPage />} />
<Route path='/login' element={<LoginPage />} />
<Route path='/signup' element={<SignupPage />} />
<Route path='/dashboard' element={
<ProtectedRoute><DashboardPage /></ProtectedRoute>
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
