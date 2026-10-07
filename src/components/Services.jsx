import { useState } from 'react'

const SERVICES = [
  {
    title: 'Sports Massage',
    desc: 'Targeted massage to release tension, improve mobility and aid performance.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 4C11 4 7 8.5 7 12c0 6 9 14 9 14s9-8 9-14c0-3.5-4-8-9-8z"/>
        <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3z"/>
      </svg>
    ),
  },
  {
    title: 'Deep Tissue Massage',
    desc: 'Focused pressure to relieve chronic tension and support muscle recovery.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
        <path d="M8 28c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
        <path d="M16 16v4"/>
        <path d="M12 22l4-2 4 2"/>
      </svg>
    ),
  },
  {
    title: 'Trigger Point Therapy',
    desc: 'Release stubborn knots and reduce pain in key areas.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="16" cy="16" r="12"/>
        <circle cx="16" cy="16" r="7"/>
        <circle cx="16" cy="16" r="2.5"/>
        <line x1="16" y1="4" x2="16" y2="9"/>
        <line x1="16" y1="23" x2="16" y2="28"/>
        <line x1="4" y1="16" x2="9" y2="16"/>
        <line x1="23" y1="16" x2="28" y2="16"/>
      </svg>
    ),
  },
  {
    title: 'Recovery Therapy',
    desc: 'Reduce muscle soreness and enhance recovery after training or competition.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="12" width="5" height="14" rx="1"/>
        <rect x="24" y="12" width="5" height="14" rx="1"/>
        <line x1="8" y1="17" x2="24" y2="17"/>
        <line x1="12" y1="7" x2="12" y2="12"/>
        <line x1="20" y1="7" x2="20" y2="12"/>
        <line x1="12" y1="7" x2="20" y2="7"/>
      </svg>
    ),
  },
  {
    title: 'Mobility & Flexibility',
    desc: 'Improve movement patterns, flexibility and overall body function.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 4 Q26 12 22 22 Q16 28 10 22 Q6 12 16 4z"/>
        <path d="M16 9 Q21 14 19 20"/>
      </svg>
    ),
  },
]

export default function Services() {
  return (
    <section id="services" style={{ backgroundColor: '#171717', padding: '7rem 0 6rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="eyebrow">Our Services</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 500, color: '#F4F0EB',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Tailored Treatments. Real Results.
          </h2>
        </div>

        {/* Cards grid — thin gold gaps between cells */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          backgroundColor: 'rgba(201,161,91,0.15)',
        }} className="services-grid">
          {SERVICES.map(({ title, desc, icon }) => (
            <ServiceCard key={title} title={title} desc={desc} icon={icon} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <a href="#pricing" style={{
            display: 'inline-block',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#C9A15B', textDecoration: 'none',
            border: '1px solid #C9A15B',
            padding: '0.85rem 2rem',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A15B'; e.currentTarget.style.color = '#171717' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C9A15B' }}
          >View Pricing</a>
        </div>
      </div>

      {/* Responsive: stack to 2-col on tablet, 1-col on mobile */}
      <style>{`
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}

function ServiceCard({ title, desc, icon }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#1c1c1c' : '#171717',
        padding: '2.75rem 1.75rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        transition: 'background-color 0.25s',
      }}
    >
      <div style={{ color: '#C9A15B', marginBottom: '1.25rem' }}>{icon}</div>
      <span style={{
        display: 'block', width: '1.5rem', height: '1px',
        backgroundColor: '#C9A15B', marginBottom: '1.25rem',
      }} />
      <h3 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.55rem', fontWeight: 700,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#F4F0EB', marginBottom: '0.85rem',
      }}>{title}</h3>
      <p style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.72rem', fontWeight: 300,
        color: '#78736C', lineHeight: 1.8,
      }}>{desc}</p>
    </div>
  )
}
