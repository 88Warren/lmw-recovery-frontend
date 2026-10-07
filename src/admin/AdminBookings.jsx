import { useState, useEffect, useCallback } from 'react'
import { adminApi } from './adminApi'
import { styles } from './AdminSlots'

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState('all') // all | confirmed | cancelled

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setBookings(await adminApi.listBookings()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCancel(id) {
    if (!confirm('Cancel this booking? The slot will be freed.')) return
    try {
      await adminApi.cancelBooking(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (e) { alert(e.message) }
  }

  const visible = bookings.filter(b => filter === 'all' || b.status === filter)
  const counts  = {
    all:       bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div>
      <h2 style={styles.pageTitle}>Bookings</h2>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid rgba(201,161,91,0.15)' }}>
        {['all', 'confirmed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.65rem 1.25rem',
            color: filter === f ? '#C9A15B' : '#78736C',
            borderBottom: filter === f ? '2px solid #C9A15B' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.2s',
          }}>
            {f} <span style={{ opacity: 0.6 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading && <p style={styles.hint}>Loading…</p>}
      {error   && <p style={styles.err}>{error}</p>}
      {!loading && visible.length === 0 && <p style={styles.hint}>No bookings to show.</p>}

      {visible.length > 0 && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,161,91,0.12)' }}>
          <table style={{ ...styles.table, tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '6%'  }} />
            </colgroup>
            <thead>
              <tr>
                {['Session', 'Treatment', 'Client', 'Email', 'Phone', 'Status', ''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(b => (
                <tr key={b.id} style={{
                  borderBottom: '1px solid rgba(201,161,91,0.08)',
                  opacity: b.status === 'cancelled' ? 0.5 : 1,
                }}>
                  <td style={styles.td}>{fmtDate(b.starts_at)}</td>
                  <td style={styles.td}>{b.treatment}</td>
                  <td style={styles.td}>
                    {b.client_name}
                    {b.notes && (
                      <div style={{ fontSize: '0.6rem', color: '#78736C', marginTop: '0.2rem', fontStyle: 'italic' }}
                        title={b.notes}>
                        {b.notes.length > 40 ? b.notes.slice(0, 40) + '…' : b.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ ...styles.td, wordBreak: 'break-all' }}>
                    <a href={`mailto:${b.client_email}`} style={{ color: '#B8AEA0', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
                      onMouseLeave={e => e.currentTarget.style.color = '#B8AEA0'}
                    >{b.client_email}</a>
                  </td>
                  <td style={styles.td}>{b.client_phone || '—'}</td>
                  <td style={styles.td}>
                    <StatusPill status={b.status} brevo={b.brevo_sent} />
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {b.status === 'confirmed' && (
                      <CancelBtn onClick={() => handleCancel(b.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status, brevo }) {
  const map = {
    confirmed: { color: '#6fcf97', bg: 'rgba(111,207,151,0.1)', label: 'Confirmed' },
    cancelled: { color: '#e07070', bg: 'rgba(224,112,112,0.1)', label: 'Cancelled' },
    pending:   { color: '#C9A15B', bg: 'rgba(201,161,91,0.1)',  label: 'Pending'   },
  }
  const { color, bg, label } = map[status] ?? map.pending
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color, backgroundColor: bg, padding: '0.2rem 0.45rem', display: 'inline-block' }}>{label}</span>
      {status === 'confirmed' && (
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.45rem', color: brevo ? '#6fcf97' : '#78736C' }}>
          {brevo ? '✓ questionnaire sent' : '○ questionnaire pending'}
        </span>
      )}
    </div>
  )
}

function CancelBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '0.45rem', fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        backgroundColor: 'transparent',
        color: hov ? '#e07070' : '#78736C',
        border: `1px solid ${hov ? '#e07070' : 'rgba(120,115,108,0.3)'}`,
        padding: '0.25rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}>Cancel</button>
  )
}
