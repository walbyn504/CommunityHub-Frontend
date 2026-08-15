/**
 * Restaura la sesión guardada en sessionStorage al abrir/recargar la pestaña,
 * y mantiene sessionStorage sincronizado con cualquier cambio posterior del
 * token (login, logout).
 *
 * Es un plugin SOLO DE CLIENTE (sufijo .client.ts): sessionStorage no existe
 * durante el renderizado en servidor, así que la sesión no se puede verificar
 * ahí. Por eso, al recargar una página protegida, puede haber un instante en
 * el que el servidor no sepa que estás logueado (el middleware podría
 * redirigir a /login) antes de que este plugin confirme la sesión en el
 * navegador. Es la limitación esperada de usar sessionStorage en una app SSR.
 *
 * IMPORTANTE: no se espera (no se hace await) la llamada a fetchMe() aquí.
 * Si el enganchado (hidratación) esperara esa respuesta, el navegador
 * calcularía el contenido ya con el usuario cargado mientras el HTML del
 * servidor se mandó sin usuario, causando un "hydration mismatch". Al no
 * esperarla, el navegador hidrata igual que el servidor (sin sesión) y la
 * actualiza reactivamente un instante después, sin ese warning.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const token = useAuthToken()

  const stored = sessionStorage.getItem('chub_token')
  if (stored) {
    token.value = stored
  }
  auth.fetchMe(stored ?? undefined)

  watch(token, (value) => {
    if (value) {
      sessionStorage.setItem('chub_token', value)
    } else {
      sessionStorage.removeItem('chub_token')
    }
  })
})
