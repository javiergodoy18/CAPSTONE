"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Dispatch {
  id: string;
  dispatchNumber: string;
  scheduledStartDate: string;
  scheduledEndDate: string | null;
  status: string;
  totalMerchandiseValue: number;
  totalIncome: number;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
  } | null;
  driver: {
    name: string;
  } | null;
  pickups: {
    id: string;
    laboratory: {
      name: string;
    };
    deliveries: any[];
  }[];
}

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, scheduled, in_progress, completed

  useEffect(() => {
    loadDispatches();
  }, []);

  async function loadDispatches() {
    try {
      const response = await fetch("/api/dispatches");
      if (!response.ok) throw new Error("Error al cargar viajes");
      const data = await response.json();
      setDispatches(data);
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

  const filteredDispatches = dispatches.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>Cargando viajes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0" }}>
            Viajes / Despachos
          </h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
            Gestiona todos los viajes de transporte
          </p>
        </div>
        <Link
          href="/dispatches/new"
          style={{ padding: "12px 24px", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "600", fontSize: "16px" }}
        >
          ➕ Crear Nuevo Viaje
        </Link>
      </div>

      {error && (
        <div style={{ padding: "16px", background: "#fee", border: "1px solid #fcc", borderRadius: "8px", color: "#c00", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {/* FILTROS */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{ padding: "8px 16px", background: filter === "all" ? "#3b82f6" : "#f3f4f6", color: filter === "all" ? "white" : "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}
          >
            Todos ({dispatches.length})
          </button>
          <button
            onClick={() => setFilter("scheduled")}
            style={{ padding: "8px 16px", background: filter === "scheduled" ? "#f59e0b" : "#f3f4f6", color: filter === "scheduled" ? "white" : "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}
          >
            Programados ({dispatches.filter((d) => d.status === "scheduled").length})
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            style={{ padding: "8px 16px", background: filter === "in_progress" ? "#8b5cf6" : "#f3f4f6", color: filter === "in_progress" ? "white" : "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}
          >
            En Ruta ({dispatches.filter((d) => d.status === "in_progress").length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            style={{ padding: "8px 16px", background: filter === "completed" ? "#10b981" : "#f3f4f6", color: filter === "completed" ? "white" : "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}
          >
            Completados ({dispatches.filter((d) => d.status === "completed").length})
          </button>
        </div>
      </div>

      {/* LISTA DE VIAJES */}
      {filteredDispatches.length === 0 && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "60px", textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#9ca3af", margin: 0 }}>
            {filter === "all"
              ? "No hay viajes registrados. Crea tu primer viaje."
              : `No hay viajes con estado "${getStatusLabel(filter)}"`}
          </p>
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredDispatches.map((dispatch) => {
          const totalDeliveries = dispatch.pickups.reduce(
            (sum, p) => sum + p.deliveries.length,
            0
          );

          return (
            <Link
              key={dispatch.id}
              href={`/dispatches/${dispatch.id}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", cursor: "pointer", transition: "all 0.2s", ":hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                {/* HEADER DEL VIAJE */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0", color: "#111827" }}>
                      🚚 {dispatch.dispatchNumber}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6b7280" }}>
                      <span>📅 {formatDate(dispatch.scheduledStartDate)}</span>
                      {dispatch.scheduledEndDate && (
                        <>
                          <span>→</span>
                          <span>{formatDate(dispatch.scheduledEndDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "6px 12px", background: getStatusColor(dispatch.status), color: "white", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    {getStatusLabel(dispatch.status)}
                  </div>
                </div>

                {/* INFORMACIÓN DEL VIAJE */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 4px 0", fontWeight: "500" }}>VEHÍCULO</p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0, fontWeight: "600" }}>
                      {dispatch.vehicle
                        ? `${dispatch.vehicle.plate} - ${dispatch.vehicle.brand} ${dispatch.vehicle.model}`
                        : "Sin asignar"}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 4px 0", fontWeight: "500" }}>CONDUCTOR</p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0, fontWeight: "600" }}>
                      {dispatch.driver ? dispatch.driver.name : "Sin asignar"}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 4px 0", fontWeight: "500" }}>LABORATORIOS</p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0, fontWeight: "600" }}>
                      {dispatch.pickups.length} laboratorios
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 4px 0", fontWeight: "500" }}>ENTREGAS</p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0, fontWeight: "600" }}>
                      {totalDeliveries} entregas
                    </p>
                  </div>
                </div>

                {/* LABORATORIOS */}
                <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0", fontWeight: "600" }}>
                    LABORATORIOS EN ESTE VIAJE:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {dispatch.pickups.map((pickup) => (
                      <span
                        key={pickup.id}
                        style={{ padding: "4px 10px", background: "#10b981", color: "white", borderRadius: "4px", fontSize: "12px", fontWeight: "500" }}
                      >
                        {pickup.laboratory.name} ({pickup.deliveries.length} entregas)
                      </span>
                    ))}
                  </div>
                </div>

                {/* FINANCIERO */}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>Valor Mercancía</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#374151", margin: 0 }}>
                      ${dispatch.totalMerchandiseValue.toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>Ingreso Total</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#10b981", margin: 0 }}>
                      ${dispatch.totalIncome.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
