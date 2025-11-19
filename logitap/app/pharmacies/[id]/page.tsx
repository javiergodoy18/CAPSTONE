'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Pharmacy {
  id: string;
  name: string;
  rut?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contactPerson: string;
  createdAt: string;
  updatedAt: string;
}

export default function PharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacy();
  }, []);

  const fetchPharmacy = async () => {
    try {
      const response = await fetch(`/api/pharmacies/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setPharmacy(data);
      } else {
        alert('Farmacia no encontrada');
        router.push('/pharmacies');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar farmacia');
    } finally {
      setLoading(false);
    }
  };

  const deletePharmacy = async () => {
    if (!confirm('¿Estás seguro de eliminar esta farmacia?')) return;

    try {
      const response = await fetch(`/api/pharmacies/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/pharmacies');
      } else {
        alert('Error al eliminar farmacia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar farmacia');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  if (!pharmacy) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Detalle de Farmacia</h1>
        <Link href="/pharmacies" style={{ color: '#4b5563', textDecoration: 'none' }}>
          ← Volver
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
            {pharmacy.name}
          </h2>
          <p style={{ color: '#6b7280' }}>{pharmacy.city}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {pharmacy.rut && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>RUT</h3>
              <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.rut}</p>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Email</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.email}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Teléfono</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.phone}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Dirección</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.address}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Ciudad</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.city}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Persona de Contacto</h3>
            <p style={{ fontSize: '1.125rem', color: '#111827' }}>{pharmacy.contactPerson}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <div>
              <span style={{ fontWeight: '600' }}>Creado:</span>{' '}
              {new Date(pharmacy.createdAt).toLocaleString('es-ES')}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Actualizado:</span>{' '}
              {new Date(pharmacy.updatedAt).toLocaleString('es-ES')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link
            href={`/pharmacies/${pharmacy.id}/edit`}
            style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Editar
          </Link>
          <button
            onClick={deletePharmacy}
            style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            Eliminar
          </button>
          <Link
            href="/pharmacies"
            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
