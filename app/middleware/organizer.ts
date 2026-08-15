/**
 * Protege páginas que solo deben ver ORGANIZER o ADMIN (además de estar
 * logueado). Se usa junto con 'auth', que garantiza la sesión antes de
 * llegar aquí: definePageMeta({ middleware: ['auth', 'organizer'] })
 *
 * El backend ya rechaza estas acciones para un USER normal
 * (protect + authorize('ORGANIZER', 'ADMIN') en eventRoutes.js); este
 * middleware solo evita que un USER llegue a ver la pantalla.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isOrganizer && !auth.isAdmin) {
    return navigateTo('/')
  }
})
