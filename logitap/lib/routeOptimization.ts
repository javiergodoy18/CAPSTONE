// ===== TYPES =====

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "pickup" | "delivery";
  address?: string;
  relatedId?: string; // Para vincular pickup con delivery
}

export interface RouteStats {
  totalDistance: number; // en kilómetros
  estimatedTime: number; // en minutos
  numberOfStops: number;
}

export interface ValidationResult {
  isValid: boolean;
  validLocations: Location[];
  invalidCount: number;
  message: string;
  warnings?: string[];
}

export interface OptimizationResult {
  optimizedOrder: number[];
  stats: RouteStats;
  success: boolean;
  message: string;
}

export interface SavingsResult {
  distanceSaved: number;
  percentageSaved: number;
  timeSaved: number;
}

// ===== VALIDATION =====

/**
 * Valida que las coordenadas sean válidas
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  // Verificar que no sean null, undefined, NaN
  if (lat == null || lng == null) return false;
  if (isNaN(lat) || isNaN(lng)) return false;

  // Verificar rangos válidos
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;

  // Verificar que no sean 0,0 (probablemente error)
  if (lat === 0 && lng === 0) return false;

  return true;
}

/**
 * Valida un array de ubicaciones y filtra las válidas
 */
export function validateLocations(locations: Location[]): ValidationResult {
  console.log('🔍 VALIDATE LOCATIONS - Input:', locations.length, 'locations');

  if (!locations || locations.length === 0) {
    console.log('❌ No locations provided');
    return {
      isValid: false,
      validLocations: [],
      invalidCount: 0,
      message: 'No se proporcionaron ubicaciones para validar.'
    };
  }

  const warnings: string[] = [];

  const validLocations = locations.filter((loc, index) => {
    console.log(`\n📍 Validating location ${index + 1}/${locations.length}:`, {
      id: loc.id,
      name: loc.name,
      type: loc.type,
      lat: loc.lat,
      lng: loc.lng,
      latType: typeof loc.lat,
      lngType: typeof loc.lng,
    });

    // Verificar que no sea null o undefined
    if (loc.lat === null || loc.lat === undefined) {
      console.log(`  ❌ lat is ${loc.lat}`);
      warnings.push(`${loc.name}: latitud es ${loc.lat}`);
      return false;
    }
    if (loc.lng === null || loc.lng === undefined) {
      console.log(`  ❌ lng is ${loc.lng}`);
      warnings.push(`${loc.name}: longitud es ${loc.lng}`);
      return false;
    }

    // Convertir a número si es necesario
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);

    // Verificar que no sea NaN después de conversión
    if (isNaN(lat) || isNaN(lng)) {
      console.log(`  ❌ NaN after conversion - lat: ${lat}, lng: ${lng}`);
      warnings.push(`${loc.name}: coordenadas NaN después de conversión`);
      return false;
    }

    // Verificar rangos válidos
    if (lat < -90 || lat > 90) {
      console.log(`  ❌ lat out of range: ${lat}`);
      warnings.push(`${loc.name}: latitud fuera de rango (${lat})`);
      return false;
    }
    if (lng < -180 || lng > 180) {
      console.log(`  ❌ lng out of range: ${lng}`);
      warnings.push(`${loc.name}: longitud fuera de rango (${lng})`);
      return false;
    }

    console.log(`  ✅ Valid location: ${loc.name}`);
    return true;
  });

  console.log(`\n📊 VALIDATION SUMMARY:`);
  console.log(`  Total locations: ${locations.length}`);
  console.log(`  Valid locations: ${validLocations.length}`);
  console.log(`  Invalid locations: ${locations.length - validLocations.length}`);

  const invalidCount = locations.length - validLocations.length;
  const canOptimize = validLocations.length >= 2;

  let message = "";
  if (validLocations.length === 0) {
    message = "No hay ubicaciones con coordenadas válidas";
  } else if (validLocations.length === 1) {
    message = "Solo hay 1 ubicación válida. Se necesitan al menos 2 para optimizar";
  } else if (invalidCount > 0) {
    message = `${validLocations.length} ubicaciones válidas (${invalidCount} excluidas por coordenadas inválidas)`;
  } else {
    message = `${validLocations.length} ubicaciones listas para optimizar`;
  }

  if (!canOptimize) {
    console.log(`❌ VALIDATION FAILED: ${message}`);
  } else {
    console.log(`✅ VALIDATION PASSED: ${validLocations.length} valid locations`);
  }

  return {
    isValid: canOptimize,
    validLocations,
    invalidCount,
    message,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ===== DISTANCE CALCULATION =====

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @returns distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ===== ROUTE OPTIMIZATION =====

/**
 * Optimiza la ruta usando algoritmo greedy (vecino más cercano)
 * Estrategia: Pickups primero, luego deliveries en orden óptimo
 */
export function optimizeRoute(locations: Location[]): OptimizationResult {
  // Validar ubicaciones primero
  const validation = validateLocations(locations);

  if (!validation.isValid) {
    return {
      optimizedOrder: [],
      stats: { totalDistance: 0, estimatedTime: 0, numberOfStops: 0 },
      success: false,
      message: validation.message,
    };
  }

  const validLocations = validation.validLocations;

  // Si solo hay 2 ubicaciones, no hay mucho que optimizar
  if (validLocations.length === 2) {
    return {
      optimizedOrder: [0, 1],
      stats: calculateRouteStats(validLocations, [0, 1]),
      success: true,
      message: "Ruta directa (2 ubicaciones)",
    };
  }

  // Separar pickups y deliveries
  const pickups = validLocations
    .map((loc, idx) => ({ loc, idx }))
    .filter((item) => item.loc.type === "pickup");

  const deliveries = validLocations
    .map((loc, idx) => ({ loc, idx }))
    .filter((item) => item.loc.type === "delivery");

  // Orden optimizado final
  const optimizedOrder: number[] = [];

  // 1. Agregar todos los pickups primero (orden de aparición)
  pickups.forEach((item) => optimizedOrder.push(item.idx));

  // 2. Optimizar deliveries usando vecino más cercano
  if (deliveries.length > 0) {
    const visited = new Set<number>();

    // Comenzar desde el último pickup (o primer delivery si no hay pickups)
    let currentIdx = pickups.length > 0
      ? pickups[pickups.length - 1].idx
      : deliveries[0].idx;

    let currentLat = validLocations[currentIdx].lat;
    let currentLng = validLocations[currentIdx].lng;

    // Encontrar el delivery más cercano sucesivamente
    while (visited.size < deliveries.length) {
      let nearestIdx = -1;
      let nearestDistance = Infinity;

      deliveries.forEach((item) => {
        if (!visited.has(item.idx)) {
          const distance = calculateDistance(
            currentLat,
            currentLng,
            item.loc.lat,
            item.loc.lng
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIdx = item.idx;
          }
        }
      });

      if (nearestIdx !== -1) {
        visited.add(nearestIdx);
        optimizedOrder.push(nearestIdx);
        currentLat = validLocations[nearestIdx].lat;
        currentLng = validLocations[nearestIdx].lng;
      }
    }
  }

  const stats = calculateRouteStats(validLocations, optimizedOrder);

  return {
    optimizedOrder,
    stats,
    success: true,
    message: `Ruta optimizada con ${validLocations.length} paradas`,
  };
}

// ===== ROUTE STATISTICS =====

/**
 * Calcula estadísticas de una ruta dada
 */
export function calculateRouteStats(
  locations: Location[],
  order: number[]
): RouteStats {
  if (order.length === 0) {
    return { totalDistance: 0, estimatedTime: 0, numberOfStops: 0 };
  }

  let totalDistance = 0;

  // Sumar distancias entre paradas consecutivas
  for (let i = 0; i < order.length - 1; i++) {
    const currentIdx = order[i];
    const nextIdx = order[i + 1];

    const distance = calculateDistance(
      locations[currentIdx].lat,
      locations[currentIdx].lng,
      locations[nextIdx].lat,
      locations[nextIdx].lng
    );

    totalDistance += distance;
  }

  // Calcular tiempo estimado
  // Asumiendo 60 km/h de velocidad promedio + 15 minutos por parada
  const travelTime = (totalDistance / 60) * 60; // minutos
  const stopTime = order.length * 15; // 15 min por parada
  const estimatedTime = travelTime + stopTime;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // 2 decimales
    estimatedTime: Math.round(estimatedTime),
    numberOfStops: order.length,
  };
}

/**
 * Calcula el ahorro entre ruta original y optimizada
 */
export function calculateSavings(
  locations: Location[],
  originalOrder: number[],
  optimizedOrder: number[]
): SavingsResult {
  const originalStats = calculateRouteStats(locations, originalOrder);
  const optimizedStats = calculateRouteStats(locations, optimizedOrder);

  const distanceSaved = originalStats.totalDistance - optimizedStats.totalDistance;
  const percentageSaved = originalStats.totalDistance > 0
    ? (distanceSaved / originalStats.totalDistance) * 100
    : 0;
  const timeSaved = originalStats.estimatedTime - optimizedStats.estimatedTime;

  return {
    distanceSaved: Math.round(distanceSaved * 100) / 100,
    percentageSaved: Math.round(percentageSaved * 10) / 10,
    timeSaved: Math.round(timeSaved),
  };
}

/**
 * Calcula el centro geográfico de un conjunto de ubicaciones
 */
export function calculateCenter(locations: Location[]): { lat: number; lng: number } {
  if (locations.length === 0) {
    return { lat: 10.4806, lng: -66.9036 }; // Caracas por defecto
  }

  const validLocations = locations.filter((loc) =>
    isValidCoordinate(loc.lat, loc.lng)
  );

  if (validLocations.length === 0) {
    return { lat: 10.4806, lng: -66.9036 };
  }

  const avgLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0) / validLocations.length;
  const avgLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0) / validLocations.length;

  return { lat: avgLat, lng: avgLng };
}
