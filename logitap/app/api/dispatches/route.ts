import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dispatches = await prisma.dispatch.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(dispatches);
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    return NextResponse.json(
      { error: "Error al cargar despachos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const dispatch = await prisma.dispatch.create({
      data: {
        dispatchNumber: body.dispatchNumber,
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        scheduledStartDate: new Date(body.scheduledStartDate),
        scheduledEndDate: body.scheduledEndDate ? new Date(body.scheduledEndDate) : undefined,
        status: body.status || 'scheduled',
        totalMerchandiseValue: body.totalMerchandiseValue || 0,
        totalIncome: body.totalIncome || 0,
        generalNotes: body.generalNotes,
      },
      include: {
        vehicle: true,
        driver: true,
        pickups: {
          include: {
            laboratory: true,
          },
        },
      },
    });

    return NextResponse.json(dispatch, { status: 201 });
  } catch (error) {
    console.error("Error creating dispatch:", error);
    return NextResponse.json(
      { error: "Error al crear despacho" },
      { status: 500 }
    );
  }
}