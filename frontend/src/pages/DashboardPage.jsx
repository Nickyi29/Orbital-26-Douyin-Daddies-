import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, skillsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('skills').select('*').eq('user_id', user.id)
      ])
      setProfile(profileRes.data)
      setSkills(skillsRes.data || [])
      setLoading(false)
    }
    if (user) fetchData()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const offeringSkills = skills.filter(s => s.type === 'offering')
  const learningSkills = skills.filter(s => s.type === 'learning')

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ textAlign: 'center', marginTop: '20vh', color: '#475569' }}>
          Loading your dashboard...
        </p>
      </div>
    )
  }

  return (
    <div style={pageStyle}>

      {/* Navbar */}
      <nav style={navStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E3A8A', margin: 0 }}>
          Skill<span style={{ color: '#F97316' }}>Swap</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

          {/* Inbox */}
          <Link to="/inbox" style={iconLinkStyle} title="View Inbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span style={iconLabelStyle}>Inbox</span>
          </Link>

          {/* Credits */}
          <Link to="/credits" style={iconLinkStyle} title="View Credits">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <span style={iconLabelStyle}>Credits</span>
          </Link>

          {/* Profile */}
          <Link to="/profile" style={iconLinkStyle} title="Edit Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={iconLabelStyle}>Profile</span>
          </Link>

          <button onClick={handleLogout} style={btnSecondary}>Log Out</button>
        </div>
      </nav>

      {/* Main content */}
      <div style={containerStyle}>

        <div style={headerStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
            Welcome back, {profile?.name}! 👋
          </h2>
          <p style={{ color: '#475569', marginTop: '0.5rem' }}>
            Manage your skills and exchange preferences below.
          </p>
        </div>

        {/* Top row */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '2rem', marginBottom: '2rem' }}>

          {/* Account Balance */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Account Balance</h3>
            <p style={infoTextStyle}><strong>Email:</strong> {profile?.email}</p>
            <p style={infoTextStyle}>
              <strong>Program:</strong>{' '}
              {profile?.course || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Not set</span>}
            </p>
            <p style={infoTextStyle}>
              <strong>Year:</strong>{' '}
              {profile?.year_of_study || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Not set</span>}
            </p>
            <p style={infoTextStyle}>
              <strong>Telegram:</strong>{' '}
              {profile?.telegram_handle || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Not set</span>}
            </p>

            <div style={creditBoxStyle}>
              <p style={{ fontSize: '0.85rem', textTransform: 'uppercase',
                          letterSpacing: '1px', color: '#475569',
                          margin: '0 0 0.5rem 0', fontWeight: '500' }}>
                Available Exchange Credits
              </p>
              <p style={{ fontSize: '3rem', fontWeight: '700',
                          color: '#F97316', margin: 0, lineHeight: '1' }}>
                {profile?.credits ?? 0}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8',
                          marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                credits available
              </p>
              <Link to="/credits" style={{
                fontSize: '0.85rem', color: '#1E3A8A', fontWeight: 600,
                textDecoration: 'none', display: 'inline-block',
                padding: '0.4rem 0.85rem', background: '#EFF6FF',
                borderRadius: '6px', border: '1px solid #BFDBFE'
              }}>
                View transaction history →
              </Link>
            </div>
          </div>

          {/* Bio */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>About Me</h3>
            <p style={{ ...infoTextStyle, lineHeight: 1.7 }}>
              {profile?.bio || (
                <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>
                  No bio added yet.
                </span>
              )}
            </p>
            <Link to="/profile"
              style={{ color: '#F97316', fontSize: '0.9rem', fontWeight: '600',
                       textDecoration: 'none', marginTop: 'auto', paddingTop: '1rem' }}>
              Edit Profile →
            </Link>
          </div>

        </div>

        {/* Skills row */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '2rem' }}>

          {/* Offering */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <span style={{ color: '#1E40AF', marginRight: '0.4rem' }}>●</span>
              Skills I am Offering
              <span style={{ fontSize: '0.8rem', color: '#94A3B8',
                             fontWeight: 400, marginLeft: '0.5rem' }}>
                ({offeringSkills.length})
              </span>
            </h3>
            {offeringSkills.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No skills listed yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {offeringSkills.map(skill => (
                  <span key={skill.id} style={offeringBadgeStyle}>{skill.name}</span>
                ))}
              </div>
            )}
            <Link to="/profile"
              style={{ color: '#F97316', fontSize: '0.85rem', fontWeight: '600',
                       textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
              Edit Skills →
            </Link>
          </div>

          {/* Learning */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <span style={{ color: '#9A3412', marginRight: '0.4rem' }}>●</span>
              Skills I Want to Learn
              <span style={{ fontSize: '0.8rem', color: '#94A3B8',
                             fontWeight: 400, marginLeft: '0.5rem' }}>
                ({learningSkills.length})
              </span>
            </h3>
            {learningSkills.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No skills listed yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {learningSkills.map(skill => (
                  <span key={skill.id} style={learningBadgeStyle}>{skill.name}</span>
                ))}
              </div>
            )}
            <Link to="/profile"
              style={{ color: '#F97316', fontSize: '0.85rem', fontWeight: '600',
                       textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
              Edit Skills →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: '100vh', backgroundColor: '#F0F4F8',
  fontFamily: "'Poppins', sans-serif", color: '#0F172A'
}
const navStyle = {
  backgroundColor: '#FFFFFF', padding: '1rem 5%',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
}
const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%' }
const headerStyle    = { marginBottom: '2.5rem' }
const cardStyle = {
  backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '16px', padding: '2rem',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  display: 'flex', flexDirection: 'column', gap: '0.75rem'
}
const cardTitleStyle  = { fontSize: '1.1rem', fontWeight: '700', color: '#1E3A8A', margin: 0 }
const infoTextStyle   = { color: '#475569', fontSize: '0.95rem', margin: 0 }
const creditBoxStyle  = {
  backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '12px', padding: '1.5rem', marginTop: '0.5rem'
}
const iconLinkStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  textDecoration: 'none', color: '#475569', fontSize: '0.75rem', fontWeight: '500',
}
const iconLabelStyle  = { marginTop: '0.25rem' }
const offeringBadgeStyle = {
  padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem',
  fontWeight: '500', backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'inline-block'
}
const learningBadgeStyle = {
  padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem',
  fontWeight: '500', backgroundColor: '#FFEDD5', color: '#9A3412', display: 'inline-block'
}
const btnSecondary = {
  padding: '0.5rem 1.25rem', backgroundColor: 'transparent',
  border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569',
  fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
  fontFamily: "'Poppins', sans-serif"
}