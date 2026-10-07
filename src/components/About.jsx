export default function About() {
  return (
    <section id="about" className="about-grid" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '680px',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Left: ivory text panel */}
      <div style={{
        backgroundColor: '#F4F0EB',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(3.5rem, 6vw, 6rem) clamp(2.5rem, 5vw, 5rem)',
      }}>
        <span className="eyebrow" style={{ color: '#C9A15B' }}>The Therapist</span>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
          fontWeight: 600, lineHeight: 0.95,
          color: '#171717', letterSpacing: '0.02em',
          marginBottom: '2rem',
        }}>
          Laura Warren
        </h2>

        <p style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '0.78rem', fontWeight: 300,
          color: '#78736C', lineHeight: 1.9,
          marginBottom: '1rem', maxWidth: '40ch',
        }}>
          Qualified sports massage therapist with a background in strength and
          physique coaching. I understand training load, not just tight muscles.
          Every session is built around how you move, not a generic routine.
        </p>

        <p style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '0.78rem', fontWeight: 300,
          color: '#78736C', lineHeight: 1.9,
          marginBottom: '2.75rem', maxWidth: '40ch',
        }}>
          Sessions run from a private, purpose-built studio at the house in
          Llantrisant. Quiet, comfortable, and entirely yours.
        </p>

        <a href="#contact" style={{
          alignSelf: 'flex-start',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '0.55rem', fontWeight: 600,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          backgroundColor: '#C9A15B', color: '#171717',
          textDecoration: 'none', padding: '0.9rem 2rem',
          transition: 'background-color 0.25s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b8904a'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9A15B'}
        >Book a Session</a>
      </div>

      {/* Right: photo + floating badges */}
      <div style={{ position: 'relative', minHeight: '420px' }}>
        <img
          src="/massage-about.jpg"
          alt="Laura Warren, sports massage therapist, Llantrisant"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(23,23,23,0.45) 0%, rgba(23,23,23,0.05) 50%, rgba(23,23,23,0.6) 100%)',
        }} aria-hidden="true" />

        {/* Floating badges */}
        <div style={{
          position: 'absolute', bottom: '2rem', right: '2rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {[
            { label: 'Qualified',    detail: 'Level 3 Sports Massage Therapist' },
            { label: 'Personal',     detail: 'Tailored to how you train' },
            { label: 'Professional', detail: 'Evidence based. Results driven.' },
          ].map(({ label, detail }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              backgroundColor: 'rgba(23,23,23,0.9)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem 1rem',
              borderLeft: '2px solid #C9A15B',
            }}>
              <span style={{
                display: 'block', width: '5px', height: '5px',
                border: '1px solid #C9A15B', flexShrink: 0,
              }} />
              <div>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem',
                  fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#F4F0EB',
                }}>{label}</p>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem',
                  fontWeight: 300, color: '#B8AEA0', marginTop: '1px',
                }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
