import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ლოკალურ dev-ზე SW ხშირად ინახავს ძველ bundle-ს → ცარიელი გვერდი; პროდაქშენში SW იმუშავებს
      devOptions: { enabled: false },
      includeAssets: ['icon.svg', 'pwa-maskable.svg'],
      manifest: {
        name: 'სამზარეულო კალკულაცია — ტიფლისი',
        short_name: 'ტიფლისი',
        description: 'კერძების ღირებულების კალკულაცია',
        theme_color: '#0f0f0f',
        background_color: '#f8f6f2',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ka',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/pwa-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
