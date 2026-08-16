/**
 * Cookie de sesión donde vive el JWT. Al no definir maxAge ni expires, el
 * navegador la elimina al finalizar la sesión. La cookie también es accesible
 * durante SSR, por lo que los middleware pueden validar un refresh directo de
 * una página protegida antes de decidir si redirigen al login.
 */
export function useAuthToken() {
  return useCookie<string | null>('chub_token', {
    default: () => null,
    sameSite: 'lax',
    secure: !import.meta.dev
  })
}
