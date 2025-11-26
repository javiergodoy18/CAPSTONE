import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('🔐 Login request received');

    const body = await request.json();
    console.log('📧 Email:', body.email);

    const { email, password } = body;

    // Validar campos
    if (!email || !password) {
      console.log('❌ Missing fields');
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando usuario...');

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        driver: true,
      },
    });

    console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('🔑 Verificando contraseña...');

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.password);

    console.log('🔑 Contraseña válida:', isValid);

    if (!isValid) {
      console.log('❌ Contraseña incorrecta');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('✅ Creando sesión...');

    // Crear sesión
    const session = await createSession(user.id);

    console.log('✅ Sesión creada:', session.id);

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
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    console.log('✅ Login exitoso');

    return response;
  } catch (error: any) {
    console.error('❌ ERROR EN LOGIN:', error);
    console.error('Stack:', error.stack);
    console.error('Message:', error.message);

    return NextResponse.json(
      {
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
