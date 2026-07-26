import React from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES = ['Morning', 'Afternoon', 'Evening']

export default function AvailabilityGrid({ slots = [], onChange }) {
  const toggleSlot = (day, time) => {
    const slot = `${day.toLowerCase()}_${time.toLowerCase()}`
    if (slots.includes(slot)) {
      onChange(slots.filter(s => s !== slot))
    } else {
      onChange([...slots, slot])
    }
  }

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E3A8A', marginBottom: '0.5rem' }}>
        Select Your General Availability
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {DAYS.map(day => (
          <div key={day} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', margin: '0 0 4px 0' }}>
              {day}
            </p>
            {TIMES.map(time => {
              const slotKey = `${day.toLowerCase()}_${time.toLowerCase()}`
              const active = slots.includes(slotKey)
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleSlot(day, time)}
                  style={{
                    width: '100%',
                    padding: '6px 2px',
                    marginBottom: '4px',
                    borderRadius: '6px',
                    border: active ? '1px solid #1E3A8A' : '1px solid #E2E8F0',
                    background: active ? '#1E3A8A' : '#F8FAFC',
                    color: active ? '#FFFFFF' : '#475569',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  {time.slice(0, 3)}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}