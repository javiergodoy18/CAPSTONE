'use client';

import { useState, useEffect } from 'react';
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
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await fetch('/api/pharmacies');
      const data = await response.json();
      setPharmacies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePharmacy = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta farmacia?')) return;

    try {
      await fetch(`/api/pharmacies/${id}`, { method: 'DELETE' });
      fetchPharmacies();
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Gestión de Farmacias</h1>
          <Link
            href="/pharmacies/new"
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
            + Nueva Farmacia
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  NOMBRE
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RUT
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  EMAIL
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CIUDAD
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                    {pharmacy.name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {pharmacy.rut || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {pharmacy.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    {pharmacy.city}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <Link
                      href={`/pharmacies/${pharmacy.id}`}
                      style={{ color: '#2563eb', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/pharmacies/${pharmacy.id}/edit`}
                      style={{ color: '#10b981', textDecoration: 'none', marginRight: '1rem', fontWeight: '500' }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deletePharmacy(pharmacy.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pharmacies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '0.875rem' }}>
              No hay farmacias registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
