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

    await prisma.dispatch.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Despacho eliminado" });
  } catch (error) {
    console.error("Error deleting dispatch:", error);
    return NextResponse.json(
      { error: "Error al eliminar despacho" },
      { status: 500 }
    );
  }
}