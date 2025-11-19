import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const vehicle = await prisma.vehicle.create({
      data: {
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        type: body.type,
        capacity: parseFloat(body.capacity),
        status: body.status || 'available',
        fuelType: body.fuelType || null,
        mileage: body.mileage ? parseFloat(body.mileage) : null,
        lastService: body.lastService ? new Date(body.lastService) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Error al crear vehículo' },
      { status: 500 }
    );
  }
}