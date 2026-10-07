const VALUES = [
  {
    roman: 'I.',
    title: 'Expertise',
    desc: 'Level 3 qualified, results driven, and trained in how athletes actually move and load.',
  },
  {
    roman: 'II.',
    title: 'Recovery',
    desc: 'Restoring balance and relieving tension so training can keep progressing, not stalling.',
  },
  {
    roman: 'III.',
    title: 'Performance',
    desc: 'Every session is built to support the demands of an active, training-focused lifestyle.',
  },
  {
    roman: 'IV.',
    title: 'Care',
    desc: 'Personal and attentive. Never rushed, never generic.',
  },
]

export default function BrandValues() {
  return (
    <section style={{ backgroundColor: '#0f0f0f', padding: '6rem 0' }} className="brand-values-section">
      <style>{`@media (max-width: 768px) { .brand-values-section { display: none !important; } }`}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          backgroundColor: 'rgba(201,161,91,0.12)',
        }} className="values-grid">
          {VALUES.map(({ roman, title, desc }) => (
            <div key={roman} style={{
              backgroundColor: '#0f0f0f',
              padding: '3rem 2rem',
            }}>
              {/* Roman numeral */}
              <div style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '2.5rem', fontWeight: 300,
                color: '#C9A15B', lineHeight: 1,
                marginBottom: '1rem',
              }}>{roman}</div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.25em', textTransform: 'uppercase',
                color: '#F4F0EB', marginBottom: '0.85rem',
              }}>{title}</h3>

              {/* Gold rule */}
              <span style={{
                display: 'block', width: '1.5rem', height: '1px',
                backgroundColor: '#C9A15B', marginBottom: '1rem',
              }} />

              {/* Description */}
              <p style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.72rem', fontWeight: 300,
                color: '#78736C', lineHeight: 1.8,
              }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .values-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .values-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
