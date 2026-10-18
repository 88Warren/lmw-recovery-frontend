import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devRouteFallback(),
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
