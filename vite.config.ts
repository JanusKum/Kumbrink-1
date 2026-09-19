import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path matches the GitHub Pages project site URL (/<repo-name>/).
// Override with VITE_BASE_PATH if deploying elsewhere (e.g. Vercel/Netlify use '/').
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'ChartPuls · Aktienmarkt-Übersicht',
        short_name: 'ChartPuls',
        description:
          'ChartPuls zeigt automatisch aktualisierte Top-Performer, Branchen-Trends und die wertvollsten Unternehmen des Aktienmarkts.',
        lang: 'de',
        // Relative to the manifest's own URL, so this works under any base path.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Marktdaten: im Vordergrund immer frisch vom Netz laden, offline
        // auf die zuletzt geladenen Daten zurückfallen.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/data/market.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'market-data',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
  base: process.env.VITE_BASE_PATH ?? '/Kumbrink-1/',
})
