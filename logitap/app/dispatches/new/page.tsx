"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateDispatchNumber } from "@/lib/pricing";

interface Laboratory {
  id: string;
  name: string;
  address: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

interface Driver {
  id: string;
  name: string;
  license: string;
}

interface Delivery {
  pharmacyId: string;
  invoiceNumber: string;
  merchandiseValue: number;
  productType: string;
  weight?: number;
  packages?: number;
  deliveryNotes?: string;
}

interface Pickup {
  laboratoryId: string;
  pickupAddress: string;
  pickupDate: string;
  pickupNotes?: string;
  deliveries: Delivery[];
}

export default function NewDispatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Datos del formulario
  const [dispatchNumber, setDispatchNumber] = useState("");
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [scheduledEndDate, setScheduledEndDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // Catálogos
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Cargar catálogos
  useEffect(() => {
    loadCatalogs();
    // Generar número de despacho automático
    setDispatchNumber(`VJ-${Date.now().toString().slice(-6)}`);
  }, []);

  async function loadCatalogs() {
    try {
      const [labsRes, pharmsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/laboratories"),
        fetch("/api/pharmacies"),
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);

      setLaboratories(await labsRes.json());
      setPharmacies(await pharmsRes.json());
      setVehicles(await vehiclesRes.json());
      setDrivers(await driversRes.json());
    } catch (err) {
      setError("Error al cargar catálogos");
    }
  }

  // Agregar nuevo pickup (laboratorio)
  function addPickup() {
    setPickups([
      ...pickups,
      {
        laboratoryId: "",
        pickupAddress: "",
        pickupDate: scheduledStartDate,
        deliveries: [],
      },
    ]);
  }

  // Remover pickup
  function removePickup(index: number) {
    setPickups(pickups.filter((_, i) => i !== index));
  }

  // Actualizar pickup
  function updatePickup(index: number, field: string, value: any) {
    const updated = [...pickups];
    (updated[index] as any)[field] = value;

    // Si cambia el laboratorio, actualizar la dirección automáticamente
    if (field === "laboratoryId") {
      const lab = laboratories.find(l => l.id === value);
      if (lab) {
        updated[index].pickupAddress = lab.address;
      }
    }

    setPickups(updated);
  }

  // Agregar delivery a un pickup
  function addDelivery(pickupIndex: number) {
    const updated = [...pickups];
    updated[pickupIndex].deliveries.push({
      pharmacyId: "",
      invoiceNumber: "",
      merchandiseValue: 0,
      productType: "medicamentos",
    });
    setPickups(updated);
  }

  // Remover delivery
  function removeDelivery(pickupIndex: number, deliveryIndex: number) {
    const updated = [...pickups];
    updated[pickupIndex].deliveries = updated[pickupIndex].deliveries.filter(
      (_, i) => i !== deliveryIndex
    );
    setPickups(updated);
  }

  // Actualizar delivery
  function updateDelivery(
    pickupIndex: number,
    deliveryIndex: number,
    field: string,
    value: any
  ) {
    const updated = [...pickups];
    (updated[pickupIndex].deliveries[deliveryIndex] as any)[field] = value;
    setPickups(updated);
  }

  // Calcular subtotales
  function calculatePickupSubtotal(pickup: Pickup) {
    const total = pickup.deliveries.reduce((sum, d) => sum + d.merchandiseValue, 0);
    let percentage = 3.0;
    if (total > 22000 && total <= 30000) {
      percentage = 2.75;
    } else if (total > 30000) {
      percentage = 2.5;
    }
    const cost = total * (percentage / 100);
    return { total, cost, percentage };
  }

  // Calcular totales del viaje
  function calculateTotals() {
    let totalMerchandise = 0;
    let totalIncome = 0;

    pickups.forEach((pickup) => {
      const subtotal = calculatePickupSubtotal(pickup);
      totalMerchandise += subtotal.total;
      totalIncome += subtotal.cost;
    });

    return { totalMerchandise, totalIncome };
  }

  // Enviar formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validaciones
      if (!vehicleId || !driverId) {
        setError("Debe seleccionar vehículo y conductor");
        setLoading(false);
        return;
      }

      if (pickups.length === 0) {
        setError("Debe agregar al menos un laboratorio");
        setLoading(false);
        return;
      }

      for (let i = 0; i < pickups.length; i++) {
        if (!pickups[i].laboratoryId) {
          setError(`Pickup #${i + 1}: Debe seleccionar un laboratorio`);
          setLoading(false);
          return;
        }
        if (pickups[i].deliveries.length === 0) {
          setError(`Pickup #${i + 1}: Debe agregar al menos una entrega`);
          setLoading(false);
          return;
        }
        for (let j = 0; j < pickups[i].deliveries.length; j++) {
          const delivery = pickups[i].deliveries[j];
          if (!delivery.pharmacyId || !delivery.invoiceNumber || delivery.merchandiseValue <= 0) {
            setError(`Pickup #${i + 1}, Entrega #${j + 1}: Complete todos los campos`);
            setLoading(false);
            return;
          }
        }
      }

      const response = await fetch("/api/dispatches/create-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispatch: {
            dispatchNumber,
            vehicleId,
            driverId,
            scheduledStartDate,
            scheduledEndDate: scheduledEndDate || null,
            generalNotes,
          },
          pickups,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear despacho");
      }

      const data = await response.json();
      router.push(`/dispatches/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const totals = calculateTotals();

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 className="page-title" style={{ margin: '0 0 8px 0' }}>
            Crear Nuevo Viaje
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Complete la información del viaje, laboratorios y entregas
          </p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

      <form onSubmit={handleSubmit}>
        {/* INFORMACIÓN GENERAL DEL VIAJE */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
            📋 Información General del Viaje
          </h2>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Número de Viaje</label>
              <input
                type="text"
                value={dispatchNumber}
                onChange={(e) => setDispatchNumber(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehículo *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Seleccionar vehículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} - {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Conductor *</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Seleccionar conductor</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.license}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input
                type="datetime-local"
                value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Fin Estimada</label>
              <input
                type="datetime-local"
                value={scheduledEndDate}
                onChange={(e) => setScheduledEndDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Notas Generales</label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Notas sobre el viaje..."
              />
            </div>
          </div>
        </div>

        {/* LABORATORIOS Y ENTREGAS */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #10b981', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              🏢 Laboratorios y sus Entregas
            </h2>
            <button
              type="button"
              onClick={addPickup}
              className="btn btn-success"
              style={{ fontSize: '14px' }}
            >
              + Agregar Laboratorio
            </button>
          </div>

          {pickups.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              <p style={{ fontSize: "16px", margin: 0 }}>
                No hay laboratorios agregados. Haz clic en "Agregar Laboratorio" para comenzar.
              </p>
            </div>
          )}

          {pickups.map((pickup, pickupIndex) => {
            const subtotal = calculatePickupSubtotal(pickup);

            return (
              <div key={pickupIndex} style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
                {/* HEADER DEL PICKUP */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#10b981" }}>
                    Pickup #{pickupIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removePickup(pickupIndex)}
                    style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                  >
                    Eliminar
                  </button>
                </div>

                {/* INFORMACIÓN DEL PICKUP */}
                <div className="grid-2" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Laboratorio *</label>
                    <select
                      value={pickup.laboratoryId}
                      onChange={(e) => updatePickup(pickupIndex, "laboratoryId", e.target.value)}
                      required
                      className="form-select"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">Seleccionar laboratorio</option>
                      {laboratories.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Fecha de Recogida *</label>
                    <input
                      type="datetime-local"
                      value={pickup.pickupDate}
                      onChange={(e) => updatePickup(pickupIndex, "pickupDate", e.target.value)}
                      required
                      className="form-input"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Dirección de Recogida</label>
                    <input
                      type="text"
                      value={pickup.pickupAddress}
                      onChange={(e) => updatePickup(pickupIndex, "pickupAddress", e.target.value)}
                      placeholder="Se completa automáticamente al seleccionar laboratorio"
                      className="form-input"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Notas de Recogida</label>
                    <textarea
                      value={pickup.pickupNotes || ""}
                      onChange={(e) => updatePickup(pickupIndex, "pickupNotes", e.target.value)}
                      rows={2}
                      className="form-textarea"
                      style={{ fontSize: '14px' }}
                      placeholder="Notas especiales para esta recogida..."
                    />
                  </div>
                </div>

                {/* ENTREGAS DEL PICKUP */}
                <div style={{ background: "white", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
                      📦 Entregas de este Laboratorio
                    </h4>
                    <button
                      type="button"
                      onClick={() => addDelivery(pickupIndex)}
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      + Agregar Entrega
                    </button>
                  </div>

                  {pickup.deliveries.length === 0 && (
                    <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", margin: "12px 0" }}>
                      No hay entregas. Haz clic en "Agregar Entrega".
                    </p>
                  )}

                  {pickup.deliveries.map((delivery, deliveryIndex) => (
                    <div key={deliveryIndex} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#3b82f6" }}>
                          Entrega #{deliveryIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDelivery(pickupIndex, deliveryIndex)}
                          style={{ padding: "4px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Eliminar
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Farmacia *
                          </label>
                          <select
                            value={delivery.pharmacyId}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "pharmacyId", e.target.value)}
                            required
                            className="form-select"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          >
                            <option value="">Seleccionar</option>
                            {pharmacies.map((pharm) => (
                              <option key={pharm.id} value={pharm.id}>
                                {pharm.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Nº Factura *
                          </label>
                          <input
                            type="text"
                            value={delivery.invoiceNumber}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "invoiceNumber", e.target.value)}
                            required
                            placeholder="12345"
                            className="form-input"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Valor (USD) *
                          </label>
                          <input
                            type="number"
                            value={delivery.merchandiseValue || ""}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "merchandiseValue", parseFloat(e.target.value) || 0)}
                            required
                            min="0"
                            step="0.01"
                            placeholder="5000"
                            className="form-input"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Tipo de Producto
                          </label>
                          <select
                            value={delivery.productType}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "productType", e.target.value)}
                            className="form-select"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          >
                            <option value="medicamentos">Medicamentos</option>
                            <option value="insumos_agricolas">Insumos Agrícolas</option>
                            <option value="ambos">Ambos</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Peso (kg)
                          </label>
                          <input
                            type="number"
                            value={delivery.weight || ""}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "weight", parseFloat(e.target.value) || undefined)}
                            min="0"
                            step="0.1"
                            placeholder="50"
                            className="form-input"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                            Paquetes
                          </label>
                          <input
                            type="number"
                            value={delivery.packages || ""}
                            onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, "packages", parseInt(e.target.value) || undefined)}
                            min="0"
                            placeholder="5"
                            className="form-input"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUBTOTAL DEL PICKUP */}
                <div style={{ background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "6px", padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "500" }}>Valor Mercancía:</span>
                    <span style={{ fontWeight: "600" }}>${subtotal.total.toLocaleString("es-CL")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "500" }}>Porcentaje:</span>
                    <span style={{ fontWeight: "600" }}>{subtotal.percentage}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", borderTop: "1px solid #10b981", paddingTop: "8px", marginTop: "4px" }}>
                    <span style={{ fontWeight: "600", color: "#10b981" }}>Costo a Cobrar:</span>
                    <span style={{ fontWeight: "700", color: "#10b981" }}>${subtotal.cost.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN TOTAL */}
        {pickups.length > 0 && (
          <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#1e40af" }}>
              📊 RESUMEN TOTAL DEL VIAJE
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div style={{ background: "white", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>Laboratorios</p>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "#1e40af", margin: 0 }}>{pickups.length}</p>
              </div>

              <div style={{ background: "white", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>Total Entregas</p>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "#1e40af", margin: 0 }}>
                  {pickups.reduce((sum, p) => sum + p.deliveries.length, 0)}
                </p>
              </div>

              <div style={{ background: "white", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>Valor Total Mercancía</p>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "#1e40af", margin: 0 }}>
                  ${totals.totalMerchandise.toLocaleString("es-CL")}
                </p>
              </div>

              <div style={{ background: "white", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>Ingreso Total</p>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "#10b981", margin: 0 }}>
                  ${totals.totalIncome.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTONES */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
            style={{ fontSize: '16px' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || pickups.length === 0}
            className="btn btn-success"
            style={{ fontSize: '16px' }}
          >
            {loading ? 'Creando...' : 'Crear Viaje'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
