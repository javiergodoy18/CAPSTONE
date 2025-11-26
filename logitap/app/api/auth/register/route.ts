import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, driverId } = await request.json();

    // Validar campos
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Si es conductor, verificar que el driver exista
    if (role === 'DRIVER' && driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Conductor no encontrado' },
          { status: 404 }
        );
      }

      // Verificar que el driver no tenga usuario ya
      const existingDriverUser = await prisma.user.findFirst({
        where: { driverId },
      });

      if (existingDriverUser) {
        return NextResponse.json(
          { error: 'Este conductor ya tiene un usuario asignado' },
          { status: 400 }
        );
      }
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'DRIVER',
        driverId: role === 'DRIVER' ? driverId : null,
      },
      include: {
        driver: true,
      },
    });

    // Crear sesión
    const session = await createSession(user.id);

    // Preparar respuesta
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        driver: user.driver,
      },
      token: session.token,
    });

    // Establecer cookie
    response.cookies.set('auth_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
