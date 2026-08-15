import type { ApiErrorResponse } from '~/types/auth'

/**
 * Cliente HTTP centralizado para consumir la API REST del backend de CommunityHub.
 *
 * - Usa $fetch (ofetch), la herramienta HTTP nativa de Nuxt.
 * - Adjunta automáticamente la cookie httpOnly del JWT (credentials: 'include').
 * - Durante el renderizado en servidor (SSR), reenvía la cookie de la petición
 *   original del navegador, porque ahí no existe un "navegador" que la adjunte solo.
 * - Normaliza cualquier error del backend a un ApiError con mensaje legible,
 *   para que las páginas nunca muestren errores crudos de red o del servidor.
 */
export function useApi() {
  const config = useRuntimeConfig()

  const forwardedCookie = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    headers: forwardedCookie,
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
