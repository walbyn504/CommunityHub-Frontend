/** Validación simple de formato de correo electrónico para formularios del frontend. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Espejo exacto de validatePassword() en authController.js del backend:
 * mínimo 8 caracteres, con minúscula, mayúscula, número y carácter especial
 * (@$!%*?&.#_-). Debe coincidir siempre con el backend para que el frontend
 * nunca acepte algo que el backend vaya a rechazar después.
 */
export function isValidPassword(value: string): boolean {
  const hasLower = /[a-z]/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[@$!%*?&.#_-]/.test(value)
  const minLength = value.length >= 8

  return hasLower && hasUpper && hasNumber && hasSpecial && minLength
}
