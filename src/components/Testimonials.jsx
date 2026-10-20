import { useState } from 'react'

const TESTIMONIALS = [
  { quote: 'Laura is incredibly knowledgeable and professional. My go-to for recovery and performance.', name: 'James C.' },
  { quote: 'I feel the difference after every session. Better mobility, less pain and faster recovery.',   name: 'Sophie R.' },
  { quote: 'The best sports massage I\'ve had. Highly recommend LMW Recovery.',                           name: 'Tom W.' },
]

// Opens the LMW Recovery listing on Google Maps, where the "Write a review"
// button is one tap away. Built from the business's Google listing CID.
// To send users straight to the review form instead, replace this with the
// "Ask for reviews" link from Google Business Profile
// (e.g. https://g.page/r/XXXXXXXX/review).
const GOOGLE_REVIEW_URL = 'https://www.google.com/maps?cid=13635445275265530864'

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(i => (i === 0 ? TESTIMONIALS.length - 1 : i - 1))
  const next = () => setActive(i => (i === TESTIMONIALS.length - 1 ? 0 : i + 1))

  return (
    /* Ivory background matching the mockup */
    <section style={{ backgroundColor: '#F4F0EB', padding: '7rem 0' }}>
      <div className="section-pad" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

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
              width: '44px', height: '44px',
              border: 'none', cursor: 'pointer', background: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}>
              <span aria-hidden="true" style={{
                display: 'block', width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: i === active ? '#C9A15B' : '#B8AEA0',
                transition: 'background-color 0.2s',
              }} />
            </button>
          ))}
        </div>

        {/* ── Leave a review ── */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank" rel="noopener noreferrer"
            className="cta-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#171717', textDecoration: 'none',
              border: '1px solid #171717', padding: '0.85rem 1.75rem',
              transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#171717'; e.currentTarget.style.color = '#F4F0EB' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#171717' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            Leave a Google Review
          </a>
        </div>
      </div>
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
        width: '2.75rem', height: '2.75rem',
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
