"use client";

import { useLoadScript, GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect, useMemo } from "react";
import {
  Location,
  RouteStats,
  ValidationResult,
  SavingsResult,
  validateLocations,
  optimizeRoute,
  calculateCenter,
  calculateSavings,
} from "@/lib/routeOptimization";

interface MapViewProps {
  pickups?: Array<{
    id: string;
    laboratory?: {
      id?: string;
      name?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
    } | null;
  }>;
  deliveries?: Array<{
    id: string;
    pharmacy?: {
      id?: string;
      name?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
    } | null;
  }>;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export default function MapView({ pickups, deliveries }: MapViewProps) {
  // Validación defensiva
  const safePickups = pickups || [];
  const safeDeliveries = deliveries || [];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [savings, setSavings] = useState<SavingsResult | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // DEBUG: Log received props
  useEffect(() => {
    console.log('=== MapView DEBUG START ===');
    console.log('Pickups recibidos:', pickups);
    console.log('Deliveries recibidos:', deliveries);
    console.log('SafePickups length:', safePickups.length);
    console.log('SafeDeliveries length:', safeDeliveries.length);

    safePickups.forEach((pickup, i) => {
      console.log(`Pickup ${i}:`, {
        id: pickup.id,
        laboratory: pickup.laboratory,
        lat: pickup.laboratory?.latitude,
        lng: pickup.laboratory?.longitude,
        latType: typeof pickup.laboratory?.latitude,
        lngType: typeof pickup.laboratory?.longitude,
      });
    });

    safeDeliveries.forEach((delivery, i) => {
      console.log(`Delivery ${i}:`, {
        id: delivery.id,
        pharmacy: delivery.pharmacy,
        lat: delivery.pharmacy?.latitude,
        lng: delivery.pharmacy?.longitude,
        latType: typeof delivery.pharmacy?.latitude,
        lngType: typeof delivery.pharmacy?.longitude,
      });
    });
  }, [pickups, deliveries, safePickups, safeDeliveries]);

  // Construir ubicaciones con useMemo y conversión a Number
  const allLocations = useMemo(() => {
    const locations: Location[] = [];

    console.log('Construyendo allLocations...');

    // Agregar pickups con conversión a Number
    safePickups.forEach((pickup, index) => {
      const lab = pickup.laboratory;
      console.log(`Procesando pickup ${index}:`, lab);

      if (lab?.latitude != null && lab?.longitude != null) {
        const lat = Number(lab.latitude);
        const lng = Number(lab.longitude);

        console.log(`  Coordenadas convertidas: lat=${lat}, lng=${lng}`);

        // Validación adicional después de conversión
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          locations.push({
            id: pickup.id,
            name: lab.name || "Sin nombre",
            lat: lat,
            lng: lng,
            type: "pickup",
            address: lab.address || "",
          });
          console.log(`  ✅ Pickup agregado a locations`);
        } else {
          console.log(`  ❌ Pickup rechazado: coordenadas inválidas después de conversión`);
        }
      } else {
        console.log(`  ❌ Pickup rechazado: coordenadas null/undefined`);
      }
    });

    // Agregar deliveries con conversión a Number
    safeDeliveries.forEach((delivery, index) => {
      const pharm = delivery.pharmacy;
      console.log(`Procesando delivery ${index}:`, pharm);

      if (pharm?.latitude != null && pharm?.longitude != null) {
        const lat = Number(pharm.latitude);
        const lng = Number(pharm.longitude);

        console.log(`  Coordenadas convertidas: lat=${lat}, lng=${lng}`);

        // Validación adicional después de conversión
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          locations.push({
            id: delivery.id,
            name: pharm.name || "Sin nombre",
            lat: lat,
            lng: lng,
            type: "delivery",
            address: pharm.address || "",
          });
          console.log(`  ✅ Delivery agregado a locations`);
        } else {
          console.log(`  ❌ Delivery rechazado: coordenadas inválidas después de conversión`);
        }
      } else {
        console.log(`  ❌ Delivery rechazado: coordenadas null/undefined`);
      }
    });

    console.log('allLocations construido:', locations);
    console.log('Total locations:', locations.length);
    console.log('=== MapView DEBUG END ===');

    return locations;
  }, [safePickups, safeDeliveries]);

  // Validar ubicaciones cuando cambien
  useEffect(() => {
    if (allLocations.length > 0) {
      const validationResult = validateLocations(allLocations);
      console.log('Validation result:', validationResult);
      setValidation(validationResult);
    } else {
      console.log('No locations to validate');
      setValidation(null);
    }
  }, [allLocations]);

  // Calcular centro del mapa
  const center = calculateCenter(allLocations);

  // Manejar optimización
  const handleOptimize = () => {
    if (!validation || !validation.isValid) {
      alert(validation?.message || "No hay suficientes ubicaciones válidas para optimizar");
      return;
    }

    setIsOptimizing(true);

    const result = optimizeRoute(allLocations);

    if (result.success) {
      const originalOrder = allLocations.map((_, i) => i);
      const savingsResult = calculateSavings(allLocations, originalOrder, result.optimizedOrder);

      setOptimizedOrder(result.optimizedOrder);
      setRouteStats(result.stats);
      setSavings(savingsResult);

      // Dibujar ruta optimizada
      drawRoute(result.optimizedOrder);
    } else {
      alert(result.message);
    }

    setIsOptimizing(false);
  };

  // Dibujar ruta en el mapa
  const drawRoute = (order: number[]) => {
    if (!isLoaded || order.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    const orderedLocations = order.map((idx) => allLocations[idx]);

    const waypoints = orderedLocations.slice(1, -1).map((loc) => ({
      location: { lat: loc.lat, lng: loc.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: { lat: orderedLocations[0].lat, lng: orderedLocations[0].lng },
        destination: {
          lat: orderedLocations[orderedLocations.length - 1].lat,
          lng: orderedLocations[orderedLocations.length - 1].lng,
        },
        waypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Error al calcular ruta:", status);
          alert("No se pudo calcular la ruta. Intenta de nuevo.");
        }
      }
    );
  };

  // Early return si no hay datos
  if (safePickups.length === 0 && safeDeliveries.length === 0) {
    return (
      <div className="card" style={{ padding: "20px", backgroundColor: "#fef3c7", borderColor: "#fbbf24" }}>
        <p style={{ color: "#92400e", fontWeight: "500", margin: 0 }}>
          ℹ️ No hay ubicaciones para mostrar en el mapa
        </p>
        <p style={{ color: "#92400e", fontSize: "14px", marginTop: "8px", marginBottom: 0 }}>
          Agrega pickups y deliveries con coordenadas válidas para visualizar la ruta.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="card" style={{ padding: "20px", backgroundColor: "#fee2e2" }}>
        <p style={{ color: "#dc2626", fontWeight: "500" }}>
          ❌ Error al cargar Google Maps. Verifica tu API key.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="card" style={{ padding: "20px" }}>
        <p style={{ color: "#6b7280" }}>Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Mensajes de validación */}
      {validation && validation.invalidCount > 0 && (
        <div className="card" style={{ padding: "16px", backgroundColor: "#fef3c7" }}>
          <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
            ⚠️ {validation.message}
          </p>
          {validation.warnings && validation.warnings.length > 0 && (
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              {validation.warnings.map((warning, idx) => (
                <li key={idx} style={{ color: "#92400e", fontSize: "13px" }}>
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Controles */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Mapa de Ruta</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
              {validation?.message || "Cargando ubicaciones..."}
            </p>
          </div>
          <button
            onClick={handleOptimize}
            disabled={!validation?.isValid || isOptimizing}
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            {isOptimizing ? "⏳ Optimizando..." : "🚀 Optimizar Ruta"}
          </button>
        </div>

        {/* Indicador de ubicaciones */}
        {validation && (
          <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              <span>
                Pickups: {allLocations.filter((l) => l.type === "pickup").length}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                }}
              />
              <span>
                Deliveries: {allLocations.filter((l) => l.type === "delivery").length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{ width: "100%", height: "500px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {/* Marcadores (solo si no hay ruta dibujada) */}
          {!directions &&
            allLocations.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                label={{
                  text: (index + 1).toString(),
                  color: "white",
                  fontWeight: "bold",
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 14,
                  fillColor: location.type === "pickup" ? "#10b981" : "#3b82f6",
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 3,
                }}
                title={`${location.name} - ${location.address}`}
              />
            ))}

          {/* Ruta optimizada */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#3b82f6",
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
                markerOptions: {
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#3b82f6",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  },
                },
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Estadísticas */}
      {routeStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div className="card" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6", marginBottom: "8px" }}>
              {routeStats.totalDistance} km
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>Distancia Total</div>
          </div>

          <div className="card" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#10b981", marginBottom: "8px" }}>
              {Math.floor(routeStats.estimatedTime / 60)}h {routeStats.estimatedTime % 60}m
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>Tiempo Estimado</div>
          </div>

          <div className="card" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#8b5cf6", marginBottom: "8px" }}>
              {routeStats.numberOfStops}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>Paradas</div>
          </div>
        </div>
      )}

      {/* Ahorro */}
      {savings && savings.distanceSaved > 0 && (
        <div className="card" style={{ padding: "20px", backgroundColor: "#dcfce7", borderColor: "#10b981" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#065f46", fontSize: "16px", fontWeight: "600" }}>
            ✅ Ruta Optimizada
          </h4>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#059669" }}>
                -{savings.distanceSaved} km
              </div>
              <div style={{ fontSize: "13px", color: "#065f46" }}>
                Ahorro de distancia ({savings.percentageSaved}%)
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#059669" }}>
                -{savings.timeSaved} min
              </div>
              <div style={{ fontSize: "13px", color: "#065f46" }}>Ahorro de tiempo</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
