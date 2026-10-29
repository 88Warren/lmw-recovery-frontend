import { useState } from 'react'

// Visible location block for the studio. The address was previously only in
// the page's structured data (JSON-LD) — this surfaces it for human visitors
// and embeds a map so people can see where the studio is and get directions.
//
// Address and coordinates match the HealthAndBeautyBusiness schema in
// index.html. The map uses Google's keyless embed (output=embed), and the
// directions link reuses the business's existing Google Maps short link.

const ADDRESS_LINES = ['45 Greenmeadow Court', 'Llantrisant', 'Pontyclun', 'CF72 8JH']
const LAT = 51.5369361
const LNG = -3.3711697
const DIRECTIONS_URL = 'https://maps.app.goo.gl/ecvjkrSifJmZuLho6'
// Keyless Google Maps embed centred on the studio coordinates.
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${LAT},${LNG}&z=15&output=embed`

export default function Location() {
  // Click-to-load the map: the iframe isn't in the DOM until the visitor asks
  // for it. This keeps the (crawl-unfriendly, heavier) embed off the initial
  // page while still giving users the map on demand. The address and a
  // directions link are always visible regardless.
  const [showMap, setShowMap] = useState(false)

  return (
    <section id="location" style={{ backgroundColor: '#171717', padding: '7rem 0' }}>
      <div className="section-pad" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="eyebrow">Find the Studio</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 500, color: '#F4F0EB',
            letterSpacing: '0.04em', marginTop: '0.25rem',
          }}>Where to Find Me</h2>
        </div>

        {/* Address + map */}
        <div
          className="location-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
            gap: '2.5rem',
            alignItems: 'stretch',
          }}
        >
          {/* Address panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A15B',
              marginBottom: '1rem',
            }}>The Studio</p>

            <address style={{
              fontStyle: 'normal',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem', fontWeight: 400, color: '#F4F0EB',
              lineHeight: 1.5, marginBottom: '1.5rem',
            }}>
              {ADDRESS_LINES.map(line => (
                <span key={line} style={{ display: 'block' }}>{line}</span>
              ))}
            </address>

            <p style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', fontWeight: 300,
              color: '#B8AEA0', lineHeight: 1.8, maxWidth: '36ch', marginBottom: '2rem',
            }}>
              A private garden studio with its own entrance and free on-site
              parking, in Llantrisant, Rhondda Cynon Taf.
            </p>

            <a
              href={DIRECTIONS_URL}
              target="_blank" rel="noopener noreferrer"
              className="cta-button"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                alignSelf: 'flex-start',
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', fontWeight: 600,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#C9A15B', textDecoration: 'none',
                border: '1px solid #C9A15B', padding: '0.85rem 1.75rem',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A15B'; e.currentTarget.style.color = '#171717' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C9A15B' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Get Directions
            </a>
          </div>

          {/* Map */}
          <div style={{
            position: 'relative', minHeight: '340px',
            border: '1px solid rgba(201,161,91,0.2)',
            overflow: 'hidden',
          }}>
            {showMap ? (
              <iframe
                title="Map showing the LMW Recovery studio in Llantrisant"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                aria-label="Load the interactive map of the studio location"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.85rem', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1c1c1c 0%, #141414 100%)',
                  border: 'none',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C9A15B" strokeWidth="1.3" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', fontWeight: 600,
                  letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A15B',
                }}>View interactive map</span>
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', fontWeight: 300,
                  color: '#78736C',
                }}>Loads Google Maps</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
