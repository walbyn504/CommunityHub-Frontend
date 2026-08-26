/** Redirige al inicio si ya existe una sesión. */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.fetchMe()
  }

  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
