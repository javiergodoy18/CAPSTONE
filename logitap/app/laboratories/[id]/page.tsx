'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Laboratory {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contactPerson?: string;
  businessType: string;
  createdAt: string;
  updatedAt: string;
}

export default function LaboratoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaboratory();
  }, []);

  const fetchLaboratory = async () => {
    try {
      const response = await fetch(`/api/laboratories/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setLaboratory(data);
      } else {
        alert('Laboratorio no encontrado');
        router.push('/laboratories');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLaboratory = async () => {
    if (!confirm('¿Estás seguro de eliminar este laboratorio?')) return;

    try {
      const response = await fetch(`/api/laboratories/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/laboratories');
      } else {
        alert('Error al eliminar laboratorio');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  if (!laboratory) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Detalle del Laboratorio</h1>
        <Link href="/laboratories" style={{ color: '#4b5563', textDecoration: 'none' }}>
          ← Volver
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
            {laboratory.name}
          </h2>
          <p style={{ color: '#6b7280' }}>{laboratory.city}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Email</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{laboratory.email}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Teléfono</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{laboratory.phone}</p>
          </div>

          {laboratory.contactPerson && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Contacto</h3>
              <p style={{ fontSize: '1.125rem', color: '#111827' }}>{laboratory.contactPerson}</p>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Tipo</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827', textTransform: 'capitalize' }}>{laboratory.businessType}</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Dirección</h3>
          <p style={{ color: '#374151', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>{laboratory.address}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link
            href={`/laboratories/${laboratory.id}/edit`}
            style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Editar
          </Link>
          <button
            onClick={deleteLaboratory}
            style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Eliminar
          </button>
          <Link
            href="/laboratories"
            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
