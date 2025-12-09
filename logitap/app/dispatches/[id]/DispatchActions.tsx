'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import Card from '@/app/components/Card';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Delivery {
  id: string;
  invoiceNumber: string;
  status: string;
  deliveredAt: Date | null;
  pharmacy: Pharmacy;
}

interface Laboratory {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Pickup {
  id: string;
  laboratory: Laboratory;
  deliveries: Delivery[];
}

interface Props {
  dispatchId: string;
  status: string;
  pickups: Pickup[];
}

export default function DispatchActions({ dispatchId, status, pickups }: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completingDelivery, setCompletingDelivery] = useState<string | null>(null);

  // Calcular si todas las deliveries están completas
  const allDeliveries = pickups.flatMap(p => p.deliveries);
  const completedDeliveries = allDeliveries.filter(
    d => d.status === 'delivered' || d.status === 'failed'
  );
  const allDeliveriesComplete = allDeliveries.length > 0 && allDeliveries.every(
    d => d.status === 'delivered' || d.status === 'failed'
  );

  // Función para iniciar viaje
  const handleStartDispatch = async () => {
    if (!confirm('¿Iniciar este viaje?')) return;

    setIsStarting(true);
    try {
      const response = await fetch(`/api/dispatches/${dispatchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });

      if (response.ok) {
        alert('✅ Viaje iniciado correctamente');
        router.refresh();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error al iniciar viaje'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión al iniciar viaje');
    } finally {
      setIsStarting(false);
    }
  };

  // Función para completar delivery
  const handleCompleteDelivery = async (deliveryId: string, newStatus: 'delivered' | 'failed') => {
    const confirmMessage = newStatus === 'delivered'
      ? '¿Marcar esta entrega como COMPLETADA?'
      : '¿Marcar esta entrega como FALLIDA?';

    if (!confirm(confirmMessage)) return;

    setCompletingDelivery(deliveryId);
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        const statusText = newStatus === 'delivered' ? 'completada' : 'fallida';
        alert(`✅ Entrega marcada como ${statusText}`);

        // Si todas las entregas están completas, preguntar si quiere finalizar
        if (data.allDeliveriesComplete) {
          if (confirm('✅ Todas las entregas están completas. ¿Finalizar viaje?')) {
            await handleCompleteDispatch();
          } else {
            router.refresh();
          }
        } else {
          router.refresh();
        }
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error al actualizar entrega'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión al actualizar entrega');
    } finally {
      setCompletingDelivery(null);
    }
  };

  // Función para finalizar viaje
  const handleCompleteDispatch = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch(`/api/dispatches/${dispatchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        alert('✅ Viaje finalizado correctamente');
        router.push('/dispatches');
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error al finalizar viaje'}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión al finalizar viaje');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      {/* Botón Iniciar Viaje */}
      {status === 'scheduled' && (
        <div style={{ marginBottom: '2rem' }}>
          <Button
            onClick={handleStartDispatch}
            variant="primary"
            icon={<span>🚀</span>}
            disabled={isStarting}
            style={{
              opacity: isStarting ? 0.5 : 1,
              cursor: isStarting ? 'not-allowed' : 'pointer',
            }}
          >
            {isStarting ? '⏳ Iniciando...' : 'Iniciar Viaje'}
          </Button>
        </div>
      )}

      {/* Panel de Entregas en Progreso */}
      {status === 'in_progress' && (
        <div style={{ marginTop: '2rem' }}>
          <Card variant="glass" padding="lg">
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#f0f9ff',
                marginBottom: '0.5rem',
              }}>
                📋 Gestión de Entregas
              </h3>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                color: '#94a3b8',
              }}>
                <span>Progreso: {completedDeliveries.length}/{allDeliveries.length}</span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(completedDeliveries.length / allDeliveries.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>

            {pickups.map((pickup, pIndex) => (
              <div key={pickup.id} style={{ marginBottom: '2rem' }}>
                <div style={{
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
                }}>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#38bdf8',
                  }}>
                    📦 Pickup {pIndex + 1}: {pickup.laboratory.name}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                  }}>
                    {pickup.laboratory.address}, {pickup.laboratory.city}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  {pickup.deliveries.map((delivery, dIndex) => (
                    <div
                      key={delivery.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '12px',
                        border: '1px solid rgba(56, 189, 248, 0.1)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem',
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            {dIndex + 1}
                          </span>
                          <strong style={{ color: '#f0f9ff' }}>
                            {delivery.pharmacy.name}
                          </strong>
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#94a3b8',
                          marginLeft: '2rem',
                        }}>
                          {delivery.pharmacy.address}, {delivery.pharmacy.city}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginLeft: '2rem',
                          marginTop: '0.25rem',
                        }}>
                          Factura: {delivery.invoiceNumber}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}>
                        {delivery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCompleteDelivery(delivery.id, 'delivered')}
                              disabled={completingDelivery === delivery.id}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: completingDelivery === delivery.id ? 'not-allowed' : 'pointer',
                                opacity: completingDelivery === delivery.id ? 0.5 : 1,
                                transition: 'all 0.2s',
                              }}
                            >
                              {completingDelivery === delivery.id ? '⏳' : '✓'} Entregado
                            </button>
                            <button
                              onClick={() => handleCompleteDelivery(delivery.id, 'failed')}
                              disabled={completingDelivery === delivery.id}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: completingDelivery === delivery.id ? 'not-allowed' : 'pointer',
                                opacity: completingDelivery === delivery.id ? 0.5 : 1,
                                transition: 'all 0.2s',
                              }}
                            >
                              {completingDelivery === delivery.id ? '⏳' : '✗'} Fallido
                            </button>
                          </>
                        )}
                        {delivery.status === 'delivered' && (
                          <Badge variant="success" size="lg">
                            ✓ Entregado
                          </Badge>
                        )}
                        {delivery.status === 'failed' && (
                          <Badge variant="danger" size="lg">
                            ✗ Fallido
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Botón Finalizar Viaje */}
            {allDeliveriesComplete && (
              <div style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(56, 189, 248, 0.2)',
              }}>
                <Button
                  onClick={handleCompleteDispatch}
                  variant="primary"
                  icon={<span>🏁</span>}
                  disabled={isCompleting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.125rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    opacity: isCompleting ? 0.5 : 1,
                    cursor: isCompleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCompleting ? '⏳ Finalizando...' : '🏁 Finalizar Viaje Completo'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Mensaje de Viaje Completado */}
      {status === 'completed' && (
        <Card variant="glass" padding="lg">
          <div style={{
            textAlign: 'center',
            padding: '2rem',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#22c55e',
              marginBottom: '0.5rem',
            }}>
              Viaje Completado
            </h3>
            <p style={{ color: '#94a3b8' }}>
              Todas las entregas han sido procesadas
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
