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
        latitude: body.latitude !== undefined ? Number(body.latitude) : undefined,
        longitude: body.longitude !== undefined ? Number(body.longitude) : undefined,
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
    const { id } = resolvedParams;

    // Verificar si el laboratorio tiene pickups en viajes activos
    const activePickups = await prisma.pickup.findMany({
      where: {
        laboratoryId: id,
        dispatch: {
          status: {
            in: ["scheduled", "in_progress"],
          },
        },
      },
    });

    if (activePickups.length > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El laboratorio tiene ${activePickups.length} pickup(s) en viaje(s) activo(s).` },
        { status: 400 }
      );
    }

    await prisma.laboratory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Laboratorio eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting laboratory:", error);
    return NextResponse.json(
      { error: "Error al eliminar laboratorio" },
      { status: 500 }
    );
  }
}
