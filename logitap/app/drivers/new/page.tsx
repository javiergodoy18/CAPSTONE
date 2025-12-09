'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license: '',
    status: 'available',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar credenciales generadas
        if (data.credentials) {
          alert(
            `✅ Conductor creado exitosamente\n\n` +
            `📧 Email: ${data.credentials.email}\n` +
            `🔑 Contraseña: ${data.credentials.password}\n\n` +
            `⚠️ IMPORTANTE: Guarda estas credenciales.\n` +
            `El conductor debe cambiar su contraseña al primer login.`
          );

          // Opcional: Copiar al portapapeles
          if (navigator.clipboard) {
            const credentials =
              `Credenciales de acceso LOGITAP\n` +
              `Email: ${data.credentials.email}\n` +
              `Contraseña: ${data.credentials.password}\n`;
            navigator.clipboard.writeText(credentials);
            console.log('📋 Credenciales copiadas al portapapeles');
          }
        } else {
          alert('✅ Conductor creado exitosamente');
        }

        router.push('/drivers');
      } else {
        alert(`❌ Error: ${data.error || 'Error al crear conductor'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear conductor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="page-title">Nuevo Conductor</h1>
          <Link href="/drivers" className="btn btn-secondary">
            ← Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="juan.perez@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Licencia *</label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="12345678-9"
                />
              </div>

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
                  <option value="busy">Ocupado</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link href="/drivers" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar Conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
