import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDispatchCost } from "@/lib/pricing";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const pickup = await prisma.pickup.findUnique({
      where: { id },
      include: {
        laboratory: true,
        dispatch: {
          include: {
            vehicle: true,
            driver: true,
          },
        },
        deliveries: {
          include: {
            pharmacy: true,
          },
          orderBy: {
            orderInRoute: 'asc',
          },
        },
      },
    });

    if (!pickup) {
      return NextResponse.json(
        { error: "Recogida no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(pickup);
  } catch (error) {
    console.error("Error fetching pickup:", error);
    return NextResponse.json(
      { error: "Error al cargar recogida" },
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

    const pickup = await prisma.pickup.update({
      where: { id },
      data: {
        pickupAddress: body.pickupAddress,
        pickupDate: body.pickupDate ? new Date(body.pickupDate) : undefined,
        actualPickupTime: body.actualPickupTime ? new Date(body.actualPickupTime) : undefined,
        merchandiseValue: body.merchandiseValue,
        pricingType: body.pricingType,
        customPrice: body.customPrice,
        pickupNotes: body.pickupNotes,
      },
      include: {
        laboratory: true,
        deliveries: {
          include: {
            pharmacy: true,
          },
        },
      },
    });

    // Recalcular costo si cambió el valor de mercancía y es por porcentaje
    if (pickup.pricingType === 'percentage' && pickup.merchandiseValue > 0) {
      const pricing = calculateDispatchCost(pickup.merchandiseValue);

      await prisma.pickup.update({
        where: { id: pickup.id },
        data: {
          dispatchCost: pricing.cost,
          percentageApplied: pricing.percentage,
        },
      });
    }

    return NextResponse.json(pickup);
  } catch (error) {
    console.error("Error updating pickup:", error);
    return NextResponse.json(
      { error: "Error al actualizar recogida" },
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

    await prisma.pickup.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recogida eliminada" });
  } catch (error) {
    console.error("Error deleting pickup:", error);
    return NextResponse.json(
      { error: "Error al eliminar recogida" },
      { status: 500 }
    );
  }
}
