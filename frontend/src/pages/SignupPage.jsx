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

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Join SkillSwap</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
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
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }
const cardStyle = { width: '100%', maxWidth: '420px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem' }
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }
const labelStyle = { fontSize: '0.8rem', color: 'var(--muted)' }
const inputStyle = { padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }
const btnStyle = { width: '100%', padding: '0.85rem', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', marginTop: '1rem' }