import type { UserRole } from '~/types/auth'
import type { UpdateUserData, UserRecord } from '~/types/user'

/** Cliente para /api/users (gestión de usuarios, mayormente restringido a ADMIN). */
export function useUsers() {
  const api = useApi()

  /** GET /api/users — solo ADMIN. Filtro opcional por rol. */
  function list(role?: UserRole) {
    return api<UserRecord[]>('/users', {
      params: { role: role || undefined }
    })
  }

  /** GET /api/users/:id — el propio usuario o un ADMIN. */
  function getById(id: string) {
    return api<UserRecord>(`/users/${id}`)
  }

  /** PUT /api/users/:id — el propio usuario o un ADMIN; solo un ADMIN puede cambiar "role". */
  function update(id: string, data: UpdateUserData) {
    return api<UserRecord>(`/users/${id}`, { method: 'PUT', body: data })
  }

  /** DELETE /api/users/:id — solo ADMIN. */
  function remove(id: string) {
    return api<{ message: string }>(`/users/${id}`, { method: 'DELETE' })
  }

  return { list, getById, update, remove }
}
