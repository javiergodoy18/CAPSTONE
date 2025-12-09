'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useGoogleMaps } from '@/app/contexts/GoogleMapsContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

interface Delivery {
  id: string;
  status: string;
  deliveredAt: string | null;
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  merchandiseValue: number | null;
  customPriceAmount: number | null;
}

interface Pickup {
  id: string;
  laboratory: {
    id: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  deliveries: Delivery[];
}

interface Dispatch {
  id: string;
  dispatchNumber: string;
  status: string;
  scheduledStartDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
  };
  driver: {
    name: string;
  };
  pickups: Pickup[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '16px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function DriverDispatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoaded: mapsLoaded, loadError: mapsError } = useGoogleMaps();
  const router = useRouter();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatchId, setDispatchId] = useState<string | null>(null);

  // Estado del mapa
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Estado de entregas
  const [completingDelivery, setCompletingDelivery] = useState<string | null>(null);

  // Resolver params
  useEffect(() => {
    params.then(p => setDispatchId(p.id));
  }, [params]);

  // Cargar dispatch
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && dispatchId) {
      loadDispatch();
    }
  }, [user, authLoading, dispatchId]);

  // Tracking GPS del conductor
  useEffect(() => {
    if (!dispatch || dispatch.status !== 'in_progress') return;

    // Obtener ubicación inicial
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );

      // Actualizar ubicación cada 10 segundos
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error tracking ubicación:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [dispatch]);

  // Calcular ruta cuando se carga el dispatch
  useEffect(() => {
    if (!dispatch || !map || typeof window === 'undefined' || !window.google) return;
    calculateRoute();
  }, [dispatch, map]);

  const loadDispatch = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dispatches/${dispatchId}`);

      if (!response.ok) {
        throw new Error('Error al cargar el viaje');
      }

      const data = await response.json();
      setDispatch(data);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!dispatch || typeof window === 'undefined' || !window.google) return;

    const directionsService = new google.maps.DirectionsService();

    // Construir waypoints (todos los puntos de pickup y delivery)
    const waypoints: google.maps.DirectionsWaypoint[] = [];

    // Agregar laboratorios (pickups) y farmacias (deliveries)
    dispatch.pickups.forEach(pickup => {
      if (pickup.laboratory.latitude && pickup.laboratory.longitude) {
        waypoints.push({
          location: {
            lat: Number(pickup.laboratory.latitude),
            lng: Number(pickup.laboratory.longitude),
          },
          stopover: true,
        });
      }

      pickup.deliveries.forEach(delivery => {
        if (delivery.pharmacy.latitude && delivery.pharmacy.longitude) {
          waypoints.push({
            location: {
              lat: Number(delivery.pharmacy.latitude),
              lng: Number(delivery.pharmacy.longitude),
            },
            stopover: true,
          });
        }
      });
    });

    if (waypoints.length < 2) {
      console.warn('No hay suficientes puntos para crear ruta');
      return;
    }

    // Usar ubicación actual como origen si existe
    const origin = currentLocation || waypoints[0]!.location;
    const destination = waypoints[waypoints.length - 1]!.location;
    const intermediateWaypoints = waypoints.slice(
      currentLocation ? 0 : 1,
      -1
    );

    try {
      const result = await directionsService.route({
        origin: origin!,
        destination: destination!,
        waypoints: intermediateWaypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      });

      setDirections(result);
      console.log('✅ Ruta calculada:', result);
    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
    }
  };

  const handleCompleteDelivery = async (deliveryId: string, status: 'delivered' | 'failed') => {
    if (!confirm(`¿Marcar esta entrega como ${status === 'delivered' ? 'completada' : 'fallida'}?`)) {
      return;
    }

    setCompletingDelivery(deliveryId);

    try {
      const response = await fetch(`/api/deliveries/${deliveryId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          deliveredAt: status === 'delivered' ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        alert(`✅ Entrega marcada como ${status === 'delivered' ? 'completada' : 'fallida'}`);
        loadDispatch();
      } else {
        alert('❌ Error al actualizar entrega');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar entrega');
    } finally {
      setCompletingDelivery(null);
    }
  };

  const handleStartDispatch = async () => {
    if (!confirm('¿Iniciar este viaje?')) return;

    try {
      const response = await fetch(`/api/dispatches/${dispatchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });

      if (response.ok) {
        alert('✅ Viaje iniciado');
        loadDispatch();
      } else {
        alert('❌ Error al iniciar viaje');
      }
    } catch (error) {
      alert('❌ Error al iniciar viaje');
    }
  };

  const handleCompleteDispatch = async () => {
    if (!confirm('¿Finalizar este viaje? Asegúrate de haber completado todas las entregas.')) return;

    try {
      const response = await fetch(`/api/dispatches/${dispatchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      if (response.ok) {
        alert('✅ Viaje finalizado exitosamente');
        router.push('/driver/dashboard');
      } else {
        alert('❌ Error al finalizar viaje');
      }
    } catch (error) {
      alert('❌ Error al finalizar viaje');
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        <div style={{ textAlign: 'center', color: '#38bdf8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <div style={{ fontSize: '1.25rem' }}>Cargando ruta...</div>
        </div>
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div style={{ fontSize: '1.25rem' }}>{error || 'Error al cargar el viaje'}</div>
          <button
            onClick={() => router.push('/driver/dashboard')}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: '#38bdf8',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const allDeliveries = dispatch.pickups.flatMap(p => p.deliveries);
  const pendingDeliveries = allDeliveries.filter(d => d.status === 'pending');
  const completedDeliveries = allDeliveries.filter(d => d.status === 'delivered');
  const failedDeliveries = allDeliveries.filter(d => d.status === 'failed');
  const progressPercentage = allDeliveries.length > 0
    ? ((completedDeliveries.length / allDeliveries.length) * 100).toFixed(0)
    : '0';

  // Centro del mapa
  const defaultCenter = dispatch.pickups[0]?.laboratory.latitude && dispatch.pickups[0]?.laboratory.longitude
    ? {
      lat: Number(dispatch.pickups[0].laboratory.latitude),
      lng: Number(dispatch.pickups[0].laboratory.longitude),
    }
    : { lat: -33.4489, lng: -70.6693 };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingTop: '80px',
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <button
              onClick={() => router.push('/driver/dashboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(148, 163, 184, 0.2)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              ← Volver al Dashboard
            </button>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f0f9ff',
              marginBottom: '0.5rem',
            }}>
              Viaje {dispatch.dispatchNumber}
            </h1>
            <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
              {dispatch.vehicle.brand} {dispatch.vehicle.model} • {dispatch.vehicle.plate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {dispatch.status === 'scheduled' && (
              <button
                onClick={handleStartDispatch}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                }}
              >
                🚀 INICIAR VIAJE
              </button>
            )}

            {dispatch.status === 'in_progress' && pendingDeliveries.length === 0 && (
              <button
                onClick={handleCompleteDispatch}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                }}
              >
                🏁 FINALIZAR VIAJE
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {dispatch.status === 'in_progress' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <span style={{ color: '#f0f9ff', fontWeight: '600' }}>
                Progreso del Viaje
              </span>
              <span style={{ color: '#38bdf8', fontWeight: '700' }}>
                {progressPercentage}% Completado
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '6px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              fontSize: '0.875rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <span style={{ color: '#22c55e' }}>
                ✓ {completedDeliveries.length} completadas
              </span>
              <span style={{ color: '#f59e0b' }}>
                ⏳ {pendingDeliveries.length} pendientes
              </span>
              {failedDeliveries.length > 0 && (
                <span style={{ color: '#ef4444' }}>
                  ✗ {failedDeliveries.length} fallidas
                </span>
              )}
            </div>
          </div>
        )}

        {/* Layout: Mapa + Lista */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr',
          gap: '2rem',
        }}>
          {/* MAPA */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f0f9ff',
              marginBottom: '1.5rem',
            }}>
              🗺️ Mapa de Ruta
            </h3>

            {mapsError && (
              <div style={{
                padding: '20px',
                backgroundColor: '#fee2e2',
                borderRadius: '16px',
                color: '#dc2626',
                textAlign: 'center'
              }}>
                ❌ Error al cargar Google Maps. Verifica tu API key.
              </div>
            )}

            {!mapsLoaded && !mapsError && (
              <div style={{
                height: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '16px',
                color: '#94a3b8'
              }}>
                Cargando mapa...
              </div>
            )}

            {mapsLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation || defaultCenter}
                zoom={12}
                options={mapOptions}
                onLoad={(map) => setMap(map)}
              >
                {/* Ubicación actual del conductor */}
                {currentLocation && typeof window !== 'undefined' && window.google && (
                  <Marker
                    position={currentLocation}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: { width: 40, height: 40 } as any,
                    }}
                    title="Tu ubicación"
                  />
                )}

                {/* Marcadores de laboratorios (pickups) */}
                {dispatch.pickups.map((pickup) => {
                  if (!pickup.laboratory.latitude || !pickup.laboratory.longitude) return null;

                  return (
                    <Marker
                      key={`lab-${pickup.id}`}
                      position={{
                        lat: Number(pickup.laboratory.latitude),
                        lng: Number(pickup.laboratory.longitude),
                      }}
                      icon={typeof window !== 'undefined' && window.google ? {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: { width: 35, height: 35 } as any,
                      } : undefined}
                      title={pickup.laboratory.name}
                      onClick={() => setSelectedMarker(`lab-${pickup.id}`)}
                    >
                      {selectedMarker === `lab-${pickup.id}` && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div style={{ color: '#000' }}>
                            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
                              🏢 {pickup.laboratory.name}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                              {pickup.laboratory.address}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}

                {/* Marcadores de farmacias (deliveries) */}
                {dispatch.pickups.flatMap(p => p.deliveries).map((delivery) => {
                  if (!delivery.pharmacy.latitude || !delivery.pharmacy.longitude) return null;

                  const iconColor =
                    delivery.status === 'delivered' ? 'green' :
                      delivery.status === 'failed' ? 'red' :
                        'yellow';

                  return (
                    <Marker
                      key={`pharmacy-${delivery.id}`}
                      position={{
                        lat: Number(delivery.pharmacy.latitude),
                        lng: Number(delivery.pharmacy.longitude),
                      }}
                      icon={typeof window !== 'undefined' && window.google ? {
                        url: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
                        scaledSize: { width: 35, height: 35 } as any,
                      } : undefined}
                      title={delivery.pharmacy.name}
                      onClick={() => setSelectedMarker(`pharmacy-${delivery.id}`)}
                    >
                      {selectedMarker === `pharmacy-${delivery.id}` && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div style={{ color: '#000' }}>
                            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
                              💊 {delivery.pharmacy.name}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              {delivery.pharmacy.address}
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: delivery.status === 'delivered' ? '#22c55e' :
                                delivery.status === 'failed' ? '#ef4444' : '#f59e0b'
                            }}>
                              {delivery.status === 'delivered' ? '✓ Entregado' :
                                delivery.status === 'failed' ? '✗ Fallido' :
                                  '⏳ Pendiente'}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}

                {/* Renderizar ruta */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#38bdf8',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            )}

            {/* Leyenda */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#3b82f6'
                }} />
                Tu ubicación
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#22c55e'
                }} />
                Laboratorios
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#f59e0b'
                }} />
                Pendientes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#22c55e'
                }} />
                Completadas
              </div>
            </div>
          </div>

          {/* LISTA DE ENTREGAS */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            maxHeight: '750px',
            overflowY: 'auto',
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f0f9ff',
              marginBottom: '1.5rem',
            }}>
              📋 Entregas ({completedDeliveries.length}/{allDeliveries.length})
            </h3>

            {dispatch.pickups.map((pickup, pickupIndex) => (
              <div key={pickup.id} style={{ marginBottom: '2rem' }}>
                {/* Laboratorio */}
                <div style={{
                  padding: '1rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#22c55e',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}>
                    🏢 PICKUP #{pickupIndex + 1}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#f0f9ff',
                    marginBottom: '0.25rem',
                  }}>
                    {pickup.laboratory.name}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                  }}>
                    📍 {pickup.laboratory.address}
                  </div>
                </div>

                {/* Deliveries del pickup */}
                {pickup.deliveries.map((delivery, deliveryIndex) => (
                  <div
                    key={delivery.id}
                    style={{
                      padding: '1.25rem',
                      background: delivery.status === 'delivered'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : delivery.status === 'failed'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(15, 23, 42, 0.5)',
                      border: delivery.status === 'delivered'
                        ? '2px solid rgba(34, 197, 94, 0.3)'
                        : delivery.status === 'failed'
                          ? '2px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '600',
                      }}>
                        ENTREGA #{deliveryIndex + 1}
                      </div>
                      {delivery.status !== 'pending' && (
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          background: delivery.status === 'delivered' ? '#22c55e' : '#ef4444',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: 'white',
                        }}>
                          {delivery.status === 'delivered' ? '✓ ENTREGADO' : '✗ FALLIDO'}
                        </div>
                      )}
                    </div>

                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#f0f9ff',
                      marginBottom: '0.5rem',
                    }}>
                      💊 {delivery.pharmacy.name}
                    </div>

                    <div style={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      marginBottom: '0.5rem',
                    }}>
                      📍 {delivery.pharmacy.address}
                    </div>

                    {delivery.pharmacy.phone && (
                      <a
                        href={`tel:${delivery.pharmacy.phone}`}
                        style={{
                          display: 'inline-block',
                          fontSize: '0.875rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                          marginBottom: '1rem',
                        }}
                      >
                        📞 {delivery.pharmacy.phone}
                      </a>
                    )}

                    {delivery.status === 'pending' && dispatch.status === 'in_progress' && (
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '1rem',
                      }}>
                        <button
                          onClick={() => handleCompleteDelivery(delivery.id, 'delivered')}
                          disabled={completingDelivery === delivery.id}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            cursor: completingDelivery === delivery.id ? 'not-allowed' : 'pointer',
                            opacity: completingDelivery === delivery.id ? 0.5 : 1,
                          }}
                        >
                          ✓ Entregar
                        </button>
                        <button
                          onClick={() => handleCompleteDelivery(delivery.id, 'failed')}
                          disabled={completingDelivery === delivery.id}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '2px solid #ef4444',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            cursor: completingDelivery === delivery.id ? 'not-allowed' : 'pointer',
                            opacity: completingDelivery === delivery.id ? 0.5 : 1,
                          }}
                        >
                          ✗ Fallido
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
