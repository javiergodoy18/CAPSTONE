import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Buscar token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
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

    // Token válido
    return NextResponse.json({
      valid: true,
      message: 'Token válido',
    });

  } catch (error: any) {
    console.error('Error en validate-reset-token:', error);

    return NextResponse.json(
      {
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
