import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { optimizedOrder } = body;

    // Actualizar el orden de las entregas según la optimización
    for (let i = 0; i < optimizedOrder.length; i++) {
      const deliveryId = optimizedOrder[i];
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: { actualOrder: i },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error optimizing route:", error);
    return NextResponse.json(
      { error: "Error al optimizar ruta" },
      { status: 500 }
    );
  }
}
