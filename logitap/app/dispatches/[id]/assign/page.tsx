'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Dispatch {
  id: string;
  dispatchNumber: string;
  vehicleId?: string;
  driverId?: string;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  license: string;
  status: string;
}

export default function AssignResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dispatches/${resolvedParams.id}`).then(r => r.json()),
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/drivers').then(r => r.json()),
    ]).then(([dispatchData, vehiclesData, driversData]) => {
      setDispatch(dispatchData);
      // Filtrar solo vehículos disponibles
      setVehicles(vehiclesData.filter((v: Vehicle) => v.status === 'available'));
      // Filtrar solo conductores disponibles
      setDrivers(driversData.filter((d: Driver) => d.status === 'available'));
      // Pre-seleccionar si ya tiene asignados
      setSelectedVehicle(dispatchData.vehicleId || '');
      setSelectedDriver(dispatchData.driverId || '');
      setLoading(false);
    });
  }, []);

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) {
      alert('Debes seleccionar un vehículo y un conductor');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/dispatches/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          driverId: selectedDriver,
          status: 'assigned',
        }),
      });

      if (response.ok) {
        router.push(`/dispatches/${resolvedParams.id}`);
      } else {
        alert('Error al asignar recursos');
      }
    } catch (error) {
      console.error(error);
      alert('Error al asignar recursos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Cargando...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Asignar Recursos - despacho #{dispatch?.dispatchNumber}
      </h1>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Vehículo *
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
          >
            <option value="">Seleccionar vehículo...</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model} (Capacidad: {vehicle.capacity} kg)
              </option>
            ))}
          </select>
          {vehicles.length === 0 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              No hay vehículos disponibles
            </p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Conductor *
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
          >
            <option value="">Seleccionar conductor...</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - Licencia: {driver.license}
              </option>
            ))}
          </select>
          {drivers.length === 0 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              No hay conductores disponibles
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleAssign}
            disabled={saving || !selectedVehicle || !selectedDriver}
            style={{
              flex: 1,
              backgroundColor: saving ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Asignando...' : 'Asignar Recursos'}
          </button>
          <Link
            href={`/dispatches/${resolvedParams.id}`}
            style={{
              flex: 1,
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '0.75rem',
              borderRadius: '6px',
              textAlign: 'center',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'block'
            }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
