import { useState } from 'react'
import { getConsent, setConsent } from '../cookies'

export default function CookieBanner() {
  // Show only if the visitor hasn't made a choice yet. The consent check is
  // synchronous, so compute the initial state directly — no effect needed.
  const [visible, setVisible] = useState(() => getConsent() === null)

  const choose = (choice) => {
    setConsent(choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: 'fixed', left: '1rem', right: '1rem', bottom: '1rem',
        zIndex: 1000, maxWidth: '640px', margin: '0 auto',
        background: '#0a0a0a', border: '1px solid rgba(201,161,91,0.3)',
        borderRadius: '10px', padding: '1.25rem 1.4rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: '1rem', justifyContent: 'space-between',
      }}
    >
      <p style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem',
        fontWeight: 300, color: '#B8AEA0', lineHeight: 1.7,
        flex: '1 1 260px', margin: 0,
      }}>
        We use essential cookies to make this site work, and analytics cookies
        (only if you accept) to understand how it's used.{' '}
        <a
          href="/docs/LMW_Recovery_Privacy_Policy.html"
          target="_blank" rel="noopener noreferrer"
          style={{ color: '#C9A15B', textDecoration: 'none' }}
        >Cookie Policy</a>.
      </p>

      <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
        <BannerButton onClick={() => choose('declined')} variant="ghost">
          Decline
        </BannerButton>
        <BannerButton onClick={() => choose('accepted')} variant="solid">
          Accept
        </BannerButton>
      </div>
    </div>
  )
}

function BannerButton({ onClick, variant, children }) {
  const solid = variant === 'solid'
  const base = {
    background: solid ? '#C9A15B' : 'transparent',
    color: solid ? '#0a0a0a' : '#B8AEA0',
    border: solid ? '1px solid #C9A15B' : '1px solid rgba(184,174,160,0.4)',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem',
        fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
        padding: '0.6rem 1.1rem', borderRadius: '6px', cursor: 'pointer',
        transition: 'all 0.2s', ...base,
      }}
      onMouseEnter={e => {
        if (solid) {
          e.currentTarget.style.background = '#d8b473'
        } else {
          e.currentTarget.style.color = '#C9A15B'
          e.currentTarget.style.borderColor = 'rgba(201,161,91,0.6)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = base.background
        e.currentTarget.style.color = base.color
        e.currentTarget.style.borderColor = solid ? '#C9A15B' : 'rgba(184,174,160,0.4)'
      }}
    >{children}</button>
  )
}
