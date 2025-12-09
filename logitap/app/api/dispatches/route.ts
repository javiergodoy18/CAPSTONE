import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🔍 API: Fetching dispatches from database...');
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

    console.log('✅ API: Found', dispatches.length, 'dispatches');
    console.log('📦 API: First dispatch:', dispatches[0] ? dispatches[0].dispatchNumber : 'none');
    return NextResponse.json(dispatches);
  } catch (error) {
    console.error("❌ API: Error fetching dispatches:", error);
    return NextResponse.json(
      { error: "Error al cargar despachos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dispatchNumber, vehicleId, driverId, scheduledStartDate } = body;

    console.log('📝 Creando viaje:', { dispatchNumber, vehicleId, driverId });

    // IMPORTANTE: Validar que el conductor existe
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: { user: true },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Conductor no encontrado' },
          { status: 400 }
        );
      }

      console.log(`✅ Conductor encontrado: ${driver.name}`);
      console.log(`📧 Email: ${driver.email} | User ID: ${driver.user?.id || 'Sin usuario'}`);
    }

    const dispatch = await prisma.dispatch.create({
      data: {
        dispatchNumber: body.dispatchNumber,
        vehicleId: body.vehicleId,
        driverId: body.driverId, // AQUÍ SE ASIGNA AL CONDUCTOR
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

    console.log(`✅ Viaje creado: ${dispatch.id}`);
    if (dispatch.driver) {
      console.log(`🚚 Asignado a: ${dispatch.driver.name}`);
    }

    // TODO: Enviar notificación al conductor (Fase futura)
    // await sendNotificationToDriver(driver.userId, dispatch.id);

    return NextResponse.json({
      success: true,
      dispatch,
      message: dispatch.driver
        ? `Viaje asignado exitosamente a ${dispatch.driver.name}`
        : 'Viaje creado exitosamente',
    }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating dispatch:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear despacho" },
      { status: 500 }
    );
  }
}