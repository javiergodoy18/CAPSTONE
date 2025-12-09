import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, recipientName, deliveryProof } = body;

    // Validar estado
    const validStatuses = ["pending", "loaded", "in_transit", "delivered", "failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    // Si se marca como entregado, registrar tiempo y datos
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
      if (recipientName) updateData.recipientName = recipientName;
      if (deliveryProof) updateData.deliveryProof = deliveryProof;
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        pharmacy: true,
        pickup: {
          include: {
            laboratory: true,
            dispatch: {
              include: {
                deliveries: true,
              },
            },
          },
        },
      },
    });

    // Verificar si todas las deliveries del dispatch están completas
    const dispatch = delivery.pickup.dispatch;
    const allDeliveries = dispatch.deliveries;
    const allDeliveriesComplete = allDeliveries.every(
      d => d.status === 'delivered' || d.status === 'failed'
    );

    return NextResponse.json({
      delivery,
      allDeliveriesComplete,
      dispatchId: dispatch.id,
      completedCount: allDeliveries.filter(d => d.status === 'delivered' || d.status === 'failed').length,
      totalCount: allDeliveries.length,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado de la entrega" },
      { status: 500 }
    );
  }
}
