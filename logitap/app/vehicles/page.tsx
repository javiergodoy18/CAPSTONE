'use client';

import { useState, useEffect } from 'react';
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
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;

    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      fetchVehicles();
    } catch (error) {
      console.error('Error:', error);
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

  const filteredVehicles = vehicles.filter(
    (v) => filter === 'all' || v.status === filter
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Gestión de Vehículos</h1>
          <Link
            href="/vehicles/new"
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '1rem',
              display: 'inline-block'
            }}
          >
            + Nuevo Vehículo
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'all' ? '#2563eb' : '#e5e7eb',
              color: filter === 'all' ? 'white' : '#374151',
            }}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'available' ? '#10b981' : '#e5e7eb',
              color: filter === 'available' ? 'white' : '#374151',
            }}
          >
            Disponibles
          </button>
          <button
            onClick={() => setFilter('in_use')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'in_use' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'in_use' ? 'white' : '#374151',
            }}
          >
            En Uso
          </button>
          <button
            onClick={() => setFilter('maintenance')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'maintenance' ? '#f59e0b' : '#e5e7eb',
              color: filter === 'maintenance' ? 'white' : '#374151',
            }}
          >
            Mantenimiento
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PATENTE
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  VEHÍCULO
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TIPO
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CAPACIDAD
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ESTADO
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                    {vehicle.plate}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    {vehicle.type}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {vehicle.capacity} kg
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(vehicle.status) + '20',
                        color: getStatusColor(vehicle.status),
                      }}
                    >
                      {getStatusLabel(vehicle.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      style={{ color: '#2563eb', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/vehicles/${vehicle.id}/edit`}
                      style={{ color: '#10b981', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteVehicle(vehicle.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVehicles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '0.875rem' }}>
              No hay vehículos registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}