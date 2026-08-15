/**
 * Middleware de invitado: protege páginas que solo tienen sentido sin sesión
 * iniciada (login, register). Si el usuario ya está autenticado, lo redirige
 * al inicio en vez de dejarlo ver el formulario de login otra vez.
 * Uso: definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.fetchMe()
  }

  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
