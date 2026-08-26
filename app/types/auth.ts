/** Roles admitidos por el backend. */
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'USER'

/** Usuario autenticado devuelto por la API. */
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

/** Usuario y token devueltos al iniciar sesión. */
export interface LoginResponse extends AuthUser {
  token: string
}

/** Formato de error que usa el backend (a veces con "success", a veces sin él). */
export interface ApiErrorResponse {
  success?: false
  message: string
  errors?: Record<string, string>
}
