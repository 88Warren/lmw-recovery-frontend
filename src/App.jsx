import { useState, useCallback, useEffect } from 'react'
import { initConsent } from './cookies'
import BookingReturn   from './components/BookingReturn'
import MemberAccess    from './components/MemberAccess'
import ManageBooking   from './components/ManageBooking'
import ScreeningForm   from './components/ScreeningForm'
import Navbar          from './components/Navbar'
import Hero           from './components/Hero'
import Marquee        from './components/Marquee'
import About          from './components/About'
import BrandValues    from './components/BrandValues'
import Studio         from './components/Studio'
import Treatments     from './components/Treatments'
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

  // Re-apply a previously granted analytics consent on load.
  useEffect(() => { initConsent() }, [])

  // Stripe Checkout return pages. The app has no router, so branch on the path.
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (path.startsWith('/booking/success')) return <BookingReturn />
  if (path.startsWith('/booking/cancelled')) return <BookingReturn cancelled />
  if (path.startsWith('/booking/member')) return <MemberAccess />
  if (path.startsWith('/booking/manage')) return <ManageBooking />
  if (path.startsWith('/booking/screening')) return <ScreeningForm />

  return (
    <>
      <Navbar onBookClick={() => openModal()} />

      <main>
        <Hero onBookClick={() => openModal()} />
        <Marquee />
        <About />
        <BrandValues />
        <Studio />
        <Treatments onBookClick={openModal} />
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
