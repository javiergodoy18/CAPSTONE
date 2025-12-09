'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import FormField from '@/app/components/FormField';
import Input from '@/app/components/Input';
import Select from '@/app/components/Select';
import styles from './NewDispatch.module.css';

interface Laboratory {
  id: string;
  name: string;
  address: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

interface Driver {
  id: string;
  name: string;
  license: string;
}

interface Delivery {
  pharmacyId: string;
  invoiceNumber: string;
  merchandiseValue: number;
  productType: string;
  weight?: number;
  packages?: number;
  deliveryNotes?: string;
  isCustomPricing?: boolean;
  customPriceConcept?: string;
  customPriceAmount?: number;
}

interface Pickup {
  laboratoryId: string;
  pickupAddress: string;
  pickupDate: string;
  pickupNotes?: string;
  deliveries: Delivery[];
}

export default function NewDispatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [dispatchNumber, setDispatchNumber] = useState('');
  const [scheduledStartDate, setScheduledStartDate] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndDate, setScheduledEndDate] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // Catalogs
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    loadCatalogs();
    setDispatchNumber(`VJ-${Date.now().toString().slice(-6)}`);
  }, []);

  async function loadCatalogs() {
    try {
      const [labsRes, pharmsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/laboratories'),
        fetch('/api/pharmacies'),
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
      ]);

      setLaboratories(await labsRes.json());
      setPharmacies(await pharmsRes.json());
      setVehicles(await vehiclesRes.json());
      setDrivers(await driversRes.json());
    } catch (err) {
      console.error('Error loading catalogs:', err);
    }
  }

  function addPickup() {
    setPickups([
      ...pickups,
      {
        laboratoryId: '',
        pickupAddress: '',
        pickupDate: scheduledStartDate,
        pickupNotes: '',
        deliveries: [],
      },
    ]);
  }

  function removePickup(index: number) {
    setPickups(pickups.filter((_, i) => i !== index));
  }

  function updatePickup(index: number, field: string, value: any) {
    const updated = [...pickups];
    (updated[index] as any)[field] = value;

    if (field === 'laboratoryId') {
      const lab = laboratories.find((l) => l.id === value);
      if (lab) {
        updated[index].pickupAddress = lab.address;
      }
    }

    setPickups(updated);
  }

  function addDelivery(pickupIndex: number) {
    const updated = [...pickups];
    updated[pickupIndex].deliveries.push({
      pharmacyId: '',
      invoiceNumber: '',
      merchandiseValue: 0,
      productType: 'farmaceutico',
      weight: 0,
      packages: 1,
      deliveryNotes: '',
      isCustomPricing: false,
      customPriceConcept: '',
      customPriceAmount: 0,
    });
    setPickups(updated);
  }

  function toggleCustomPricing(pickupIndex: number, deliveryIndex: number) {
    setPickups(prev => prev.map((pickup, pIdx) => {
      if (pIdx !== pickupIndex) return pickup;

      return {
        ...pickup,
        deliveries: pickup.deliveries.map((delivery, dIdx) => {
          if (dIdx !== deliveryIndex) return delivery;

          const newIsCustom = !delivery.isCustomPricing;

          // Log para debugging
          console.log('🔄 Toggle Custom Pricing:', {
            pickupIndex,
            deliveryIndex,
            oldValue: delivery.isCustomPricing,
            newValue: newIsCustom
          });

          return {
            ...delivery,
            isCustomPricing: newIsCustom,
            // Limpiar valores al desactivar
            customPriceConcept: newIsCustom ? delivery.customPriceConcept : '',
            customPriceAmount: newIsCustom ? delivery.customPriceAmount : undefined,
            // Limpiar merchandiseValue al activar
            merchandiseValue: newIsCustom ? 0 : delivery.merchandiseValue,
          };
        }),
      };
    }));
  }

  function removeDelivery(pickupIndex: number, deliveryIndex: number) {
    const updated = [...pickups];
    updated[pickupIndex].deliveries = updated[pickupIndex].deliveries.filter(
      (_, i) => i !== deliveryIndex
    );
    setPickups(updated);
  }

  function updateDelivery(pickupIndex: number, deliveryIndex: number, field: string, value: any) {
    console.log('📝 Update Delivery:', { pickupIndex, deliveryIndex, field, value });

    const updated = [...pickups];
    (updated[pickupIndex].deliveries[deliveryIndex] as any)[field] = value;
    setPickups(updated);
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!vehicleId) newErrors.vehicleId = 'Selecciona un vehículo';
    if (!driverId) newErrors.driverId = 'Selecciona un conductor';
    if (!scheduledStartDate) newErrors.scheduledStartDate = 'Ingresa fecha de inicio';
    if (!scheduledEndDate) newErrors.scheduledEndDate = 'Ingresa fecha de fin';
    if (pickups.length === 0) newErrors.pickups = 'Agrega al menos un pickup';

    pickups.forEach((pickup, i) => {
      if (!pickup.laboratoryId) {
        newErrors[`pickup_${i}_lab`] = 'Selecciona un laboratorio';
      }

      if (pickup.deliveries.length === 0) {
        newErrors[`pickup_${i}_deliveries`] = 'Agrega al menos una entrega';
      }

      pickup.deliveries.forEach((delivery, j) => {
        if (!delivery.pharmacyId) {
          newErrors[`pickup_${i}_delivery_${j}_pharmacy`] = 'Selecciona una farmacia';
        }

        // Validación para delivery con custom pricing
        if (delivery.isCustomPricing) {
          if (!delivery.customPriceConcept || !delivery.customPriceConcept.trim()) {
            newErrors[`pickup_${i}_delivery_${j}_concept`] = 'El concepto es requerido';
          }
          if (!delivery.customPriceAmount || delivery.customPriceAmount <= 0) {
            newErrors[`pickup_${i}_delivery_${j}_customPrice`] = 'El precio debe ser mayor a 0';
          }
        } else {
          // Validación normal - el merchandiseValue es requerido
          if (!delivery.merchandiseValue || delivery.merchandiseValue <= 0) {
            newErrors[`pickup_${i}_delivery_${j}_value`] = 'El valor es requerido';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const startDateTime = new Date(`${scheduledStartDate}T${scheduledStartTime || '08:00'}`);
      const endDateTime = new Date(`${scheduledEndDate}T${scheduledEndTime || '18:00'}`);

      const response = await fetch('/api/dispatches/create-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchNumber,
          vehicleId,
          driverId,
          scheduledStartDate: startDateTime.toISOString(),
          scheduledEndDate: endDateTime.toISOString(),
          generalNotes,
          pickups: pickups.map((pickup) => ({
            laboratoryId: pickup.laboratoryId,
            pickupAddress: pickup.pickupAddress,
            pickupDate: pickup.pickupDate ? new Date(pickup.pickupDate).toISOString() : startDateTime.toISOString(),
            pickupNotes: pickup.pickupNotes,
            deliveries: pickup.deliveries.map((d) => ({
              pharmacyId: d.pharmacyId,
              invoiceNumber: d.invoiceNumber,
              productType: d.productType,
              weight: Number(d.weight) || 0,
              packages: Number(d.packages) || 1,
              deliveryNotes: d.deliveryNotes,

              // Campos de custom pricing a nivel de delivery
              isCustomPricing: d.isCustomPricing || false,
              customPriceConcept: d.isCustomPricing ? d.customPriceConcept : null,
              customPriceAmount: d.isCustomPricing ? Number(d.customPriceAmount) : null,
              merchandiseValue: d.isCustomPricing ? 0 : Number(d.merchandiseValue) || 0,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear viaje');
      }

      const dispatch = await response.json();
      router.push(`/dispatches/${dispatch.id}`);
    } catch (error: any) {
      alert(error.message || 'Error al crear el viaje');
    } finally {
      setLoading(false);
    }
  }

  const vehicleOptions = [
    { value: '', label: 'Selecciona un vehículo' },
    ...vehicles.map((v) => ({ value: v.id, label: `${v.plate} - ${v.brand} ${v.model}` })),
  ];

  const driverOptions = [
    { value: '', label: 'Selecciona un conductor' },
    ...drivers.map((d) => ({ value: d.id, label: d.name })),
  ];

  const labOptions = [
    { value: '', label: 'Selecciona un laboratorio' },
    ...laboratories.map((l) => ({ value: l.id, label: l.name })),
  ];

  const pharmacyOptions = [
    { value: '', label: 'Selecciona una farmacia' },
    ...pharmacies.map((p) => ({ value: p.id, label: p.name })),
  ];

  const productOptions = [
    { value: 'farmaceutico', label: 'Farmacéutico' },
    { value: 'refrigerado', label: 'Refrigerado' },
    { value: 'controlado', label: 'Controlado' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Volver
        </button>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✨</span>
          Crear Nuevo Viaje
        </h1>
        <p className={styles.subtitle}>
          Completa la información del viaje, pickups y entregas
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info */}
        <Card variant="glass" padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🚗</span>
              Información Básica
            </h2>

            <div className={styles.formGrid}>
              <FormField label="Número de Viaje">
                <Input
                  icon="🏷️"
                  value={dispatchNumber}
                  onChange={(e) => setDispatchNumber(e.target.value)}
                  placeholder="VJ-000000"
                />
              </FormField>

              <FormField label="Vehículo" required error={errors.vehicleId}>
                <Select
                  icon="🚗"
                  options={vehicleOptions}
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  error={!!errors.vehicleId}
                />
              </FormField>

              <FormField label="Conductor" required error={errors.driverId}>
                <Select
                  icon="👤"
                  options={driverOptions}
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  error={!!errors.driverId}
                />
              </FormField>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              Fecha y Hora
            </h2>

            <div className={styles.dateGrid}>
              <FormField label="Fecha Inicio" required error={errors.scheduledStartDate}>
                <Input
                  icon="📅"
                  type="date"
                  value={scheduledStartDate}
                  onChange={(e) => setScheduledStartDate(e.target.value)}
                  error={!!errors.scheduledStartDate}
                />
              </FormField>

              <FormField label="Hora Inicio">
                <Input
                  icon="🕐"
                  type="time"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                />
              </FormField>

              <FormField label="Fecha Fin" required error={errors.scheduledEndDate}>
                <Input
                  icon="📅"
                  type="date"
                  value={scheduledEndDate}
                  onChange={(e) => setScheduledEndDate(e.target.value)}
                  error={!!errors.scheduledEndDate}
                />
              </FormField>

              <FormField label="Hora Fin">
                <Input
                  icon="🕐"
                  type="time"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <FormField label="Notas Generales" hint="Instrucciones adicionales para el conductor">
              <textarea
                className={styles.textarea}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Instrucciones especiales, observaciones..."
                rows={3}
              />
            </FormField>
          </div>
        </Card>

        {/* Pickups Section */}
        <Card variant="glass" padding="lg">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🏢</span>
              Pickups (Laboratorios)
              {pickups.length > 0 && <Badge variant="info" size="sm">{pickups.length}</Badge>}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addPickup} icon={<span>+</span>}>
              Agregar Pickup
            </Button>
          </div>

          {errors.pickups && (
            <p className={styles.errorMessage}>⚠️ {errors.pickups}</p>
          )}

          {pickups.length === 0 ? (
            <div className={styles.emptyPickups}>
              <p>No hay pickups agregados</p>
              <Button type="button" onClick={addPickup} icon={<span>+</span>}>
                Agregar Primer Pickup
              </Button>
            </div>
          ) : (
            <div className={styles.pickupsList}>
              {pickups.map((pickup, pickupIndex) => (
                <div key={pickupIndex} className={styles.pickupCard}>
                  <div className={styles.pickupHeader}>
                    <h3 className={styles.pickupTitle}>
                      <Badge variant="info">Pickup #{pickupIndex + 1}</Badge>
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePickup(pickupIndex)}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>

                  <div className={styles.formGrid}>
                    <FormField label="Laboratorio" required error={errors[`pickup_${pickupIndex}_lab`]}>
                      <Select
                        icon="🏢"
                        options={labOptions}
                        value={pickup.laboratoryId}
                        onChange={(e) => updatePickup(pickupIndex, 'laboratoryId', e.target.value)}
                        error={!!errors[`pickup_${pickupIndex}_lab`]}
                      />
                    </FormField>

                    <FormField label="Fecha de Pickup">
                      <Input
                        icon="📅"
                        type="date"
                        value={pickup.pickupDate}
                        onChange={(e) => updatePickup(pickupIndex, 'pickupDate', e.target.value)}
                      />
                    </FormField>
                  </div>

                  {pickup.pickupAddress && (
                    <p className={styles.addressHint}>📍 {pickup.pickupAddress}</p>
                  )}

                  {/* Deliveries */}
                  <div className={styles.deliveriesSection}>
                    <div className={styles.deliveriesHeader}>
                      <h4 className={styles.deliveriesTitle}>
                        Entregas
                        {pickup.deliveries.length > 0 && (
                          <Badge variant="success" size="sm">{pickup.deliveries.length}</Badge>
                        )}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addDelivery(pickupIndex)}
                        icon={<span>+</span>}
                      >
                        Agregar
                      </Button>
                    </div>

                    {errors[`pickup_${pickupIndex}_deliveries`] && (
                      <p className={styles.errorMessage}>⚠️ {errors[`pickup_${pickupIndex}_deliveries`]}</p>
                    )}

                    {pickup.deliveries.map((delivery, deliveryIndex) => (
                      <div key={deliveryIndex} className={styles.deliveryCard}>
                        <div className={styles.deliveryHeader}>
                          <span className={styles.deliveryBadge}>Entrega #{deliveryIndex + 1}</span>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeDelivery(pickupIndex, deliveryIndex)}
                          >
                            ✕
                          </button>
                        </div>

                        {/* GRID DE 4 COLUMNAS - Farmacia, Nro Factura, Valor, Tipo */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}>
                          {/* Columna 1: Farmacia */}
                          <FormField label="Farmacia" required error={errors[`pickup_${pickupIndex}_delivery_${deliveryIndex}_pharmacy`]}>
                            <Select
                              icon="💊"
                              options={pharmacyOptions}
                              value={delivery.pharmacyId}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'pharmacyId', e.target.value)}
                              error={!!errors[`pickup_${pickupIndex}_delivery_${deliveryIndex}_pharmacy`]}
                            />
                          </FormField>

                          {/* Columna 2: Nro. Factura */}
                          <FormField label="Nro. Factura">
                            <Input
                              icon="📄"
                              type="text"
                              value={delivery.invoiceNumber || ''}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'invoiceNumber', e.target.value)}
                              placeholder="FAC-0000"
                            />
                          </FormField>

                          {/* Columna 3: Valor ($) - SIN BOTÓN AQUÍ */}
                          <FormField
                            label="Valor ($)"
                            required={!delivery.isCustomPricing}
                          >
                            <Input
                              icon="💰"
                              type="text"
                              inputMode="decimal"
                              value={delivery.merchandiseValue === 0 || !delivery.merchandiseValue
                                ? ''
                                : String(delivery.merchandiseValue)
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log('💵 Valor input:', value);

                                if (value === '') {
                                  updateDelivery(pickupIndex, deliveryIndex, 'merchandiseValue', '');
                                  return;
                                }

                                if (/^\d*\.?\d*$/.test(value)) {
                                  updateDelivery(pickupIndex, deliveryIndex, 'merchandiseValue', value);
                                }
                              }}
                              placeholder="0"
                              disabled={delivery.isCustomPricing}
                              style={{
                                opacity: delivery.isCustomPricing ? 0.6 : 1,
                                cursor: delivery.isCustomPricing ? 'not-allowed' : 'text',
                              }}
                            />
                          </FormField>

                          {/* Columna 4: Tipo de Producto */}
                          <FormField label="Tipo de Producto">
                            <Select
                              options={productOptions}
                              value={delivery.productType || 'medicamentos'}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'productType', e.target.value)}
                            />
                          </FormField>
                        </div>

                        {/* BOTÓN PERSONALIZADO - EN SU PROPIA FILA */}
                        <div style={{
                          marginBottom: '1.5rem',
                          display: 'flex',
                          justifyContent: 'flex-start',
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🔧 Click Personalizado - Delivery:', deliveryIndex);
                              toggleCustomPricing(pickupIndex, deliveryIndex);
                            }}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              border: delivery.isCustomPricing
                                ? '2px solid #f97316'
                                : '2px solid #4b5563',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              backgroundColor: delivery.isCustomPricing
                                ? '#f97316'
                                : 'rgba(75, 85, 99, 0.2)',
                              color: delivery.isCustomPricing ? 'white' : '#9ca3af',
                              fontWeight: '500',
                              fontSize: '0.875rem',
                              minWidth: '160px',
                              boxShadow: delivery.isCustomPricing
                                ? '0 4px 12px rgba(249, 115, 22, 0.3)'
                                : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!delivery.isCustomPricing) {
                                e.currentTarget.style.borderColor = '#6b7280';
                                e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.2)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!delivery.isCustomPricing) {
                                e.currentTarget.style.borderColor = '#4b5563';
                                e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.2)';
                              }
                            }}
                          >
                            <span style={{ fontSize: '1.25rem' }}>
                              {delivery.isCustomPricing ? '✓' : '🔧'}
                            </span>
                            <span>{delivery.isCustomPricing ? 'Usando Precio Personalizado' : 'Usar Precio Personalizado'}</span>
                          </button>
                        </div>

                        {/* CAMPOS PERSONALIZADOS - Cuando está activo */}
                        {delivery.isCustomPricing && (
                          <div style={{
                            marginBottom: '1.5rem',
                            padding: '1.25rem',
                            borderLeft: '4px solid #f97316',
                            background: 'linear-gradient(to right, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02))',
                            borderRadius: '0 8px 8px 0',
                          }}>
                            {/* Warning */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.875rem 1rem',
                              marginBottom: '1.25rem',
                              background: 'rgba(251, 191, 36, 0.15)',
                              border: '1px solid rgba(251, 191, 36, 0.3)',
                              borderRadius: '8px',
                              color: '#fbbf24',
                              fontSize: '0.875rem',
                            }}>
                              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                              <span>
                                Este precio <strong>NO</strong> usará el valor de mercadería ingresado arriba
                              </span>
                            </div>

                            {/* Grid de 2 columnas para Concepto y Precio */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 1fr',
                              gap: '1.25rem',
                            }}>
                              {/* Concepto */}
                              <FormField
                                label="Concepto del Precio Personalizado"
                                required
                                error={errors?.[`pickup_${pickupIndex}_delivery_${deliveryIndex}_concept`]}
                              >
                                <Input
                                  icon="📝"
                                  type="text"
                                  placeholder="Ej: Servicio express, Carga frágil"
                                  value={delivery.customPriceConcept || ''}
                                  onChange={(e) => {
                                    console.log('📝 Concepto:', e.target.value);
                                    updateDelivery(pickupIndex, deliveryIndex, 'customPriceConcept', e.target.value);
                                  }}
                                />
                              </FormField>

                              {/* Precio Personalizado */}
                              <FormField
                                label="Precio Personalizado ($)"
                                required
                                error={errors?.[`pickup_${pickupIndex}_delivery_${deliveryIndex}_customPrice`]}
                              >
                                <Input
                                  icon="💵"
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="50000"
                                  value={delivery.customPriceAmount === 0 || !delivery.customPriceAmount
                                    ? ''
                                    : String(delivery.customPriceAmount)
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    console.log('💵 Precio personalizado:', value);

                                    if (value === '') {
                                      updateDelivery(pickupIndex, deliveryIndex, 'customPriceAmount', '');
                                      return;
                                    }

                                    if (/^\d*\.?\d*$/.test(value)) {
                                      updateDelivery(pickupIndex, deliveryIndex, 'customPriceAmount', value);
                                    }
                                  }}
                                />
                              </FormField>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            glow
            loading={loading}
            icon={<span>✓</span>}
          >
            Crear Viaje
          </Button>
        </div>
      </form>
    </div>
  );
}
