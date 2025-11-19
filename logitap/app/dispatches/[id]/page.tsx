"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Dispatch {
  id: string;
  dispatchNumber: string;
  scheduledStartDate: string;
  scheduledEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: string;
  totalMerchandiseValue: number;
  totalIncome: number;
  generalNotes: string | null;
  vehicle: {
    id: string;
    patent: string;
    brand: string;
    model: string;
  } | null;
  driver: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  pickups: {
    id: string;
    pickupAddress: string;
    pickupDate: string;
    actualPickupTime: string | null;
    merchandiseValue: number;
    dispatchCost: number;
    percentageApplied: number;
    pickupNotes: string | null;
    laboratory: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    deliveries: {
      id: string;
      invoiceNumber: string;
      merchandiseValue: number;
      orderInRoute: number;
      status: string;
      deliveredAt: string | null;
      productType: string;
      pharmacy: {
        id: string;
        name: string;
        address: string;
        phone: string;
      };
    }[];
  }[];
}

export default function DispatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadDispatch(p.id);
    });
  }, [params]);

  async function loadDispatch(dispatchId: string) {
    try {
      const response = await fetch(`/api/dispatches/${dispatchId}`);
      if (!response.ok) throw new Error("Error al cargar viaje");

      const data = await response.json();
      setDispatch(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: any = {
      scheduled: "#f59e0b",
      assigned: "#3b82f6",
      in_progress: "#8b5cf6",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  }

  function getStatusLabel(status: string) {
    const labels: any = {
      scheduled: "Programado",
      assigned: "Asignado",
      in_progress: "En Ruta",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  }

  function getDeliveryStatusLabel(status: string) {
    const labels: any = {
      pending: "Pendiente",
      loaded: "Cargado",
      in_transit: "En Tránsito",
      delivered: "Entregado",
      failed: "Fallido",
    };
    return labels[status] || status;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <div className="loading">Cargando viaje...</div>;
  }

  if (error || !dispatch) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="alert alert-error">{error || "Viaje no encontrado"}</div>
          <Link href="/dispatches" className="btn btn-secondary">
            ← Volver a Viajes
          </Link>
        </div>
      </div>
    );
  }

  const totalDeliveries = dispatch.pickups.reduce(
    (sum, p) => sum + p.deliveries.length,
    0
  );

  const completedDeliveries = dispatch.pickups.reduce(
    (sum, p) => sum + p.deliveries.filter((d) => d.status === "delivered").length,
    0
  );

  return (
    <div className="page-container">
      <div className="page-content">
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "32px" }}>
          <div>
            <Link href="/dispatches" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: "500", marginBottom: "12px", display: "inline-block" }}>
              ← Volver a Viajes
            </Link>
            <h1 className="page-title">🚚 {dispatch.dispatchNumber}</h1>
            <p className="page-subtitle">Detalles completos del viaje</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ padding: "8px 16px", background: getStatusColor(dispatch.status), color: "white", borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}>
              {getStatusLabel(dispatch.status)}
            </div>
            <Link href={`/dispatches/${id}/edit`} className="btn btn-primary">
              ✏️ Editar
            </Link>
          </div>
        </div>

        {/* INFORMACIÓN GENERAL */}
        <div className="card">
          <h2 className="card-title">📋 Información General</h2>
          <div className="grid-2">
            <div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: "500" }}>FECHA DE INICIO</p>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                📅 {formatDate(dispatch.scheduledStartDate)}
              </p>
              {dispatch.actualStartDate && (
                <p style={{ fontSize: "13px", color: "#10b981", marginTop: "4px" }}>
                  ✓ Iniciado: {formatDate(dispatch.actualStartDate)}
                </p>
              )}
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: "500" }}>FECHA DE FIN ESTIMADA</p>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                {dispatch.scheduledEndDate ? `📅 ${formatDate(dispatch.scheduledEndDate)}` : "No definida"}
              </p>
              {dispatch.actualEndDate && (
                <p style={{ fontSize: "13px", color: "#10b981", marginTop: "4px" }}>
                  ✓ Completado: {formatDate(dispatch.actualEndDate)}
                </p>
              )}
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: "500" }}>VEHÍCULO</p>
              {dispatch.vehicle ? (
                <Link href={`/vehicles/${dispatch.vehicle.id}`} style={{ textDecoration: "none" }}>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#3b82f6" }}>
                    🚚 {dispatch.vehicle.patent} - {dispatch.vehicle.brand} {dispatch.vehicle.model}
                  </p>
                </Link>
              ) : (
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#ef4444" }}>Sin asignar</p>
              )}
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: "500" }}>CONDUCTOR</p>
              {dispatch.driver ? (
                <div>
                  <Link href={`/drivers/${dispatch.driver.id}`} style={{ textDecoration: "none" }}>
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#3b82f6" }}>
                      👤 {dispatch.driver.name}
                    </p>
                  </Link>
                  <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    📞 {dispatch.driver.phone} | ✉️ {dispatch.driver.email}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#ef4444" }}>Sin asignar</p>
              )}
            </div>
          </div>

          {dispatch.generalNotes && (
            <div style={{ marginTop: "20px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", fontWeight: "600" }}>NOTAS GENERALES</p>
              <p style={{ fontSize: "14px", color: "#374151" }}>{dispatch.generalNotes}</p>
            </div>
          )}
        </div>

        {/* RESUMEN FINANCIERO */}
        <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "12px" }}>
            💰 Resumen Financiero del Viaje
          </h2>
          <div className="grid-2" style={{ gap: "20px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Valor Total Mercancía</p>
              <p style={{ fontSize: "32px", fontWeight: "700" }}>
                ${dispatch.totalMerchandiseValue.toLocaleString("es-CL")}
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Ingreso Total</p>
              <p style={{ fontSize: "32px", fontWeight: "700" }}>
                ${dispatch.totalIncome.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Laboratorios</p>
              <p style={{ fontSize: "32px", fontWeight: "700" }}>{dispatch.pickups.length}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Entregas</p>
              <p style={{ fontSize: "32px", fontWeight: "700" }}>
                {completedDeliveries}/{totalDeliveries}
              </p>
            </div>
          </div>
        </div>

        {/* PICKUPS Y DELIVERIES */}
        <div className="card">
          <h2 className="card-title">🏢 Laboratorios y Entregas</h2>

          {dispatch.pickups.map((pickup, index) => (
            <div key={pickup.id} style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              {/* HEADER DEL PICKUP */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#10b981", marginBottom: "8px" }}>
                    Pickup #{index + 1} - {pickup.laboratory.name}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    <p>📍 {pickup.pickupAddress}</p>
                    <p>📅 {formatDate(pickup.pickupDate)}</p>
                    {pickup.actualPickupTime && (
                      <p style={{ color: "#10b981", fontWeight: "600", marginTop: "4px" }}>
                        ✓ Recogido: {formatDate(pickup.actualPickupTime)}
                      </p>
                    )}
                    <p>📞 {pickup.laboratory.phone} | ✉️ {pickup.laboratory.email}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>Valor Mercancía</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                    ${pickup.merchandiseValue.toLocaleString("es-CL")}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>Costo ({pickup.percentageApplied}%)</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>
                    ${pickup.dispatchCost.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {pickup.pickupNotes && (
                <div style={{ padding: "12px", background: "#fef3c7", borderRadius: "8px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", color: "#92400e" }}>📝 {pickup.pickupNotes}</p>
                </div>
              )}

              {/* DELIVERIES DEL PICKUP */}
              <div style={{ background: "white", borderRadius: "10px", padding: "20px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#374151" }}>
                  📦 Entregas ({pickup.deliveries.length})
                </h4>

                {pickup.deliveries.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                    No hay entregas registradas para este laboratorio
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {pickup.deliveries
                      .sort((a, b) => a.orderInRoute - b.orderInRoute)
                      .map((delivery) => (
                        <div
                          key={delivery.id}
                          style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                              <span style={{ background: "#3b82f6", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>
                                {delivery.orderInRoute || "?"}
                              </span>
                              <div>
                                <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "2px" }}>
                                  {delivery.pharmacy.name}
                                </p>
                                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                                  📍 {delivery.pharmacy.address}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#6b7280", marginLeft: "40px" }}>
                              <span>📄 Factura: <strong>{delivery.invoiceNumber}</strong></span>
                              <span>💵 ${delivery.merchandiseValue.toLocaleString("es-CL")}</span>
                              <span>📦 {delivery.productType}</span>
                            </div>
                            {delivery.deliveredAt && (
                              <p style={{ fontSize: "12px", color: "#10b981", marginTop: "6px", marginLeft: "40px", fontWeight: "600" }}>
                                ✓ Entregado: {formatDate(delivery.deliveredAt)}
                              </p>
                            )}
                          </div>
                          <div>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: delivery.status === "delivered" ? "#d1fae5" : delivery.status === "in_transit" ? "#dbeafe" : "#f3f4f6",
                                color: delivery.status === "delivered" ? "#065f46" : delivery.status === "in_transit" ? "#1e40af" : "#6b7280",
                              }}
                            >
                              {getDeliveryStatusLabel(delivery.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Link href="/dispatches" className="btn btn-secondary">
            ← Volver a Lista
          </Link>
          <Link href={`/dispatches/${id}/edit`} className="btn btn-primary">
            ✏️ Editar Viaje
          </Link>
        </div>
      </div>
    </div>
  );
}
