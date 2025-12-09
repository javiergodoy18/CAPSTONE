import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { error: 'driverId es requerido' },
        { status: 400 }
      );
    }

    // Obtener viajes de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dispatches = await prisma.dispatch.findMany({
      where: {
        driverId,
        scheduledStartDate: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
        pickups: {
          include: {
            laboratory: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                latitude: true,
                longitude: true,
              },
            },
            deliveries: {
              include: {
                pharmacy: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledStartDate: 'desc',
      },
    });

    return NextResponse.json(dispatches);
  } catch (error: any) {
    console.error('Error fetching driver dispatches:', error);
    return NextResponse.json(
      { error: 'Error al obtener viajes del conductor' },
      { status: 500 }
    );
  }
}
