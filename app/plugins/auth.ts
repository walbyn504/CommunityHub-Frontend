/** Restaura la sesión al iniciar la aplicación. */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.fetchMe()
  }
})
