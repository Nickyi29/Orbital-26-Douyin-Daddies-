import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function CreditsPage() {
  const { user } = useAuth()
  const [profile,      setProfile]      = useState(null)
  const [transactions, setTransactions] = useState([])
  const [sessions,     setSessions]     = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  const fetchAll = async () => {
    const [profileRes, txRes, sessionRes] = await Promise.all([
      supabase.from('profiles').select('credits, name').eq('id', user.id).single(),
      supabase.from('credit_transactions').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('sessions').select('*')
        .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order('created_at', { ascending: false }),
    ])
    setProfile(profileRes.data)
    setTransactions(txRes.data || [])
    setSessions(sessionRes.data || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={pageStyle}>
      <p style={{ textAlign: 'center', marginTop: '20vh', color: '#475569' }}>
        Loading...
      </p>
    </div>
  )

  return (
    <div style={pageStyle}>

      <nav style={navStyle}>
        <Link to="/dashboard"
          style={{ fontWeight: 700, fontSize: '1.3rem', textDecoration: 'none', color: '#1E3A8A' }}>
          Skill<span style={{ color: '#F97316' }}>Swap</span>
        </Link>
        <Link to="/dashboard"
          style={{ color: '#475569', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={containerStyle}>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
          Credits
        </h2>
        <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Earn credits by teaching sessions. Spend them to learn from others.
        </p>

        {/* Balance card */}
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase',
                          letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.4rem' }}>
                Current Balance
              </p>
              <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#F97316',
                          lineHeight: 1, margin: 0 }}>
                {profile?.credits ?? 0}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.3rem' }}>
                credits available
              </p>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem',
                          border: '1px solid #E2E8F0', minWidth: '220px' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>
                💰 Each session costs <strong style={{ color: '#DC2626' }}>5 credits</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0' }}>
                🎓 Each session earns <strong style={{ color: '#16A34A' }}>5 credits</strong>
              </p>
              <Link to="/inbox" style={{
                display: 'block', textAlign: 'center', padding: '0.6rem',
                background: '#1E3A8A', color: 'white', borderRadius: '8px',
                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none'
              }}>
                Go to Inbox →
              </Link>
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '2rem' }}>

          {/* Transaction history */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Transaction History</h3>
            {transactions.length === 0 ? (
              <div style={emptyBoxStyle}>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                  No transactions yet.
                </p>
                <p style={{ color: '#CBD5E1', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                  Complete a session to see your history here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', background: '#F8FAFC',
                    borderRadius: '8px', border: '1px solid #E2E8F0'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                        {tx.description}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>
                        {new Date(tx.created_at).toLocaleDateString('en-SG', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '1.1rem', fontWeight: 800,
                      color: tx.amount > 0 ? '#16A34A' : '#DC2626',
                      minWidth: '48px', textAlign: 'right'
                    }}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session history */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Session History</h3>
            {sessions.length === 0 ? (
              <div style={emptyBoxStyle}>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                  No sessions yet.
                </p>
                <p style={{ color: '#CBD5E1', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                  Request a session from your Connected tab in the Inbox.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sessions.map(session => {
                  const isTeacher = session.teacher_id === user.id
                  const sc = {
                    completed: { bg: '#DCFCE7', text: '#16A34A' },
                    pending:   { bg: '#FEF9C3', text: '#B45309' },
                    cancelled: { bg: '#FEE2E2', text: '#DC2626' },
                  }[session.status] || { bg: '#FEF9C3', text: '#B45309' }

                  return (
                    <div key={session.id} style={{
                      padding: '0.85rem', background: '#F8FAFC',
                      borderRadius: '8px', border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '0.35rem' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {session.skill_name}
                        </p>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          padding: '0.2rem 0.6rem', borderRadius: '99px',
                          background: sc.bg, color: sc.text, textTransform: 'capitalize'
                        }}>
                          {session.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                        {isTeacher ? '🎓 You taught' : '📚 You learned'}
                        {' · '}{session.credits_used} credits
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const pageStyle      = { minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: "'Poppins', sans-serif", color: '#0F172A' }
const navStyle       = { backgroundColor: '#FFFFFF', padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }
const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 5%' }
const cardStyle      = { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }
const cardTitleStyle = { fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 1.25rem 0' }
const emptyBoxStyle  = { background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }