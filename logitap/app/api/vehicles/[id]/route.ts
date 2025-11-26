import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículo' },
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

    const vehicle = await prisma.vehicle.update({
      where: { id: resolvedParams.id },
      data: {
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        type: body.type,
        capacity: parseFloat(body.capacity),
        status: body.status,
        fuelType: body.fuelType || null,
        mileage: body.mileage ? parseFloat(body.mileage) : null,
        lastService: body.lastService ? new Date(body.lastService) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Error al actualizar vehículo' },
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

    // Verificar si el vehículo está asignado a algún viaje activo
    const activeDispatches = await prisma.dispatch.findMany({
      where: {
        vehicleId: id,
        status: {
          in: ["scheduled", "in_progress"],
        },
      },
    });

    if (activeDispatches.length > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El vehículo está asignado a ${activeDispatches.length} viaje(s) activo(s).` },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Error al eliminar vehículo" },
      { status: 500 }
    );
  }
}