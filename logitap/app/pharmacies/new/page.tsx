'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { geocodeAddressClient } from '@/lib/geocoding';

export default function NewPharmacyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  async function handleGeocodeAddress() {
    if (!address || !city) {
      alert("Ingresa dirección y ciudad primero");
      return;
    }

    setGeocoding(true);

    const coords = await geocodeAddressClient(address, city, "Venezuela");

    if (coords) {
      setCoordinates(coords);
      alert(`✅ Coordenadas encontradas:\n${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
    } else {
      alert("❌ No se pudieron obtener las coordenadas.\nVerifica que la dirección esté completa.");
    }

    setGeocoding(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Intentar geocodificar si no hay coordenadas
      let finalCoordinates = coordinates;

      if (!finalCoordinates && address && city) {
        setGeocoding(true);
        finalCoordinates = await geocodeAddressClient(address, city, "Venezuela");
        setGeocoding(false);

        if (finalCoordinates) {
          setCoordinates(finalCoordinates);
        }
      }

      if (!finalCoordinates) {
        setError("No se pudieron obtener las coordenadas. Haz click en 'Obtener Ubicación' primero.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/pharmacies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rut,
          email,
          phone,
          address,
          city,
          contactPerson,
          latitude: finalCoordinates.lat,
          longitude: finalCoordinates.lng,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear farmacia");
      }

      const data = await response.json();
      router.push(`/pharmacies/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="page-title">Nueva Farmacia</h1>
          <Link href="/pharmacies" className="btn btn-secondary">
            ← Volver
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre de la Farmacia *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Farmacia Cruz Verde"
                />
              </div>

              <div className="form-group">
                <label className="form-label">RUT</label>
                <input
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="form-input"
                  placeholder="76.123.456-7"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="contacto@farmacia.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="form-input"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Caracas"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Persona de Contacto *</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Dirección *</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Ej: Av. Bolívar con Calle 5, Edificio Torre, Local 3"
                    style={{ margin: 0 }}
                  />
                  {coordinates && (
                    <p style={{ fontSize: "13px", color: "#10b981", marginTop: "6px", margin: "6px 0 0 0" }}>
                      ✅ Ubicación confirmada: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  )}
                  {!coordinates && address && city && (
                    <p style={{ fontSize: "13px", color: "#f59e0b", marginTop: "6px", margin: "6px 0 0 0" }}>
                      ⚠️ Haz click en "Obtener Ubicación" para geocodificar
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={geocoding || !address || !city}
                  className="btn btn-primary"
                  style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
                >
                  {geocoding ? "🔍 Buscando..." : "📍 Obtener Ubicación"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link href="/pharmacies" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar Farmacia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
