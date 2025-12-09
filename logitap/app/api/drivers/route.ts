import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Error al obtener conductores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, license, status } = body;

    console.log('📝 Creando conductor:', { name, email });

    // PASO 1: Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    // PASO 2: Generar contraseña automática
    // Formato: PrimeraLetraNombre + Licencia (sin puntos ni guión) + "2025"
    // Ejemplo: J123456782025
    const cleanLicense = license.replace(/[.-]/g, ''); // Quitar puntos y guión
    const autoPassword = `${name.charAt(0).toUpperCase()}${cleanLicense}2025`;

    console.log('🔑 Contraseña generada:', autoPassword);

    // PASO 3: Hash de la contraseña
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    // NOTA: El nombre completo se usa directamente en la creación del usuario

    // PASO 5: Crear conductor Y usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Primero crear conductor
      const driver = await tx.driver.create({
        data: {
          name,
          email,
          phone,
          license,
          status: status || 'available',
        },
      });

      console.log('✅ Conductor creado:', driver.id);

      // Luego crear usuario vinculado al conductor
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name,
          role: 'DRIVER',
          driverId: driver.id, // VINCULAR al conductor
        },
      });

      console.log('✅ Usuario creado:', user.id);

      return { user, driver, autoPassword };
    });

    // PASO 6: Retornar respuesta con credenciales
    return NextResponse.json({
      success: true,
      driver: result.driver,
      credentials: {
        email: result.user.email,
        password: result.autoPassword, // Contraseña sin hashear para mostrarla
        message: '⚠️ IMPORTANTE: Guarda estas credenciales. El conductor debe cambiar su contraseña al primer login.',
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creando conductor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear conductor' },
      { status: 500 }
    );
  }
}
