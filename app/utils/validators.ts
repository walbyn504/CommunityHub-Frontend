/** Validación simple de formato de correo electrónico para formularios del frontend. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** Replica la validación de contraseña del backend. */
export function isValidPassword(value: string): boolean {
  const hasLower = /[a-z]/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[@$!%*?&.#_-]/.test(value)
  const minLength = value.length >= 8

  return hasLower && hasUpper && hasNumber && hasSpecial && minLength
}
