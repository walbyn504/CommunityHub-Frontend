/**
 * Protege páginas que solo debe ver ADMIN. Se usa junto con 'auth', que
 * garantiza la sesión antes de llegar aquí:
 * definePageMeta({ middleware: ['auth', 'admin'] })
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isAdmin) {
    return navigateTo('/')
  }
})
