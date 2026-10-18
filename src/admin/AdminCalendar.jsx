import { useState, useEffect, useCallback, useMemo } from 'react'
import { adminApi } from './adminApi'
import { styles } from './adminStyles'

/*
 * Diary / calendar view: a week-at-a-glance of confirmed (and pending) sessions.
 * Reuses the existing admin bookings endpoint — no backend changes. Each session
 * is a block in its day column, positioned by start time and sized by duration
 * (so a 1-hour session is visibly taller than a 30-minute one).
 */

const GOLD = '#C9A15B'
const TEXT = '#F4F0EB'
const MUTED = '#B8AEA0'

// The grid's hour range is derived from the week's actual sessions (see
// useMemo below) so there's no dead space. These bound the auto-range and act
// as the fallback for an empty week — tuned to the studio's usual hours
// (Sunday mornings from 09:00, evening sessions ending ~20:30).
const FALLBACK_START_HOUR = 9
const FALLBACK_END_HOUR = 21
const PX_PER_MIN = 1.2 // row height scale: 60min = 72px

// The studio's standard open days (JS getDay(): 0=Sun … 6=Sat). The diary shows
// these plus any day that happens to have a session (in case a one-off slot was
// added manually on a normally-closed day).
const OPEN_DAYS = new Set([2, 3, 4, 0]) // Tue, Wed, Thu, Sun

function startOfWeek(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay() // 0 = Sun
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day)) // Monday start
  return x
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function fmtTime(d) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setBookings(await adminApi.listBookings()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  // Only active sessions (hide cancelled) within the visible week.
  const weekEnd = addDays(weekStart, 7)
  const sessions = useMemo(() => bookings
    .filter(b => b.status !== 'cancelled')
    .map(b => ({ ...b, start: new Date(b.starts_at) }))
    .filter(b => b.start >= weekStart && b.start < weekEnd),
  [bookings, weekStart, weekEnd])

  // Show the standard open days, plus any closed day that has a session this
  // week (e.g. a manually-added one-off slot), so nothing is ever hidden.
  const days = useMemo(() => {
    const daysWithSessions = new Set(sessions.map(s => s.start.getDay()))
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      .filter(d => OPEN_DAYS.has(d.getDay()) || daysWithSessions.has(d.getDay()))
  }, [weekStart, sessions])

  // Derive the visible hour range from the week's sessions so the grid hugs the
  // actual opening hours instead of showing a block of empty space. Pad by half
  // an hour each side; fall back to the studio's usual hours for an empty week.
  const { startHour, endHour } = useMemo(() => {
    if (sessions.length === 0) {
      return { startHour: FALLBACK_START_HOUR, endHour: FALLBACK_END_HOUR }
    }
    let minMin = 24 * 60, maxMin = 0
    for (const s of sessions) {
      const startM = s.start.getHours() * 60 + s.start.getMinutes()
      const endM = startM + (s.treatment_duration_minutes || 60)
      if (startM < minMin) minMin = startM
      if (endM > maxMin) maxMin = endM
    }
    // Floor to the hour below (with 30m pad) and ceil to the hour above.
    const start = Math.max(0, Math.floor((minMin - 30) / 60))
    const end = Math.min(24, Math.ceil((maxMin + 30) / 60))
    return { startHour: start, endHour: Math.max(end, start + 1) }
  }, [sessions])

  const hours = []
  for (let h = startHour; h <= endHour; h++) hours.push(h)
  const gridHeight = (endHour - startHour) * 60 * PX_PER_MIN

  const today = new Date()
  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div>
      <h2 style={styles.pageTitle}>Diary</h2>

      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <NavBtn onClick={() => setWeekStart(w => addDays(w, -7))}>←</NavBtn>
        <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.75rem', color: TEXT, minWidth: '11rem', textAlign: 'center' }}>{weekLabel}</span>
        <NavBtn onClick={() => setWeekStart(w => addDays(w, 7))}>→</NavBtn>
        <button onClick={() => setWeekStart(startOfWeek(new Date()))} style={{
          fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
          backgroundColor: 'transparent', color: MUTED, border: '1px solid rgba(201,161,91,0.25)', padding: '0.4rem 0.8rem', cursor: 'pointer',
        }}>This week</button>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.9rem' }}>
          <Legend swatch="#C9A15B" label="1 hour" />
          <Legend swatch="#7FA8C9" label="30 min" />
          <Legend swatch="#9B8BC9" label="Plan" />
        </span>
      </div>

      {loading && <p style={styles.hint}>Loading…</p>}
      {error && <p style={styles.err}>{error}</p>}

      {!loading && !error && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,161,91,0.12)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: `${48 + days.length * 110}px` }}>
            {/* Time gutter */}
            <div style={{ width: '3rem', flexShrink: 0, borderRight: '1px solid rgba(201,161,91,0.1)' }}>
              <div style={{ height: '2.5rem', borderBottom: '1px solid rgba(201,161,91,0.1)' }} />
              <div style={{ position: 'relative', height: gridHeight }}>
                {hours.map(h => (
                  <div key={h} style={{ position: 'absolute', top: (h - startHour) * 60 * PX_PER_MIN, right: '0.4rem', transform: 'translateY(-50%)', fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', color: '#78736C' }}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Day columns */}
            {days.map((day, i) => {
              const isToday = sameDay(day, today)
              const daySessions = sessions.filter(s => sameDay(s.start, day))
              return (
                <div key={i} style={{ flex: 1, minWidth: '90px', borderRight: i < days.length - 1 ? '1px solid rgba(201,161,91,0.08)' : 'none' }}>
                  {/* Day header */}
                  <div style={{
                    height: '2.5rem', borderBottom: '1px solid rgba(201,161,91,0.1)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? 'rgba(201,161,91,0.08)' : 'transparent',
                  }}>
                    <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: isToday ? GOLD : '#78736C' }}>
                      {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                    <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.62rem', color: isToday ? TEXT : MUTED }}>
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Hour grid + session blocks */}
                  <div style={{ position: 'relative', height: gridHeight }}>
                    {hours.map(h => (
                      <div key={h} style={{ position: 'absolute', top: (h - startHour) * 60 * PX_PER_MIN, left: 0, right: 0, borderTop: '1px solid rgba(201,161,91,0.06)' }} />
                    ))}
                    {daySessions.map(s => <SessionBlock key={s.id} s={s} startHour={startHour} />)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <p style={{ ...styles.hint, marginTop: '1rem' }}>No sessions booked this week.</p>
      )}
    </div>
  )
}

function SessionBlock({ s, startHour }) {
  const mins = s.treatment_duration_minutes || 60
  const startMin = s.start.getHours() * 60 + s.start.getMinutes()
  const top = (startMin - startHour * 60) * PX_PER_MIN
  const height = Math.max(mins * PX_PER_MIN, 22)

  // Colour: plan sessions purple, else by duration.
  const color = s.is_member ? '#9B8BC9' : (mins <= 30 ? '#7FA8C9' : '#C9A15B')
  const pending = s.status === 'pending'

  return (
    <div
      title={`${fmtTime(s.start)} · ${s.treatment} · ${s.client_name}${pending ? ' (pending payment)' : ''}`}
      style={{
        position: 'absolute', top, height, left: '2px', right: '2px',
        backgroundColor: hexA(color, 0.16), borderLeft: `3px solid ${color}`,
        padding: '2px 4px', overflow: 'hidden', borderRadius: '2px',
        opacity: pending ? 0.6 : 1,
      }}>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.48rem', fontWeight: 700, color }}>{fmtTime(s.start)}</div>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.52rem', fontWeight: 500, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.client_name}</div>
      {height > 34 && (
        <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.46rem', color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.treatment}{pending ? ' · pending' : ''}
        </div>
      )}
    </div>
  )
}

function NavBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'Montserrat,sans-serif', fontSize: '0.9rem', color: GOLD,
      backgroundColor: 'transparent', border: '1px solid rgba(201,161,91,0.25)',
      width: '2rem', height: '2rem', cursor: 'pointer', lineHeight: 1,
    }}>{children}</button>
  )
}

function Legend({ swatch, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
      <span style={{ width: '0.6rem', height: '0.6rem', backgroundColor: swatch, borderRadius: '2px' }} />
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.5rem', color: '#78736C' }}>{label}</span>
    </span>
  )
}

// hexA turns a #rrggbb colour + alpha into an rgba() string.
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
