import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

/* ─── Constants ─────────────────────────────────────────────────────────── */

const FALLBACK_TREATMENTS = [
  { id: 'sports-massage',   name: 'Sports Massage',   duration_minutes: 60, price: '£45' },
  { id: 'recovery-express', name: 'Recovery Express', duration_minutes: 30, price: '£30' },
  { id: 'maintenance-plan', name: 'Maintenance Plan', duration_minutes: 60, price: '£80', note: 'Fortnightly · 2 sessions per month' },
]

// Steps: 0=DateTime, 1=Treatment, 2=Details, 3=Confirmed
// Maintenance has an extra step 1b for picking the second session
const STEPS = ['Date & Time', 'Treatment', 'Your Details']

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function formatDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmt24(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function weekStart(date) {
  const d = new Date(date); d.setHours(0,0,0,0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}
function weekStartOffset(n) {
  const m = weekStart(new Date()); m.setDate(m.getDate() + n * 7); return m
}
function weekRangeLabel(mon) {
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const monStr = mon.toLocaleDateString('en-GB', { day: 'numeric', month: mon.getMonth() !== sun.getMonth() ? 'short' : undefined })
  const sunStr = sun.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${monStr} – ${sunStr} ${sun.getFullYear()}`
}
function toWeekVal(mon) {
  const thu = new Date(mon); thu.setDate(mon.getDate() + 3)
  const yr = thu.getFullYear()
  const wk = Math.ceil(((thu - new Date(yr,0,1)) / 86400000 + new Date(yr,0,1).getDay() + 1) / 7)
  return `${yr}-W${String(wk).padStart(2,'0')}`
}
function fromWeekVal(val) {
  const [y, w] = val.split('-W').map(Number)
  const jan4 = new Date(y,0,4)
  const mon = weekStart(jan4); mon.setDate(mon.getDate() + (w-1)*7); return mon
}
function groupByDayForWeek(slots, mon) {
  const sun = new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999)
  const map = {}
  for (const s of slots) {
    const d = new Date(s.starts_at)
    if (d < mon || d > sun) continue
    const key = d.toISOString().slice(0,10)
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  return Object.keys(map).sort().map(date => ({ date, slots: map[date] }))
}
function slotsInMonth(slots, yr, mo) {
  return slots.filter(s => { const d = new Date(s.starts_at); return d.getFullYear()===yr && d.getMonth()===mo })
}

/* ─── Shared UI primitives ──────────────────────────────────────────────── */

function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
      {STEPS.map((label, i) => {
        const done = i < step, cur = i === step
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
              <div style={{
                width:'1.6rem', height:'1.6rem', borderRadius:'50%',
                border:`1px solid ${done||cur ? '#C9A15B' : 'rgba(201,161,91,0.25)'}`,
                backgroundColor: done ? '#C9A15B' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.25s',
              }}>
                {done
                  ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#171717" strokeWidth="2"><path d="M1 4.5l2.5 2.5 4.5-4"/></svg>
                  : <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.5rem', fontWeight:700, color: cur ? '#C9A15B' : '#78736C' }}>{i+1}</span>
                }
              </div>
              <span className="bm-step-label" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.45rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color: cur ? '#C9A15B' : done ? '#B8AEA0' : '#78736C', whiteSpace:'nowrap' }}>{label}</span>
            </div>
            {i < STEPS.length-1 && <div style={{ flex:1, height:'1px', margin:'0 0.4rem', marginBottom:'1rem', backgroundColor: done ? '#C9A15B' : 'rgba(201,161,91,0.2)', transition:'background-color 0.25s' }} />}
          </div>
        )
      })}
    </div>
  )
}

function GoldBtn({ children, onClick, disabled, type='button', fullWidth, variant='solid' }) {
  const [hov, setHov] = useState(false)
  const solid = variant === 'solid'
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width: fullWidth ? '100%' : 'auto',
        fontFamily:'Montserrat,sans-serif', fontSize:'0.55rem', fontWeight:600,
        letterSpacing:'0.22em', textTransform:'uppercase',
        padding:'0.85rem 1.75rem', border:'1px solid #C9A15B',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: solid ? (hov&&!disabled ? '#b8904a' : '#C9A15B') : (hov&&!disabled ? '#C9A15B' : 'transparent'),
        color: solid ? '#171717' : (hov&&!disabled ? '#171717' : '#C9A15B'),
        opacity: disabled ? 0.45 : 1, transition:'all 0.2s',
      }}
    >{children}</button>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color: error ? '#e07070' : '#B8AEA0' }}>{label}</label>
      {children}
      {error && <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', color:'#e07070' }}>{error}</span>}
    </div>
  )
}

const inputStyle = err => ({
  fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:300,
  backgroundColor:'#1c1c1c', border:`1px solid ${err ? '#e07070' : 'rgba(201,161,91,0.2)'}`,
  color:'#F4F0EB', padding:'0.7rem 1rem', outline:'none', width:'100%',
})

/* ─── Week navigation + slot grid ──────────────────────────────────────── */

function WeekNav({ offset, label, onPrev, onNext }) {
  const [hovL, setHovL] = useState(false)
  const [hovR, setHovR] = useState(false)
  const ArrowBtn = ({ dir, disabled, hov, setHov, onClick }) => (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background:'none', border:`1px solid ${hov&&!disabled ? '#C9A15B' : 'rgba(201,161,91,0.25)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? '#3a3a3a' : '#C9A15B',
        padding:'0.35rem 0.6rem', transition:'all 0.2s',
      }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        {dir==='left' ? <path d="M8 10L4 6l4-4"/> : <path d="M4 2l4 4-4 4"/>}
      </svg>
    </button>
  )
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
      <ArrowBtn dir="left"  disabled={offset===0} hov={hovL} setHov={setHovL} onClick={onPrev} />
      <span className="bm-week-label" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:500, color:'#F4F0EB', letterSpacing:'0.04em' }}>{label}</span>
      <ArrowBtn dir="right" disabled={false}      hov={hovR} setHov={setHovR} onClick={onNext} />
    </div>
  )
}

function SlotGrid({ days, selectedIds = [], onSelect, getBadge, isDisabled }) {
  return (
    <div style={{ overflowX:'auto', paddingBottom:'0.25rem' }}>
      <div style={{
        display:'grid',
        gridTemplateColumns:`repeat(${days.length}, minmax(110px, 1fr))`,
        gap:'1px', backgroundColor:'rgba(201,161,91,0.12)',
        minWidth: days.length > 1 ? '320px' : '0',
      }}>
        {days.map(({ date, slots }) => {
          const dt      = new Date(date + 'T00:00:00')
          const weekday = dt.toLocaleDateString('en-GB', { weekday:'long' })
          const dayDate = dt.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
          return (
            <div key={date} style={{ backgroundColor:'#1a1a1a', display:'flex', flexDirection:'column' }}>
              <div className="bm-day-header" style={{ padding:'0.85rem 0.75rem 0.6rem', borderBottom:'1px solid rgba(201,161,91,0.1)', textAlign:'center' }}>
                <p className="bm-day-name" style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'1.1rem', fontWeight:500, color:'#F4F0EB', lineHeight:1 }}>{weekday}</p>
                <p className="bm-day-date" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:600, color:'#C9A15B', marginTop:'0.3rem', letterSpacing:'0.05em' }}>{dayDate}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'1px', backgroundColor:'rgba(201,161,91,0.08)', flex:1 }}>
                {slots.map(s => {
                  const sel      = selectedIds.includes(s.id)
                  const disabled = isDisabled ? isDisabled(s) : false
                  const badge    = getBadge ? getBadge(s) : null
                  return (
                    <button key={s.id} className="bm-slot-btn" onClick={() => !disabled && onSelect(s)} style={{
                      padding:'0.85rem 0.5rem', position:'relative',
                      backgroundColor: sel ? '#C9A15B' : '#1a1a1a',
                      border:'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      textAlign:'center', transition:'background-color 0.15s',
                      opacity: disabled ? 0.25 : 1,
                    }}
                    onMouseEnter={e => { if (!sel && !disabled) e.currentTarget.style.backgroundColor = '#222' }}
                    onMouseLeave={e => { if (!sel && !disabled) e.currentTarget.style.backgroundColor = '#1a1a1a' }}
                    >
                      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.8rem', fontWeight: sel ? 600 : 400, color: sel ? '#171717' : '#F4F0EB', letterSpacing:'0.05em' }}>
                        {fmt24(s.starts_at)}
                      </span>
                      {badge && (
                        <span style={{ position:'absolute', top:'3px', right:'4px', fontFamily:'Montserrat,sans-serif', fontSize:'0.42rem', fontWeight:700, backgroundColor:'#171717', color:'#C9A15B', padding:'1px 3px', lineHeight:1.2 }}>
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekJump({ val, minVal, onChange }) {
  return (
    <div style={{ marginTop:'1.25rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
      <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.5rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#78736C', whiteSpace:'nowrap' }}>
        Jump to week
      </label>
      <input type="week" value={val} min={minVal} onChange={onChange} style={{
        fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:300,
        backgroundColor:'#1c1c1c', border:'1px solid rgba(201,161,91,0.2)',
        color:'#F4F0EB', padding:'0.45rem 0.75rem', outline:'none', colorScheme:'dark',
      }} />
    </div>
  )
}

/* ─── Mobile-only: Booksy-style date chips + vertical time list ─────────── */

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const fn = e => setMobile(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

// Groups ALL slots (not just one week) by date — used for date chip strip
function groupAllByDay(slots) {
  const map = {}
  for (const s of slots) {
    const key = new Date(s.starts_at).toISOString().slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  return Object.keys(map).sort().map(date => ({ date, slots: map[date] }))
}

function MobileCalendar({ slots, loading, selectedIds = [], onSelect, getBadge, isDisabled }) {
  const days = groupAllByDay(slots)
  const [activeDate, setActiveDate] = useState(() => days[0]?.date ?? null)

  // Keep activeDate in sync if slots change
  useEffect(() => {
    if (days.length > 0 && !days.find(d => d.date === activeDate)) {
      setActiveDate(days[0].date)
    }
  }, [slots])

  const activeDaySlots = days.find(d => d.date === activeDate)?.slots ?? []

  if (loading) return (
    <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.8rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0' }}>
      Loading availability…
    </p>
  )
  if (days.length === 0) return (
    <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.8rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0', lineHeight:1.8 }}>
      No availability right now.<br/>Check back soon.
    </p>
  )

  return (
    <div>
      {/* ── Date chip strip ── */}
      <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#78736C', marginBottom:'0.75rem' }}>
        Select a date
      </p>
      <div style={{ display:'flex', gap:'0.5rem', overflowX:'auto', paddingBottom:'0.5rem', marginBottom:'1.5rem', scrollbarWidth:'none' }}>
        {days.map(({ date }) => {
          const dt   = new Date(date + 'T00:00:00')
          const day  = dt.toLocaleDateString('en-GB', { weekday:'short' })
          const num  = dt.getDate()
          const mon  = dt.toLocaleDateString('en-GB', { month:'short' })
          const sel  = date === activeDate
          return (
            <button key={date} onClick={() => setActiveDate(date)} style={{
              flexShrink: 0,
              display: 'flex', flexDirection:'column', alignItems:'center',
              padding: '0.65rem 0.9rem',
              backgroundColor: sel ? '#C9A15B' : '#1a1a1a',
              border: `1px solid ${sel ? '#C9A15B' : 'rgba(201,161,91,0.2)'}`,
              cursor: 'pointer', gap:'0.15rem', transition:'all 0.15s',
              minWidth: '3.5rem',
            }}>
              <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color: sel ? '#171717' : '#78736C' }}>{day}</span>
              <span style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'1.5rem', fontWeight:500, color: sel ? '#171717' : '#F4F0EB', lineHeight:1 }}>{num}</span>
              <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:400, color: sel ? '#171717' : '#78736C' }}>{mon}</span>
            </button>
          )
        })}
      </div>

      {/* ── Time list ── */}
      <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#78736C', marginBottom:'0.75rem' }}>
        Pick a time
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {activeDaySlots.map(s => {
          const sel      = selectedIds.includes(s.id)
          const disabled = isDisabled ? isDisabled(s) : false
          const badge    = getBadge ? getBadge(s) : null
          return (
            <button key={s.id} onClick={() => !disabled && onSelect(s)} style={{
              position: 'relative',
              padding: '1rem 1.25rem',
              backgroundColor: sel ? '#C9A15B' : '#1a1a1a',
              border: `1px solid ${sel ? '#C9A15B' : 'rgba(201,161,91,0.18)'}`,
              cursor: disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: disabled ? 0.3 : 1,
              transition: 'all 0.15s',
            }}>
              <span style={{
                fontFamily:'Montserrat,sans-serif', fontSize:'1rem', fontWeight: sel ? 600 : 400,
                color: sel ? '#171717' : '#F4F0EB',
              }}>
                {fmt24(s.starts_at)}
              </span>
              {badge && (
                <span style={{
                  position:'absolute', top:'0.4rem', right:'0.6rem',
                  fontFamily:'Montserrat,sans-serif', fontSize:'0.5rem', fontWeight:700,
                  backgroundColor: sel ? '#171717' : '#C9A15B',
                  color: sel ? '#C9A15B' : '#171717',
                  padding:'2px 5px', lineHeight:1.3,
                }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Single-slot calendar (Sports Massage + Recovery Express) ───────────── */

function SingleCalendar({ slots, loading, selectedId, onSelect }) {
  const isMobile = useIsMobile()
  const [offset, setOffset] = useState(0)
  const curMon = weekStartOffset(0)
  const mon    = weekStartOffset(offset)
  const days   = loading ? [] : groupByDayForWeek(slots, mon)

  function handleWeekInput(e) {
    if (!e.target.value) return
    setOffset(Math.round((fromWeekVal(e.target.value) - curMon) / (7*86400000)))
  }

  // Mobile: Booksy-style date chips + vertical time list
  if (isMobile) {
    return (
      <MobileCalendar
        slots={slots}
        loading={loading}
        selectedIds={selectedId ? [selectedId] : []}
        onSelect={onSelect}
      />
    )
  }

  // Desktop: week-column grid
  return (
    <div>
      <WeekNav offset={offset} label={weekRangeLabel(mon)} onPrev={() => setOffset(o => Math.max(0, o-1))} onNext={() => setOffset(o => o+1)} />
      {loading
        ? <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0' }}>Loading availability…</p>
        : days.length === 0
          ? <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0', lineHeight:1.8 }}>No availability this week.<br/>Try the next week or use the picker below.</p>
          : <SlotGrid days={days} selectedIds={selectedId ? [selectedId] : []} onSelect={onSelect} />
      }
      <WeekJump val={toWeekVal(mon)} minVal={toWeekVal(curMon)} onChange={handleWeekInput} />
    </div>
  )
}

/* ─── Two-slot calendar (Maintenance Plan) ──────────────────────────────── */

function PairCalendar({ slots, loading, pair, onPair }) {
  const isMobile = useIsMobile()
  const [offset, setOffset] = useState(0)
  const curMon = weekStartOffset(0)
  const mon    = weekStartOffset(offset)
  const days   = loading ? [] : groupByDayForWeek(slots, mon)
  const now    = new Date()
  const thisMonSlots = slotsInMonth(slots, now.getFullYear(), now.getMonth())
  const shortMonth   = thisMonSlots.length < 2
  const nextMonName  = new Date(now.getFullYear(), now.getMonth()+1, 1).toLocaleDateString('en-GB', { month:'long' })

  const [s1, s2] = pair

  const MIN_GAP_DAYS = 14

  function tooClose(slot) {
    if (!s1) return false
    const anchor = new Date(s1.starts_at)
    const candidate = new Date(slot.starts_at)
    const diffDays = Math.abs((candidate - anchor) / 86400000)
    return diffDays < MIN_GAP_DAYS
  }

  function handleClick(slot) {
    if (s1?.id === slot.id) { onPair([null, s2]); return }
    if (s2?.id === slot.id) { onPair([s1, null]); return }
    if (!s1) { onPair([slot, s2]); return }
    if (!s2) {
      // Enforce 14-day minimum gap
      if (tooClose(slot)) return
      onPair(new Date(slot.starts_at) < new Date(s1.starts_at) ? [slot, s1] : [s1, slot])
      return
    }
    onPair([slot, s2])
  }

  function handleWeekInput(e) {
    if (!e.target.value) return
    setOffset(Math.round((fromWeekVal(e.target.value) - curMon) / (7*86400000)))
  }

  const selIds = [s1?.id, s2?.id].filter(Boolean)
  const getBadge = s => s1?.id === s.id ? 1 : s2?.id === s.id ? 2 : null

  return (
    <div>
      {/* Session progress boxes */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[s1, s2].map((sel, i) => (
          <div key={i} className="bm-pair-session-box" style={{
            flex:1, padding:'0.6rem 0.85rem',
            border:`1px solid ${sel ? '#C9A15B' : 'rgba(201,161,91,0.2)'}`,
            backgroundColor: sel ? 'rgba(201,161,91,0.08)' : 'transparent',
          }}>
            <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.48rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color: sel ? '#C9A15B' : '#78736C', marginBottom:'0.2rem' }}>Session {i+1}</p>
            <p className="bm-pair-session-text" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:300, color: sel ? '#F4F0EB' : '#3a3a3a' }}>
              {sel ? `${new Date(sel.starts_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · ${fmt24(sel.starts_at)}` : 'Not selected'}
            </p>
          </div>
        ))}
      </div>

      {/* 14-day gap notice — shown once session 1 is selected */}
      {s1 && !s2 && (
        <div style={{ padding:'0.6rem 1rem', marginBottom:'1rem', backgroundColor:'rgba(201,161,91,0.06)', borderLeft:'2px solid rgba(201,161,91,0.4)' }}>
          <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:300, color:'#B8AEA0', lineHeight:1.7 }}>
            Session 2 must be at least 14 days after session 1. Unavailable times are greyed out.
          </p>
        </div>
      )}

      {/* Cross-month notice */}
      {shortMonth && (
        <div style={{ padding:'0.75rem 1rem', marginBottom:'1rem', backgroundColor:'rgba(201,161,91,0.07)', borderLeft:'2px solid #C9A15B' }}>
          <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:300, color:'#B8AEA0', lineHeight:1.7 }}>
            {thisMonSlots.length === 1 ? 'Only 1 slot remains' : 'No slots remain'} this month. You can pick your second session in {nextMonName}.
          </p>
        </div>
      )}

      {isMobile ? (
        <MobileCalendar
          slots={slots}
          loading={loading}
          selectedIds={selIds}
          onSelect={handleClick}
          getBadge={getBadge}
          isDisabled={s1 ? tooClose : null}
        />
      ) : (
        <>
          <WeekNav offset={offset} label={weekRangeLabel(mon)} onPrev={() => setOffset(o => Math.max(0, o-1))} onNext={() => setOffset(o => o+1)} />
          {loading
            ? <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0' }}>Loading availability…</p>
            : days.length === 0
              ? <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#78736C', textAlign:'center', padding:'2rem 0', lineHeight:1.8 }}>No availability this week.<br/>Try the next week or picker below.</p>
              : <SlotGrid days={days} selectedIds={selIds} onSelect={handleClick} getBadge={getBadge} isDisabled={s1 ? tooClose : null} />
          }
          <WeekJump val={toWeekVal(mon)} minVal={toWeekVal(curMon)} onChange={handleWeekInput} />
        </>
      )}
    </div>
  )
}

/* ─── Treatment picker (step 1) ─────────────────────────────────────────── */

function TreatmentPicker({ treatments, selected, onSelect }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
      {treatments.map(t => {
        const [hov, setHov] = useState(false)
        const active = selected?.id === t.id || hov
        return (
          <button key={t.id} onClick={() => onSelect(t)}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'1rem 1.25rem',
              backgroundColor: active ? '#1c1c1c' : '#171717',
              border:`1px solid ${selected?.id === t.id ? '#C9A15B' : 'rgba(201,161,91,0.15)'}`,
              cursor:'pointer', textAlign:'left', transition:'all 0.2s',
            }}
          >
            <div>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:600, color:'#F4F0EB', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{t.name}</p>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:300, color:'#78736C' }}>
                {t.note ?? `${t.duration_minutes} min`}
              </p>
            </div>
            <span style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'1.4rem', fontWeight:500, color:'#C9A15B', lineHeight:1, flexShrink:0, marginLeft:'1rem' }}>
              {t.price}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Main modal ────────────────────────────────────────────────────────── */

export default function BookingModal({ open, onClose, preselected }) {
  // step: 0=DateTime, 1=Treatment, 1.5=SecondSession(maintenance), 2=Details, 3=Confirmed
  const [step, setStep]               = useState(0)
  const [treatments, setTreatments]   = useState(FALLBACK_TREATMENTS)
  const [selected, setSelected]       = useState(null)    // treatment object
  const [allSlots, setAllSlots]       = useState([])      // slots from API (all durations)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)  // single slot
  const [pair, setPair]               = useState([null, null]) // maintenance pair
  const [form, setForm]               = useState({ name:'', email:'', phone:'', notes:'' })
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const isMaintenance = selected?.id === 'maintenance-plan'
  const isMobile = useIsMobile()

  // Slots available for the selected treatment duration
  // All slots that have no overlapping booking of the required duration
  // (The API already returns only non-overlapping slots for the requested duration)
  // We fetch lazily per treatment selection on step 1
  const [slotsForTreatment, setSlotsForTreatment] = useState([])
  const [slotsForTreatmentLoading, setSlotsForTreatmentLoading] = useState(false)

  // On step 0 open: fetch all slots (no duration filter) to show all available start times
  useEffect(() => {
    if (step !== 0 || !open) return
    setSlotsLoading(true)
    // Fetch with smallest duration (30 min) to show widest availability on the time picker
    api.getSlots(30)
      .then(setAllSlots)
      .catch(() => setAllSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [step, open])

  // When treatment is selected, fetch slots available for that duration
  useEffect(() => {
    if (!selected || step !== 1) return
    setSlotsForTreatmentLoading(true)
    api.getSlots(selected.duration_minutes)
      .then(data => {
        setSlotsForTreatment(data)
        // If selectedSlot is no longer available for this treatment, clear it
        setSelectedSlot(s => data.find(d => d.id === s?.id) ? s : null)
      })
      .catch(() => setSlotsForTreatment([]))
      .finally(() => setSlotsForTreatmentLoading(false))
  }, [selected, step])

  // Preselect from treatment card click — pre-set the treatment but start at step 0 (date/time)
  // Exception: Maintenance Plan skips straight to the pair picker (step 1)
  useEffect(() => {
    if (open && preselected) {
      const matched = FALLBACK_TREATMENTS.find(t => t.name === preselected.name) ?? preselected
      setSelected(matched)
      setStep(matched.id === 'maintenance-plan' ? 1 : 0)
    }
  }, [open, preselected])

  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const reset = useCallback(() => {
    setStep(0); setSelected(null); setAllSlots([]); setSlotsForTreatment([])
    setSelectedSlot(null); setPair([null, null])
    setForm({ name:'', email:'', phone:'', notes:'' })
    setErrors({}); setSubmitError('')
  }, [])

  const handleClose = useCallback(() => { reset(); onClose() }, [reset, onClose])

  // On step 0: pick time. If treatment already selected (from card click), go straight to details.
  // Maintenance Plan is never preselected into step 0, so no special case needed here.
  function handleTimeSelect(slot) {
    setSelectedSlot(slot)
    if (selected && selected.id !== 'maintenance-plan') {
      setStep(2)
    } else {
      setStep(1)
    }
  }

  // On treatment select: check the selected slot is available for this duration
  function handleTreatmentSelect(t) {
    setSelected(t)
    // slot availability for this treatment is fetched via useEffect above
  }

  // Can continue from step 1?
  const canContinueFromTreatment = isMaintenance
    ? pair[0] !== null && pair[1] !== null
    : selectedSlot !== null

  function validateDetails() {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!form.email.includes('@')) e.email = 'Enter a valid email'
    return e
  }

  async function handleSubmit() {
    const e = validateDetails()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true); setSubmitError('')
    try {
      if (isMaintenance) {
        await api.createBookingPair({
          slot_id_1:                 pair[0].id,
          slot_id_2:                 pair[1].id,
          treatment:                 selected.name,
          treatment_duration_minutes: selected.duration_minutes,
          client_name:               form.name.trim(),
          client_email:              form.email.trim(),
          client_phone:              form.phone.trim(),
          notes:                     form.notes.trim(),
        })
      } else {
        await api.createBooking({
          slot_id:                   selectedSlot.id,
          treatment:                 selected.name,
          treatment_duration_minutes: selected.duration_minutes,
          client_name:               form.name.trim(),
          client_email:              form.email.trim(),
          client_phone:              form.phone.trim(),
          notes:                     form.notes.trim(),
        })
      }
      setStep(3)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const stepForIndicator = step >= 2 ? 2 : step === 1 ? 1 : 0

  return (
    <div onClick={handleClose} style={{
      position:'fixed', inset:0, zIndex:200,
      backgroundColor:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)',
      display:'flex', alignItems: isMobile ? 'stretch' : 'center',
      justifyContent:'center',
      padding: isMobile ? 0 : '1rem',
    }}>
      {/* Mobile: full-screen. Desktop: max-width card */}
      <style>{`
        @media (max-width: 640px) {
          .bm-slot-btn { padding: 1rem 0.25rem !important; }
          .bm-slot-btn span { font-size: 0.9rem !important; }
          .bm-day-header { padding: 0.65rem 0.4rem 0.5rem !important; }
          .bm-day-name { font-size: 0.95rem !important; }
          .bm-day-date { font-size: 0.55rem !important; }
          .bm-step-label { display: none !important; }
          .bm-week-label { font-size: 0.6rem !important; }
          .bm-pair-session-box { padding: 0.5rem 0.6rem !important; }
          .bm-pair-session-text { font-size: 0.6rem !important; }
        }
      `}</style>
      <div onClick={e => e.stopPropagation()} className="bm-panel bm-backdrop" style={{
        backgroundColor:'#171717', borderTop:'2px solid #C9A15B',
        width:'100%', maxWidth: isMobile ? '100%' : '640px',
        height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '90vh',
        overflowY:'auto',
        padding: isMobile ? '1.5rem 1.25rem 2.5rem' : '2rem 2.5rem',
        position:'relative',
      }}>

        {/* Close */}
        <button onClick={handleClose} aria-label="Close" style={{
          position:'absolute', top:'1.25rem', right:'1.25rem',
          background:'none', border:'none', cursor:'pointer',
          color:'#78736C', padding:'0.25rem', transition:'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
        onMouseLeave={e => e.currentTarget.style.color = '#78736C'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l14 14M15 1L1 15"/></svg>
        </button>

        {/* Header */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.75rem', minHeight:'2.75rem' }}>
          <div style={{ position:'absolute', left:0, lineHeight:1 }}>
            <div className="bm-header-logo" style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'2rem', fontWeight:600, color:'#C9A15B', letterSpacing:'0.12em' }}>LMW</div>
            <div className="bm-header-logo-sub" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.42rem', fontWeight:600, letterSpacing:'0.87em', color:'#F4F0EB', marginTop:'2px' }}>RECOVERY</div>
          </div>
          <h2 className="bm-header-title" style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'clamp(1.1rem,3vw,1.5rem)', fontWeight:500, color:'#F4F0EB', textAlign:'center', lineHeight:1.1 }}>
            {step === 3 ? 'Session Confirmed'
              : step === 1 && selected ? selected.name
              : 'Book a Session'}
          </h2>
        </div>

        {step < 3 && <StepIndicator step={stepForIndicator} />}

        {/* ── Step 0: Pick date & time ── */}
        {step === 0 && (
          <div>
            {/* If coming from a treatment card, show it as context */}
            {selected ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderLeft:'2px solid #C9A15B', paddingLeft:'1rem', marginBottom:'1.25rem' }}>
                <div>
                  <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#C9A15B', marginBottom:'0.2rem' }}>Selected treatment</p>
                  <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:400, color:'#F4F0EB' }}>{selected.name} — {selected.price}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#78736C', fontSize:'0.6rem', fontFamily:'Montserrat,sans-serif', padding:'0.25rem 0.5rem', transition:'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
                  onMouseLeave={e => e.currentTarget.style.color = '#78736C'}
                >Change</button>
              </div>
            ) : (
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:300, color:'#78736C', marginBottom:'1.25rem', lineHeight:1.7 }}>
                Pick a time to get started. You'll choose your treatment on the next step.
              </p>
            )}
            <SingleCalendar
              slots={allSlots}
              loading={slotsLoading}
              selectedId={selectedSlot?.id ?? null}
              onSelect={handleTimeSelect}
            />
          </div>
        )}

        {/* ── Step 1: Pick treatment ── */}
        {step === 1 && !isMaintenance && (
          <div>
            {/* Selected time summary */}
            {selectedSlot && (
              <div style={{ borderLeft:'2px solid #C9A15B', paddingLeft:'1rem', marginBottom:'1.5rem' }}>
                <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#C9A15B', marginBottom:'0.2rem' }}>Selected time</p>
                <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:300, color:'#F4F0EB' }}>
                  {formatDateLong(selectedSlot.starts_at)} at {fmt24(selectedSlot.starts_at)}
                </p>
              </div>
            )}

            <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:300, color:'#78736C', marginBottom:'1rem', lineHeight:1.7 }}>
              Choose your treatment. Only sessions that fit your selected time are shown.
            </p>

            {slotsForTreatmentLoading && selected ? (
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', color:'#78736C', padding:'1rem 0' }}>Checking availability…</p>
            ) : (
              <TreatmentPicker
                treatments={treatments.filter(t => t.id !== 'maintenance-plan')}
                selected={selected}
                onSelect={handleTreatmentSelect}
              />
            )}

            {/* Maintenance plan as a separate option below */}
            <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid rgba(201,161,91,0.12)' }}>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#78736C', marginBottom:'0.6rem' }}>Plans</p>
              <TreatmentPicker
                treatments={treatments.filter(t => t.id === 'maintenance-plan')}
                selected={selected}
                onSelect={t => { handleTreatmentSelect(t) }}
              />
            </div>

            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <GoldBtn variant="outline" onClick={() => { setStep(0); setSelected(null) }}>Back</GoldBtn>
              {/* For maintenance: need to pick 2 slots, so go to pair picker */}
              {selected?.id === 'maintenance-plan' ? (
                <GoldBtn onClick={() => {}} disabled fullWidth>Select 2 Sessions Below</GoldBtn>
              ) : (
                <GoldBtn onClick={() => setStep(2)} disabled={!selected || !selectedSlot} fullWidth>Continue</GoldBtn>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1 (maintenance): pick 2 slots ── */}
        {step === 1 && isMaintenance && (
          <div>
            <div style={{ borderLeft:'2px solid #C9A15B', paddingLeft:'1rem', marginBottom:'1.5rem' }}>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#C9A15B', marginBottom:'0.2rem' }}>Maintenance Plan</p>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#B8AEA0' }}>Select 2 sessions for your fortnightly plan.</p>
            </div>
            <PairCalendar
              slots={slotsForTreatment}
              loading={slotsForTreatmentLoading}
              pair={pair}
              onPair={setPair}
            />
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <GoldBtn variant="outline" onClick={() => { setSelected(null); setPair([null,null]) }}>Back</GoldBtn>
              <GoldBtn onClick={() => setStep(2)} disabled={!canContinueFromTreatment} fullWidth>Continue</GoldBtn>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            {/* Summary */}
            <div style={{ borderLeft:'2px solid #C9A15B', paddingLeft:'1rem', marginBottom:'0.25rem' }}>
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:500, color:'#F4F0EB' }}>
                {selected.name}, {selected.price}
              </p>
              {isMaintenance ? (
                <div style={{ marginTop:'0.3rem' }}>
                  <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:300, color:'#B8AEA0' }}>Session 1: {formatDateLong(pair[0].starts_at)} at {fmt24(pair[0].starts_at)}</p>
                  <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:300, color:'#B8AEA0', marginTop:'0.15rem' }}>Session 2: {formatDateLong(pair[1].starts_at)} at {fmt24(pair[1].starts_at)}</p>
                </div>
              ) : (
                <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:300, color:'#B8AEA0', marginTop:'0.2rem' }}>
                  {formatDateLong(selectedSlot.starts_at)} at {fmt24(selectedSlot.starts_at)}
                </p>
              )}
            </div>

            <Field label="Full Name *" error={errors.name}>
              <input value={form.name} onChange={e => { setForm(f=>({...f,name:e.target.value})); setErrors(er=>({...er,name:''})) }} placeholder="Your full name" style={inputStyle(errors.name)} />
            </Field>
            <Field label="Email Address *" error={errors.email}>
              <input type="email" value={form.email} onChange={e => { setForm(f=>({...f,email:e.target.value})); setErrors(er=>({...er,email:''})) }} placeholder="your@email.com" style={inputStyle(errors.email)} />
            </Field>
            <Field label="Phone Number">
              <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="07700 000000" style={inputStyle(false)} />
            </Field>
            <Field label="Anything I should know?">
              <textarea rows={3} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Injuries, areas to focus on, questions…" style={{...inputStyle(false),resize:'vertical'}} />
            </Field>

            <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:300, color:'#78736C', lineHeight:1.7 }}>
              You'll receive a confirmation email immediately. A health questionnaire will follow, please complete it before your session.
            </p>

            {submitError && <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', color:'#e07070', padding:'0.75rem 1rem', backgroundColor:'rgba(224,112,112,0.08)', border:'1px solid rgba(224,112,112,0.2)' }}>{submitError}</p>}

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <GoldBtn variant="outline" onClick={() => setStep(selected && preselected ? 0 : 1)} disabled={submitting}>Back</GoldBtn>
              <GoldBtn onClick={handleSubmit} disabled={submitting} fullWidth>
                {submitting ? 'Confirming…' : 'Confirm Booking'}
              </GoldBtn>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirmed ── */}
        {step === 3 && (
          <div style={{ textAlign:'center', padding:'1rem 0' }}>
            <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'50%', border:'1px solid #C9A15B', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#C9A15B" strokeWidth="1.5"><path d="M2 9l5 5 9-9"/></svg>
            </div>
            <h3 style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'1.5rem', fontWeight:400, color:'#F4F0EB', marginBottom:'1rem' }}>
              You're booked in, {form.name.split(' ')[0]}.
            </h3>
            {isMaintenance ? (
              <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:300, color:'#B8AEA0', lineHeight:1.9, marginBottom:'0.5rem' }}>
                <p><strong style={{ color:'#F4F0EB', fontWeight:500 }}>Session 1</strong> — {formatDateLong(pair[0].starts_at)} at {fmt24(pair[0].starts_at)}</p>
                <p><strong style={{ color:'#F4F0EB', fontWeight:500 }}>Session 2</strong> — {formatDateLong(pair[1].starts_at)} at {fmt24(pair[1].starts_at)}</p>
              </div>
            ) : (
              <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:300, color:'#B8AEA0', lineHeight:1.8, marginBottom:'0.5rem' }}>
                <strong style={{ color:'#F4F0EB', fontWeight:500 }}>{selected.name}</strong> on{' '}
                <strong style={{ color:'#F4F0EB', fontWeight:500 }}>{formatDateLong(selectedSlot.starts_at)}</strong> at{' '}
                <strong style={{ color:'#F4F0EB', fontWeight:500 }}>{fmt24(selectedSlot.starts_at)}</strong>
              </p>
            )}
            <p style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:300, color:'#78736C', lineHeight:1.8, marginBottom:'2rem' }}>
              Confirmation sent to <span style={{ color:'#B8AEA0' }}>{form.email}</span>.<br />
              A health questionnaire will follow, please complete it before your session.
            </p>
            <GoldBtn onClick={handleClose}>Close</GoldBtn>
          </div>
        )}
      </div>
    </div>
  )
}
