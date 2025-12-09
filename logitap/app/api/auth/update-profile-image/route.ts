import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { profileImage } = await request.json();

    // Validaciones
    if (!profileImage) {
      return NextResponse.json(
        { error: 'La imagen de perfil es requerida' },
        { status: 400 }
      );
    }

    // Validar que sea una imagen válida (base64 o URL)
    if (!profileImage.startsWith('data:image/') && !profileImage.startsWith('http')) {
      return NextResponse.json(
        { error: 'Formato de imagen inválido' },
        { status: 400 }
      );
    }

    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Validar sesión y obtener usuario
    const session = await validateSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Actualizar la imagen de perfil en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: profileImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      message: 'Imagen de perfil actualizada exitosamente',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('❌ ERROR COMPLETO al actualizar imagen de perfil:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);

    // Si es un error de Prisma por campo inexistente
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        {
          error: 'El campo profileImage no existe en la base de datos. Por favor ejecuta la migración: npx prisma migrate dev --name add_profile_image',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error del servidor' },
      { status: 500 }
    );
  }
}
