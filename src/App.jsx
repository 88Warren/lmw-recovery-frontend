import { useState, useCallback, useEffect } from 'react'
import { initConsent } from './cookies'
import Navbar         from './components/Navbar'
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
