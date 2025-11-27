export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida la fortaleza de una contraseña
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos 1 letra mayúscula
 * - Al menos 1 número
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica que las contraseñas coincidan
 */
export function validatePasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
