import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generar token de sesión
export function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
}

// Crear sesión
export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return session;
}

// Validar sesión
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          driver: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

// Eliminar sesión (logout)
export async function deleteSession(token: string) {
  try {
    await prisma.session.delete({ where: { token } });
    return true;
  } catch (error) {
    return false;
  }
}

// Middleware para verificar autenticación
export async function requireAuth(token: string | undefined) {
  if (!token) {
    throw new Error('No autorizado');
  }

  const session = await validateSession(token);

  if (!session) {
    throw new Error('Sesión inválida o expirada');
  }

  return session.user;
}

// Middleware para verificar rol de admin
export async function requireAdmin(token: string | undefined) {
  const user = await requireAuth(token);

  if (user.role !== 'ADMIN') {
    throw new Error('Acceso denegado. Se requiere rol de administrador');
  }

  return user;
}
