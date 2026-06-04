import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth() 
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) 
        .single()
      
      setProfile(data)
      setLoading(false)
    }

    if (user) fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Helper function to delete the commas to make it look nicer
  const renderSkillBadges = (skillsString, isOffering) => {
    if (!skillsString || skillsString.trim() === '') {
      return <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>No skills listed yet.</p>
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {skillsString.split(',').map((skill, index) => (
          <span 
            key={index} 
            style={{
              ...badgeBaseStyle,
              backgroundColor: isOffering ? '#DBEAFE' : '#FFEDD5',
              color: isOffering ? '#1E40AF' : '#9A3412'
            }}
          >
            {skill.trim()}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ textAlign: 'center', marginTop: '20vh', color: '#475569' }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      {/* Navigation bar */}
      <nav style={navStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E3A8A', margin: 0 }}>
          Skill<span style={{ color: '#F97316' }}>Swap</span>
        </h1>
        
        {/* Navigation icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Inbox icon link */}
          <Link to="/inbox" style={iconLinkStyle} title="View Inbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span style={iconLabelStyle}>Inbox</span>
          </Link>

          {/* Profile icon link */}
          <Link to="/profile" style={iconLinkStyle} title="Edit Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span style={iconLabelStyle}>Profile</span>
          </Link>

          <button onClick={handleLogout} style={btnSecondary}>Log Out</button>
        </div>
      </nav>

      {/* Main content container */}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
            Welcome back, {profile?.name}! 👋
          </h2>
          <p style={{ color: '#475569', marginTop: '0.5rem' }}>
            Manage your skills and exchange preferences below.
          </p>
        </div>

        {/* Dashboard grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* the left card shows the credit balance but yet ot implemeent*/}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1E3A8A', margin: '0 0 1rem 0' }}>Account Balance</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}><strong>Registered Email:</strong> {profile?.email}</p>
            
            <div style={creditBoxStyle}>
              <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', margin: '0 0 0.5rem 0', fontWeight: '500' }}>
                Available Exchange Credits
              </p>
              <p style={{ fontSize: '3rem', fontWeight: '700', color: '#F97316', margin: 0, lineHeight: '1' }}>
                {profile?.credits}
              </p>
            </div>
          </div>

          {/* Right card shows portfolio */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1E3A8A', margin: 0 }}>My Skills Portfolio</h3>
              <Link to="/profile" style={{ color: '#F97316', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>Edit Skills →</Link>
            </div>

            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
              <strong>Major / Program:</strong> {profile?.major || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Not set yet</span>}
            </p>

            {/* Skills offering block */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={skillTitleStyle}>
                <span style={{ color: '#1E40AF', marginRight: '0.4rem' }}>●</span> Skills I am Offering
              </h4>
              {renderSkillBadges(profile?.offer_skills, true)}
            </div>

            {/* Skills demanding block */}
            <div>
              <h4 style={skillTitleStyle}>
                <span style={{ color: '#9A3412', marginRight: '0.4rem' }}>●</span> Skills I Want to Learn
              </h4>
              {renderSkillBadges(profile?.learn_skills, false)}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

//page styles and shit, following the color scheme we discussed,

const pageStyle = { 
  minHeight: '100vh', 
  backgroundColor: '#F0F4F8', 
  fontFamily: "'Poppins', sans-serif",
  color: '#0F172A' 
}

const navStyle = {
  backgroundColor: '#FFFFFF',
  padding: '1rem 5%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '3rem 5%'
}

const headerStyle = {
  marginBottom: '2.5rem'
}

const cardStyle = { 
  backgroundColor: '#FFFFFF', 
  border: '1px solid #E2E8F0', 
  borderRadius: '16px', 
  padding: '2rem', 
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  display: 'flex',
  flexDirection: 'column'
}

const creditBoxStyle = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '1.5rem',
  alignSelf: 'flex-start',
  width: '100%',
  boxSizing: 'border-box'
}

const iconLinkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#475569',
  fontSize: '0.75rem',
  fontWeight: '500',
  transition: 'color 0.2s ease',
}

const iconLabelStyle = {
  marginTop: '0.25rem',
}

const skillTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#334155',
  margin: '0 0 0.5rem 0'
}

const badgeBaseStyle = {
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '500',
  display: 'inline-block'
}

const btnSecondary = { 
  padding: '0.5rem 1.25rem', 
  backgroundColor: 'transparent', 
  border: '1px solid #CBD5E1', 
  borderRadius: '8px', 
  color: '#475569', 
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: "'Poppins', sans-serif"
}