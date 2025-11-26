import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Buscar todos los dispatches que tienen deliveries a esta farmacia
    const dispatches = await prisma.dispatch.findMany({
      where: {
        pickups: {
          some: {
            deliveries: {
              some: {
                pharmacyId: id,
              },
            },
          },
        },
        status: {
          in: ["scheduled", "in_progress"],
        },
      },
      include: {
        pickups: {
          include: {
            deliveries: true,
          },
        },
      },
    });

    console.log(`Actualizando ${dispatches.length} viajes que incluyen farmacia ${id}`);

    return NextResponse.json({
      success: true,
      dispatches_updated: dispatches.length,
    });
  } catch (error) {
    console.error("Error updating dispatch coordinates:", error);
    return NextResponse.json(
      { error: "Error al actualizar coordenadas de viajes" },
      { status: 500 }
    );
  }
}
