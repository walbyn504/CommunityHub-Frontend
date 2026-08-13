// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Módulos utilizados por CommunityHub
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  // Variables de entorno públicas expuestas al cliente.
  // Nuxt sobreescribe automáticamente estos valores con las variables
  runtimeConfig: {
    public: {
      apiBaseUrl: ''
    }
  },

  // Configuración de la Progressive Web App
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CommunityHub',
      short_name: 'CommunityHub',
      description: 'Gestiona y participa en actividades, eventos y comunidades',
      start_url: '/',
      display: 'standalone',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      icons: [
        {
          src: 'icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'icons/icon-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
      runtimeCaching: [
        {
          // Cachea respuestas de la API para consultar actividades vistas sin conexión
          urlPattern: /^http:\/\/localhost:5000\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'communityhub-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 24 horas
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true
    }
  }
})
