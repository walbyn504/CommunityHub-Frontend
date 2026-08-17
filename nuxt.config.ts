// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // El backend (Express, repo aparte) corre en el puerto 3000.
  // El frontend usa el 3001 en desarrollo para no chocar con él.
  devServer: {
    port: 3001
  },

  // Módulos utilizados por CommunityHub
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/tailwindcss'],

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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
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
      // @vite-pwa/nuxt trae "navigateFallback: index.html" como valor por
      // defecto interno; hay que sobreescribirlo EXPLÍCITAMENTE con undefined
      // (quitar la línea no alcanza). La app es SSR: no existe un "/" estático
      // que se pueda precachear como shell offline. La funcionalidad offline
      // real se implementa cacheando las respuestas de la API (ver
      // runtimeCaching abajo) cuando construyamos las páginas de actividades.
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,png,svg,ico,json,woff2}'],
      runtimeCaching: [
        {
          // Cachea respuestas de la API para consultar actividades vistas sin conexión
          urlPattern: /^http:\/\/localhost:3000\/api\/.*/i,
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
    // El Service Worker de prueba en modo desarrollo (devOptions.enabled) es
    // experimental y genera errores inestables al limpiar .nuxt. La PWA real
    // (manifest + Service Worker + instalación) ya se verificó funcionando
    // correctamente con `npm run build` + `npm run preview`, así que se
    // desactiva aquí para tener un entorno de desarrollo estable.
    devOptions: {
      enabled: false
    }
  }
})
