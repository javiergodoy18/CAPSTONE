"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { geocodeAddressClient } from "@/lib/geocoding";

export default function EditPharmacyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadPharmacy(p.id);
    });
  }, [params]);

  async function loadPharmacy(pharmacyId: string) {
    try {
      const response = await fetch(`/api/pharmacies/${pharmacyId}`);
      if (!response.ok) throw new Error("Error al cargar farmacia");

      const data = await response.json();
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
      setAddress(data.address);
      setCity(data.city);
      setContactPerson(data.contactPerson || "");

      // Cargar coordenadas existentes
      if (data.latitude && data.longitude) {
        setCoordinates({ lat: data.latitude, lng: data.longitude });
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          city,
          contactPerson,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar farmacia");
      }

      // Actualizar coordenadas en viajes activos
      try {
        await fetch(`/api/pharmacies/${id}/update-dispatch-coordinates`, {
          method: "POST",
        });
      } catch (error) {
        console.log("No se pudieron actualizar viajes automáticamente");
      }

      router.push(`/pharmacies/${id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <h1 className="page-title">Editar Farmacia</h1>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
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
                />
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

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Persona de Contacto</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
