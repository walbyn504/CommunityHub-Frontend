import type { ApiErrorResponse } from '~/types/auth'

/**
 * Cliente HTTP centralizado para consumir la API REST del backend de CommunityHub.
 *
 * - Usa $fetch (ofetch), la herramienta HTTP nativa de Nuxt.
 * - Adjunta automáticamente "Authorization: Bearer <token>" cuando hay sesión
 *   iniciada. El token se guarda en una cookie (useAuthToken).
 * - Acepta un `tokenOverride` opcional: úsalo cuando ya tienes el token recién
 *   recibido en la mano (por ejemplo, justo después de login) para no
 *   depender de releer la cookie, que puede tardar un instante en
 *   sincronizarse (condición de carrera).
 * - Normaliza cualquier error del backend a un ApiError con mensaje legible,
 *   para que las páginas nunca muestren errores crudos de red o del servidor.
 */
export function useApi(tokenOverride?: string) {
  const config = useRuntimeConfig()
  const token = useAuthToken()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      const activeToken = tokenOverride ?? token.value
      if (activeToken) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${activeToken}`)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      const body = response._data as ApiErrorResponse | undefined
      throw new ApiError(
        body?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.',
        response.status,
        body?.errors
      )
    }
  })
}
