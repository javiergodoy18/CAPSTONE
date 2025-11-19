'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  capacity: number;
  status: string;
  fuelType?: string;
  mileage?: number;
  lastService?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data);
      } else {
        alert('Vehículo no encontrado');
        router.push('/vehicles');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async () => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;

    try {
      const response = await fetch(`/api/vehicles/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/vehicles');
      } else {
        alert('Error al eliminar vehículo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar vehículo');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: '#10b981',
      in_use: '#3b82f6',
      maintenance: '#f59e0b',
      inactive: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      in_use: 'En Uso',
      maintenance: 'Mantenimiento',
      inactive: 'Inactivo',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Detalle del Vehículo</h1>
        <Link href="/vehicles" style={{ color: '#4b5563', textDecoration: 'none' }}>
          ← Volver
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
              {vehicle.brand} {vehicle.model}
            </h2>
            <p style={{ color: '#6b7280' }}>Patente: {vehicle.plate}</p>
          </div>
          <span
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: getStatusColor(vehicle.status) + '20',
              color: getStatusColor(vehicle.status),
            }}
          >
            {getStatusLabel(vehicle.status)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Año</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{vehicle.year}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Tipo</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827', textTransform: 'capitalize' }}>{vehicle.type}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Capacidad</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{vehicle.capacity} kg</p>
          </div>

          {vehicle.fuelType && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Tipo de Combustible</h3>
              <p style={{ fontSize: '1.125rem', color: '#111827', textTransform: 'capitalize' }}>{vehicle.fuelType}</p>
            </div>
          )}

          {vehicle.mileage && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Kilometraje</h3>
              <p style={{ fontSize: '1.125rem', color: '#111827' }}>{vehicle.mileage.toLocaleString()} km</p>
            </div>
          )}

          {vehicle.lastService && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Último Servicio</h3>
              <p style={{ fontSize: '1.125rem', color: '#111827' }}>
                {new Date(vehicle.lastService).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>

        {vehicle.notes && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Notas</h3>
            <p style={{ color: '#374151', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>{vehicle.notes}</p>
          </div>
        )}

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <div>
              <span style={{ fontWeight: '600' }}>Creado:</span>{' '}
              {new Date(vehicle.createdAt).toLocaleString('es-ES')}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Actualizado:</span>{' '}
              {new Date(vehicle.updatedAt).toLocaleString('es-ES')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Editar
          </Link>
          <button
            onClick={deleteVehicle}
            style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Eliminar
          </button>
          <Link
            href="/vehicles"
            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}