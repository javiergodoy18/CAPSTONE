import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { validatePasswordStrength } from '@/lib/passwordValidation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validar campos requeridos
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Buscar token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    // Validar que el token existe
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      );
    }

    // Validar que el token no ha sido usado
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token ya fue utilizado' },
        { status: 400 }
      );
    }

    // Validar que el token no ha expirado
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña con bcrypt
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña del usuario y marcar token como usado
    await prisma.$transaction([
      // Actualizar password del usuario
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
        },
      }),
      // Marcar token como usado
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          used: true,
        },
      }),
    ]);

    console.log(`✅ Contraseña actualizada para usuario: ${resetToken.user.email}`);

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente',
    });

  } catch (error: any) {
    console.error('Error en reset-password:', error);

    return NextResponse.json(
      {
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
