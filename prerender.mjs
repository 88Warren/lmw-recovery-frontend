// Prerender step — run after `vite build` and `vite build --ssr`.
// Renders the homepage to static HTML and injects it into dist/index.html so
// the shipped page contains the full body content for non-JS crawlers.
//
// Hydration: main.jsx uses createRoot().render() which, when #root already
// contains server-rendered markup, React will reconcile over it. (A future
// switch to hydrateRoot is possible, but createRoot render is tolerant here
// since the prerendered "/" matches the client's default route.)
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distIndex = resolve(__dirname, 'dist/index.html')
const serverEntry = pathToFileURL(resolve(__dirname, 'dist-ssr/entry-server.js')).href

const { render } = await import(serverEntry)
const appHtml = render()

let html = readFileSync(distIndex, 'utf8')

const marker = '<div id="root"></div>'
if (!html.includes(marker)) {
  console.error('prerender: could not find empty #root in dist/index.html — did the client build change it?')
  process.exit(1)
}

html = html.replace(marker, `<div id="root">${appHtml}</div>`)
writeFileSync(distIndex, html)

const bodyText = appHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
console.log('prerender: injected', bodyText.split(' ').length, 'words of static body content into dist/index.html')
