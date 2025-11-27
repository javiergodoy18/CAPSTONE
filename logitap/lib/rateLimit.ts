// Simple in-memory rate limiter
// En producción, esto debería usar Redis o similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limiter simple basado en IP
 * @param identifier - Identificador único (ej: IP address)
 * @param maxAttempts - Máximo de intentos permitidos (default: 5)
 * @param windowMs - Ventana de tiempo en milisegundos (default: 15 minutos)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Si no existe entrada o ha expirado, crear nueva
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime,
    };
  }

  // Incrementar contador
  entry.count++;
  rateLimitStore.set(identifier, entry);

  // Verificar si excede el límite
  const allowed = entry.count <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Resetear rate limit para un identificador
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Obtener IP del cliente desde headers de la request
 */
export function getClientIp(request: Request): string {
  // Intentar obtener IP desde headers de proxy
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback a IP genérica si no se puede obtener
  return 'unknown';
}
