import type { UserRole } from './auth'

/** Usuario tal como lo devuelve /api/users (toSafeUser en el backend, sin password). */
export interface UserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage?: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

/** Campos editables de un usuario vía PUT /api/users/:id. Todos opcionales (actualización parcial). */
export interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  profileImage?: string | null
  password?: string
  /** Solo un ADMIN puede enviar este campo; el backend lo rechaza si no lo es. */
  role?: UserRole
}
