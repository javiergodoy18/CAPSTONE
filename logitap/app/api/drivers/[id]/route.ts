import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const driver = await prisma.driver.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Error al obtener conductor' },
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

    const driver = await prisma.driver.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        license: body.license,
        status: body.status,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { error: 'Error al actualizar conductor' },
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

    // Verificar si el conductor está asignado a algún viaje activo
    const activeDispatches = await prisma.dispatch.findMany({
      where: {
        driverId: id,
        status: {
          in: ["scheduled", "in_progress"],
        },
      },
    });

    if (activeDispatches.length > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El conductor está asignado a ${activeDispatches.length} viaje(s) activo(s).` },
        { status: 400 }
      );
    }

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Conductor eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    return NextResponse.json(
      { error: "Error al eliminar conductor" },
      { status: 500 }
    );
  }
}
