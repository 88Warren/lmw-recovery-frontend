import { useState } from 'react'

const TESTIMONIALS = [
  { quote: 'Laura is incredibly knowledgeable and professional. My go-to for recovery and performance.', name: 'James C.' },
  { quote: 'I feel the difference after every session. Better mobility, less pain and faster recovery.',   name: 'Sophie R.' },
  { quote: 'The best sports massage I\'ve had. Highly recommend LMW Recovery.',                           name: 'Tom W.' },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(i => (i === 0 ? TESTIMONIALS.length - 1 : i - 1))
  const next = () => setActive(i => (i === TESTIMONIALS.length - 1 ? 0 : i + 1))

  return (
    /* Ivory background matching the mockup */
    <section style={{ backgroundColor: '#F4F0EB', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="eyebrow" style={{ color: '#C9A15B' }}>Clients Say</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 500, color: '#171717',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Trusted by People Who Move.</h2>
        </div>

        {/* ── Carousel ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

          {/* Prev */}
          <ArrowBtn onClick={prev} dir="left" />

          {/* Cards */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }} className="testimonial-grid">
            {TESTIMONIALS.map(({ quote, name }, i) => (
              <div key={i} style={{
                backgroundColor: '#171717',
                padding: '2.5rem 2rem',
                opacity: i === active ? 1 : 0.45,
                transition: 'opacity 0.3s',
              }}>
                {/* Decorative quote mark */}
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '3.5rem', lineHeight: 0.7,
                  color: '#C9A15B', marginBottom: '1.25rem',
                }} aria-hidden="true">&ldquo;</div>

                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.75rem', fontWeight: 300,
                  color: '#B8AEA0', lineHeight: 1.8,
                  fontStyle: 'italic', marginBottom: '1.5rem',
                }}>{quote}</p>

                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.6rem', fontWeight: 600,
                  letterSpacing: '0.15em', color: '#F4F0EB',
                }}>— {name}</p>
              </div>
            ))}
          </div>

          {/* Next */}
          <ArrowBtn onClick={next} dir="right" />
        </div>

        {/* ── Dots (always visible on all sizes) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Testimonial ${i + 1}`} style={{
              width: '6px', height: '6px',
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              backgroundColor: i === active ? '#C9A15B' : '#B8AEA0',
              transition: 'background-color 0.2s',
              padding: 0,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .testimonial-grid {
            grid-template-columns: 1fr !important;
          }
          .testimonial-grid > *:not(:nth-child(1)) {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}

function ArrowBtn({ onClick, dir }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={dir === 'left' ? 'Previous' : 'Next'}
      style={{
        flexShrink: 0,
        width: '2.5rem', height: '2.5rem',
        border: '1px solid #C9A15B',
        backgroundColor: hov ? '#C9A15B' : 'transparent',
        color: hov ? '#171717' : '#C9A15B',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 0.2s, color 0.2s',
      }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        {dir === 'left'
          ? <path d="M9 11L5 7l4-4"/>
          : <path d="M5 11l4-4-4-4"/>
        }
      </svg>
    </button>
  )
}
