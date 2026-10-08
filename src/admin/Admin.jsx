import { useState } from 'react'
import { useAdminAuth } from './useAdminAuth'
import AdminLogin    from './AdminLogin'
import AdminSlots    from './AdminSlots'
import AdminBookings from './AdminBookings'
import AdminContacts from './AdminContacts'

const NAV = [
  { id: 'slots',    label: 'Availability',
    icon: <path d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/> },
  { id: 'bookings', label: 'Bookings',
    icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></> },
  { id: 'contacts', label: 'Enquiries',
    icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
]

export default function Admin() {
  const { login, logout, isAuthed } = useAdminAuth()
  const [tab, setTab] = useState('slots')

  if (!isAuthed) return <AdminLogin onLogin={login} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', fontFamily: 'Montserrat, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <header style={{
        backgroundColor: '#171717',
        borderBottom: '1px solid rgba(201,161,91,0.15)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '3.75rem', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 600, color: '#C9A15B', letterSpacing: '0.1em' }}>LMW</span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.42rem', fontWeight: 600, letterSpacing: '0.35em', color: '#78736C', textTransform: 'uppercase' }}>Recovery · Admin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* View site link */}
          <a href="/" target="_blank" rel="noopener noreferrer" style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 500,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#78736C', textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
          onMouseLeave={e => e.currentTarget.style.color = '#78736C'}
          >View site ↗</a>

          <button onClick={logout} style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            backgroundColor: 'transparent', color: '#78736C',
            border: '1px solid rgba(120,115,108,0.3)',
            padding: '0.4rem 0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#e07070'; e.currentTarget.style.color = '#e07070' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120,115,108,0.3)'; e.currentTarget.style.color = '#78736C' }}
          >Sign out</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar nav ── */}
        <nav style={{
          width: '13rem', flexShrink: 0,
          backgroundColor: '#141414',
          borderRight: '1px solid rgba(201,161,91,0.1)',
          padding: '1.5rem 0',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {NAV.map(({ id, label, icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem',
                fontWeight: active ? 600 : 400, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backgroundColor: active ? 'rgba(201,161,91,0.08)' : 'transparent',
                color: active ? '#C9A15B' : '#78736C',
                border: 'none', borderLeft: active ? '2px solid #C9A15B' : '2px solid transparent',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                  {icon}
                </svg>
                {label}
              </button>
            )
          })}
        </nav>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
          {tab === 'slots'    && <AdminSlots />}
          {tab === 'bookings' && <AdminBookings />}
          {tab === 'contacts' && <AdminContacts />}
        </main>
      </div>
    </div>
  )
}
