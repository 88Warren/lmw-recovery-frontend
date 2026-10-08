import { useState, useEffect, useCallback } from 'react'
import { adminApi } from './adminApi'

function pad(n) { return String(n).padStart(2, '0') }

function toRFC3339(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

function fmtSlot(slot) {
  return new Date(slot.starts_at).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const TIME_OPTIONS = []
for (let h = 6; h <= 21; h++) {
  for (const m of [0, 30]) {
    if (h === 21 && m === 30) continue
    TIME_OPTIONS.push(`${pad(h)}:${pad(m)}`)
  }
}

export default function AdminSlots() {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('18:00')
  const [adding, setAdding]   = useState(false)
  const [addError, setAddError] = useState('')

  const [bulkDates, setBulkDates] = useState('')
  const [bulkTimes, setBulkTimes] = useState('18:00, 18:30, 19:00, 19:30, 20:00, 20:30')
  const [bulkAdding, setBulkAdding] = useState(false)
  const [bulkMsg, setBulkMsg]     = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setSlots(await adminApi.listSlots()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  const now      = new Date()
  const upcoming = slots.filter(s => new Date(s.starts_at) >= now)
  const past     = slots.filter(s => new Date(s.starts_at) <  now)

  async function handleAdd(e) {
    e.preventDefault()
    if (!date) { setAddError('Pick a date'); return }
    setAdding(true); setAddError('')
    try {
      await adminApi.createSlots({ starts_at: toRFC3339(date, time) })
      setDate(''); setTime('18:00')
      await load()
    } catch (e) { setAddError(e.message) }
    finally { setAdding(false) }
  }

  async function handleBulk(e) {
    e.preventDefault()
    setBulkAdding(true); setBulkMsg('')
    try {
      const dates = bulkDates.split(/[\s,]+/).map(d => d.trim()).filter(Boolean)
      const times = bulkTimes.split(/[\s,]+/).map(t => t.trim()).filter(Boolean)
      const bulk  = []
      for (const d of dates)
        for (const t of times)
          bulk.push({ starts_at: toRFC3339(d, t) })
      const res = await adminApi.createSlots({ bulk })
      setBulkMsg(`Created ${res.created} slot${res.created !== 1 ? 's' : ''}`)
      await load()
    } catch (e) { setBulkMsg(`Error: ${e.message}`) }
    finally { setBulkAdding(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this slot?')) return
    try { await adminApi.deleteSlot(id); setSlots(s => s.filter(x => x.id !== id)) }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <h2 style={styles.pageTitle}>Availability</h2>

      {/* Add single slot */}
      <Card title="Add a slot">
        <form onSubmit={handleAdd} style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'flex-end' }}>
          <Field label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().slice(0,10)} style={styles.input} />
          </Field>
          <Field label="Start time">
            <select value={time} onChange={e => setTime(e.target.value)} style={styles.input}>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Btn type="submit" loading={adding}>Add Slot</Btn>
        </form>
        {addError && <p style={styles.err}>{addError}</p>}
      </Card>

      {/* Bulk add */}
      <Card title="Bulk add slots" style={{ marginTop:'1.5rem' }}>
        <p style={styles.hint}>Paste dates (YYYY-MM-DD) and times — creates every combination. Default times match the studio schedule.</p>
        <form onSubmit={handleBulk} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <Field label="Dates (YYYY-MM-DD, comma or newline)" style={{ flex:'1 1 260px' }}>
              <textarea rows={3} value={bulkDates} onChange={e => setBulkDates(e.target.value)}
                placeholder={'2026-09-02\n2026-09-04\n2026-09-07'}
                style={{ ...styles.input, resize:'vertical', minWidth:'220px' }} />
            </Field>
            <Field label="Start times (HH:MM, comma separated)" style={{ flex:'1 1 200px' }}>
              <textarea rows={3} value={bulkTimes} onChange={e => setBulkTimes(e.target.value)}
                style={{ ...styles.input, resize:'vertical' }} />
            </Field>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <Btn type="submit" loading={bulkAdding}>Generate Slots</Btn>
            {bulkMsg && <span style={{ fontSize:'0.7rem', color: bulkMsg.startsWith('Error') ? '#e07070' : '#C9A15B' }}>{bulkMsg}</span>}
          </div>
        </form>
      </Card>

      {/* Upcoming */}
      <Card title={`Upcoming slots (${upcoming.length})`} style={{ marginTop:'1.5rem' }}>
        {loading && <p style={styles.hint}>Loading…</p>}
        {error   && <p style={styles.err}>{error}</p>}
        {!loading && upcoming.length === 0 && <p style={styles.hint}>No upcoming slots. Add some above.</p>}
        {upcoming.length > 0 && (
          <table style={styles.table}>
            <thead><tr>
              {['Date & Time', 'Status', 'Booked by', ''].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {upcoming.map(s => (
                <tr key={s.id} style={{ borderBottom:'1px solid rgba(201,161,91,0.08)' }}>
                  <td style={styles.td}>{fmtSlot(s)}</td>
                  <td style={styles.td}><StatusBadge booking={s.booking} /></td>
                  <td style={styles.td}>
                    {s.booking
                      ? <span>{s.booking.client_name}<br/><span style={{ color:'#78736C', fontSize:'0.62rem' }}>{s.booking.treatment} ({s.booking.duration_minutes} min)</span></span>
                      : <span style={{ color:'#78736C' }}>—</span>
                    }
                  </td>
                  <td style={{ ...styles.td, textAlign:'right' }}>
                    {!s.booking && <DangerBtn onClick={() => handleDelete(s.id)}>Delete</DangerBtn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Past */}
      {past.length > 0 && (
        <Card title={`Past slots (${past.length})`} style={{ marginTop:'1.5rem' }} collapsible>
          <table style={styles.table}>
            <thead><tr>
              {['Date & Time', 'Status', 'Booked by'].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {past.map(s => (
                <tr key={s.id} style={{ borderBottom:'1px solid rgba(201,161,91,0.06)', opacity:0.6 }}>
                  <td style={styles.td}>{fmtSlot(s)}</td>
                  <td style={styles.td}><StatusBadge booking={s.booking} /></td>
                  <td style={styles.td}>{s.booking ? s.booking.client_name : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ booking }) {
  if (booking) return <Badge color="#C9A15B" bg="rgba(201,161,91,0.12)">Booked</Badge>
  return <Badge color="#6fcf97" bg="rgba(111,207,151,0.1)">Available</Badge>
}

function Badge({ color, bg, children }) {
  return (
    <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.5rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color, backgroundColor:bg, padding:'0.2rem 0.5rem' }}>
      {children}
    </span>
  )
}

function Card({ title, children, style, collapsible }) {
  const [open, setOpen] = useState(!collapsible)
  return (
    <div style={{ backgroundColor:'#1a1a1a', border:'1px solid rgba(201,161,91,0.12)', ...style }}>
      <div style={{ padding:'1rem 1.25rem', borderBottom: open ? '1px solid rgba(201,161,91,0.12)' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center', cursor: collapsible ? 'pointer' : 'default' }}
        onClick={() => collapsible && setOpen(o => !o)}>
        <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F4F0EB', margin:0 }}>{title}</h3>
        {collapsible && <span style={{ color:'#C9A15B', fontSize:'0.7rem' }}>{open ? '▲' : '▼'}</span>}
      </div>
      {open && <div style={{ padding:'1.25rem' }}>{children}</div>}
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', ...style }}>
      <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.5rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#B8AEA0' }}>{label}</label>
      {children}
    </div>
  )
}

function Btn({ children, onClick, type='button', loading }) {
  return (
    <button type={type} onClick={onClick} disabled={loading} style={{
      fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:600,
      letterSpacing:'0.2em', textTransform:'uppercase',
      backgroundColor:'#C9A15B', color:'#171717',
      border:'none', padding:'0.65rem 1.25rem',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1, transition:'background-color 0.2s',
      whiteSpace:'nowrap', alignSelf:'flex-end',
    }}>{loading ? '…' : children}</button>
  )
}

function DangerBtn({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily:'Montserrat,sans-serif', fontSize:'0.48rem', fontWeight:600,
        letterSpacing:'0.15em', textTransform:'uppercase',
        backgroundColor:'transparent', color: hov ? '#e07070' : '#78736C',
        border:`1px solid ${hov ? '#e07070' : 'rgba(120,115,108,0.3)'}`,
        padding:'0.3rem 0.65rem', cursor:'pointer', transition:'all 0.2s',
      }}>{children}</button>
  )
}

import { styles } from './adminStyles'
