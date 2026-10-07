import { useState, useCallback } from 'react'
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
    </>
  )
}
