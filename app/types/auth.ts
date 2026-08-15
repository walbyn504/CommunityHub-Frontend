/**
 * Roles soportados por CommunityHub.
 * Deben coincidir exactamente con el enum "role" del modelo User en el backend.
 */
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'USER'

/**
 * Representa al usuario autenticado tal como lo devuelve la API
 * (GET /api/auth/me). Coincide exactamente con el authController real.
 */
export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  profileImage?: string | null
}

/** Datos que el formulario de login envía al backend (no confundir con el "payload" del JWT). */
export interface LoginCredentials {
  email: string
  password: string
}

/** Datos que el formulario de registro envía al backend. */
export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  profileImage?: string | null
}

/**
 * Respuesta real de POST /api/auth/login: el usuario más el token JWT,
 * todo en el mismo nivel (sin envoltorio { success, data }).
 */
export interface LoginResponse extends AuthUser {
  token: string
}

/** Formato de error que usa el backend (a veces con "success", a veces sin él). */
export interface ApiErrorResponse {
  success?: false
  message: string
  errors?: Record<string, string>
}
