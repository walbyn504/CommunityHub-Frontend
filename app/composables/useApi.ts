import type { ApiErrorResponse } from '~/types/auth'

/** Cliente HTTP con autenticación y errores normalizados. */
export function useApi(tokenOverride?: string) {
  const config = useRuntimeConfig()
  const token = useAuthToken()

  const offlineError = () => new ApiError('Sin conexión a internet.', 0)

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      if (import.meta.client && !navigator.onLine) {
        throw offlineError()
      }

      const activeToken = tokenOverride ?? token.value
      if (activeToken) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${activeToken}`)
        options.headers = headers
      }
    },
    onRequestError() {
      if (import.meta.client && !navigator.onLine) {
        throw offlineError()
      }
    },
    onResponseError({ response }) {
      if (import.meta.client && !navigator.onLine) {
        throw offlineError()
      }

      const body = response._data as ApiErrorResponse | undefined
      throw new ApiError(
        body?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.',
        response.status,
        body?.errors
      )
    }
  })
}
