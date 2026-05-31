import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)


    if (!form.email.endsWith('@u.nus.edu') && !form.email.endsWith('@nus.edu.sg')) {
      setError('Please use your NUS email to join SkillSwap')
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      name: form.name,
      email: form.email,
      credits: 0
    })

    navigate('/dashboard')
  }
//use these settings 
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#1E3A8A', fontWeight: '600' }}>Join SkillSwap</h2>
        {error && <p style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} type="text" required onChange={(e) => setForm({...form, name: e.target.value})} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>NUS Email</label>
            <input style={inputStyle} type="email" required onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" required onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" style={btnStyle}>Sign Up</button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#475569' }}>
          Already have an account? <Link to="/login" style={{ color: '#F97316', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}



const pageStyle = { 
  minHeight: '100vh', 
  backgroundColor: '#F0F4F8', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '2rem', 
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
  gap: '0.5rem', 
  marginBottom: '1.5rem' 
}

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
  padding: '0.85rem', 
  backgroundColor: '#F97316', 
  border: 'none', 
  borderRadius: '8px', 
  color: '#FFFFFF', 
  fontSize: '1rem', 
  fontWeight: '600',
  cursor: 'pointer', 
  marginTop: '0.5rem', 
  fontFamily: "'Poppins', sans-serif" 
}