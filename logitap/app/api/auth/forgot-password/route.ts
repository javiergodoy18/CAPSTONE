import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validar campo requerido
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Si el usuario existe, crear token de recuperación
    if (user) {
      // Generar token único con crypto
      const token = crypto.randomBytes(32).toString('hex');

      // Expiración del token: 1 hora desde ahora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Guardar token en la base de datos
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Por ahora, solo logueamos el link (en producción enviarías un email)
      const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`;
      console.log('\n=================================');
      console.log('🔑 LINK DE RECUPERACIÓN DE CONTRASEÑA');
      console.log('=================================');
      console.log(`Email: ${email}`);
      console.log(`Link: ${resetLink}`);
      console.log(`Expira: ${expiresAt.toLocaleString()}`);
      console.log('=================================\n');
    }

    // SIEMPRE retornar éxito, sin revelar si el email existe
    // Esto previene que atacantes descubran qué emails están registrados
    return NextResponse.json({
      message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace de recuperación.',
    });

  } catch (error: any) {
    console.error('Error en forgot-password:', error);

    return NextResponse.json(
      {
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
