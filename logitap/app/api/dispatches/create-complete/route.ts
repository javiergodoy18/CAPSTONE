import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDispatchCost } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar que tenga al menos un pickup
    if (!body.pickups || body.pickups.length === 0) {
      return NextResponse.json(
        { error: "Debe agregar al menos un laboratorio" },
        { status: 400 }
      );
    }

    // Crear el despacho con pickups y deliveries en una transacción
    const dispatch = await prisma.$transaction(async (tx) => {
      // 1. Crear el despacho
      const newDispatch = await tx.dispatch.create({
        data: {
          dispatchNumber: body.dispatch.dispatchNumber,
          vehicleId: body.dispatch.vehicleId,
          driverId: body.dispatch.driverId,
          scheduledStartDate: new Date(body.dispatch.scheduledStartDate),
          scheduledEndDate: body.dispatch.scheduledEndDate
            ? new Date(body.dispatch.scheduledEndDate)
            : null,
          status: 'scheduled',
          generalNotes: body.dispatch.generalNotes,
        },
      });

      let totalMerchandiseValue = 0;
      let totalIncome = 0;

      // 2. Crear cada pickup con sus deliveries
      for (const pickupData of body.pickups) {
        // Calcular valor total de las entregas de este pickup
        const pickupMerchandiseValue = pickupData.deliveries.reduce(
          (sum: number, delivery: any) => sum + delivery.merchandiseValue,
          0
        );

        // Calcular costo del pickup
        const pricing = calculateDispatchCost(pickupMerchandiseValue);

        // Crear pickup
        const pickup = await tx.pickup.create({
          data: {
            dispatchId: newDispatch.id,
            laboratoryId: pickupData.laboratoryId,
            pickupAddress: pickupData.pickupAddress,
            pickupDate: new Date(pickupData.pickupDate),
            merchandiseValue: pickupMerchandiseValue,
            dispatchCost: pricing.cost,
            percentageApplied: pricing.percentage,
            pricingType: pickupData.pricingType || 'percentage',
            customPrice: pickupData.customPrice,
            pickupNotes: pickupData.pickupNotes,
          },
        });

        // Crear deliveries de este pickup
        for (let i = 0; i < pickupData.deliveries.length; i++) {
          const deliveryData = pickupData.deliveries[i];

          await tx.delivery.create({
            data: {
              dispatchId: newDispatch.id,
              pickupId: pickup.id,
              pharmacyId: deliveryData.pharmacyId,
              invoiceNumber: deliveryData.invoiceNumber,
              merchandiseValue: deliveryData.merchandiseValue,
              productType: deliveryData.productType || 'medicamentos',
              weight: deliveryData.weight,
              packages: deliveryData.packages,
              orderInRoute: i, // Orden temporal
              status: 'pending',
              deliveryNotes: deliveryData.deliveryNotes,
            },
          });
        }

        totalMerchandiseValue += pickupMerchandiseValue;
        totalIncome += pricing.cost;
      }

      // 3. Actualizar el despacho con los totales
      const updatedDispatch = await tx.dispatch.update({
        where: { id: newDispatch.id },
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

      return updatedDispatch;
    });

    return NextResponse.json(dispatch, { status: 201 });
  } catch (error) {
    console.error("Error creating complete dispatch:", error);
    return NextResponse.json(
      { error: "Error al crear despacho completo" },
      { status: 500 }
    );
  }
}
