export default function Hero({ onBookClick }) {
  return (
    <section id="home" style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#171717',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Background photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1800&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        opacity: 0.45,
      }} aria-hidden="true" />

      {/* Left fade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(100deg, #171717 38%, #171717cc 58%, #17171766 75%, transparent 100%)',
      }} aria-hidden="true" />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '14rem',
        background: 'linear-gradient(to bottom, transparent, #171717)',
      }} aria-hidden="true" />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 10,
        flex: 1,
        maxWidth: '1280px', margin: '0 auto',
        padding: '10rem 2.5rem 6rem',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: '560px' }}>

          <span className="eyebrow">Sports &amp; Maintenance Massage · Llantrisant</span>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(3.75rem, 8.5vw, 7rem)',
            fontWeight: 600,
            lineHeight: 0.92,
            letterSpacing: '0.02em',
            color: '#F4F0EB',
            marginBottom: '2rem',
          }}>
            Recovery,<br />
            <em style={{ color: '#C9A15B', fontStyle: 'normal' }}>done properly.</em>
          </h1>



          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.82rem', fontWeight: 300,
            color: '#B8AEA0', lineHeight: 1.85,
            maxWidth: '38ch', marginBottom: '2.5rem',
          }}>
            Sports massage therapy from a private garden studio, built for
            athletes, lifters and anyone who trains hard and wants to keep doing
            it, injury-free.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#contact" style={{
              display: 'inline-block',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              backgroundColor: '#C9A15B', color: '#171717',
              textDecoration: 'none', padding: '1rem 2.25rem',
              transition: 'background-color 0.25s',
              cursor: 'pointer', textAlign: 'center', minWidth: '13rem',
            }}
            onClick={e => { e.preventDefault(); onBookClick() }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b8904a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9A15B'}
            >Book a Session</a>

            <a href="#treatments" style={{
              display: 'inline-block',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              border: '1px solid rgba(244,240,235,0.35)',
              color: '#F4F0EB',
              textDecoration: 'none', padding: '1rem 2.25rem',
              transition: 'border-color 0.25s, color 0.25s',
              textAlign: 'center', minWidth: '13rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A15B'; e.currentTarget.style.color = '#C9A15B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,240,235,0.35)'; e.currentTarget.style.color = '#F4F0EB' }}
            >View Treatments</a>
          </div>
        </div>
      </div>

    </section>
  )
}
