'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchDriver = async () => {
    try {
      const response = await fetch(`/api/drivers/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setDriver(data);
      } else {
        alert('Conductor no encontrado');
        router.push('/drivers');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar conductor');
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async () => {
    if (!confirm('¿Estás seguro de eliminar este conductor?')) return;

    try {
      const response = await fetch(`/api/drivers/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/drivers');
      } else {
        alert('Error al eliminar conductor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar conductor');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Detalle del Conductor</h1>
        <Link href="/drivers" style={{ color: '#4b5563', textDecoration: 'none' }}>
          ← Volver
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
              {driver.name}
            </h2>
            <p style={{ color: '#6b7280' }}>Licencia: {driver.license}</p>
          </div>
          <span
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: getStatusColor(driver.status) + '20',
              color: getStatusColor(driver.status),
            }}
          >
            {getStatusLabel(driver.status)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Email</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{driver.email}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Teléfono</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{driver.phone}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Licencia</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{driver.license}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <div>
              <span style={{ fontWeight: '600' }}>Creado:</span>{' '}
              {new Date(driver.createdAt).toLocaleString('es-ES')}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Actualizado:</span>{' '}
              {new Date(driver.updatedAt).toLocaleString('es-ES')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link
            href={`/drivers/${driver.id}/edit`}
            style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Editar
          </Link>
          <button
            onClick={deleteDriver}
            style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Eliminar
          </button>
          <Link
            href="/drivers"
            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
