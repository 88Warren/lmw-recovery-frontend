export default function CTABanner({ onBookClick }) {
  return (
    <section style={{
      backgroundColor: '#0f0f0f',
      padding: '7rem 2.5rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <span className="eyebrow" style={{ display: 'block' }}>
          Ready when you are
        </span>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
          fontWeight: 500, lineHeight: 1.0,
          color: '#F4F0EB', letterSpacing: '0.02em',
          marginBottom: 0,
        }}>
          Your next session is<br />
          <em style={{ color: '#C9A15B', fontStyle: 'normal' }}>one booking away.</em>
        </h2>

        <span className="gold-rule" style={{ margin: '1.5rem auto 2rem' }} />

        <button
          onClick={onBookClick}
          style={{
            display: 'inline-block',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.58rem', fontWeight: 600,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            backgroundColor: '#C9A15B', color: '#171717',
            border: 'none', padding: '1rem 2.5rem',
            cursor: 'pointer', transition: 'background-color 0.25s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b8904a'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9A15B'}
        >Book Your Session</button>
      </div>
    </section>
  )
}
