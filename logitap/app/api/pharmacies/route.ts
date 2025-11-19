import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(pharmacies);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json(
      { error: 'Error al obtener farmacias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Received pharmacy data:', body);

    if (!body.name || !body.email || !body.phone || !body.address || !body.city || !body.contactPerson) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar presentes' },
        { status: 400 }
      );
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: body.name,
        rut: body.rut || null,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        contactPerson: body.contactPerson,
      },
    });

    console.log('Pharmacy created successfully:', pharmacy.id);
    return NextResponse.json(pharmacy, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pharmacy:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email o RUT ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear farmacia', details: error.message },
      { status: 500 }
    );
  }
}
