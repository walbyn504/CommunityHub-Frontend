/**
 * Roles soportados por CommunityHub.
 * Deben coincidir exactamente con el enum "role" del modelo User en el backend.
 */
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'USER'

/**
 * Representa al usuario autenticado tal como lo devuelve la API
 * (GET /api/auth/me, POST /api/auth/login).
 */
export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar?: string | null
  createdAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  avatar?: string | null
}

/** Envoltorio estándar de respuestas exitosas de la API. */
export interface ApiSuccessResponse<T> {
  success: true
  message?: string
  data: T
}

/** Envoltorio estándar de respuestas de error de la API. */
export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string>
}
