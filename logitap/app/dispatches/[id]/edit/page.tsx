'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Laboratory {
  id: string;
  name: string;
}

interface Pharmacy {
  id: string;
  name: string;
}

export default function EditDispatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    laboratoryId: '',
    pharmacyId: '',
    productType: '',
    weight: '',
    units: '',
    distance: '',
    estimatedCost: '',
    status: 'pending',
    priority: 'normal',
    pickupDate: '',
    deliveryDate: '',
    pickupNotes: '',
    deliveryNotes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dispatchRes, labsRes, pharmsRes] = await Promise.all([
        fetch(`/api/dispatches/${resolvedParams.id}`),
        fetch('/api/laboratories'),
        fetch('/api/pharmacies'),
      ]);

      if (!dispatchRes.ok) {
        alert('despacho no encontrado');
        router.push('/dispatches');
        return;
      }

      const dispatch = await dispatchRes.json();
      const labs = await labsRes.json();
      const pharms = await pharmsRes.json();

      setLaboratories(labs);
      setPharmacies(pharms);

      setFormData({
        laboratoryId: dispatch.laboratoryId,
        pharmacyId: dispatch.pharmacyId,
        productType: dispatch.productType,
        weight: dispatch.weight.toString(),
        units: dispatch.units?.toString() || '',
        distance: dispatch.distance?.toString() || '',
        estimatedCost: dispatch.estimatedCost?.toString() || '',
        status: dispatch.status,
        priority: dispatch.priority,
        pickupDate: dispatch.pickupDate ? new Date(dispatch.pickupDate).toISOString().slice(0, 16) : '',
        deliveryDate: dispatch.deliveryDate ? new Date(dispatch.deliveryDate).toISOString().slice(0, 16) : '',
        pickupNotes: dispatch.pickupNotes || '',
        deliveryNotes: dispatch.deliveryNotes || '',
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        laboratoryId: formData.laboratoryId,
        pharmacyId: formData.pharmacyId,
        productType: formData.productType,
        weight: parseFloat(formData.weight),
        status: formData.status,
        priority: formData.priority,
        pickupDate: formData.pickupDate,
      };

      if (formData.units) payload.units = parseInt(formData.units);
      if (formData.distance) payload.distance = parseFloat(formData.distance);
      if (formData.estimatedCost) payload.estimatedCost = parseFloat(formData.estimatedCost);
      if (formData.deliveryDate) payload.deliveryDate = formData.deliveryDate;
      if (formData.pickupNotes) payload.pickupNotes = formData.pickupNotes;
      if (formData.deliveryNotes) payload.deliveryNotes = formData.deliveryNotes;

      const response = await fetch(`/api/dispatches/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/dispatches/${resolvedParams.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Error al actualizar despacho');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar despacho');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Editar despacho</h1>
        <Link
          href={`/dispatches/${resolvedParams.id}`}
          style={{ color: '#4b5563', textDecoration: 'none', fontSize: '1rem' }}
        >
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Laboratorio */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Laboratorio (Origen) *
            </label>
            <select
              name="laboratoryId"
              value={formData.laboratoryId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            >
              <option value="">Seleccionar laboratorio</option>
              {laboratories.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
          </div>

          {/* Farmacia */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Farmacia (Destino) *
            </label>
            <select
              name="pharmacyId"
              value={formData.pharmacyId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            >
              <option value="">Seleccionar farmacia</option>
              {pharmacies.map(pharm => (
                <option key={pharm.id} value={pharm.id}>{pharm.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Producto */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Tipo de Producto *
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            >
              <option value="">Seleccionar tipo</option>
              <option value="Medicamentos">Medicamentos</option>
              <option value="Insumos Agrícolas">Insumos Agrícolas</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          {/* Peso */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Peso (kg) *
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {/* Unidades */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Unidades
            </label>
            <input
              type="number"
              name="units"
              value={formData.units}
              onChange={handleChange}
              min="1"
              step="1"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {/* Distancia */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Distancia (km)
            </label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              min="0"
              step="0.1"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {/* Costo Estimado */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Costo Estimado ($)
            </label>
            <input
              type="number"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {/* Estado */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Estado *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            >
              <option value="pending">Pendiente</option>
              <option value="assigned">Asignado</option>
              <option value="pickup">Recogido</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Prioridad *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            >
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Fecha de Recogida */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Fecha de Recogida *
            </label>
            <input
              type="datetime-local"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {/* Fecha de Entrega */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Fecha de Entrega
            </label>
            <input
              type="datetime-local"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white' }}
            />
          </div>
        </div>

        {/* Notas de Recogida */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Notas de Recogida
          </label>
          <textarea
            name="pickupNotes"
            value={formData.pickupNotes}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white', resize: 'vertical' }}
          />
        </div>

        {/* Notas de Entrega */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Notas de Entrega
          </label>
          <textarea
            name="deliveryNotes"
            value={formData.deliveryNotes}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', backgroundColor: 'white', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ flex: 1, backgroundColor: saving ? '#9ca3af' : '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', fontSize: '1rem', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <Link
            href={`/dispatches/${resolvedParams.id}`}
            style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontSize: '1rem', fontWeight: '500', display: 'block' }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
