import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError(loginError.message)
      return
    }
    
    navigate('/dashboard')
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#1E3A8A', fontWeight: '600' }}>Welcome Back</h2>
        {error && <p style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>NUS Email</label>
            <input style={inputStyle} type="email" required onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" required onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" style={btnStyle}>Log In</button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#475569' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#F97316', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

// this the light mode if we have time we can add a dark mode toggle 
const pageStyle = { 
  minHeight: '100vh', 
  backgroundColor: '#F0F4F8', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '2rem', // large spacing of 32px
  fontFamily: "'Poppins', sans-serif",
  color: '#0F172A' 
}


const cardStyle = { 
  width: '100%', 
  maxWidth: '420px', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #E2E8F0', 
  borderRadius: '16px', 
  padding: '2.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
}

const fieldStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.5rem', // small spacing of 8px
  marginBottom: '1.5rem' 
}

// use this colour for the rest also
const labelStyle = { 
  fontSize: '0.875rem', 
  fontWeight: '500',
  color: '#1E3A8A' 
}

const inputStyle = { 
  padding: '0.75rem 1rem', 
  borderRadius: '8px', 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #CBD5E1', 
  color: '#0F172A', 
  fontSize: '0.95rem', 
  outline: 'none', 
  fontFamily: "'Poppins', sans-serif" 
}

const btnStyle = { 
  width: '100%', 
  padding: '0.85rem', // medium spacing
  backgroundColor: '#F97316', //this also
  border: 'none', 
  borderRadius: '8px', 
  color: '#FFFFFF', 
  fontSize: '1rem', 
  fontWeight: '600',
  cursor: 'pointer', 
  marginTop: '0.5rem', 
  fontFamily: "'Poppins', sans-serif" 
}