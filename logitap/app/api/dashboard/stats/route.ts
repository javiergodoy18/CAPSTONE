import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalDispatches,
      completedDispatches,
      inProgressDispatches,
      totalVehicles,
      totalDrivers,
      totalLaboratories,
      totalPharmacies,
    ] = await Promise.all([
      prisma.dispatch.count(),
      prisma.dispatch.count({ where: { status: 'completed' } }),
      prisma.dispatch.count({ where: { status: 'in_progress' } }),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.laboratory.count(),
      prisma.pharmacy.count(),
    ]);

    return NextResponse.json({
      totalDispatches,
      completedDispatches,
      inProgressDispatches,
      totalVehicles,
      totalDrivers,
      totalLaboratories,
      totalPharmacies,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
