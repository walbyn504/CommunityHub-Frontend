/**
 * Error tipado que representa una respuesta de error de la API REST del backend
 * (formato { success: false, message, errors? }).
 *
 * Se usa en toda la app para distinguir "el backend respondió con un error controlado"
 * de "no hay conexión con el servidor", y así mostrar siempre un mensaje amigable.
 */
export class ApiError extends Error {
  statusCode: number
  errors?: Record<string, string>

  constructor(message: string, statusCode: number, errors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}
