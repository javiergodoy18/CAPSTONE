import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    // Validar estado
    const validStatuses = ["scheduled", "assigned", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: any = { status };

    // Actualizar fechas según estado
    if (status === "in_progress") {
      updateData.actualStartDate = now;
    } else if (status === "completed") {
      updateData.actualEndDate = now;
    }

    const dispatch = await prisma.dispatch.update({
      where: { id },
      data: updateData,
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

    // Actualizar estado del vehículo y conductor
    if (status === "in_progress") {
      if (dispatch.vehicleId) {
        await prisma.vehicle.update({
          where: { id: dispatch.vehicleId },
          data: { status: "in_use" },
        });
      }
      if (dispatch.driverId) {
        await prisma.driver.update({
          where: { id: dispatch.driverId },
          data: { status: "busy" },
        });
      }
    } else if (status === "completed" || status === "cancelled") {
      if (dispatch.vehicleId) {
        await prisma.vehicle.update({
          where: { id: dispatch.vehicleId },
          data: { status: "available" },
        });
      }
      if (dispatch.driverId) {
        await prisma.driver.update({
          where: { id: dispatch.driverId },
          data: { status: "available" },
        });
      }
    }

    return NextResponse.json(dispatch);
  } catch (error) {
    console.error("Error updating dispatch status:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado del viaje" },
      { status: 500 }
    );
  }
}
