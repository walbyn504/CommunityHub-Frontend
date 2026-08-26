/** Cookie de sesión accesible desde el cliente y SSR. */
export function useAuthToken() {
  return useCookie<string | null>('chub_token', {
    default: () => null,
    sameSite: 'lax',
    secure: !import.meta.dev
  })
}
