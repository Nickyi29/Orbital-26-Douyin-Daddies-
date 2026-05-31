import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>
          <span style={{ color: '#F97316' }}>Skill</span>
          <span style={{ color: '#1E3A8A' }}>Swap</span>
        </Link>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/"          style={navLink}>Homepage</Link>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          <Link to="/login"     style={navLink}>Log In</Link>
          <Link to="/signup"    style={navBtn}>Sign Up</Link>
        </div>
      </nav>

      <div style={heroStyle}>
        <div style={containerStyle}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#F97316' }}>
            Welcome to <span style={{ color: '#1E3A8A' }}>SkillSwap</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '2rem' }}>
            The skill-swapping platform for NUS students. Trade the skills you excel at for the help you need.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signup" style={btnPrimary}>Create Account</Link>
            <Link to="/login"  style={btnSecondary}>Log In</Link>
          </div>
        </div>
      </div>

    </div>
  )
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2.5rem',
  background: '#F0F4FF',
  borderBottom: '1px solid #d2dfef',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}

const logoStyle = {
  fontSize: '1.4rem',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const navLink = {
  color: '#1E3A8A',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: '500',
}

const navBtn = {
  color: 'white',
  background: '#F97316',
  padding: '0.5rem 1.25rem',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 'bold',
}

const heroStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '6rem 2rem',
}

const containerStyle = {
  maxWidth: '600px',
}

const btnPrimary = {
  color: 'white',
  padding: '0.85rem 2rem',
  background: '#F97316',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
}

const btnSecondary = {
  color: '#F97316',
  padding: '0.85rem 2rem',
  background: 'transparent',
  border: '2px solid #F97316',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
}