import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Activate the non-blocking Google Fonts preload (see index.html). Flipping the
// preload link to a real stylesheet here — in external JS — keeps first paint
// unblocked without needing an inline onload handler, which the CSP forbids.
const fontsLink = document.getElementById('google-fonts')
if (fontsLink && fontsLink.rel === 'preload') {
  fontsLink.rel = 'stylesheet'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
