/** Restringe la ruta a administradores. */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isAdmin) {
    return navigateTo('/')
  }
})
