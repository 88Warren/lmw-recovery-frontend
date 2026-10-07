import { useState } from 'react'
import { adminApi } from './adminApi'

export default function AdminLogin({ onLogin }) {
  const [token, setToken]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token.trim()) { setError('Enter your admin token'); return }

    setLoading(true)
    setError('')

    // Temporarily store token so adminApi picks it up, then test it
    sessionStorage.setItem('lmw_admin_token', token.trim())
    try {
      await adminApi.listSlots()   // cheap authenticated call to verify
      onLogin(token.trim())
    } catch {
      sessionStorage.removeItem('lmw_admin_token')
      setError('Invalid token — check your ADMIN_TOKEN env var')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f0f0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: '#171717',
        borderTop: '2px solid #C9A15B',
        padding: '2.5rem',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', fontWeight: 600, color: '#C9A15B', letterSpacing: '0.12em', lineHeight: 1 }}>LMW</div>
          <div style={{ fontSize: '0.42rem', fontWeight: 500, letterSpacing: '0.45em', color: '#F4F0EB', marginTop: '2px' }}>RECOVERY · ADMIN</div>
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#F4F0EB', marginBottom: '0.5rem' }}>Sign in</h1>
        <p style={{ fontSize: '0.7rem', fontWeight: 300, color: '#78736C', marginBottom: '2rem', lineHeight: 1.7 }}>
          Enter your admin token to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8AEA0' }}>
              Admin Token
            </label>
            <input
              type="password"
              value={token}
              onChange={e => { setToken(e.target.value); setError('') }}
              placeholder="••••••••••••"
              autoFocus
              style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', fontWeight: 300,
                backgroundColor: '#1c1c1c',
                border: `1px solid ${error ? '#e07070' : 'rgba(201,161,91,0.2)'}`,
                color: '#F4F0EB', padding: '0.75rem 1rem', outline: 'none',
              }}
            />
            {error && <span style={{ fontSize: '0.65rem', color: '#e07070' }}>{error}</span>}
          </div>

          <button type="submit" disabled={loading} style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            backgroundColor: loading ? '#b8904a' : '#C9A15B', color: '#171717',
            border: 'none', padding: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s',
          }}>
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
