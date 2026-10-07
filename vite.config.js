import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Small plugin that rewrites /admin → /admin.html in the dev server
// so you can navigate to http://localhost:5173/admin cleanly.
function adminRedirect() {
  return {
    name: 'admin-redirect',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/admin' || req.url === '/admin/') {
          req.url = '/admin.html'
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
    adminRedirect(),
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
