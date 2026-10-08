import { useState, useEffect, useCallback } from 'react'
import { adminApi } from './adminApi'
import { styles } from './adminStyles'

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setContacts(await adminApi.listContacts()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <div>
      <h2 style={styles.pageTitle}>Enquiries</h2>

      {loading && <p style={styles.hint}>Loading…</p>}
      {error   && <p style={styles.err}>{error}</p>}
      {!loading && contacts.length === 0 && <p style={styles.hint}>No enquiries yet.</p>}

      {contacts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contacts.map(c => (
            <div key={c.id} style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(201,161,91,0.12)',
            }}>
              {/* Header row — always visible */}
              <div
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.9rem 1.25rem', cursor: 'pointer',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: 'rgba(201,161,91,0.15)',
                    border: '1px solid rgba(201,161,91,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '1rem', color: '#C9A15B',
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 500, color: '#F4F0EB', marginBottom: '0.1rem' }}>{c.name}</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', fontWeight: 300, color: '#78736C' }}>
                      {c.email}{c.phone ? ` · ${c.phone}` : ''}
                    </p>
                  </div>

                  {/* Message preview */}
                  {expanded !== c.id && (
                    <p style={{
                      fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', fontWeight: 300,
                      color: '#78736C', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', maxWidth: '260px',
                      display: 'none',
                    }} className="contact-preview">
                      {c.message}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 300, color: '#78736C', whiteSpace: 'nowrap' }}>
                    {fmtDate(c.created_at)}
                  </span>
                  <span style={{ color: '#C9A15B', fontSize: '0.65rem' }}>{expanded === c.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded message */}
              {expanded === c.id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(201,161,91,0.1)' }}>
                  <p style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300,
                    color: '#B8AEA0', lineHeight: 1.85, whiteSpace: 'pre-wrap',
                    padding: '1rem 0',
                  }}>{c.message}</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <ReplyBtn href={`mailto:${c.email}?subject=Re: Your LMW Recovery Enquiry`}>
                      Reply by email
                    </ReplyBtn>
                    {c.phone && (
                      <ReplyBtn href={`tel:${c.phone}`}>Call {c.phone}</ReplyBtn>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReplyBtn({ href, children }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: hov ? '#171717' : '#C9A15B',
        backgroundColor: hov ? '#C9A15B' : 'transparent',
        border: '1px solid #C9A15B',
        padding: '0.4rem 0.9rem', textDecoration: 'none',
        transition: 'all 0.2s', display: 'inline-block',
      }}
    >{children}</a>
  )
}
