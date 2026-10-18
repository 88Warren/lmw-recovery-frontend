import { useState, useEffect } from 'react'
import { api } from '../api'

/*
 * Client self-service booking management, reached from the signed link in the
 * confirmation email: /booking/manage?token=…
 *
 *  One-off booking:
 *    - Reschedule the session (acts directly, > 24h only)
 *    - Request cancellation (studio processes the refund)
 *
 *  Maintenance Plan member:
 *    - Shows BOTH plan sessions; reschedule either (acts directly, > 24h only)
 *    - "Cancel my plan" opens the Stripe portal to cancel the whole subscription
 *      (stops all future billing) — not a single session.
 */

const GOLD = '#C9A15B'
const BG = '#171717'
const TEXT = '#F4F0EB'
const MUTED = '#B8AEA0'

const linkToken = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('token')
  : null

function fmtLong(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Montserrat,sans-serif' }}>
      <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '2.2rem', fontWeight: 600, color: GOLD, letterSpacing: '0.12em', marginBottom: '0.25rem' }}>LMW</div>
        <div style={{ fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.87em', color: TEXT, marginBottom: '2rem' }}>RECOVERY</div>
        {children}
      </div>
    </div>
  )
}

function Btn({ children, onClick, disabled, variant = 'solid' }) {
  const solid = variant === 'solid'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: 'Montserrat,sans-serif', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
      padding: '0.8rem 1.4rem', border: `1px solid ${GOLD}`,
      backgroundColor: solid ? GOLD : 'transparent', color: solid ? '#171717' : GOLD,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
    }}>{children}</button>
  )
}

function BackLink() {
  return <div style={{ marginTop: '2rem' }}><a href="/" style={{ color: GOLD, fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>Back to site</a></div>
}

export default function ManageBooking() {
  const [phase, setPhase] = useState('loading')      // loading | view | reschedule | confirmCancel | done | error
  const [view, setView] = useState(null)              // { client_name, is_member, cancel_mode, sessions[] }
  const [activeToken, setActiveToken] = useState(null) // session token being rescheduled
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [doneMsg, setDoneMsg] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  async function reload() {
    const v = await api.getManagedBooking(linkToken)
    setView(v)
    return v
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!linkToken) { if (active) setPhase('error'); return }
      try {
        await reload()
        if (active) setPhase('view')
      } catch {
        if (active) setPhase('error')
      }
    }
    const t = setTimeout(run, 0)
    return () => { active = false; clearTimeout(t) }
  }, [])

  async function openReschedule(session) {
    setActiveToken(session.token); setPhase('reschedule'); setSlotsLoading(true); setError('')
    try {
      const data = await api.getSlots(session.treatment_duration_minutes)
      setSlots(data.filter(s => !s.free_minutes || s.free_minutes >= session.treatment_duration_minutes))
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  async function doReschedule(slotId) {
    setBusy(true); setError('')
    try {
      const res = await api.rescheduleBooking(activeToken, slotId)
      setDoneMsg(res?.message ?? 'Your session has been moved.')
      setPhase('done')
    } catch (e) {
      setError(e.message); setBusy(false)
    }
  }

  async function doRequestCancel() {
    setBusy(true); setError('')
    try {
      const res = await api.requestCancellation(linkToken, cancelReason.trim())
      setDoneMsg(res?.message ?? 'Your cancellation request has been received.')
      setPhase('done')
    } catch (e) {
      setError(e.message); setBusy(false)
    }
  }

  async function doCancelPlan() {
    setBusy(true); setError('')
    try {
      const res = await api.openManagePortal(linkToken)
      if (res?.portal_url) { window.location.assign(res.portal_url); return }
      throw new Error('Could not open the billing portal.')
    } catch (e) {
      setError(e.message); setBusy(false)
    }
  }

  if (phase === 'loading') return <Shell><p style={{ color: MUTED, fontSize: '0.8rem' }}>Loading your booking…</p></Shell>

  if (phase === 'error') return (
    <Shell>
      <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400 }}>Link expired</h1>
      <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.8, margin: '1rem 0 0' }}>This link is invalid or has expired. Please contact us directly to change your booking.</p>
      <BackLink />
    </Shell>
  )

  if (phase === 'done') return (
    <Shell>
      <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400 }}>All done</h1>
      <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.8, margin: '1rem 0 0' }}>{doneMsg}</p>
      <BackLink />
    </Shell>
  )

  if (phase === 'reschedule') {
    return (
      <Shell>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: '1.5rem' }}>Choose a new time</h1>
        {error && <p style={{ color: '#e07070', fontSize: '0.7rem', marginBottom: '1rem' }}>{error}</p>}
        {slotsLoading ? (
          <p style={{ color: MUTED, fontSize: '0.8rem' }}>Loading availability…</p>
        ) : slots.length === 0 ? (
          <p style={{ color: MUTED, fontSize: '0.8rem' }}>No other times are currently available. Please check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 320, overflowY: 'auto', maxWidth: 380, margin: '0 auto' }}>
            {slots.map(s => (
              <button key={s.id} onClick={() => doReschedule(s.id)} disabled={busy} style={{
                textAlign: 'left', padding: '0.7rem 1rem', backgroundColor: '#1a1a1a', border: '1px solid rgba(201,161,91,0.2)', color: TEXT,
                fontFamily: 'Montserrat,sans-serif', fontSize: '0.75rem', cursor: busy ? 'wait' : 'pointer',
              }}>
                {fmtLong(s.starts_at)} — {fmtTime(s.starts_at)}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          <Btn variant="outline" onClick={() => { setPhase('view'); setError('') }} disabled={busy}>Back</Btn>
        </div>
      </Shell>
    )
  }

  if (phase === 'confirmCancel') {
    return (
      <Shell>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: '1.25rem' }}>Request cancellation</h1>
        {error && <p style={{ color: '#e07070', fontSize: '0.7rem', marginBottom: '1rem' }}>{error}</p>}
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left', border: '1px solid rgba(224,112,112,0.3)', backgroundColor: 'rgba(224,112,112,0.06)', padding: '1.25rem' }}>
          <p style={{ fontSize: '0.7rem', color: MUTED, lineHeight: 1.7, margin: '0 0 1rem', textAlign: 'center' }}>
            The studio will process the cancellation and a full refund, then confirm by email.
          </p>
          <label style={{ display: 'block', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#78736C', marginBottom: '0.4rem' }}>Reason (optional)</label>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={2} placeholder="Anything you'd like us to know?"
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'Montserrat,sans-serif', fontSize: '0.75rem', backgroundColor: '#1c1c1c', border: '1px solid rgba(201,161,91,0.2)', color: TEXT, padding: '0.6rem 0.75rem', outline: 'none', resize: 'vertical', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Btn variant="outline" onClick={() => { setPhase('view'); setCancelReason(''); setError('') }} disabled={busy}>Keep booking</Btn>
            <Btn onClick={doRequestCancel} disabled={busy}>{busy ? 'Sending…' : 'Confirm request'}</Btn>
          </div>
        </div>
        <BackLink />
      </Shell>
    )
  }

  // phase === 'view'
  const sessions = view.sessions ?? []
  const anyChangeable = sessions.some(s => s.changeable && s.status !== 'cancelled')
  return (
    <Shell>
      <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '0.5rem' }}>Manage your booking</h1>
      <p style={{ color: MUTED, fontSize: '0.72rem', margin: '0 0 1.75rem' }}>
        {view.is_member ? 'Your Maintenance Plan sessions' : 'Your session'}
      </p>
      {error && <p style={{ color: '#e07070', fontSize: '0.7rem', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420, margin: '0 auto 1.75rem' }}>
        {sessions.map((s, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${GOLD}`, paddingLeft: '1rem', textAlign: 'left', backgroundColor: '#1a1a1a', padding: '0.85rem 1rem' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, margin: '0 0 0.3rem' }}>{s.treatment}</p>
            <p style={{ fontSize: '0.78rem', color: TEXT, margin: 0 }}>{fmtLong(s.starts_at)}</p>
            <p style={{ fontSize: '0.72rem', color: MUTED, margin: '0.15rem 0 0.6rem' }}>{fmtTime(s.starts_at)}</p>
            {s.status === 'cancelled' ? (
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e07070' }}>Cancelled</span>
            ) : s.changeable ? (
              <button onClick={() => openReschedule(s)} disabled={busy} style={{
                fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                backgroundColor: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, padding: '0.4rem 0.8rem', cursor: 'pointer',
              }}>Reschedule this session</button>
            ) : (
              <span style={{ fontSize: '0.58rem', color: '#78736C' }}>Within 24h — contact us to change</span>
            )}
          </div>
        ))}
      </div>

      {/* Cancellation area differs for members vs one-off */}
      {view.cancel_mode === 'subscription' ? (
        <>
          <Btn variant="outline" onClick={doCancelPlan} disabled={busy}>Cancel my plan</Btn>
          <p style={{ color: '#78736C', fontSize: '0.62rem', lineHeight: 1.7, margin: '1.25rem auto 0', maxWidth: 400 }}>
            Cancelling your plan stops all future monthly payments and releases any upcoming plan sessions. Reschedules above move an individual session only.
          </p>
        </>
      ) : (
        anyChangeable && (
          <>
            <Btn variant="outline" onClick={() => { setPhase('confirmCancel'); setError('') }} disabled={busy}>Request cancellation</Btn>
            <p style={{ color: '#78736C', fontSize: '0.62rem', lineHeight: 1.7, margin: '1.25rem auto 0', maxWidth: 400 }}>
              Rescheduling moves your session straight away. Cancellations (with a full refund) are processed by the studio.
            </p>
          </>
        )
      )}
      <BackLink />
    </Shell>
  )
}
