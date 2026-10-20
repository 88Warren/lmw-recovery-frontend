import { useState } from 'react'

// Real, useful answers for a sports-massage studio. The copy intentionally
// uses the site's target terms (sports massage, deep tissue, recovery,
// Llantrisant) in natural sentences so it strengthens the content signal
// without keyword stuffing. These same Q&As are mirrored as FAQPage
// structured data in index.html for rich-result eligibility — keep the two
// in sync if you edit them.
const FAQS = [
  {
    q: 'What should I expect from my first sports massage?',
    a: 'Your first session starts with a short chat about your training, any niggles or injuries, and what you want from the treatment. You complete a brief health questionnaire beforehand so the work is safe and tailored to you. Whether you book a full sports massage or a shorter recovery express session, the work focuses on the areas that need it, and you stay in control of the pressure throughout.',
  },
  {
    q: 'Does deep tissue massage hurt?',
    a: 'Deep tissue massage can feel intense in tight or overworked muscles, but it should never be unbearable. Good sports massage therapy works with your body, not against it. I check in on pressure as we go and adjust to what feels productive for you rather than painful.',
  },
  {
    q: 'How often should I book a session?',
    a: 'It depends on your training load. Many active clients book fortnightly for athlete recovery treatment that keeps tension in check, which is what the maintenance massage plan is built for. If you are working through a specific issue, weekly sessions for a short block can help; for general upkeep, monthly is plenty.',
  },
  {
    q: 'What should I wear?',
    a: 'Wear or bring comfortable, loose clothing such as shorts and a vest. You only need to expose the areas being treated, and you will always be draped with towels so you stay comfortable and covered throughout.',
  },
  {
    q: 'Where is the studio and is there parking?',
    a: 'The studio is a private, purpose-built space in Llantrisant, Rhondda Cynon Taf, with its own entrance separate from the house. There is free on-site parking, so you can arrive, park, and head straight in.',
  },
  {
    q: 'How do I book and pay?',
    a: 'You can book online in a few taps using the "Book a Session" button. Choose your treatment and time, and pay securely via Stripe. You will get a confirmation email and a short health questionnaire to complete before your appointment.',
  },
]

function FAQItem({ item, open, onToggle, id }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(201,161,91,0.15)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', padding: '1.5rem 0', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '1.25rem', fontWeight: 500, color: '#F4F0EB', lineHeight: 1.3,
        }}>{item.q}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#C9A15B" strokeWidth="1.5" aria-hidden="true"
          style={{ flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s' }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        hidden={!open}
        style={{ paddingBottom: open ? '1.5rem' : 0 }}
      >
        <p style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', fontWeight: 300,
          color: '#B8AEA0', lineHeight: 1.9, maxWidth: '68ch', margin: 0,
        }}>{item.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" style={{ backgroundColor: '#0f0f0f', padding: '7rem 0' }}>
      <div className="section-pad" style={{ maxWidth: '820px', margin: '0 auto', padding: '0 2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="eyebrow">Good to Know</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 500, color: '#F4F0EB',
            letterSpacing: '0.04em', marginTop: '0.25rem',
          }}>Frequently Asked Questions</h2>
        </div>

        {/* Accordion */}
        <div>
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              id={`faq-${i}`}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(prev => (prev === i ? -1 : i))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
