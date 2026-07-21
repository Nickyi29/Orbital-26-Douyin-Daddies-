import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REASONS = [
  'Inappropriate behaviour',
  'No show / ghosting',
  'Fake profile',
  'Spam',
  'Other',
]

export default function ReportModal({ reportedId, reportedName, onClose }) {
  const { user } = useAuth()
  const [reason,      setReason]      = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_id: reportedId,
        reason,
        description,
      })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSubmitted(true)
  }

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (submitted) return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle}>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700,
                       color: '#0F172A', margin: '0 0 0.5rem' }}>
            Report submitted
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Thank you for helping keep SkillSwap safe.
            We will review your report shortly.
          </p>
          <button onClick={onClose} style={primaryBtnStyle}>
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Report {reportedName}
          </h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <p style={{ color: '#64748B', fontSize: '0.88rem',
                    margin: '0 0 1.25rem', lineHeight: 1.5 }}>
          Reports are reviewed by the SkillSwap team. Misuse of the report
          feature may result in account suspension.
        </p>

        {/* Reason dropdown */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Reason *</label>
          <select
            value={reason}
            onChange={e => { setReason(e.target.value); setError('') }}
            style={selectStyle}>
            <option value="">Select a reason</option>
            {REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Additional details (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened..."
            rows={4}
            style={{ ...selectStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.82rem', margin: '0 0 1rem' }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason}
            style={{
              ...primaryBtnStyle,
              flex: 1,
              opacity: loading || !reason ? 0.6 : 1,
              cursor: loading || !reason ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>

      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
}

const modalStyle = {
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '1.75rem',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
}

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  marginBottom: '1rem',
}

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
}

const selectStyle = {
  padding: '0.7rem 0.85rem',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '0.88rem',
  color: '#0F172A',
  fontFamily: "'Poppins', sans-serif",
  outline: 'none',
  background: '#F8FAFC',
  width: '100%',
  boxSizing: 'border-box',
}

const primaryBtnStyle = {
  padding: '0.72rem 1.5rem',
  background: '#DC2626',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Poppins', sans-serif",
}

const cancelBtnStyle = {
  padding: '0.72rem 1.25rem',
  background: 'transparent',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  color: '#64748B',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Poppins', sans-serif",
}

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.1rem',
  color: '#94A3B8',
  cursor: 'pointer',
  padding: '0.2rem 0.4rem',
  lineHeight: 1,
}