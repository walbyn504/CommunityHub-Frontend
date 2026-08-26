/** Restringe la ruta a organizadores y administradores. */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isOrganizer && !auth.isAdmin) {
    return navigateTo('/')
  }
})
