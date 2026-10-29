import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { initConsent, trackPageView } from './cookies'
// Booking-flow screens render only on /booking/* routes, never on the home
// page. Lazy-load them so their code is split into separate chunks and kept
// out of the initial homepage bundle.
const BookingReturn = lazy(() => import('./components/BookingReturn'))
const MemberAccess  = lazy(() => import('./components/MemberAccess'))
const ManageBooking = lazy(() => import('./components/ManageBooking'))
const ScreeningForm = lazy(() => import('./components/ScreeningForm'))
import Navbar          from './components/Navbar'
import Hero           from './components/Hero'
import Marquee        from './components/Marquee'
import About          from './components/About'
import Services        from './components/Services'
import BrandValues    from './components/BrandValues'
import Studio         from './components/Studio'
import Location       from './components/Location'
import Treatments     from './components/Treatments'
import FAQ            from './components/FAQ'
import ContactSection from './components/ContactSection'
import BookingModal   from './components/BookingModal'
import Footer         from './components/Footer'
import CookieBanner   from './components/CookieBanner'

export default function App() {
  const [modalOpen, setModalOpen]               = useState(false)
  const [preselected, setPreselected]           = useState(null)

  const openModal = useCallback((treatment = null) => {
    setPreselected(treatment)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setPreselected(null)
  }, [])

  // Load analytics (Consent Mode defaults) and re-apply prior consent on load,
  // then report the initial page view for the current route.
  useEffect(() => {
    initConsent()
    trackPageView()
  }, [])

  // Stripe Checkout return pages. The app has no router, so branch on the path.
  // Each lazy screen is wrapped in Suspense (fallback is minimal — these load
  // fast and are reached only via a redirect, not the main browsing flow).
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  const bookingScreen =
    path.startsWith('/booking/success')   ? <BookingReturn /> :
    path.startsWith('/booking/cancelled') ? <BookingReturn cancelled /> :
    path.startsWith('/booking/member')    ? <MemberAccess /> :
    path.startsWith('/booking/manage')    ? <ManageBooking /> :
    path.startsWith('/booking/screening') ? <ScreeningForm /> :
    null
  if (bookingScreen) {
    return <Suspense fallback={null}>{bookingScreen}</Suspense>
  }

  return (
    <>
      <Navbar onBookClick={() => openModal()} />

      <main>
        <Hero onBookClick={() => openModal()} />
        <Marquee />
        <About />
        <Services />
        <BrandValues />
        <Studio />
        <Location />
        <Treatments onBookClick={openModal} />
        <FAQ />
        <ContactSection />
      </main>

      <Footer />

      <BookingModal
        open={modalOpen}
        onClose={closeModal}
        preselected={preselected}
      />

      <CookieBanner />
    </>
  )
}
