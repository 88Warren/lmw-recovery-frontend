import { useState, useEffect, useCallback } from 'react'
import { adminApi } from './adminApi'
import { styles } from './adminStyles'

/*
 * Private, admin-only view of client health screening submissions. Lists every
 * submitted form; expanding one fetches and renders the full answers (identity,
 * lifestyle, medical questions, GP info, declaration & consent).
 */

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const GOLD = '#C9A15B'

export default function AdminScreening() {
  const [forms, setForms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [expanded, setExpanded] = useState(null)
  const [detail, setDetail]   = useState(null)   // full submission for the expanded row
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setForms(await adminApi.listScreening()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  async function toggle(id) {
    if (expanded === id) { setExpanded(null); setDetail(null); return }
    setExpanded(id); setDetail(null); setDetailLoading(true)
    try { setDetail(await adminApi.getScreening(id)) }
    catch (e) { setError(e.message) }
    finally { setDetailLoading(false) }
  }

  return (
    <div>
      <h2 style={styles.pageTitle}>Screening forms</h2>

      {loading && <p style={styles.hint}>Loading…</p>}
      {error   && <p style={styles.err}>{error}</p>}
      {!loading && forms.length === 0 && <p style={styles.hint}>No screening forms submitted yet.</p>}

      {forms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {forms.map(f => (
            <div key={f.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,161,91,0.12)' }}>
              <div onClick={() => toggle(f.id)} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1.25rem', cursor: 'pointer', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0 }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: 'rgba(201,161,91,0.15)', border: '1px solid rgba(201,161,91,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', color: GOLD,
                  }}>{f.client_name.charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 500, color: '#F4F0EB', marginBottom: '0.1rem' }}>{f.client_name}</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', fontWeight: 300, color: '#78736C' }}>
                      {f.client_email}{f.client_phone ? ` · ${f.client_phone}` : ''}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 300, color: '#78736C', whiteSpace: 'nowrap' }}>
                    {fmtDate(f.submitted_at)}
                  </span>
                  <span style={{ color: GOLD, fontSize: '0.65rem' }}>{expanded === f.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === f.id && (
                <div style={{ padding: '0.5rem 1.25rem 1.5rem', borderTop: '1px solid rgba(201,161,91,0.1)' }}>
                  {detailLoading && <p style={styles.hint}>Loading form…</p>}
                  {detail && detail.id === f.id && <FormDetail d={detail} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Detail rendering ──────────────────────────────────────────────────────────

const sectionTitle = {
  fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700,
  letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD,
  margin: '1.5rem 0 0.75rem',
}
const rowLabel = { fontSize: '0.58rem', color: '#78736C', fontWeight: 400, width: 200, verticalAlign: 'top', padding: '0.3rem 0.75rem 0.3rem 0' }
const rowVal   = { fontSize: '0.72rem', color: '#B8AEA0', fontWeight: 300, lineHeight: 1.6, padding: '0.3rem 0' }

function KV({ label, value }) {
  return (
    <tr>
      <td style={rowLabel}>{label}</td>
      <td style={rowVal}>{value || <span style={{ color: '#555' }}>—</span>}</td>
    </tr>
  )
}

function YesNoList({ items }) {
  if (!Array.isArray(items)) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {items.map((it, i) => {
        const yes = it.answer === 'yes'
        return (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', fontSize: '0.7rem', lineHeight: 1.5 }}>
            <span style={{
              flexShrink: 0, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: yes ? '#e0b070' : '#5a7a5a', minWidth: 30,
            }}>{it.answer || '—'}</span>
            <span style={{ color: '#B8AEA0', fontWeight: 300 }}>
              {it.question}
              {it.details ? <span style={{ color: '#e0b070', display: 'block', fontSize: '0.66rem', marginTop: 2 }}>↳ {it.details}</span> : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function FormDetail({ d }) {
  const a = d.answers ?? {}
  const cd = a.client_details ?? {}
  const ls = a.lifestyle ?? {}
  const mh = a.more_about_health ?? {}
  return (
    <div>
      <p style={sectionTitle}>Client details</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <KV label="Name" value={[cd.title, cd.firstName, cd.surname].filter(Boolean).join(' ')} />
          <KV label="Date of birth" value={cd.dob || d.date_of_birth} />
          <KV label="Address" value={cd.address} />
          <KV label="Mobile" value={cd.mobile || d.client_phone} />
          <KV label="Email" value={cd.email || d.client_email} />
          <KV label="Emergency contact" value={cd.emergency} />
        </tbody>
      </table>

      <p style={sectionTitle}>Lifestyle</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <KV label="Occupation" value={ls.occupation} />
          <KV label="Full / part time" value={ls.workPattern} />
          <KV label="Daily activities" value={ls.dailyActivities} />
          <KV label="Hobbies / sport" value={ls.hobbies} />
          <KV label="Exercise per week" value={ls.exerciseHours} />
        </tbody>
      </table>

      <p style={sectionTitle}>General health</p>
      <YesNoList items={a.general_health} />

      <p style={sectionTitle}>Conditions that may affect treatment</p>
      <YesNoList items={a.conditions} />

      <p style={sectionTitle}>More about health</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <KV label="Major operations" value={mh.operations} />
          <KV label="Current medication" value={mh.medication} />
          <KV label="Other conditions" value={mh.otherConditions} />
          <KV label="Visited GP (last 6 months)" value={mh.gpVisit} />
          <KV label="GP permission for massage" value={mh.gpPermission} />
        </tbody>
      </table>

      <p style={sectionTitle}>Declaration &amp; consent</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <KV label="Consent to treatment" value={d.consent_treatment ? 'Given' : 'Not given'} />
          <KV label="Privacy & terms agreed" value={d.consent_data ? 'Agreed' : 'Not agreed'} />
          <KV label="Signed (typed name)" value={d.signature_name} />
          <KV label="Submitted" value={fmtDate(d.submitted_at)} />
        </tbody>
      </table>
    </div>
  )
}
