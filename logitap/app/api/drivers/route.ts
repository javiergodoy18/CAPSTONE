import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const driver = await prisma.driver.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        license: body.license,
        status: body.status || 'available',
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Error al crear conductor' },
      { status: 500 }
    );
  }
}
