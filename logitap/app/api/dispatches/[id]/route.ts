import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const dispatch = await prisma.dispatch.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        pickups: {
          include: {
            laboratory: true,
            deliveries: {
              include: {
                pharmacy: true,
              },
              orderBy: {
                orderInRoute: 'asc',
              },
            },
          },
        },
        deliveries: {
          include: {
            pharmacy: true,
            pickup: {
              include: {
                laboratory: true,
              },
            },
          },
          orderBy: {
            orderInRoute: 'asc',
          },
        },
      },
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: "Despacho no encontrado" },
        { status: 404 }
      );
    }

    // DEBUG: Verificar coordenadas desde la BD
    console.log('\n🔍 === API DISPATCH GET - COORDINATE CHECK ===');
    console.log('Dispatch ID:', id);
    dispatch.pickups.forEach((pickup, pIdx) => {
      console.log(`Pickup ${pIdx + 1}:`, {
        laboratoryId: pickup.laboratoryId,
        labName: pickup.laboratory?.name,
        labLat: pickup.laboratory?.latitude,
        labLng: pickup.laboratory?.longitude,
        labLatType: typeof pickup.laboratory?.latitude,
      });
      pickup.deliveries.forEach((delivery, dIdx) => {
        console.log(`  Delivery ${dIdx + 1}:`, {
          pharmacyId: delivery.pharmacyId,
          pharmName: delivery.pharmacy?.name,
          pharmLat: delivery.pharmacy?.latitude,
          pharmLng: delivery.pharmacy?.longitude,
          pharmLatType: typeof delivery.pharmacy?.latitude,
        });
      });
    });
    console.log('=== END API DEBUG ===\n');

    return NextResponse.json(dispatch);
  } catch (error) {
    console.error("Error fetching dispatch:", error);
    return NextResponse.json(
      { error: "Error al cargar despacho" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const dispatch = await prisma.dispatch.update({
      where: { id },
      data: {
        dispatchNumber: body.dispatchNumber,
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        scheduledStartDate: body.scheduledStartDate ? new Date(body.scheduledStartDate) : undefined,
        scheduledEndDate: body.scheduledEndDate ? new Date(body.scheduledEndDate) : undefined,
        actualStartDate: body.actualStartDate ? new Date(body.actualStartDate) : undefined,
        actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : undefined,
        status: body.status,
        totalMerchandiseValue: body.totalMerchandiseValue,
        totalIncome: body.totalIncome,
        generalNotes: body.generalNotes,
      },
      include: {
        vehicle: true,
        driver: true,
        pickups: {
          include: {
            laboratory: true,
            deliveries: {
              include: {
                pharmacy: true,
              },
            },
          },
        },
        deliveries: {
          include: {
            pharmacy: true,
            pickup: {
              include: {
                laboratory: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(dispatch);
  } catch (error) {
    console.error("Error updating dispatch:", error);
    return NextResponse.json(
      { error: "Error al actualizar despacho" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const dispatch = await prisma.dispatch.findUnique({
      where: { id },
      include: {
        pickups: {
          include: {
            deliveries: true,
          },
        },
      },
    });

    if (!dispatch) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    // No permitir eliminar viajes en progreso
    if (dispatch.status === "in_progress") {
      return NextResponse.json(
        { error: "No se puede eliminar un viaje que está en progreso. Primero cancélalo o completalo." },
        { status: 400 }
      );
    }

    // Eliminar en cascada: deliveries → pickups → dispatch
    for (const pickup of dispatch.pickups) {
      await prisma.delivery.deleteMany({
        where: { pickupId: pickup.id },
      });
    }

    await prisma.pickup.deleteMany({
      where: { dispatchId: id },
    });

    await prisma.dispatch.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting dispatch:", error);
    return NextResponse.json(
      { error: "Error al eliminar viaje" },
      { status: 500 }
    );
  }
}