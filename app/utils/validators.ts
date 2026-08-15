/** Validación simple de formato de correo electrónico para formularios del frontend. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Contraseña mínimamente segura para el registro: al menos 8 caracteres,
 * con una letra y un número. La validación completa y definitiva siempre
 * la hace el backend antes de hashear con bcrypt.
 */
export function isValidPassword(value: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value)
}
