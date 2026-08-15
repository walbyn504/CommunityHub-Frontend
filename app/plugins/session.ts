/**
 * Restaura la sesión del usuario apenas arranca la aplicación (SSR y cliente),
 * consultando GET /api/auth/me. Así cualquier página o componente (navbar,
 * dashboard, etc.) ya conoce el estado de autenticación desde el primer render,
 * sin depender de que el usuario visite una ruta con middleware auth/guest.
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.fetchMe()
  }
})
