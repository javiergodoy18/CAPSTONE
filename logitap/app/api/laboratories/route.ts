import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const laboratories = await prisma.laboratory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(laboratories);
  } catch (error) {
    console.error('Error fetching laboratories:', error);
    return NextResponse.json(
      { error: 'Error al obtener laboratorios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Received laboratory data:', body);

    if (!body.name || !body.email || !body.phone || !body.address || !body.city) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar presentes' },
        { status: 400 }
      );
    }

    const laboratory = await prisma.laboratory.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        contactPerson: body.contactPerson || null,
        businessType: body.businessType || 'laboratory',
      },
    });

    console.log('Laboratory created successfully:', laboratory.id);
    return NextResponse.json(laboratory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating laboratory:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear laboratorio', details: error.message },
      { status: 500 }
    );
  }
}
