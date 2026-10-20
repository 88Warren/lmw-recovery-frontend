import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Dev-server routing to mirror production nginx:
//   /admin, /admin/            → /admin.html (the admin MPA entry)
//   /booking/success, /cancelled → /index.html (SPA client routes handled by App.jsx)
// Because appType is 'mpa', Vite's SPA fallback is off, so these client-side
// routes (e.g. Stripe's redirect to /booking/success) would otherwise 404 in
// dev. In production nginx's try_files already serves index.html for them.
function devRouteFallback() {
  return {
    name: 'dev-route-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url || '').split('?')[0]
        if (path === '/admin' || path === '/admin/') {
          req.url = '/admin.html'
        } else if (
          path === '/booking/success' || path === '/booking/cancelled' ||
          path === '/booking/member' || path === '/booking/manage' ||
          path === '/booking/screening'
        ) {
          // Preserve the query string (Stripe appends ?session_id=…; the member,
          // manage and screening links append ?token=…).
          const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
          req.url = '/index.html' + qs
        }
        next()
      })
    },
  }
}

// Stamp the sitemap's <lastmod> with the build date so it always reflects the
// latest deploy. Runs on build only (not dev) and patches the emitted
// dist/sitemap.xml after the static assets are copied.
function stampSitemapLastmod() {
  return {
    name: 'stamp-sitemap-lastmod',
    apply: 'build',
    closeBundle() {
      const out = resolve(import.meta.dirname, 'dist/sitemap.xml')
      if (!existsSync(out)) return
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      let xml = readFileSync(out, 'utf8')
      if (/<lastmod>.*?<\/lastmod>/.test(xml)) {
        xml = xml.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
      } else {
        // No lastmod present — insert one after each <loc>.
        xml = xml.replace(/(<\/loc>)/g, `$1\n    <lastmod>${today}</lastmod>`)
      }
      writeFileSync(out, xml)
      this.warn(`sitemap.xml lastmod stamped: ${today}`)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devRouteFallback(),
    stampSitemapLastmod(),
  ],

  // MPA mode tells Vite there are multiple HTML entry points.
  // It disables the single-page fallback so each HTML file is served correctly.
  appType: 'mpa',

  build: {
    rollupOptions: {
      input: {
        main:  'index.html',
        admin: 'admin.html',
      },
    },
  },
})
