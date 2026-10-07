const DETAILS = [
  { label: 'Location',  value: 'Llantrisant, RCT' },
  { label: 'Parking',   value: 'Private, on-site' },
  { label: 'Access',    value: 'Own entrance, separate from the house' },
  { label: 'Tue – Thu', value: '6pm – 8pm' },
  { label: 'Sunday',    value: '9am – 1pm' },
  { label: 'Booking',   value: 'Online, same-week availability' },
]

export default function Studio() {
  return (
    <section id="the-space" className="studio-grid" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '620px',
      backgroundColor: '#0f0f0f',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .studio-grid { grid-template-columns: 1fr !important; }
          .studio-grid > *:first-child { order: 2; min-height: 320px; }
          .studio-grid > *:last-child  { order: 1; }
        }
      `}</style>

      {/* Left — photo */}
      <div style={{ position: 'relative', minHeight: '420px' }}>
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=85"
          alt="The LMW Recovery studio — Llantrisant"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(23,23,23,0.3) 0%, rgba(23,23,23,0.05) 60%, rgba(23,23,23,0.5) 100%)',
        }} aria-hidden="true" />
      </div>

      {/* Right — text + details table */}
      <div style={{
        backgroundColor: '#1c1c1c',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(3.5rem, 6vw, 6rem) clamp(2.5rem, 5vw, 5rem)',
      }}>
        <span className="eyebrow">The Studio</span>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(2rem, 3.5vw, 3rem)',
          fontWeight: 500, lineHeight: 1.05,
          color: '#F4F0EB', letterSpacing: '0.02em',
          marginBottom: 0,
        }}>A private space<br />to switch off</h2>

        <span className="gold-rule" />

        <p style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '0.78rem', fontWeight: 300,
          color: '#78736C', lineHeight: 1.9,
          maxWidth: '40ch', marginBottom: '2.5rem',
        }}>
          A converted garden studio at the house, warm lighting, no rush, no
          waiting room. Just you, the table, and time to properly recover.
        </p>

        {/* Details table */}
        <dl style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {DETAILS.map(({ label, value }, i) => (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: '10rem 1fr',
              padding: '0.75rem 0',
              borderTop: i === 0 ? '1px solid rgba(201,161,91,0.18)' : 'none',
              borderBottom: '1px solid rgba(201,161,91,0.18)',
              gap: '1rem',
            }}>
              <dt style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.58rem', fontWeight: 600,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#C9A15B',
              }}>{label}</dt>
              <dd style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.72rem', fontWeight: 300,
                color: '#B8AEA0',
              }}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
