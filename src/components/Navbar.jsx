import { useState, useEffect } from 'react'

const NAV = [
  { label: 'About',      href: '#about' },
  { label: 'Treatments', href: '#treatments' },
  { label: 'The Space',  href: '#the-space' },
  { label: 'Contact',    href: '#contact' },
]

export default function Navbar({ onBookClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: scrolled ? '1px solid rgba(201,161,91,0.15)' : '1px solid transparent',
      backgroundColor: scrolled ? 'rgba(23,23,23,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'background-color 0.4s, border-color 0.4s',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 2.5rem', height: '5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <a href="#home" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 600, color: '#C9A15B', letterSpacing: '0.12em' }}>LMW</span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.42rem', fontWeight: 600, letterSpacing: '0.87em', color: '#F4F0EB', marginTop: '2px', display: 'block' }}>RECOVERY</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '2.5rem' }}>
          {NAV.map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.6rem', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#F4F0EB', textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
            onMouseLeave={e => e.currentTarget.style.color = '#F4F0EB'}
            >{label}</a>
          ))}
        </nav>

        {/* Book Now + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#contact" className="hidden md:inline-block" style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#C9A15B', textDecoration: 'none',
            border: '1px solid #C9A15B', padding: '0.7rem 1.4rem',
            transition: 'background-color 0.2s, color 0.2s',
            cursor: 'pointer',
          }}
          onClick={e => { e.preventDefault(); onBookClick() }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A15B'; e.currentTarget.style.color = '#171717' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C9A15B' }}
          >Book a Session</a>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu" aria-expanded={menuOpen}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: '22px', height: '1px', backgroundColor: '#F4F0EB',
                transition: 'transform 0.3s, opacity 0.3s',
                transform: menuOpen
                  ? i === 0 ? 'translateY(6px) rotate(45deg)'
                  : i === 2 ? 'translateY(-6px) rotate(-45deg)' : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" style={{
        overflow: 'hidden',
        maxHeight: menuOpen ? '400px' : '0',
        transition: 'max-height 0.35s ease',
        backgroundColor: '#171717',
        borderTop: menuOpen ? '1px solid rgba(201,161,91,0.15)' : 'none',
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 2.5rem 2rem', gap: '1.25rem' }}>
          {NAV.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem',
              fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#F4F0EB', textDecoration: 'none',
            }}>{label}</a>
          ))}
          <a href="#contact" onClick={() => { setMenuOpen(false); onBookClick() }} style={{
            alignSelf: 'flex-start', marginTop: '0.5rem',
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#C9A15B', textDecoration: 'none',
            border: '1px solid #C9A15B', padding: '0.7rem 1.4rem',
          }}>Book a Session</a>
        </nav>
      </div>
    </header>
  )
}
