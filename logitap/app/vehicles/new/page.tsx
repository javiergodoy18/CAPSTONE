'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'camión',
    capacity: '',
    status: 'available',
    fuelType: 'diesel',
    mileage: '',
    lastService: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/vehicles');
      } else {
        alert('Error al crear vehículo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="page-title">Nuevo Vehículo</h1>
          <Link href="/vehicles" className="btn btn-secondary">
            ← Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="grid-2">
              {/* Patente */}
              <div className="form-group">
                <label className="form-label">Patente *</label>
                <input
                  type="text"
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="BBCH-12"
                />
              </div>

              {/* Marca */}
              <div className="form-group">
                <label className="form-label">Marca *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Mercedes-Benz"
                />
              </div>

              {/* Modelo */}
              <div className="form-group">
                <label className="form-label">Modelo *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Actros 2651"
                />
              </div>

              {/* Año */}
              <div className="form-group">
                <label className="form-label">Año *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                />
              </div>

              {/* Tipo */}
              <div className="form-group">
                <label className="form-label">Tipo *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="camión">Camión</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="furgón">Furgón</option>
                  <option value="auto">Auto</option>
                  <option value="moto">Moto</option>
                </select>
              </div>

              {/* Capacidad */}
              <div className="form-group">
                <label className="form-label">Capacidad (kg) *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="form-input"
                  placeholder="15000"
                />
              </div>

              {/* Estado */}
              <div className="form-group">
                <label className="form-label">Estado *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="available">Disponible</option>
                  <option value="in_use">En Uso</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              {/* Tipo de Combustible */}
              <div className="form-group">
                <label className="form-label">Tipo de Combustible</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              {/* Kilometraje */}
              <div className="form-group">
                <label className="form-label">Kilometraje</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  step="0.01"
                  className="form-input"
                  placeholder="50000"
                />
              </div>

              {/* Último Servicio */}
              <div className="form-group">
                <label className="form-label">Último Servicio</label>
                <input
                  type="date"
                  name="lastService"
                  value={formData.lastService}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="form-textarea"
                placeholder="Información adicional sobre el vehículo..."
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link href="/vehicles" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
