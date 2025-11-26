import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: resolvedParams.id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            dispatch: true,
            pickup: {
              include: {
                laboratory: true,
              },
            },
          },
        },
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: 'Farmacia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(pharmacy);
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    return NextResponse.json(
      { error: 'Error al obtener farmacia' },
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

    const pharmacy = await prisma.pharmacy.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        rut: body.rut || null,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        contactPerson: body.contactPerson,
        latitude: body.latitude !== undefined ? Number(body.latitude) : undefined,
        longitude: body.longitude !== undefined ? Number(body.longitude) : undefined,
      },
    });

    return NextResponse.json(pharmacy);
  } catch (error: any) {
    console.error('Error updating pharmacy:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email o RUT ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar farmacia' },
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

    // Verificar si la farmacia tiene deliveries en viajes activos
    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        pharmacyId: id,
        dispatch: {
          status: {
            in: ["scheduled", "in_progress"],
          },
        },
      },
    });

    if (activeDeliveries.length > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. La farmacia tiene ${activeDeliveries.length} entrega(s) en viaje(s) activo(s).` },
        { status: 400 }
      );
    }

    await prisma.pharmacy.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Farmacia eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting pharmacy:", error);
    return NextResponse.json(
      { error: "Error al eliminar farmacia" },
      { status: 500 }
    );
  }
}
