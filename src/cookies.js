// ─── Cookie consent + analytics loader ──────────────────────────────
//
// Essential cookies (the site itself, forms) are always on and
// need no consent. Analytical / performance cookies (Google Analytics) are
// loaded ONLY after the visitor accepts them — matching the Cookie Policy.

const STORAGE_KEY = 'lmw-cookie-consent'   // 'accepted' | 'declined'
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''

let gaLoaded = false

/** Read the stored choice, or null if the visitor hasn't chosen yet. */
export function getConsent() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'accepted' || v === 'declined' ? v : null
  } catch {
    return null
  }
}

/** Persist the choice and apply it. */
export function setConsent(choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    /* storage unavailable (private mode) — honour the choice for this session only */
  }
  if (choice === 'accepted') loadAnalytics()
}

/**
 * Inject Google Analytics (gtag) once, only when consent is given and a
 * Measurement ID is configured. No analytical cookies are set before this runs.
 */
export function loadAnalytics() {
  if (gaLoaded || !GA_ID || typeof document === 'undefined') return
  gaLoaded = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  gtag('js', new Date())
  // Keep GA cookie-light and privacy-friendly.
  gtag('config', GA_ID, { anonymize_ip: true })
}

/** Call once on app start — re-applies a previously accepted consent. */
export function initConsent() {
  if (getConsent() === 'accepted') loadAnalytics()
}
