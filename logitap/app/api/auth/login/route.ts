import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Verificar rate limiting por IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);

      return NextResponse.json(
        {
          error: `Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en ${minutesRemaining} minuto(s).`,
          retryAfter: resetDate.toISOString(),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        driver: true,
      },
    });

    // Si no existe el usuario, retornar error genérico
    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña con bcrypt
    const isValid = await verifyPassword(password, user.password);

    // Si la contraseña no es válida, retornar error genérico
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Crear sesión JWT
    const session = await createSession(user.id);

    // Preparar respuesta con datos del usuario y token
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

    // Establecer cookie httpOnly segura
    response.cookies.set('auth_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);

    return NextResponse.json(
      {
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
