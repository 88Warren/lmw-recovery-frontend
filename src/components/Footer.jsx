const NAV_LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Treatments', href: '#treatments' },
  { label: 'The Space',  href: '#the-space' },
  { label: 'Contact',    href: '#contact' },
]

export default function Footer() {
  return (
    <footer id="contact" style={{ backgroundColor: '#0a0a0a' }}>

      {/* ── Main grid ── */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '5rem 2.5rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '3rem',
        borderBottom: '1px solid rgba(201,161,91,0.12)',
      }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: '1.25rem', lineHeight: 1 }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '2rem', fontWeight: 600,
              color: '#C9A15B', letterSpacing: '0.12em',
            }}>LMW</div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.42rem', fontWeight: 600,
              letterSpacing: '0.87em', color: '#F4F0EB', marginTop: '2px',
            }}>RECOVERY</div>
          </div>
          <p style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem',
            fontWeight: 300, color: '#78736C', lineHeight: 1.8, marginBottom: '0.75rem',
          }}>
            Sports &amp; remedial massage therapy.<br />Move. Recover. Perform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
            <SocialIcon href="https://instagram.com" label="Instagram">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </SocialIcon>
            <SocialIcon href="https://facebook.com" label="Facebook">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </SocialIcon>
          </div>
        </div>

        {/* Studio */}
        <div>
          <ColHead>Studio</ColHead>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {['Llantrisant, RCT', 'Private garden studio', 'Own parking &amp; entrance'].map(line => (
              <li key={line}>
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem',
                  fontWeight: 300, color: '#78736C',
                }} dangerouslySetInnerHTML={{ __html: line }} />
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <ColHead>Contact</ColHead>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <ContactRow icon="email" href="mailto:hello@lmwrecovery.co.uk">hello@lmwrecovery.co.uk</ContactRow>
            <ContactRow icon="phone" href="tel:07810123456">07810 123456</ContactRow>
            <ContactRow icon="web"   href="https://lmwrecovery.co.uk">lmwrecovery.co.uk</ContactRow>
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '1.25rem 2.5rem',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
      }}>
        <p style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem',
          fontWeight: 300, color: '#78736C', letterSpacing: '0.04em',
        }}>
          &copy; {new Date().getFullYear()} LMW Recovery &nbsp;·&nbsp; Move. Recover. Perform.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms & Conditions'].map(l => (
            <FooterLink key={l} href="#">{l}</FooterLink>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function ColHead({ children }) {
  return (
    <h3 style={{
      fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 700,
      letterSpacing: '0.28em', textTransform: 'uppercase',
      color: '#F4F0EB', marginBottom: '1.25rem',
    }}>{children}</h3>
  )
}

function FooterLink({ href, children }) {
  return (
    <a href={href} style={{
      fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem',
      fontWeight: 300, color: '#78736C', textDecoration: 'none',
      transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
    onMouseLeave={e => e.currentTarget.style.color = '#78736C'}
    >{children}</a>
  )
}

function SocialIcon({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
      color: '#78736C', textDecoration: 'none', transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
    onMouseLeave={e => e.currentTarget.style.color = '#78736C'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {children}
      </svg>
    </a>
  )
}

function ContactRow({ icon, href, children }) {
  const paths = {
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.4 2 2 0 0 1 3.58 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
    email: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    web:   <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  }
  const content = (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A15B" strokeWidth="1.5" style={{ flexShrink: 0 }}>
        {paths[icon]}
      </svg>
      <span style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem',
        fontWeight: 300, color: '#78736C',
      }}>{children}</span>
    </li>
  )
  return href
    ? <a href={href} style={{ textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.querySelector('span').style.color = '#C9A15B'}
        onMouseLeave={e => e.currentTarget.querySelector('span').style.color = '#78736C'}
      >{content}</a>
    : content
}
