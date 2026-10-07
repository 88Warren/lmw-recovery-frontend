import { useState } from 'react'

const TREATMENTS = [
  {
    name: 'Sports Massage',
    desc: 'Deep tissue work targeting training-specific tension, tightness and imbalance.',
    duration: '60 minutes',
    price: '£45',
    featured: true,
  },
  {
    name: 'Recovery Express',
    desc: 'A focused session for one or two problem areas between training blocks.',
    duration: '30 minutes',
    price: '£30',
    featured: false,
  },
  {
    name: 'Maintenance Plan',
    desc: 'Fortnightly sessions for clients in an active training or bulk phase. 2 sessions per month.',
    duration: 'Monthly',
    price: '£80',
    featured: false,
  },
]

export default function Treatments({ onBookClick }) {
  return (
    // #1c1c1c contrasts against Studio (#0f0f0f) above and CTABanner (#0f0f0f) below
    <section id="treatments" style={{ backgroundColor: '#1c1c1c', padding: '7rem 0 6rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="eyebrow">Treatments</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 500, color: '#F4F0EB',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Choose Your Session</h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.72rem', fontWeight: 300,
            color: '#78736C', marginTop: '0.75rem',
          }}>Click a treatment to book straight in</p>
        </div>

        {/* Treatment cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          backgroundColor: 'rgba(201,161,91,0.15)',
        }} className="treatments-grid">
          {TREATMENTS.map(t => (
            <TreatmentCard key={t.name} {...t} onBookClick={onBookClick} />
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) { .treatments-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .treatments-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}

function TreatmentCard({ name, desc, duration, price, featured, onBookClick }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={() => onBookClick({ name, price, duration_minutes: parseInt(duration) || 60 })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? '#252525' : '#1c1c1c',
        padding: '2.75rem 2rem 2.5rem',
        display: 'flex', flexDirection: 'column',
        transition: 'background-color 0.25s',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {/* Featured tag */}
      {featured && (
        <span style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          fontFamily: 'Montserrat, sans-serif', fontSize: '0.48rem',
          fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#171717', backgroundColor: '#C9A15B',
          padding: '0.25rem 0.6rem',
        }}>Most Popular</span>
      )}

      {/* Name */}
      <h3 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '1.5rem', fontWeight: 500,
        color: '#F4F0EB', letterSpacing: '0.02em',
        marginBottom: '1rem',
      }}>{name}</h3>

      {/* Description */}
      <p style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.72rem', fontWeight: 300,
        color: '#78736C', lineHeight: 1.8,
        flex: 1, marginBottom: '2rem',
      }}>{desc}</p>

      {/* Duration + Price + Book hint */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderTop: '1px solid rgba(201,161,91,0.15)',
        paddingTop: '1.25rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem',
            fontWeight: 400, color: '#B8AEA0', letterSpacing: '0.05em',
          }}>{duration}</span>
        </div>
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '1.75rem', fontWeight: 500,
          color: '#C9A15B', lineHeight: 1,
        }}>{price}</span>
      </div>
    </button>
  )
}
