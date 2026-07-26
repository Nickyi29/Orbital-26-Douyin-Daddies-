import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'

export default function ReviewPage() {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [rating, setRating]   = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (sessionId) fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!error) setSession(data)
    setFetching(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !session) return
    setLoading(true)

    const otherUserId = session.teacher_id === user.id
      ? session.learner_id
      : session.teacher_id

  
    const { error: reviewError } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewee_id: otherUserId,
      session_id:  sessionId,
      rating:      rating,
      comment:     comment
    })

    if (reviewError) {
      alert('Error submitting review: ' + reviewError.message)
      setLoading(false)
      return
    }

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', otherUserId)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      await supabase
        .from('profiles')
        .update({ rating: parseFloat(avg.toFixed(1)) })
        .eq('id', otherUserId)
    }

    setLoading(false)
    navigate('/credits')
  }

  if (fetching) return <div style={pageStyle}><p>Loading session...</p></div>

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E3A8A', marginBottom: '0.5rem' }}>
          Leave a Review
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          How was your swap for <strong>{session?.skill_name}</strong>?
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label style={labelStyle}>Comments (Optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Was your partner helpful, punctual, and clear?"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Submitting...' : 'Submit Review →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const pageStyle = { minHeight: '100vh', backgroundColor: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Poppins', sans-serif" }
const cardStyle = { width: '100%', maxWidth: '480px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }
const labelStyle = { fontSize: '0.85rem', fontWeight: '600', color: '#1E3A8A', marginBottom: '0.5rem', display: 'block' }
const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box' }
const btnStyle = { padding: '0.85rem', backgroundColor: '#F97316', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }