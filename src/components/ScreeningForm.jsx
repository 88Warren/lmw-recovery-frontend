import { useState, useEffect } from 'react'
import { api } from '../api'

/*
 * Client health screening & history form, reached from the signed link in the
 * booking confirmation email: /booking/screening?token=…
 *
 * Mobile-first: everything is a native input/select/radio/textarea so it works
 * on any phone with no app or download. On submit it POSTs the whole form back
 * as structured JSON; the studio reads it in the private admin area.
 *
 * The form digitises LMW_1_Client_Screening_Form, and adds an explicit
 * informed-consent block (treatment consent + privacy/terms acknowledgement +
 * typed signature) required to submit.
 */

const GOLD   = '#C9A15B'
const BG     = '#171717'
const PANEL  = '#1c1c1c'
const TEXT   = '#F4F0EB'
const MUTED  = '#B8AEA0'
const DIM    = '#78736C'
const BORDER = 'rgba(201,161,91,0.22)'

const linkToken = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('token')
  : null

const PRIVACY_URL = '/docs/LMW_Recovery_Privacy_Policy.html'
const TERMS_URL   = '/docs/LMW_Recovery_Terms_of_Service.html'

// Yes/No medical questions, grouped as on the paper form.
const GENERAL_HEALTH = [
  'Are you diabetic?',
  'Are you epileptic?',
  'Do you suffer from heart problems (e.g. angina)?',
  'Do you have a pacemaker?',
  'Do you have any circulatory problems, such as high or low blood pressure?',
  'Do you have any chest or breathing problems (e.g. asthma)?',
  'Have you ever been diagnosed as having TB?',
  'Do you take any anticoagulation medication (e.g. Warfarin)?',
  'Have you ever been diagnosed or treated for cancer?',
  'Have you undergone treatment such as radiotherapy or chemotherapy?',
  'Have you had any unexpected or sudden weight loss / weight gain?',
  'Have you ever been on steroids?',
  'Have you ever been diagnosed with osteoporosis?',
  'Have you been diagnosed as having rheumatoid arthritis?',
  'Have you had any recent fractures or physical trauma?',
  'Do you have any allergies (incl. oils, nuts, latex)?',
]

const CONDITIONS = [
  'Thrombosis, phlebitis or DVT?',
  'Psoriasis, eczema or any other skin condition or disease?',
  'Bell\u2019s palsy, a trapped / pinched nerve or neuritis?',
  'Oedema (fluid retention / swelling)?',
  'Varicose veins?',
  'A fever, or any contagious illness, including cold or flu symptoms, right now?',
  'Any recent or acute injury?',
  'Any bruising, cuts, abrasions, sunburn or inflamed areas?',
  'Are you pregnant?',
]

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, color: TEXT, fontFamily: 'Montserrat,sans-serif', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '2.2rem', fontWeight: 600, color: GOLD, letterSpacing: '0.12em', lineHeight: 1 }}>LMW</div>
          <div style={{ fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.87em', color: TEXT, marginTop: 4 }}>RECOVERY</div>
        </div>
        {children}
      </div>
    </div>
  )
}

// Section heading with a gold rule.
function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.3rem', fontWeight: 600,
        color: TEXT, margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${BORDER}`,
      }}>{title}</h2>
      {children}
    </section>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: DIM, marginBottom: '0.4rem',
}
const inputStyle = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'Montserrat,sans-serif', fontSize: '0.85rem',
  backgroundColor: PANEL, border: `1px solid ${BORDER}`, color: TEXT,
  padding: '0.7rem 0.8rem', outline: 'none', borderRadius: 2,
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function TextField({ label, value, onChange, type = 'text', placeholder, autoComplete }) {
  return (
    <Field label={label}>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} style={inputStyle} />
    </Field>
  )
}

function AreaField({ label, value, onChange, placeholder, rows = 2 }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        placeholder={placeholder} style={{ ...inputStyle, resize: 'vertical' }} />
    </Field>
  )
}

// A single Yes/No medical question with an optional details box when "Yes".
function YesNo({ n, text, value, onChange }) {
  const yes = value?.answer === 'yes'
  return (
    <div style={{ padding: '0.85rem 0', borderBottom: `1px solid rgba(201,161,91,0.1)` }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.82rem', color: TEXT, margin: 0, lineHeight: 1.5, flex: 1 }}>
          {n != null && <span style={{ color: GOLD, marginRight: 6 }}>{n}.</span>}{text}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          {['yes', 'no'].map(opt => {
            const active = value?.answer === opt
            return (
              <button key={opt} type="button"
                onClick={() => onChange({ ...value, answer: opt })}
                style={{
                  fontFamily: 'Montserrat,sans-serif', fontSize: '0.55rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '0.4rem 0.7rem', cursor: 'pointer', borderRadius: 2,
                  border: `1px solid ${active ? GOLD : 'rgba(120,115,108,0.4)'}`,
                  backgroundColor: active ? GOLD : 'transparent',
                  color: active ? '#171717' : MUTED,
                }}>{opt}</button>
            )
          })}
        </div>
      </div>
      {yes && (
        <input type="text" value={value?.details ?? ''} placeholder="Details"
          onChange={e => onChange({ ...value, details: e.target.value })}
          style={{ ...inputStyle, marginTop: '0.6rem', fontSize: '0.8rem' }} />
      )}
    </div>
  )
}

export default function ScreeningForm() {
  const [phase, setPhase] = useState('loading') // loading | form | done | error | already
  const [intro, setIntro] = useState(null)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  // ── Form state ──
  const [details, setDetails] = useState({
    title: '', firstName: '', surname: '', dob: '', address: '',
    mobile: '', email: '', emergency: '',
  })
  const [lifestyle, setLifestyle] = useState({
    occupation: '', workPattern: '', dailyActivities: '', hobbies: '', exerciseHours: '',
  })
  const [general, setGeneral] = useState({})
  const [conditions, setConditions] = useState({})
  const [health, setHealth] = useState({
    operations: '', medication: '', otherConditions: '',
    gpVisit: '', gpPermission: '',
  })
  const [signature, setSignature] = useState('')
  const [consentTreatment, setConsentTreatment] = useState(false)
  const [consentData, setConsentData] = useState(false)

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!linkToken) { if (active) setPhase('error'); return }
      try {
        const data = await api.getScreening(linkToken)
        if (!active) return
        setIntro(data)
        if (data.already_done) { setPhase('already'); return }
        // Prefill name/email from the booking.
        const parts = (data.client_name ?? '').trim().split(/\s+/)
        setDetails(d => ({
          ...d,
          firstName: parts[0] ?? '',
          surname: parts.slice(1).join(' '),
          email: data.booking_email ?? '',
        }))
        setSignature(data.client_name ?? '')
        setPhase('form')
      } catch {
        if (active) setPhase('error')
      }
    }
    const t = setTimeout(run, 0)
    return () => { active = false; clearTimeout(t) }
  }, [])

  async function submit() {
    setError('')
    if (!consentTreatment || !consentData) {
      setError('Please confirm both consent statements before submitting.')
      return
    }
    if (!signature.trim()) {
      setError('Please type your full name to sign the declaration.')
      return
    }
    setBusy(true)
    const answers = {
      client_details: details,
      lifestyle,
      general_health: GENERAL_HEALTH.map((q, i) => ({
        question: q, ...(general[i] ?? { answer: '' }),
      })),
      conditions: CONDITIONS.map((q, i) => ({
        question: q, ...(conditions[i] ?? { answer: '' }),
      })),
      more_about_health: health,
      declaration: {
        statement:
          'I confirm the information on this form is true, complete and accurate to the best of my knowledge. ' +
          'I understand I must tell my therapist if my health or medication changes. ' +
          'I consent to be assessed and treated by my sports massage therapist.',
        signed_name: signature.trim(),
      },
    }
    try {
      const res = await api.submitScreening({
        token: linkToken,
        date_of_birth: details.dob,
        phone: details.mobile,
        signature_name: signature.trim(),
        consent_treatment: consentTreatment,
        consent_data: consentData,
        answers,
      })
      setIntro(i => ({ ...i, _doneMsg: res?.message }))
      setPhase('done')
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  if (phase === 'loading') return <Shell><p style={{ color: MUTED, textAlign: 'center' }}>Loading your form…</p></Shell>

  if (phase === 'error') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 400 }}>Link expired</h1>
        <p style={{ color: MUTED, fontSize: '0.85rem', lineHeight: 1.8, margin: '1rem 0 0' }}>
          This link is invalid or has expired. Please contact us and we'll send you a fresh one.
        </p>
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', color: GOLD, fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>Back to site</a>
      </div>
    </Shell>
  )

  if (phase === 'already' || phase === 'done') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.9rem', fontWeight: 400 }}>Thank you</h1>
        <p style={{ color: MUTED, fontSize: '0.85rem', lineHeight: 1.8, margin: '1rem auto 0', maxWidth: 440 }}>
          {intro?._doneMsg ?? 'Your health screening form has been received. There\u2019s nothing else to do — I\u2019ll see you at your session.'}
        </p>
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', color: GOLD, fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>Back to site</a>
      </div>
    </Shell>
  )

  // phase === 'form'
  return (
    <Shell>
      <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.9rem', fontWeight: 400, margin: '0 0 0.6rem' }}>
          Health screening &amp; history
        </h1>
        <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
          Please complete this before your appointment. It's confidential and helps me make sure massage is safe and right for you.
        </p>
      </div>

      <Section title="Your details">
        <TextField label="Title" value={details.title} onChange={v => setDetails({ ...details, title: v })} placeholder="e.g. Mr / Ms / Mx" />
        <TextField label="First name" value={details.firstName} onChange={v => setDetails({ ...details, firstName: v })} autoComplete="given-name" />
        <TextField label="Surname" value={details.surname} onChange={v => setDetails({ ...details, surname: v })} autoComplete="family-name" />
        <TextField label="Date of birth" type="date" value={details.dob} onChange={v => setDetails({ ...details, dob: v })} />
        <AreaField label="Address" value={details.address} onChange={v => setDetails({ ...details, address: v })} />
        <TextField label="Mobile" type="tel" value={details.mobile} onChange={v => setDetails({ ...details, mobile: v })} autoComplete="tel" />
        <TextField label="Email" type="email" value={details.email} onChange={v => setDetails({ ...details, email: v })} autoComplete="email" />
        <TextField label="Emergency contact (name / number / relationship)" value={details.emergency} onChange={v => setDetails({ ...details, emergency: v })} />
      </Section>

      <Section title="Lifestyle">
        <TextField label="Occupation" value={lifestyle.occupation} onChange={v => setLifestyle({ ...lifestyle, occupation: v })} />
        <TextField label="Full or part time" value={lifestyle.workPattern} onChange={v => setLifestyle({ ...lifestyle, workPattern: v })} />
        <AreaField label="Activities undertaken during an average day" value={lifestyle.dailyActivities} onChange={v => setLifestyle({ ...lifestyle, dailyActivities: v })} />
        <TextField label="Hobbies / sport / interests" value={lifestyle.hobbies} onChange={v => setLifestyle({ ...lifestyle, hobbies: v })} />
        <TextField label="Hours of exercise per week" value={lifestyle.exerciseHours} onChange={v => setLifestyle({ ...lifestyle, exerciseHours: v })} />
      </Section>

      <Section title="General health">
        <p style={{ color: DIM, fontSize: '0.72rem', margin: '0 0 0.5rem' }}>Tap Yes or No. If Yes, a short box appears for details.</p>
        {GENERAL_HEALTH.map((q, i) => (
          <YesNo key={i} n={i + 1} text={q} value={general[i]} onChange={v => setGeneral({ ...general, [i]: v })} />
        ))}
      </Section>

      <Section title="Conditions that may affect your treatment">
        {CONDITIONS.map((q, i) => (
          <YesNo key={i} n={GENERAL_HEALTH.length + i + 1} text={q} value={conditions[i]} onChange={v => setConditions({ ...conditions, [i]: v })} />
        ))}
      </Section>

      <Section title="More about your health">
        <AreaField label="Any major operations? (type & date)" value={health.operations} onChange={v => setHealth({ ...health, operations: v })} />
        <AreaField label="Currently on medication? (name, dose, how often)" value={health.medication} onChange={v => setHealth({ ...health, medication: v })} />
        <AreaField label="Any other medical conditions or problems I should be aware of?" value={health.otherConditions} onChange={v => setHealth({ ...health, otherConditions: v })} />
        <YesNo text="Have you visited your GP in the last 6 months?" value={health.gpVisit ? { answer: health.gpVisit } : undefined}
          onChange={v => setHealth({ ...health, gpVisit: v.answer })} />
        <p style={{ color: DIM, fontSize: '0.72rem', lineHeight: 1.6, margin: '0.5rem 0 1rem' }}>
          If you're being treated for an ongoing issue by your GP, please bring a letter from your GP giving permission for sports massage.
        </p>
        <Field label="Has your GP / consultant given permission for massage?">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Yes', 'No', 'Not applicable'].map(opt => {
              const active = health.gpPermission === opt
              return (
                <button key={opt} type="button" onClick={() => setHealth({ ...health, gpPermission: opt })}
                  style={{
                    fontFamily: 'Montserrat,sans-serif', fontSize: '0.6rem', fontWeight: 600,
                    letterSpacing: '0.06em', padding: '0.5rem 0.9rem', cursor: 'pointer', borderRadius: 2,
                    border: `1px solid ${active ? GOLD : 'rgba(120,115,108,0.4)'}`,
                    backgroundColor: active ? GOLD : 'transparent', color: active ? '#171717' : MUTED,
                  }}>{opt}</button>
              )
            })}
          </div>
        </Field>
      </Section>

      <Section title="Declaration & consent">
        <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.75, margin: '0 0 1.25rem' }}>
          I confirm the information on this form is true, complete and accurate to the best of my knowledge.
          I understand I must tell my therapist if my health or medication changes.
        </p>

        <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1rem' }}>
          <input type="checkbox" checked={consentTreatment} onChange={e => setConsentTreatment(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: GOLD, flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: TEXT, lineHeight: 1.6 }}>
            I give my informed consent to be assessed and treated by my sports massage therapist, and I understand I can withdraw consent or stop treatment at any time.
          </span>
        </label>

        <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.25rem' }}>
          <input type="checkbox" checked={consentData} onChange={e => setConsentData(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: GOLD, flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: TEXT, lineHeight: 1.6 }}>
            I consent to LMW Recovery storing this information securely to provide my treatment, and I have read and agree to the{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Privacy Policy</a> and{' '}
            <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Terms of Service</a>.
          </span>
        </label>

        <TextField label="Signature — type your full name" value={signature} onChange={setSignature} autoComplete="name" />
        <p style={{ color: DIM, fontSize: '0.7rem', margin: '-0.4rem 0 0' }}>
          Dated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} on submission.
        </p>
      </Section>

      {error && <p style={{ color: '#e07070', fontSize: '0.78rem', textAlign: 'center', margin: '0 0 1rem' }}>{error}</p>}

      <button type="button" onClick={submit} disabled={busy} style={{
        width: '100%', fontFamily: 'Montserrat,sans-serif', fontSize: '0.65rem', fontWeight: 600,
        letterSpacing: '0.2em', textTransform: 'uppercase', padding: '1rem',
        border: `1px solid ${GOLD}`, backgroundColor: GOLD, color: '#171717',
        cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1, borderRadius: 2,
      }}>
        {busy ? 'Submitting…' : 'Submit my form'}
      </button>

      <p style={{ color: DIM, fontSize: '0.68rem', textAlign: 'center', lineHeight: 1.7, margin: '1.25rem 0 0' }}>
        Your answers are confidential and seen only by your therapist.
      </p>
    </Shell>
  )
}
