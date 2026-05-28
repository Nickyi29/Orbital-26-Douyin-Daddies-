import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#F97316' }}>
          Welcome to <span style={{ color: '#1E3A8A' }}>SkillSwap</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          The official module-swapping platform for NUS students. Trade the modules you excel at for the help you need.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/signup" style={btnPrimary}>Create Account</Link>
          <Link to="/login" style={btnSecondary}>Log In</Link>
        </div>
      </div>
    </div>
  )
}

const pageStyle = { 
  minHeight: '100vh', 
  background: 'var(--bg)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  textAlign: 'center', 
  padding: '2rem' }

const containerStyle = { 
  maxWidth: '600px' }

  const btnPrimary = {
  color: '#1E3A8A',
  padding: '0.85rem 2rem', 
  background: '#F97316', 
  borderRadius: '8px',
  textDecoration: 'none', fontWeight: 'bold' }

  const btnSecondary = { 
  color: '#1E3A8A',
  padding: '0.85rem 2rem', 
  background: '#F97316',
  border: '1px solid var(--border)', 
  borderRadius: '8px', 
  textDecoration: 'none', 
  fontWeight: 'bold' }

