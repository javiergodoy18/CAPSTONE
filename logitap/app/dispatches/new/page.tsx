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
    });
    setPickups(updated);
  }

  function removeDelivery(pickupIndex: number, deliveryIndex: number) {
    const updated = [...pickups];
    updated[pickupIndex].deliveries = updated[pickupIndex].deliveries.filter(
      (_, i) => i !== deliveryIndex
    );
    setPickups(updated);
  }

  function updateDelivery(pickupIndex: number, deliveryIndex: number, field: string, value: any) {
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
              merchandiseValue: Number(d.merchandiseValue) || 0,
              productType: d.productType,
              weight: Number(d.weight) || 0,
              packages: Number(d.packages) || 1,
              deliveryNotes: d.deliveryNotes,
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

                        <div className={styles.deliveryGrid}>
                          <FormField label="Farmacia" required error={errors[`pickup_${pickupIndex}_delivery_${deliveryIndex}_pharmacy`]}>
                            <Select
                              icon="💊"
                              options={pharmacyOptions}
                              value={delivery.pharmacyId}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'pharmacyId', e.target.value)}
                              error={!!errors[`pickup_${pickupIndex}_delivery_${deliveryIndex}_pharmacy`]}
                            />
                          </FormField>

                          <FormField label="N° Factura">
                            <Input
                              icon="📄"
                              value={delivery.invoiceNumber}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'invoiceNumber', e.target.value)}
                              placeholder="FAC-0000"
                            />
                          </FormField>

                          <FormField label="Valor ($)">
                            <Input
                              icon="💰"
                              type="number"
                              value={delivery.merchandiseValue || ''}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'merchandiseValue', e.target.value)}
                              placeholder="0"
                            />
                          </FormField>

                          <FormField label="Tipo">
                            <Select
                              options={productOptions}
                              value={delivery.productType}
                              onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'productType', e.target.value)}
                            />
                          </FormField>
                        </div>
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
