'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormField from '@/app/components/FormField';
import Input from '@/app/components/Input';
import Select from '@/app/components/Select';
import Button from '@/app/components/Button';
import styles from '../../new/NewDispatch.module.css';

interface Delivery {
  id?: string;
  pharmacyId: string;
  invoiceNumber: string;
  merchandiseValue: number;
  productType: 'farmaceutico' | 'cosmetico' | 'alimentos' | 'otro';
  deliveryDate?: string;
  deliveryAddress?: string;
}

interface Pickup {
  id?: string;
  laboratoryId: string;
  pickupAddress: string;
  pickupDate: string;
  deliveries: Delivery[];
}

interface FormData {
  vehicleId: string;
  driverId: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  estimatedDistance: number;
  estimatedDuration: number;
  notes: string;
  pickups: Pickup[];
}

export default function EditDispatch() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: '',
    driverId: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
    estimatedDistance: 0,
    estimatedDuration: 0,
    notes: '',
    pickups: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [dispatchId]);

  async function loadData() {
    try {
      setLoading(true);

      // Load dispatch data
      const dispatchRes = await fetch(`/api/dispatches/${dispatchId}`);
      if (!dispatchRes.ok) throw new Error('Error al cargar el viaje');
      const dispatch = await dispatchRes.json();

      // Load reference data
      const [vehiclesRes, driversRes, labsRes, pharmsRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
        fetch('/api/laboratories'),
        fetch('/api/pharmacies'),
      ]);

      const [vehiclesData, driversData, labsData, pharmsData] = await Promise.all([
        vehiclesRes.json(),
        driversRes.json(),
        labsRes.json(),
        pharmsRes.json(),
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setLaboratories(labsData);
      setPharmacies(pharmsData);

      // Transform dispatch data to form format
      const pickups = dispatch.pickups?.map((pickup: any) => ({
        id: pickup.id,
        laboratoryId: pickup.laboratoryId,
        pickupAddress: pickup.pickupAddress || '',
        pickupDate: pickup.pickupDate ? new Date(pickup.pickupDate).toISOString().slice(0, 16) : '',
        deliveries: pickup.deliveries?.map((delivery: any) => ({
          id: delivery.id,
          pharmacyId: delivery.pharmacyId,
          invoiceNumber: delivery.invoiceNumber || '',
          merchandiseValue: delivery.merchandiseValue || 0,
          productType: delivery.productType || 'farmaceutico',
          deliveryDate: delivery.deliveryDate ? new Date(delivery.deliveryDate).toISOString().slice(0, 16) : '',
          deliveryAddress: delivery.deliveryAddress || '',
        })) || [],
      })) || [];

      setFormData({
        vehicleId: dispatch.vehicleId || '',
        driverId: dispatch.driverId || '',
        scheduledStartDate: dispatch.scheduledStartDate ? new Date(dispatch.scheduledStartDate).toISOString().slice(0, 16) : '',
        scheduledEndDate: dispatch.scheduledEndDate ? new Date(dispatch.scheduledEndDate).toISOString().slice(0, 16) : '',
        estimatedDistance: dispatch.estimatedDistance || 0,
        estimatedDuration: dispatch.estimatedDuration || 0,
        notes: dispatch.notes || '',
        pickups,
      });
    } catch (err) {
      console.error('Error loading dispatch:', err);
      setError('Error al cargar los datos del viaje');
    } finally {
      setLoading(false);
    }
  }

  function updateFormData(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  }

  function updatePickup(index: number, field: string, value: any) {
    const updated = [...formData.pickups];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, pickups: updated });
  }

  function updateDelivery(pickupIndex: number, deliveryIndex: number, field: string, value: any) {
    const updated = [...formData.pickups];
    updated[pickupIndex].deliveries[deliveryIndex] = {
      ...updated[pickupIndex].deliveries[deliveryIndex],
      [field]: value,
    };
    setFormData({ ...formData, pickups: updated });
  }

  function addPickup() {
    setFormData({
      ...formData,
      pickups: [
        ...formData.pickups,
        {
          laboratoryId: '',
          pickupAddress: '',
          pickupDate: formData.scheduledStartDate,
          deliveries: [],
        },
      ],
    });
  }

  function removePickup(index: number) {
    const updated = formData.pickups.filter((_, i) => i !== index);
    setFormData({ ...formData, pickups: updated });
  }

  function addDelivery(pickupIndex: number) {
    const updated = [...formData.pickups];
    updated[pickupIndex].deliveries.push({
      pharmacyId: '',
      invoiceNumber: '',
      merchandiseValue: 0,
      productType: 'farmaceutico',
    });
    setFormData({ ...formData, pickups: updated });
  }

  function removeDelivery(pickupIndex: number, deliveryIndex: number) {
    const updated = [...formData.pickups];
    updated[pickupIndex].deliveries = updated[pickupIndex].deliveries.filter((_, i) => i !== deliveryIndex);
    setFormData({ ...formData, pickups: updated });
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) newErrors.vehicleId = 'Seleccione un vehículo';
    if (!formData.driverId) newErrors.driverId = 'Seleccione un conductor';
    if (!formData.scheduledStartDate) newErrors.scheduledStartDate = 'Ingrese fecha de inicio';
    if (!formData.scheduledEndDate) newErrors.scheduledEndDate = 'Ingrese fecha de fin';

    if (formData.pickups.length === 0) {
      newErrors.pickups = 'Debe agregar al menos una recolección';
    } else {
      formData.pickups.forEach((pickup, pIndex) => {
        if (!pickup.laboratoryId) {
          newErrors[`pickup_${pIndex}_lab`] = 'Seleccione un laboratorio';
        }
        if (pickup.deliveries.length === 0) {
          newErrors[`pickup_${pIndex}_deliveries`] = 'Debe agregar al menos una entrega';
        } else {
          pickup.deliveries.forEach((delivery, dIndex) => {
            if (!delivery.pharmacyId) {
              newErrors[`delivery_${pIndex}_${dIndex}_pharmacy`] = 'Seleccione una farmacia';
            }
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/dispatches/${dispatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el viaje');
      }

      router.push('/dispatches');
    } catch (err: any) {
      console.error('Error updating dispatch:', err);
      setError(err.message || 'Error al actualizar el viaje');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
            Cargando datos del viaje...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push('/dispatches')}>
          ← Volver a Viajes
        </button>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✏️</span>
          Editar Viaje
        </h1>
        <p className={styles.subtitle}>
          Modifique la información del viaje, recolecciones y entregas
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            Información Básica
          </h2>

          <div className={styles.formGrid}>
            <FormField label="Vehículo" required error={errors.vehicleId}>
              <Select
                icon="🚗"
                value={formData.vehicleId}
                onChange={(e) => updateFormData('vehicleId', e.target.value)}
                error={!!errors.vehicleId}
                options={[
                  { value: '', label: 'Seleccione un vehículo' },
                  ...vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.plate} - ${v.brand} ${v.model}`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Conductor" required error={errors.driverId}>
              <Select
                icon="👤"
                value={formData.driverId}
                onChange={(e) => updateFormData('driverId', e.target.value)}
                error={!!errors.driverId}
                options={[
                  { value: '', label: 'Seleccione un conductor' },
                  ...drivers.map((d) => ({
                    value: d.id,
                    label: `${d.firstName} ${d.lastName}`,
                  })),
                ]}
              />
            </FormField>
          </div>

          <div className={styles.dateGrid}>
            <FormField label="Inicio Programado" required error={errors.scheduledStartDate}>
              <Input
                icon="📅"
                type="datetime-local"
                value={formData.scheduledStartDate}
                onChange={(e) => updateFormData('scheduledStartDate', e.target.value)}
                error={!!errors.scheduledStartDate}
              />
            </FormField>

            <FormField label="Fin Programado" required error={errors.scheduledEndDate}>
              <Input
                icon="📅"
                type="datetime-local"
                value={formData.scheduledEndDate}
                onChange={(e) => updateFormData('scheduledEndDate', e.target.value)}
                error={!!errors.scheduledEndDate}
              />
            </FormField>

            <FormField label="Distancia (km)" hint="Estimada">
              <Input
                icon="📏"
                type="number"
                step="0.1"
                value={formData.estimatedDistance}
                onChange={(e) => updateFormData('estimatedDistance', parseFloat(e.target.value) || 0)}
              />
            </FormField>

            <FormField label="Duración (min)" hint="Estimada">
              <Input
                icon="⏱️"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => updateFormData('estimatedDuration', parseInt(e.target.value) || 0)}
              />
            </FormField>
          </div>

          <FormField label="Notas" hint="Información adicional opcional">
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Instrucciones especiales, observaciones, etc."
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
            />
          </FormField>
        </section>

        <div className={styles.divider} />

        {/* Pickups */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📦</span>
              Recolecciones
            </h2>
            <Button type="button" variant="primary" size="sm" onClick={addPickup}>
              + Agregar Recolección
            </Button>
          </div>

          {errors.pickups && <p className={styles.errorMessage}>{errors.pickups}</p>}

          {formData.pickups.length === 0 ? (
            <div className={styles.emptyPickups}>
              <p>No hay recolecciones agregadas</p>
              <p style={{ fontSize: '0.9rem' }}>Haga clic en "Agregar Recolección" para comenzar</p>
            </div>
          ) : (
            <div className={styles.pickupsList}>
              {formData.pickups.map((pickup, pIndex) => {
                const selectedLab = laboratories.find((l) => l.id === pickup.laboratoryId);

                return (
                  <div key={pIndex} className={styles.pickupCard}>
                    <div className={styles.pickupHeader}>
                      <h3 className={styles.pickupTitle}>Recolección #{pIndex + 1}</h3>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removePickup(pIndex)}
                      >
                        Eliminar
                      </Button>
                    </div>

                    <div className={styles.formGrid}>
                      <FormField
                        label="Laboratorio"
                        required
                        error={errors[`pickup_${pIndex}_lab`]}
                      >
                        <Select
                          icon="🏭"
                          value={pickup.laboratoryId}
                          onChange={(e) => {
                            updatePickup(pIndex, 'laboratoryId', e.target.value);
                            const lab = laboratories.find((l) => l.id === e.target.value);
                            if (lab) {
                              updatePickup(pIndex, 'pickupAddress', lab.address || '');
                            }
                          }}
                          error={!!errors[`pickup_${pIndex}_lab`]}
                          options={[
                            { value: '', label: 'Seleccione un laboratorio' },
                            ...laboratories.map((lab) => ({
                              value: lab.id,
                              label: lab.name,
                            })),
                          ]}
                        />
                      </FormField>

                      <FormField label="Fecha de Recolección" required>
                        <Input
                          icon="📅"
                          type="datetime-local"
                          value={pickup.pickupDate}
                          onChange={(e) => updatePickup(pIndex, 'pickupDate', e.target.value)}
                        />
                      </FormField>
                    </div>

                    {selectedLab && (
                      <div className={styles.addressHint}>
                        📍 Dirección: {selectedLab.address || 'No especificada'}
                      </div>
                    )}

                    {/* Deliveries Section */}
                    <div className={styles.deliveriesSection}>
                      <div className={styles.deliveriesHeader}>
                        <h4 className={styles.deliveriesTitle}>
                          <span>🚚</span>
                          Entregas para esta recolección
                        </h4>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addDelivery(pIndex)}
                        >
                          + Agregar Entrega
                        </Button>
                      </div>

                      {errors[`pickup_${pIndex}_deliveries`] && (
                        <p className={styles.errorMessage}>
                          {errors[`pickup_${pIndex}_deliveries`]}
                        </p>
                      )}

                      {pickup.deliveries.map((delivery, dIndex) => {
                        const selectedPharm = pharmacies.find((p) => p.id === delivery.pharmacyId);

                        return (
                          <div key={dIndex} className={styles.deliveryCard}>
                            <div className={styles.deliveryHeader}>
                              <span className={styles.deliveryBadge}>Entrega {dIndex + 1}</span>
                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeDelivery(pIndex, dIndex)}
                              >
                                ✕
                              </button>
                            </div>

                            <div className={styles.deliveryGrid}>
                              <FormField
                                label="Farmacia"
                                required
                                error={errors[`delivery_${pIndex}_${dIndex}_pharmacy`]}
                              >
                                <Select
                                  icon="💊"
                                  value={delivery.pharmacyId}
                                  onChange={(e) => {
                                    updateDelivery(pIndex, dIndex, 'pharmacyId', e.target.value);
                                    const pharm = pharmacies.find((p) => p.id === e.target.value);
                                    if (pharm) {
                                      updateDelivery(pIndex, dIndex, 'deliveryAddress', pharm.address || '');
                                    }
                                  }}
                                  error={!!errors[`delivery_${pIndex}_${dIndex}_pharmacy`]}
                                  options={[
                                    { value: '', label: 'Seleccione farmacia' },
                                    ...pharmacies.map((pharm) => ({
                                      value: pharm.id,
                                      label: pharm.name,
                                    })),
                                  ]}
                                />
                              </FormField>

                              <FormField label="Nro. Factura">
                                <Input
                                  icon="📄"
                                  type="text"
                                  placeholder="F-12345"
                                  value={delivery.invoiceNumber}
                                  onChange={(e) =>
                                    updateDelivery(pIndex, dIndex, 'invoiceNumber', e.target.value)
                                  }
                                />
                              </FormField>

                              <FormField label="Valor ($)">
                                <Input
                                  icon="💰"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={delivery.merchandiseValue}
                                  onChange={(e) =>
                                    updateDelivery(
                                      pIndex,
                                      dIndex,
                                      'merchandiseValue',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormField>

                              <FormField label="Tipo de Producto">
                                <Select
                                  icon="📦"
                                  value={delivery.productType}
                                  onChange={(e) =>
                                    updateDelivery(pIndex, dIndex, 'productType', e.target.value)
                                  }
                                  options={[
                                    { value: 'farmaceutico', label: 'Farmacéutico' },
                                    { value: 'cosmetico', label: 'Cosmético' },
                                    { value: 'alimentos', label: 'Alimentos' },
                                    { value: 'otro', label: 'Otro' },
                                  ]}
                                />
                              </FormField>
                            </div>

                            {selectedPharm && (
                              <div className={styles.addressHint}>
                                📍 Dirección: {selectedPharm.address || 'No especificada'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--color-error)', margin: 0 }}>{error}</p>
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={() => router.push('/dispatches')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
