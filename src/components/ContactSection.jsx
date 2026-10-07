import { useState } from 'react'
import { api } from '../api'
import { getRecaptchaToken } from '../recaptcha'

export default function ContactSection() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent]       = useState(false)
  const [apiError, setApiError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setApiError('')
    try {
      const recaptchaToken = await getRecaptchaToken('contact')
      await api.sendContact({
        name:            form.name.trim(),
        email:           form.email.trim(),
        phone:           form.phone.trim(),
        message:         form.message.trim(),
        recaptcha_token: recaptchaToken,
      })
      setSent(true)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" style={{ backgroundColor: '#0f0f0f', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'stretch',
        }} className="contact-grid">
          <style>{`
            @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }
          `}</style>

          {/* ── Left: heading + info ── */}
          <div>
            <span className="eyebrow">Get in Touch</span>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              fontWeight: 500, lineHeight: 1.0,
              color: '#F4F0EB', marginBottom: 0,
            }}>
              Ready when<br />
              <em style={{ color: '#C9A15B', fontStyle: 'normal' }}>you are.</em>
            </h2>

            <span className="gold-rule" />

            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.78rem', fontWeight: 300,
              color: '#78736C', lineHeight: 1.9,
              maxWidth: '36ch', marginBottom: '2.5rem',
            }}>
              Drop me a message if you'd like to chat about the right treatment,
              or book directly through the site.
            </p>

            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,
                  extra: <polyline points="22,6 12,13 2,6"/>,
                  label: 'info@lmwrecovery.co.uk',
                  href: 'mailto:info@lmwrecovery.co.uk',
                },
                {
                  icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.4 2 2 0 0 1 3.58 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
                  label: '07516 606668',
                  href: 'tel:07516606668',
                },
                {
                  icon: <><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></>,
                  label: 'Llantrisant, RCT',
                  href: null,
                },
              ].map(({ icon, extra, label, href }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A15B" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    {icon}{extra}
                  </svg>
                  {href
                    ? <a href={href} style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: '#B8AEA0', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#C9A15B'}
                        onMouseLeave={e => e.currentTarget.style.color = '#B8AEA0'}
                      >{label}</a>
                    : <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: '#B8AEA0' }}>{label}</span>
                  }
                </div>
              ))}
            </div>

            {/* Hours */}
            <div style={{ marginTop: '2rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(201,161,91,0.15)' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A15B', marginBottom: '0.75rem' }}>Studio Hours</p>
              {[
                { day: 'Tue – Thu', time: '6pm – 8pm' },
                { day: 'Sunday',    time: '9am – 1pm' },
                { day: 'Mon, Fri, Sat', time: 'Closed' },
              ].map(({ day, time }) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', maxWidth: '220px' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', fontWeight: 400, color: '#B8AEA0' }}>{day}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', fontWeight: 300, color: '#78736C' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: message form ── */}
          <div>
            {!sent ? (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <FormField label="Full Name *" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                    placeholder="Your name"
                    style={fieldInput(errors.name)}
                  />
                </FormField>

                <FormField label="Email Address *" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })) }}
                    placeholder="your@email.com"
                    style={fieldInput(errors.email)}
                  />
                </FormField>

                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="07700 000000 (optional)"
                    style={fieldInput(false)}
                  />
                </FormField>

                <FormField label="Message *" error={errors.message}>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: '' })) }}
                    placeholder="What would you like to know? Which treatment interests you? Any injuries or areas you'd like to focus on?"
                    style={{ ...fieldInput(errors.message), resize: 'vertical' }}
                  />
                </FormField>

                {apiError && (
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', color: '#e07070', padding: '0.75rem 1rem', backgroundColor: 'rgba(224,112,112,0.08)', border: '1px solid rgba(224,112,112,0.2)' }}>
                    {apiError}
                  </p>
                )}

                <button type="submit" disabled={submitting} style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem',
                  fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
                  backgroundColor: submitting ? '#b8904a' : '#C9A15B', color: '#171717',
                  border: 'none', padding: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, transition: 'background-color 0.25s',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#b8904a' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#C9A15B' }}
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{
                  width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                  border: '1px solid #C9A15B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#C9A15B" strokeWidth="1.5">
                    <path d="M2 9l5 5 9-9"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#F4F0EB', marginBottom: '0.75rem' }}>
                  Message sent.
                </h3>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: '#78736C', lineHeight: 1.8 }}>
                  Thanks, {form.name.split(' ')[0]}. I'll get back to you within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: error ? '#e07070' : '#B8AEA0' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', color: '#e07070' }}>{error}</span>}
    </div>
  )
}

function fieldInput(err) {
  return {
    fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300,
    backgroundColor: '#171717',
    border: `1px solid ${err ? '#e07070' : 'rgba(201,161,91,0.2)'}`,
    color: '#F4F0EB', padding: '0.75rem 1rem',
    outline: 'none', width: '100%',
  }
}
