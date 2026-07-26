export default function StarRating({ value = 0, onChange, readOnly = false }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{
            fontSize: readOnly ? '1.1rem' : '1.8rem',
            color: star <= value ? '#F97316' : '#CBD5E1',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readOnly ? 'default' : 'pointer',
            lineHeight: 1
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}