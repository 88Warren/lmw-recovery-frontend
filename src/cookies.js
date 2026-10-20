// ─── Cookie consent + analytics loader ──────────────────────────────
//
// Essential cookies (the site itself, forms) are always on and need no
// consent. Analytical / performance cookies (Google Analytics) follow
// Google Consent Mode v2:
//
//   • GA loads on every visit, but with analytics storage DENIED by default.
//     In this state GA sends only cookieless "pings" — no analytics cookies
//     are written, which keeps us GDPR-compliant for visitors who have not
//     chosen yet or who decline.
//   • When the visitor accepts, we send a consent "update" granting analytics
//     storage, and GA upgrades to full, cookie-based measurement.
//
// This gives basic aggregate insight from all visitors while respecting
// consent, and matches what modern audit tools expect to see.

const STORAGE_KEY = 'lmw-cookie-consent'   // 'accepted' | 'declined'
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''

let gaLoaded = false

/** Shared gtag shim. Safe to call before the GA script has loaded. */
function gtag() {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(arguments)
}

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
  updateConsentState(choice === 'accepted')
}

/**
 * Inject Google Analytics (gtag) once, with Consent Mode defaults applied
 * BEFORE the GA script loads. Analytics storage starts denied; a later
 * consent "update" grants it. No analytics cookies are written while denied.
 */
export function loadAnalytics() {
  if (gaLoaded || !GA_ID || typeof document === 'undefined') return
  gaLoaded = true

  window.gtag = gtag

  // Default denied — must run before the GA script. ad_* are included because
  // Consent Mode v2 expects the full signal set even for analytics-only sites.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  gtag('js', new Date())
  // Keep GA cookie-light and privacy-friendly. Disable the automatic initial
  // page_view: this is an SPA, so page views are sent manually via
  // trackPageView() to avoid double-counting the first load.
  gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false })
}

/** Grant or keep-denied analytics storage based on the visitor's choice. */
function updateConsentState(granted) {
  loadAnalytics()
  if (typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  })
}

/**
 * Send a page_view for the current URL. The app is a single-page app that
 * swaps views by pathname (booking return routes), so views after the first
 * load must be reported manually. No-op until GA has loaded.
 */
export function trackPageView(path) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path ?? window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  })
}

/**
 * Call once on app start. Loads GA with Consent Mode defaults and, if the
 * visitor has previously accepted, immediately upgrades consent to granted.
 */
export function initConsent() {
  loadAnalytics()
  if (getConsent() === 'accepted') updateConsentState(true)
}
