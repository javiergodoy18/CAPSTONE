'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  status: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este conductor?')) return;

    try {
      await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      fetchDrivers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: '#10b981',
      busy: '#3b82f6',
      inactive: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      busy: 'Ocupado',
      inactive: 'Inactivo',
    };
    return labels[status] || status;
  };

  const filteredDrivers = drivers.filter(
    (d) => filter === 'all' || d.status === filter
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Gestión de Conductores</h1>
          <Link
            href="/drivers/new"
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
            + Nuevo Conductor
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
            Todos ({drivers.length})
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
            onClick={() => setFilter('busy')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'busy' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'busy' ? 'white' : '#374151',
            }}
          >
            Ocupados
          </button>
          <button
            onClick={() => setFilter('inactive')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filter === 'inactive' ? '#6b7280' : '#e5e7eb',
              color: filter === 'inactive' ? 'white' : '#374151',
            }}
          >
            Inactivos
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  NOMBRE
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  EMAIL
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TELÉFONO
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LICENCIA
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
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                    {driver.name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {driver.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {driver.phone}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {driver.license}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(driver.status) + '20',
                        color: getStatusColor(driver.status),
                      }}
                    >
                      {getStatusLabel(driver.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <Link
                      href={`/drivers/${driver.id}`}
                      style={{ color: '#2563eb', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/drivers/${driver.id}/edit`}
                      style={{ color: '#10b981', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteDriver(driver.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '0.875rem' }}>
              No hay conductores registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
