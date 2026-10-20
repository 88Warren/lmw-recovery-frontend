// Server/prerender entry. Renders the marketing homepage (the "/" route) to
// an HTML string at build time so the shipped index.html contains the full
// body content — crawlers that don't execute JavaScript (SEO audit tools,
// some bots) can then read the copy, headings and keywords.
//
// Only the "/" route is prerendered. App.jsx guards window access and falls
// back to the main marketing page when window is undefined, so no booking
// sub-routes are rendered here.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
