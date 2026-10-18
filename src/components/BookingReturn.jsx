import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

/*
 * Rendered when Stripe redirects back after Checkout:
 *   /booking/success?session_id=cs_...  → poll until the booking confirms
 *   /booking/cancelled                  → payment abandoned, offer to retry
 *
 * The app has no router, so App.jsx picks this up from window.location.pathname.
 */

const GOLD = '#C9A15B'
const BG   = '#171717'
const TEXT = '#F4F0EB'
const MUTED = '#B8AEA0'

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
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '0.85rem 1.75rem', border: `1px solid ${GOLD}`, color: GOLD, textDecoration: 'none' }}>
          Back to site
        </a>
      </div>
    </div>
  )
}

function Heading({ children }) {
  return <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400, margin: '0 0 1rem' }}>{children}</h1>
}
function Body({ children }) {
  return <p style={{ fontSize: '0.8rem', fontWeight: 300, color: MUTED, lineHeight: 1.8, margin: 0 }}>{children}</p>
}

// Capture the session_id from the URL exactly once, at module load, BEFORE the
// component mounts and before we tidy the address bar. This survives React
// StrictMode's double-invoked effects (which would otherwise re-read the URL
// after we've already stripped the token) and any re-render.
const initialSessionId = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('session_id')
  : null

export default function BookingReturn({ cancelled }) {
  const [state, setState] = useState(cancelled ? 'cancelled' : 'checking') // checking | confirmed | pending | error | cancelled
  const [data, setData]   = useState(null)
  const tries = useRef(0)

  useEffect(() => {
    if (cancelled) return
    const sessionId = initialSessionId

    // Tidy the address bar: drop the long ?session_id=… token now that we've
    // captured it. replaceState keeps the page on /booking/success without a
    // reload or a new history entry.
    if (sessionId && window.history?.replaceState) {
      window.history.replaceState(null, '', '/booking/success')
    }

    let active = true
    let timer

    const poll = async () => {
      if (!sessionId) { if (active) setState('error'); return }
      try {
        const res = await api.getBookingStatus(sessionId)
        if (!active) return
        setData(res)
        if (res.payment_status === 'paid' || res.status === 'confirmed') {
          setState('confirmed')
          return
        }
      } catch {
        // keep trying — the booking row may not be visible for a beat
      }
      if (!active) return
      // Webhook can lag the redirect by a second or two. Poll ~10 times (20s).
      tries.current += 1
      if (tries.current >= 10) {
        setState('pending')
        return
      }
      timer = setTimeout(poll, 2000)
    }
    // Kick off asynchronously so no setState runs synchronously in the effect.
    timer = setTimeout(poll, 0)

    return () => { active = false; clearTimeout(timer) }
  }, [cancelled])

  if (state === 'cancelled') {
    return (
      <Shell>
        <Heading>Payment cancelled</Heading>
        <Body>No payment was taken and your slot has not been booked. You can head back and try again whenever you're ready.</Body>
      </Shell>
    )
  }

  if (state === 'checking') {
    return (
      <Shell>
        <Heading>Confirming your payment…</Heading>
        <Body>Just a moment while we confirm your booking. Please don't close this page.</Body>
      </Shell>
    )
  }

  if (state === 'confirmed') {
    const first = (data?.client_name || '').split(' ')[0]
    return (
      <Shell>
        <Heading>{first ? `You're booked in, ${first}.` : "You're booked in."}</Heading>
        <Body>
          {data?.treatment ? <><strong style={{ color: TEXT, fontWeight: 500 }}>{data.treatment}</strong> is confirmed. </> : null}
          A confirmation email with the full details is on its way. A short health questionnaire will follow — please complete it before your session.
        </Body>
      </Shell>
    )
  }

  if (state === 'pending') {
    return (
      <Shell>
        <Heading>Payment received</Heading>
        <Body>Thanks — we're just finalising your booking. You'll get a confirmation email shortly. If it doesn't arrive within a few minutes, please get in touch.</Body>
      </Shell>
    )
  }

  return (
    <Shell>
      <Heading>Something went wrong</Heading>
      <Body>We couldn't confirm your booking automatically. If you completed payment, please contact us and we'll sort it out.</Body>
    </Shell>
  )
}
