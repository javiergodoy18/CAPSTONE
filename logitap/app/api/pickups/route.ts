import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDispatchCost } from "@/lib/pricing";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dispatchId = searchParams.get('dispatchId');

    const where = dispatchId ? { dispatchId } : {};

    const pickups = await prisma.pickup.findMany({
      where,
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
        },
      },
      orderBy: {
        pickupDate: 'asc',
      },
    });

    return NextResponse.json(pickups);
  } catch (error) {
    console.error("Error fetching pickups:", error);
    return NextResponse.json(
      { error: "Error al cargar recogidas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const pickup = await prisma.pickup.create({
      data: {
        dispatchId: body.dispatchId,
        laboratoryId: body.laboratoryId,
        pickupAddress: body.pickupAddress,
        pickupDate: new Date(body.pickupDate),
        merchandiseValue: body.merchandiseValue || 0,
        pickupNotes: body.pickupNotes,
      },
      include: {
        laboratory: true,
        deliveries: true,
      },
    });

    // Calcular costo automáticamente (siempre usa porcentaje)
    if (pickup.merchandiseValue > 0) {
      const pricing = calculateDispatchCost(pickup.merchandiseValue);

      await prisma.pickup.update({
        where: { id: pickup.id },
        data: {
          dispatchCost: pricing.cost,
          percentageApplied: pricing.percentage,
        },
      });
    }

    return NextResponse.json(pickup, { status: 201 });
  } catch (error) {
    console.error("Error creating pickup:", error);
    return NextResponse.json(
      { error: "Error al crear recogida" },
      { status: 500 }
    );
  }
}
