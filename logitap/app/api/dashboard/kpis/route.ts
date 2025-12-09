import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  console.log('📊 [DASHBOARD KPIs] Iniciando cálculo de KPIs...');

  try {
    // Extraer parámetro de período (7d, 30d, 90d, all)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    console.log(`🔍 Período seleccionado: ${period}`);

    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Calcular fechas según el período
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(startDate.getTime() - 1);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(startDate.getTime() - 1);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(startDate.getTime() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Desde el principio de los tiempos
        previousStartDate = new Date(0);
        previousEndDate = new Date(0);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(startDate.getTime() - 1);
    }

    console.log(`📅 Período actual: ${startDate.toISOString()} - ${now.toISOString()}`);
    console.log(`📅 Período anterior: ${previousStartDate.toISOString()} - ${previousEndDate.toISOString()}`);

    // Filtro de fecha para el período seleccionado
    const periodFilter = period === 'all' ? {} : { createdAt: { gte: startDate } };
    const previousPeriodFilter = period === 'all'
      ? {}
      : { createdAt: { gte: previousStartDate, lte: previousEndDate } };

    // KPI #1: Tasa de Cumplimiento
    const [totalDispatches, completedDispatches] = await Promise.all([
      prisma.dispatch.count({ where: periodFilter }),
      prisma.dispatch.count({ where: { ...periodFilter, status: 'completed' } }),
    ]);
    const completionRate = totalDispatches > 0
      ? parseFloat(((completedDispatches / totalDispatches) * 100).toFixed(1))
      : 0;

    // KPI #2: Ingresos y Margen
    const allPickups = await prisma.pickup.findMany({
      where: {
        dispatch: periodFilter,
      },
      include: {
        deliveries: {
          include: {
            pharmacy: { select: { id: true, name: true } },
          },
        },
        laboratory: { select: { id: true, name: true } },
        dispatch: {
          select: {
            id: true,
            driverId: true,
            driver: { select: { id: true, name: true } },
            createdAt: true,
          },
        },
      },
    });

    console.log(`📦 Total pickups encontrados: ${allPickups.length}`);
    console.log(`📦 Total deliveries: ${allPickups.reduce((sum, p) => sum + p.deliveries.length, 0)}`);

    let totalRevenue = 0;
    let estimatedCosts = 0;
    const revenueByLab: Record<string, { name: string; revenue: number; trips: number }> = {};
    const revenueByDriver: Record<string, { name: string; revenue: number; trips: number }> = {};

    allPickups.forEach((pickup, pickupIndex) => {
      let pickupRevenue = 0;

      console.log(`\n📦 Pickup ${pickupIndex + 1}/${allPickups.length} - Lab: ${pickup.laboratory?.name || 'Sin lab'}`);
      console.log(`   Deliveries en este pickup: ${pickup.deliveries.length}`);

      pickup.deliveries.forEach((delivery, deliveryIndex) => {
        let revenue = 0;
        const pharmacyName = delivery.pharmacy?.name || 'Sin farmacia';

        if (delivery.isCustomPricing && delivery.customPriceAmount) {
          revenue = parseFloat(delivery.customPriceAmount.toString());
          console.log(`   💰 Delivery ${deliveryIndex + 1} (${pharmacyName}): Custom pricing = $${revenue.toLocaleString()}`);
        } else if (delivery.merchandiseValue) {
          const value = parseFloat(delivery.merchandiseValue.toString());
          if (value <= 100000) revenue = value * 0.03;
          else if (value <= 1000000) revenue = value * 0.0275;
          else revenue = value * 0.025;
          console.log(`   💰 Delivery ${deliveryIndex + 1} (${pharmacyName}): Valor $${value.toLocaleString()} → Revenue $${revenue.toLocaleString()}`);
        } else {
          console.log(`   ⚠️ Delivery ${deliveryIndex + 1} (${pharmacyName}): Sin merchandiseValue ni customPriceAmount`);
        }

        pickupRevenue += revenue;
        totalRevenue += revenue;
      });

      console.log(`   📊 Revenue total del pickup: $${pickupRevenue.toLocaleString()}`);
      estimatedCosts += pickupRevenue * 0.3;

      // Por Laboratorio
      const labId = pickup.laboratory?.id;
      const labName = pickup.laboratory?.name || 'Sin laboratorio';
      if (labId) {
        if (!revenueByLab[labId]) {
          revenueByLab[labId] = { name: labName, revenue: 0, trips: 0 };
        }
        revenueByLab[labId].revenue += pickupRevenue;
        revenueByLab[labId].trips += 1;
      }

      // Por Conductor
      const driverId = pickup.dispatch?.driverId;
      const driverName = pickup.dispatch?.driver
        ? pickup.dispatch.driver.name
        : 'Sin conductor';
      if (driverId) {
        if (!revenueByDriver[driverId]) {
          revenueByDriver[driverId] = { name: driverName, revenue: 0, trips: 0 };
        }
        revenueByDriver[driverId].revenue += pickupRevenue;
        revenueByDriver[driverId].trips += 1;
      }
    });

    console.log(`\n💰 TOTAL REVENUE CALCULADO: $${totalRevenue.toLocaleString()}`);
    console.log(`💸 Costos estimados (30%): $${estimatedCosts.toLocaleString()}`);

    const profitMargin = totalRevenue > 0
      ? parseFloat(((totalRevenue - estimatedCosts) / totalRevenue * 100).toFixed(1))
      : 0;

    console.log(`📈 Margen de ganancia: ${profitMargin}%`);

    // KPI #3: Utilización de Flota
    const [totalVehicles, activeVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'disponible' } }),
    ]);
    const vehicleUtilization = totalVehicles > 0
      ? parseFloat((((totalVehicles - activeVehicles) / totalVehicles) * 100).toFixed(1))
      : 0;

    // KPI #4: Entregas por Viaje
    const totalDeliveries = allPickups.reduce((sum, p) => sum + p.deliveries.length, 0);
    const deliveriesPerDispatch = totalDispatches > 0
      ? parseFloat((totalDeliveries / totalDispatches).toFixed(1))
      : 0;

    // KPI #5: Crecimiento del Período
    const [currentPeriodDispatches, previousPeriodDispatchesCount] = await Promise.all([
      prisma.dispatch.count({ where: periodFilter }),
      prisma.dispatch.count({ where: previousPeriodFilter }),
    ]);

    console.log(`\n📊 Viajes período actual (${period}): ${currentPeriodDispatches}`);
    console.log(`📊 Viajes período anterior: ${previousPeriodDispatchesCount}`);

    let periodGrowth = 0;
    if (period === 'all') {
      // Para 'all', no hay crecimiento que mostrar
      periodGrowth = 0;
      console.log(`📈 Crecimiento: N/A (modo 'all')`);
    } else if (previousPeriodDispatchesCount === 0 && currentPeriodDispatches > 0) {
      periodGrowth = 100; // 100% de crecimiento si antes no había viajes
      console.log(`📈 Crecimiento: ${periodGrowth}% (nuevo - antes no había viajes)`);
    } else if (previousPeriodDispatchesCount > 0) {
      periodGrowth = parseFloat((((currentPeriodDispatches - previousPeriodDispatchesCount) / previousPeriodDispatchesCount) * 100).toFixed(1));
      console.log(`📈 Crecimiento: ${periodGrowth}% (${currentPeriodDispatches} vs ${previousPeriodDispatchesCount})`);
    } else {
      console.log(`📈 Crecimiento: ${periodGrowth}% (no hay datos para comparar)`);
    }

    // Rankings
    const topLaboratories = Object.values(revenueByLab)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(lab => ({
        name: lab.name,
        revenue: Math.round(lab.revenue),
        trips: lab.trips,
        avgPerTrip: Math.round(lab.revenue / lab.trips),
      }));

    const topDriversByRevenue = Object.values(revenueByDriver)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(driver => ({
        name: driver.name,
        revenue: Math.round(driver.revenue),
        trips: driver.trips,
        avgPerTrip: Math.round(driver.revenue / driver.trips),
      }));

    // Tendencia 7 días
    const dailyTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.dispatch.count({
          where: { createdAt: { gte: date, lt: nextDay } },
        });

        return {
          date: date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
          count,
        };
      })
    );

    return NextResponse.json({
      period, // Período seleccionado
      kpi1: { completionRate, completedDispatches, totalDispatches },
      kpi2: {
        totalRevenue: Math.round(totalRevenue),
        profit: Math.round(totalRevenue - estimatedCosts),
        profitMargin,
      },
      kpi3: { vehicleUtilization, totalVehicles, inUseVehicles: totalVehicles - activeVehicles },
      kpi4: { deliveriesPerDispatch, totalDeliveries },
      kpi5: {
        monthGrowth: periodGrowth, // Renombrado pero manteniendo compatibilidad
        thisMonth: currentPeriodDispatches,
        periodGrowth,
        currentPeriod: currentPeriodDispatches,
        previousPeriod: previousPeriodDispatchesCount,
      },
      topLaboratories,
      topDriversByRevenue,
      trends: { daily: dailyTrend },
    });
  } catch (error: any) {
    console.error('❌ Error KPIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
