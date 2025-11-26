import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDispatchCost } from "@/lib/pricing";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Verificar que el viaje no esté en progreso
    const existingDispatch = await prisma.dispatch.findUnique({
      where: { id },
    });

    if (!existingDispatch) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    if (existingDispatch.status === "in_progress") {
      return NextResponse.json(
        { error: "No se puede editar un viaje que está en progreso" },
        { status: 400 }
      );
    }

    // Actualizar en transacción
    const dispatch = await prisma.$transaction(async (tx) => {
      // 1. Eliminar pickups y deliveries existentes
      await tx.delivery.deleteMany({
        where: {
          dispatchId: id,
        },
      });

      await tx.pickup.deleteMany({
        where: {
          dispatchId: id,
        },
      });

      // 2. Actualizar información del despacho
      const updatedDispatch = await tx.dispatch.update({
        where: { id },
        data: {
          dispatchNumber: body.dispatch.dispatchNumber,
          vehicleId: body.dispatch.vehicleId,
          driverId: body.dispatch.driverId,
          scheduledStartDate: new Date(body.dispatch.scheduledStartDate),
          scheduledEndDate: body.dispatch.scheduledEndDate
            ? new Date(body.dispatch.scheduledEndDate)
            : null,
          generalNotes: body.dispatch.generalNotes,
        },
      });

      let totalMerchandiseValue = 0;
      let totalIncome = 0;

      // 3. Crear nuevos pickups con sus deliveries
      for (const pickupData of body.pickups) {
        const pickupMerchandiseValue = pickupData.deliveries.reduce(
          (sum: number, delivery: any) => sum + delivery.merchandiseValue,
          0
        );

        const pricing = calculateDispatchCost(pickupMerchandiseValue);

        const pickup = await tx.pickup.create({
          data: {
            dispatchId: id,
            laboratoryId: pickupData.laboratoryId,
            pickupAddress: pickupData.pickupAddress,
            pickupDate: new Date(pickupData.pickupDate),
            merchandiseValue: pickupMerchandiseValue,
            dispatchCost: pricing.cost,
            percentageApplied: pricing.percentage,
            pricingType: pickupData.pricingType || "percentage",
            customPrice: pickupData.customPrice,
            pickupNotes: pickupData.pickupNotes,
          },
        });

        for (let i = 0; i < pickupData.deliveries.length; i++) {
          const deliveryData = pickupData.deliveries[i];

          await tx.delivery.create({
            data: {
              dispatchId: id,
              pickupId: pickup.id,
              pharmacyId: deliveryData.pharmacyId,
              invoiceNumber: deliveryData.invoiceNumber,
              merchandiseValue: deliveryData.merchandiseValue,
              productType: deliveryData.productType || "medicamentos",
              weight: deliveryData.weight,
              packages: deliveryData.packages,
              orderInRoute: i,
              status: "pending",
              deliveryNotes: deliveryData.deliveryNotes,
            },
          });
        }

        totalMerchandiseValue += pickupMerchandiseValue;
        totalIncome += pricing.cost;
      }

      // 4. Actualizar totales del despacho
      const finalDispatch = await tx.dispatch.update({
        where: { id },
        data: {
          totalMerchandiseValue,
          totalIncome,
        },
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
        },
      });

      return finalDispatch;
    });

    return NextResponse.json(dispatch);
  } catch (error) {
    console.error("Error updating complete dispatch:", error);
    return NextResponse.json(
      { error: "Error al actualizar viaje completo" },
      { status: 500 }
    );
  }
}
