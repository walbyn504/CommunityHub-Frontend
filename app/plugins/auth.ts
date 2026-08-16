/**
 * Restaura la sesion una sola vez al iniciar la aplicacion. Como el JWT vive
 * en una cookie, esta comprobacion funciona tanto en SSR como en el navegador
 * y evita que un refresh de una ruta protegida redirija incorrectamente.
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.fetchMe()
  }
})
