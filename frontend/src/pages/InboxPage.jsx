import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { calculateMatchScore } from '../lib/matching'
import ReportModal from '../components/ReportModal'

const CATEGORIES = ['All', 'Academic', 'Creative', 'Lifestyle', 'Language']

export default function InboxPage() {
  const { user } = useAuth()

  const [tab, setTab]                               = useState('discover')
  const [allMatches, setAllMatches]                 = useState([])
  const [requests, setRequests]                     = useState([])
  const [connected, setConnected]                   = useState([])
  const [category, setCategory]                     = useState('All')
  const [loading, setLoading]                       = useState(true)
  const [sentIds, setSentIds]                       = useState([])
  const [currentUserCredits, setCurrentUserCredits] = useState(0)

  useEffect(() => {
    if (user) loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    setCurrentUserCredits(myProfile?.credits ?? 0)

    await Promise.all([
      loadDiscoverMatches(),
      loadRequests(),
      loadConnected(),
    ])
    setLoading(false)
  }

  const loadDiscoverMatches = async () => {
    const [mySkillsRes, myProfileRes] = await Promise.all([
      supabase.from('skills').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    const mySkills  = mySkillsRes.data  || []
    const myProfile = myProfileRes.data

    const { data: existingMatches } = await supabase
      .from('matches')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    const alreadyMatchedIds = existingMatches?.flatMap(m => [
      m.sender_id, m.receiver_id
    ]).filter(id => id !== user.id) || []

    setSentIds(alreadyMatchedIds)

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_complete', true)
      .neq('id', user.id)

    if (!allProfiles || allProfiles.length === 0) return

    const candidateProfiles = allProfiles
      .filter(p => !alreadyMatchedIds.includes(p.id))
      .filter(p => !p.is_flagged)                        // ← Step 3: exclude flagged users

    if (candidateProfiles.length === 0) return

    const candidateIds = candidateProfiles.map(p => p.id)
    const { data: allSkills } = await supabase
      .from('skills')
      .select('*')
      .in('user_id', candidateIds)

    const scored = candidateProfiles
      .map(candidate => {
        const candidateSkills = (allSkills || [])
          .filter(s => s.user_id === candidate.id)

        const result = calculateMatchScore(
          myProfile, mySkills,
          candidate, candidateSkills
        )

        if (!result || result.total < 15) return null

        return {
          ...candidate,
          score:         result.total,
          breakdown:     result.breakdown,
          matchedSkills: result.matchedSkills,
          skills:        candidateSkills,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    setAllMatches(scored)
  }

  const loadRequests = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, sender:sender_id(*)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (!data) return

    const senderIds = data.map(m => m.sender_id)
    const { data: skills } = await supabase
      .from('skills')
      .select('*')
      .in('user_id', senderIds)

    const enriched = data.map(match => ({
      ...match,
      profile: match.sender,
      skills:  (skills || []).filter(s => s.user_id === match.sender_id),
    }))

    setRequests(enriched)
  }

  const loadConnected = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, sender:sender_id(*), receiver:receiver_id(*)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (!data) return

    const enriched = data.map(match => {
      const otherProfile = match.sender_id === user.id
        ? match.receiver
        : match.sender
      return { matchId: match.id, score: match.score, profile: otherProfile }
    })

    setConnected(enriched)
  }

  const handleConnect = async (candidateId, score) => {
    const { error } = await supabase
      .from('matches')
      .insert({ sender_id: user.id, receiver_id: candidateId, score, status: 'pending' })

    if (error) { console.error('Connect error:', error.message); return }
    setAllMatches(prev => prev.filter(m => m.id !== candidateId))
    setSentIds(prev => [...prev, candidateId])
  }

  const handleAccept = async (matchId) => {
    const { error } = await supabase
      .from('matches').update({ status: 'accepted' }).eq('id', matchId)
    if (error) { console.error('Accept error:', error.message); return }
    await loadAll()
  }

  const handleDecline = async (matchId) => {
    const { error } = await supabase
      .from('matches').update({ status: 'declined' }).eq('id', matchId)
    if (error) { console.error('Decline error:', error.message); return }
    setRequests(prev => prev.filter(r => r.id !== matchId))
  }

  const filteredMatches = category === 'All'
    ? allMatches
    : allMatches.filter(match =>
        match.skills.some(s => s.category === category && s.type === 'offering')
      )

  if (loading) return (
    <div style={pageStyle}>
      <p style={{ textAlign: 'center', marginTop: '20vh', color: '#475569' }}>
        Finding your matches...
      </p>
    </div>
  )

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700,
                     color: '#1E3A8A', marginBottom: '1.5rem' }}>
          Inbox
        </h1>

        {/* Tabs */}
        <div style={tabBarStyle}>
          <button onClick={() => setTab('discover')}
            style={tab === 'discover' ? activeTabStyle : tabStyle}>
            Discover
            <span style={countBadge}>{allMatches.length}</span>
          </button>
          <button onClick={() => setTab('requests')}
            style={tab === 'requests' ? activeTabStyle : tabStyle}>
            Requests
            {requests.length > 0 && (
              <span style={{ ...countBadge, background: '#F97316' }}>
                {requests.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('connected')}
            style={tab === 'connected' ? activeTabStyle : tabStyle}>
            Connected
            <span style={countBadge}>{connected.length}</span>
          </button>
        </div>

        {/* Discover tab */}
        {tab === 'discover' && (
          <div>
            <div style={filterRowStyle}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={category === cat ? activeCategoryStyle : categoryStyle}>
                  {cat}
                </button>
              ))}
            </div>
            {filteredMatches.length === 0 ? (
              <EmptyState
                message="No matches found"
                sub="Try adding more skills to your profile to improve your matches."
              />
            ) : (
              <div style={gridStyle}>
                {filteredMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    profile={match}
                    score={match.score}
                    breakdown={match.breakdown}
                    matchedSkills={match.matchedSkills}
                    skills={match.skills}
                    showTelegram={false}
                    showReport={true}
                    actions={
                      <button
                        onClick={() => handleConnect(match.id, match.score)}
                        style={connectBtnStyle}>
                        Connect →
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <EmptyState
                message="No pending requests"
                sub="When someone sends you a connect request it will appear here."
              />
            ) : (
              <div style={gridStyle}>
                {requests.map(req => (
                  <MatchCard
                    key={req.id}
                    profile={req.profile}
                    score={req.score}
                    skills={req.skills}
                    showTelegram={false}
                    showReport={true}
                    actions={
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => handleAccept(req.id)} style={acceptBtnStyle}>
                          Accept
                        </button>
                        <button onClick={() => handleDecline(req.id)} style={declineBtnStyle}>
                          Decline
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connected tab */}
        {tab === 'connected' && (
          <div>
            {connected.length === 0 ? (
              <EmptyState
                message="No connections yet"
                sub="Accept requests or send connects to start exchanging skills."
              />
            ) : (
              <div style={gridStyle}>
                {connected.map(conn => (
                  <MatchCard
                    key={conn.matchId}
                    profile={conn.profile}
                    score={conn.score}
                    skills={[]}
                    showTelegram={true}
                    showReport={true}
                    actions={
                      <RequestSessionButton
                        teacherId={conn.profile.id}
                        teacherName={conn.profile.name}
                        currentUserCredits={currentUserCredits}
                      />
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function MatchCard({
  profile, score, breakdown, matchedSkills,
  skills, showTelegram, showReport, actions
}) {
  const offeringSkills = skills?.filter(s => s.type === 'offering') || []
  const scoreColor     = score >= 70 ? '#16a34a' : score >= 40 ? '#F97316' : '#94A3B8'

  // Report modal state — lives inside the card
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <div style={cardStyle}>

      {/* Name + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>
            {profile?.name}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            {profile?.course} · {profile?.year_of_study}
          </p>
        </div>
        {score && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8',
                          fontWeight: 600, letterSpacing: '0.05em' }}>
              MATCH
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      {profile?.bio && (
        <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
          {profile.bio.length > 100 ? profile.bio.slice(0, 100) + '...' : profile.bio}
        </p>
      )}

      {/* Matched skills */}
      {matchedSkills?.theyCanTeachMe?.length > 0 && (
        <div>
          <p style={skillLabelStyle}>Can teach you</p>
          <div style={badgeRowStyle}>
            {matchedSkills.theyCanTeachMe.map(s => (
              <span key={s} style={offerBadgeStyle}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {matchedSkills?.iCanTeachThem?.length > 0 && (
        <div>
          <p style={skillLabelStyle}>Wants to learn from you</p>
          <div style={badgeRowStyle}>
            {matchedSkills.iCanTeachThem.map(s => (
              <span key={s} style={learnBadgeStyle}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {!matchedSkills && offeringSkills.length > 0 && (
        <div>
          <p style={skillLabelStyle}>Offering</p>
          <div style={badgeRowStyle}>
            {offeringSkills.map(s => (
              <span key={s.id} style={offerBadgeStyle}>{s.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Telegram — only in Connected tab */}
      {showTelegram && profile?.telegram_handle && (
        <div style={telegramStyle}>
          <span style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: 600 }}>
            📱 Telegram:
          </span>
          <span style={{ fontSize: '0.85rem', color: '#F97316',
                         fontWeight: 700, marginLeft: '0.4rem' }}>
            {profile.telegram_handle}
          </span>
        </div>
      )}

      {/* Score breakdown */}
      {breakdown && (
        <div style={breakdownStyle}>
          <span>Skill {breakdown.skill}/50</span>
          <span>Category {breakdown.category}/20</span>
          <span>Rating {breakdown.rating}/20</span>
          <span>Profile {breakdown.completeness}/10</span>
        </div>
      )}

      {/* Action buttons */}
      {actions && <div style={{ marginTop: 'auto' }}>{actions}</div>}

      {/* Report button — small, at the very bottom */}
      {showReport && (
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.6rem', marginTop: '0.25rem' }}>
          <button
            onClick={() => setShowReportModal(true)}
            style={reportBtnStyle}>
            🚩 Report user
          </button>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <ReportModal
          reportedId={profile?.id}
          reportedName={profile?.name}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  )
}

function RequestSessionButton({ teacherId, teacherName, currentUserCredits }) {
  const { user } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [skill, setSkill]       = useState('')
  const [showForm, setShowForm] = useState(false)

  const COST = 5

  const handleRequest = async () => {
    if (!skill.trim()) { setError('Please enter a skill'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('sessions')
      .insert({
        teacher_id:   teacherId,
        learner_id:   user.id,
        skill_name:   skill,
        credits_used: COST,
        status:       'pending'
      })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setShowForm(false)
  }

  if (success) return (
    <p style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
      ✓ Session requested! View it on the Credits page.
    </p>
  )

  if (currentUserCredits < COST) return (
    <div style={{ background: '#FEF9C3', border: '1px solid #FDE047',
                  borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
      <p style={{ color: '#B45309', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
        Need {COST} credits to request a session
      </p>
      <p style={{ color: '#92400E', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>
        You have {currentUserCredits} — teach a session to earn more
      </p>
    </div>
  )

  if (!showForm) return (
    <button onClick={() => setShowForm(true)} style={sessionBtnStyle}>
      Request Session ({COST} credits)
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
        What do you want to learn from {teacherName}?
      </p>
      <input
        value={skill}
        onChange={e => setSkill(e.target.value)}
        placeholder="e.g. Python basics, Guitar chords..."
        style={{
          padding: '0.6rem 0.75rem', borderRadius: '8px',
          border: '1px solid #E2E8F0', fontSize: '0.85rem',
          fontFamily: "'Poppins', sans-serif", outline: 'none',
          width: '100%', boxSizing: 'border-box'
        }}
      />
      {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleRequest} disabled={loading} style={{
          flex: 1, padding: '0.6rem',
          background: loading ? '#94A3B8' : '#1E3A8A',
          border: 'none', borderRadius: '8px', color: 'white',
          fontSize: '0.85rem', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Poppins', sans-serif"
        }}>
          {loading ? 'Sending...' : 'Confirm Request'}
        </button>
        <button onClick={() => { setShowForm(false); setError('') }} style={{
          padding: '0.6rem 1rem', background: 'transparent',
          border: '1px solid #E2E8F0', borderRadius: '8px',
          color: '#94A3B8', fontSize: '0.85rem', cursor: 'pointer',
          fontFamily: "'Poppins', sans-serif"
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function EmptyState({ message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontSize: '1.1rem', color: '#475569',
                  fontWeight: 600, marginBottom: '0.5rem' }}>
        {message}
      </p>
      <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>{sub}</p>
    </div>
  )
}

//  Styles 
const pageStyle = {
  minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: "'Poppins', sans-serif",
}
const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 5%' }
const tabBarStyle = {
  display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
  borderBottom: '2px solid #E2E8F0', paddingBottom: '0',
}
const tabStyle = {
  padding: '0.6rem 1.25rem', background: 'transparent', border: 'none',
  borderBottom: '2px solid transparent', marginBottom: '-2px',
  color: '#64748B', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  fontFamily: "'Poppins', sans-serif",
}
const activeTabStyle  = { ...tabStyle, color: '#1E3A8A', borderBottom: '2px solid #F97316', fontWeight: 700 }
const countBadge      = { background: '#E2E8F0', color: '#475569', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.5rem' }
const filterRowStyle  = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }
const categoryStyle   = { padding: '0.4rem 1rem', borderRadius: '99px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }
const activeCategoryStyle = { ...categoryStyle, background: '#1E3A8A', border: '1px solid #1E3A8A', color: '#FFFFFF' }
const gridStyle       = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }
const cardStyle       = { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }
const skillLabelStyle = { fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, margin: '0 0 0.35rem 0' }
const badgeRowStyle   = { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }
const offerBadgeStyle = { padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 500, backgroundColor: '#DBEAFE', color: '#1E40AF' }
const learnBadgeStyle = { padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 500, backgroundColor: '#FFEDD5', color: '#9A3412' }
const telegramStyle   = { backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '0.65rem 0.85rem' }
const breakdownStyle  = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }
const connectBtnStyle = { width: '100%', padding: '0.7rem', background: '#F97316', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }
const acceptBtnStyle  = { flex: 1, padding: '0.7rem', background: '#1E3A8A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }
const declineBtnStyle = { flex: 1, padding: '0.7rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }
const sessionBtnStyle = { width: '100%', padding: '0.7rem', background: '#1E3A8A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }
const reportBtnStyle  = { background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.78rem', cursor: 'pointer', padding: '0', fontFamily: "'Poppins', sans-serif", fontWeight: 500 }