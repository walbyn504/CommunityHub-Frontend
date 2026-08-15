/**
 * Estado reactivo compartido donde vive el JWT durante la sesión.
 *
 * El valor real se guarda en sessionStorage del navegador (ver
 * app/plugins/session.client.ts, que restaura y sincroniza este estado
 * con sessionStorage). Aquí solo devolvemos el estado compartido en
 * memoria (useState), porque sessionStorage no existe durante el
 * renderizado en servidor.
 */
export function useAuthToken() {
  return useState<string | null>('chub_token', () => null)
}
