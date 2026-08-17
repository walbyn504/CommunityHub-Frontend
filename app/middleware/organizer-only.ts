export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (auth.role !== 'ORGANIZER') {
    return navigateTo('/')
  }
})
