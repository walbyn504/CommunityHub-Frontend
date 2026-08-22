
/// <reference types="node" />

const apiBaseUrl = (process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')
const escapedApiBaseUrl = apiBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const publicApiCachePattern = new RegExp(
  `^${escapedApiBaseUrl}/(?:events(?:/[^/?#]+)?|categories)(?:\\?.*)?$`,
  'i'
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  // El backend (Express, repo aparte) corre en el puerto 3000.
  // El frontend usa el 3001 en desarrollo para no chocar con él.
  devServer: {
    port: 3001
  },

  // Módulos utilizados por CommunityHub.
  // @nuxt/ui (v2) se apoya en @nuxtjs/tailwindcss (Tailwind v3), por eso va
  // después en la lista y no reemplaza el módulo de Tailwind existente.
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/tailwindcss', '@nuxt/ui'],

  // exposeConfig es necesario para que @nuxt/ui pueda leer los colores del
  // tema (los importa vía el módulo virtual #tailwind-config/theme/colors).
  // Sin esto, el build falla al no poder resolver ese import.
  tailwindcss: {
    exposeConfig: true
  },

  // Hoja de estilos global (reset + tipografía base)
  css: ['~/assets/css/main.css'],

  // Favicon del sitio (mismo ícono usado en la PWA).
  // El "?v=2" al final es cache-busting: obliga a Chrome a tratarlo como un
  // archivo nuevo en vez de usar el favicon viejo que dejó cacheado.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192x192.png?v=2' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png?v=2' }
      ]
    }
  },

  // Variables de entorno públicas expuestas al cliente.
  // Nuxt sobreescribe automáticamente estos valores con las variables
  runtimeConfig: {
    public: {
      apiBaseUrl
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
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,png,svg,ico,json,woff2}'],
      runtimeCaching: [
        {
          // Solo cachea consultas públicas; excluye perfiles, sesiones y dashboards.
          urlPattern: publicApiCachePattern,
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
      installPrompt: false,
      periodicSyncForUpdates: 3600
    },

    devOptions: {
      enabled: false
    }
  }
})
