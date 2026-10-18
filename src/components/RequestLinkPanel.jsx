import { useState } from 'react'
import { api } from '../api'

const GOLD = '#C9A15B'
const TEXT = '#F4F0EB'
const MUTED = '#B8AEA0'

// Inline form letting a returning Maintenance Plan member request a passwordless
// magic link to book this month's sessions without paying again.
export default function RequestLinkPanel() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email.includes('@')) { setMsg('Enter a valid email'); setStatus('error'); return }
    setStatus('sending'); setMsg('')
    try {
      const res = await api.requestMemberLink(email.trim())
      setMsg(res?.message ?? 'Check your email for a sign-in link.')
      setStatus('sent')
    } catch {
      setMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.65rem', fontWeight: 300, color: MUTED, lineHeight: 1.7 }}>
        {msg}
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.6rem', fontWeight: 300, color: '#78736C', lineHeight: 1.6 }}>
        Already on the Maintenance Plan? Enter your email and we'll send a link to book this month's sessions.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ flex: 1, fontFamily: 'Montserrat,sans-serif', fontSize: '0.75rem', backgroundColor: '#1c1c1c', border: '1px solid rgba(201,161,91,0.25)', color: TEXT, padding: '0.6rem 0.75rem', outline: 'none' }}
        />
        <button type="submit" disabled={status === 'sending'}
          style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0 1rem', border: `1px solid ${GOLD}`, backgroundColor: 'transparent', color: GOLD, cursor: status === 'sending' ? 'wait' : 'pointer' }}>
          {status === 'sending' ? 'Sending…' : 'Send link'}
        </button>
      </div>
      {status === 'error' && <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.6rem', color: '#e07070' }}>{msg}</p>}
    </form>
  )
}
