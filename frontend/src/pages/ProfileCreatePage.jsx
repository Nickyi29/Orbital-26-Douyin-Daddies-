import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { COURSES, SKILLS, YEARS } from '../lib/data'

export default function ProfileCreatePage() {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    telegram_handle: '',
    course: '',
    year_of_study: '',
    bio: '',
  })

  const [selectedOffering, setSelectedOffering] = useState([])
  const [selectedLearning, setSelectedLearning] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const toggleSkill = (skillName, list, setList) => {
    if (list.includes(skillName)) {
      setList(list.filter(s => s !== skillName))
    } else {
      if (list.length >= 5) {
        setError('Maximum 5 skills allowed')
        return
      }
      setList([...list, skillName])
    }
    setError('')
  }

  const handleNextStep = () => {
    if (!form.course)          { setError('Please select your course');          return }
    if (!form.year_of_study)   { setError('Please select your year');            return }
    if (!form.telegram_handle) { setError('Please enter your Telegram handle'); return }
    setError('')
    setStep(2)
  }

const handleSubmit = async () => {
  if (selectedOffering.length === 0) {
    setError('Please add at least one skill you can teach')
    return
  }
  if (selectedLearning.length === 0) {
    setError('Please add at least one skill you want to learn')
    return
  }

  setLoading(true)
  setError('')

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      telegram_handle:  form.telegram_handle,
      course:           form.course,
      year_of_study:    form.year_of_study,
      bio:              form.bio,
      profile_complete: true,
    })
    .eq('id', user.id)

  if (profileError) {
    setError('Failed to save profile: ' + profileError.message)
    setLoading(false)
    return
  }

  await supabase.from('skills').delete().eq('user_id', user.id)

  const offeringRows = selectedOffering.map(name => ({
    user_id:  user.id,
    name,
    category: SKILLS.find(s => s.name === name)?.category || 'Other',
    type:     'offering',
  }))

  const learningRows = selectedLearning.map(name => ({
    user_id:  user.id,
    name,
    category: SKILLS.find(s => s.name === name)?.category || 'Other',
    type:     'learning',
  }))

  const { error: skillsError } = await supabase
    .from('skills')
    .insert([...offeringRows, ...learningRows])

  if (skillsError) {
    setError('Failed to save skills: ' + skillsError.message)
    setLoading(false)
    return
  }

  await fetchProfile(user.id)

  setTimeout(() => {
    navigate('/dashboard')
  }, 100)
}

  const categories = [...new Set(SKILLS.map(s => s.category))]

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800,
                       marginBottom: '0.4rem', color: '#1E3A8A' }}>
            Set up your profile
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Your Skills'}
          </p>
          <div style={{ marginTop: '1rem', background: '#E5E7EB',
                        borderRadius: '99px', height: '4px', overflow: 'hidden' }}>
            <div style={{
              width: step === 1 ? '50%' : '100%',
              background: '#F97316',
              height: '4px',
              borderRadius: '99px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Telegram Handle">
              <input name="telegram_handle" value={form.telegram_handle}
                onChange={handleChange} placeholder="@yourhandle" style={inputStyle} />
            </Field>
            <Field label="Course / Programme">
              <select name="course" value={form.course}
                onChange={handleChange} style={inputStyle}>
                <option value="">Select your course</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Year of Study">
              <select name="year_of_study" value={form.year_of_study}
                onChange={handleChange} style={inputStyle}>
                <option value="">Select your year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Bio (optional)">
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Tell others a little about yourself..."
                rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </Field>

            {error && <p style={errorStyle}>{error}</p>}

            <button onClick={handleNextStep} style={btnStyle}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div>
              <p style={sectionLabel}>
                Skills I can <span style={{ color: '#16a34a' }}>teach</span>
                <span style={{ color: '#64748B', fontSize: '0.8rem',
                               marginLeft: '0.5rem' }}>
                  ({selectedOffering.length}/5)
                </span>
              </p>
              {categories.map(category => (
                <div key={category} style={{ marginBottom: '0.75rem' }}>
                  <p style={categoryLabel}>{category}</p>
                  <div style={tagContainer}>
                    {SKILLS.filter(s => s.category === category).map(skill => (
                      <button key={skill.name}
                        onClick={() => toggleSkill(
                          skill.name, selectedOffering, setSelectedOffering
                        )}
                        style={selectedOffering.includes(skill.name)
                          ? selectedTagStyle : tagStyle}>
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p style={sectionLabel}>
                Skills I want to <span style={{ color: '#2f5acf' }}>learn</span>
                <span style={{ color: '#64748B', fontSize: '0.8rem',
                               marginLeft: '0.5rem' }}>
                  ({selectedLearning.length}/5)
                </span>
              </p>
              {categories.map(category => (
                <div key={category} style={{ marginBottom: '0.75rem' }}>
                  <p style={categoryLabel}>{category}</p>
                  <div style={tagContainer}>
                    {SKILLS.filter(s => s.category === category).map(skill => (
                      <button key={skill.name}
                        onClick={() => toggleSkill(
                          skill.name, selectedLearning, setSelectedLearning
                        )}
                        style={selectedLearning.includes(skill.name)
                          ? selectedTagStyleLearning : tagStyle}>
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)}
                style={{ ...btnStyle, background: 'transparent',
                         border: '1px solid #d2dfef', color: '#64748B' }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ ...btnStyle, flex: 1,
                         opacity: loading ? 0.7 : 1,
                         cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Saving profile...' : 'Complete Profile →'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const pageStyle = {
  minHeight: '100vh',
  background: '#F8FBFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
}

const cardStyle = {
  width: '100%',
  maxWidth: '560px',
  background: '#FFFFFF',
  border: '1px solid #d2dfef',
  borderRadius: '16px',
  padding: '2.5rem',
  boxShadow: '0 10px 30px rgba(30, 58, 138, 0.08)',
}

const inputStyle = {
  padding: '0.85rem 1rem',
  borderRadius: '8px',
  background: '#F8FBFF',
  border: '1px solid #d2dfef',
  color: '#1E293B',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
}

const btnStyle = {
  width: '100%',
  padding: '0.85rem',
  background: '#F97316',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.95rem',
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: 'inherit',
}

const errorStyle = {
  color: '#DC2626',
  fontSize: '0.85rem',
  textAlign: 'center',
}

const sectionLabel = {
  fontSize: '0.95rem',
  fontWeight: 700,
  marginBottom: '0.75rem',
  color: '#1E3A8A',
}

const categoryLabel = {
  fontSize: '0.75rem',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
  fontWeight: 700,
}

const tagContainer = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '0.5rem',
}

const tagStyle = {
  padding: '0.4rem 0.9rem',
  borderRadius: '999px',
  background: '#F8FBFF',
  border: '1px solid #d2dfef',
  color: '#1E3A8A',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 500,
}

const selectedTagStyle = {
  ...tagStyle,
  background: '#FFF7ED',
  border: '1px solid #FDBA74',
  color: '#EA580C',
}

const selectedTagStyleLearning = {
  ...tagStyle,
  background: '#EFF6FF',
  border: '1px solid #93C5FD',
  color: '#2f5acf',
}