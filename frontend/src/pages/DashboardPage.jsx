import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth() 
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) 
        .single()
      
      setProfile(data)
    }

    if (user) fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>My Dashboard</h2>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>

        {profile ? (
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Welcome, {profile.name}!</h3>
            <p style={{ color: 'var(--muted)' }}>Email: {profile.email}</p>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', display: 'inline-block' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Exchange Credits</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{profile.credits}</p>
            </div>
          </div>
        ) : (
          <p>Loading your profile...</p>
        )}
      </div>
    </div>
  )
}