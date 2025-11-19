import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const laboratory = await prisma.laboratory.findUnique({
      where: { id: resolvedParams.id },
      include: {
        pickups: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            dispatch: true,
          },
        },
      },
    });

    if (!laboratory) {
      return NextResponse.json(
        { error: 'Laboratorio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(laboratory);
  } catch (error) {
    console.error('Error fetching laboratory:', error);
    return NextResponse.json(
      { error: 'Error al obtener laboratorio' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const laboratory = await prisma.laboratory.update({
      where: { id: resolvedParams.id },
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

    return NextResponse.json(laboratory);
  } catch (error: any) {
    console.error('Error updating laboratory:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar laboratorio' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.laboratory.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: 'Laboratorio eliminado' });
  } catch (error) {
    console.error('Error deleting laboratory:', error);
    return NextResponse.json(
      { error: 'Error al eliminar laboratorio' },
      { status: 500 }
    );
  }
}
