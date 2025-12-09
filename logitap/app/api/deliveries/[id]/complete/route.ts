import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, deliveredAt } = body;

    console.log(`📦 Actualizando delivery ${id} a estado: ${status}`);

    // Validar estado
    if (!['delivered', 'failed', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Actualizar delivery
    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
      },
      include: {
        pharmacy: true,
        dispatch: true,
      },
    });

    console.log(`✅ Delivery actualizado: ${delivery.pharmacy?.name || 'Sin nombre'} - ${status}`);

    return NextResponse.json({
      success: true,
      delivery,
      message: `Entrega marcada como ${status === 'delivered' ? 'completada' : status === 'failed' ? 'fallida' : 'pendiente'}`,
    });
  } catch (error: any) {
    console.error('❌ Error updating delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar entrega' },
      { status: 500 }
    );
  }
}
