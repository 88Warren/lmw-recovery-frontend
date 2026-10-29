import { useEffect, useState } from 'react'

// Keeps the contact email out of the static/prerendered HTML so naive scrapers
// can't harvest it, while humans still get a working mailto: link. The address
// is assembled from parts only on the client (after mount) — during
// prerender/SSR the hook returns a no-address fallback that links to the
// contact section instead.
//
// The address still appears in JSON-LD (needed for local SEO) and the contact
// form remains the primary path; this just removes the easy plain-text grab
// from the visible page.
const USER = 'info'
const DOMAIN = 'lmwrecovery.co.uk'

export function useEmail() {
  const [revealed, setRevealed] = useState(false)
  // Intentional: reveal only after mount so the address is never in the
  // prerendered/SSR HTML. This is the standard client-only reveal pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRevealed(true) }, [])

  if (!revealed) {
    // Pre-hydration / no-JS: label + anchor to the contact section, no address.
    return { label: 'Email us', href: '#contact', isEmail: false }
  }
  const address = `${USER}@${DOMAIN}`
  return { label: address, href: `mailto:${address}`, isEmail: true }
}
