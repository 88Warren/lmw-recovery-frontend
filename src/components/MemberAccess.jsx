import { useState, useEffect } from 'react'
import { api } from '../api'
import BookingModal from './BookingModal'

/*
 * Passwordless member access for the Maintenance Plan.
 *
 *  /booking/member?token=…  → verify the magic-link token; if valid, open the
 *                             booking modal in verified-member mode so the two
 *                             plan sessions book without paying again.
 *
 * The "request a link" form (for members who don't have a link yet) is rendered
 * by RequestLinkPanel, used inside the normal booking modal via App.
 */

const GOLD = '#C9A15B'
const BG = '#171717'
const TEXT = '#F4F0EB'
const MUTED = '#B8AEA0'

const initialToken = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('token')
  : null

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: BG, color: TEXT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'Montserrat,sans-serif', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 460, width: '100%' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '2.2rem', fontWeight: 600, color: GOLD, letterSpacing: '0.12em', marginBottom: '0.25rem' }}>LMW</div>
        <div style={{ fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.87em', color: TEXT, marginBottom: '2.5rem' }}>RECOVERY</div>
        {children}
      </div>
    </div>
  )
}

export default function MemberAccess() {
  const [state, setState] = useState('checking') // checking | ready | invalid
  const [member, setMember] = useState(null)      // { email, token }
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!initialToken) { if (active) setState('invalid'); return }
      try {
        const res = await api.verifyMember(initialToken)
        if (!active) return
        if (res?.email && res?.active) {
          setMember({ email: res.email, token: initialToken })
          setState('ready')
          setModalOpen(true)
          // Tidy the token out of the address bar.
          if (window.history?.replaceState) {
            window.history.replaceState(null, '', '/booking/member')
          }
        } else {
          setState('invalid')
        }
      } catch {
        if (active) setState('invalid')
      }
    }
    const t = setTimeout(run, 0)
    return () => { active = false; clearTimeout(t) }
  }, [])

  if (state === 'checking') {
    return <Shell><p style={{ color: MUTED, fontSize: '0.8rem' }}>Verifying your link…</p></Shell>
  }

  if (state === 'invalid') {
    return (
      <Shell>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400, margin: '0 0 1rem' }}>Link expired</h1>
        <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.8, margin: '0 0 2rem' }}>
          This sign-in link is invalid or has expired. Head back and request a new one from the booking screen.
        </p>
        <a href="/" style={{ display: 'inline-block', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '0.85rem 1.75rem', border: `1px solid ${GOLD}`, color: GOLD, textDecoration: 'none' }}>Back to site</a>
      </Shell>
    )
  }

  // Verified member — open the booking modal locked to the Maintenance Plan.
  return (
    <>
      <Shell><p style={{ color: MUTED, fontSize: '0.8rem' }}>You're verified. Choose this month's two sessions.</p></Shell>
      <BookingModal
        open={modalOpen}
        onClose={() => { window.location.assign('/') }}
        memberContext={member}
      />
    </>
  )
}


