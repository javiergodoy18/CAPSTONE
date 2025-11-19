"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  dispatches: {
    active: number;
    scheduled: number;
    completed_today: number;
    total_month: number;
  };
  resources: {
    vehicles_available: number;
    vehicles_in_use: number;
    drivers_available: number;
    drivers_busy: number;
  };
  financials: {
    today_income: number;
    month_income: number;
  };
}

interface ActiveDispatch {
  id: string;
  dispatchNumber: string;
  status: string;
  vehicle: { patent: string; brand: string; model: string } | null;
  driver: { name: string } | null;
  scheduledStartDate: string;
  totalIncome: number;
  pickups: {
    laboratory: { name: string };
    deliveries: any[];
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeDispatches, setActiveDispatches] = useState<ActiveDispatch[]>([]);
  const [upcomingDispatches, setUpcomingDispatches] = useState<ActiveDispatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Cargar todos los despachos
      const dispatchesRes = await fetch("/api/dispatches");
      const allDispatches = await dispatchesRes.json();

      // Cargar vehículos y conductores
      const [vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);
      const vehicles = await vehiclesRes.json();
      const drivers = await driversRes.json();

      // Calcular estadísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const active = allDispatches.filter(
        (d: any) => d.status === "in_progress" || d.status === "assigned"
      );
      const scheduled = allDispatches.filter((d: any) => d.status === "scheduled");
      const completedToday = allDispatches.filter(
        (d: any) =>
          d.status === "completed" &&
          d.actualEndDate &&
          new Date(d.actualEndDate) >= today
      );
      const completedMonth = allDispatches.filter(
        (d: any) =>
          d.status === "completed" &&
          d.actualEndDate &&
          new Date(d.actualEndDate) >= monthStart
      );

      const todayIncome = completedToday.reduce(
        (sum: number, d: any) => sum + (d.totalIncome || 0),
        0
      );
      const monthIncome = completedMonth.reduce(
        (sum: number, d: any) => sum + (d.totalIncome || 0),
        0
      );

      const vehiclesAvailable = vehicles.filter(
        (v: any) => v.status === "available"
      ).length;
      const vehiclesInUse = vehicles.filter((v: any) => v.status === "in_use").length;
      const driversAvailable = drivers.filter(
        (d: any) => d.status === "available"
      ).length;
      const driversBusy = drivers.filter((d: any) => d.status === "busy").length;

      setStats({
        dispatches: {
          active: active.length,
          scheduled: scheduled.length,
          completed_today: completedToday.length,
          total_month: completedMonth.length,
        },
        resources: {
          vehicles_available: vehiclesAvailable,
          vehicles_in_use: vehiclesInUse,
          drivers_available: driversAvailable,
          drivers_busy: driversBusy,
        },
        financials: {
          today_income: todayIncome,
          month_income: monthIncome,
        },
      });

      // Separar viajes activos y próximos
      const upcoming = scheduled
        .filter((d: any) => new Date(d.scheduledStartDate) > now)
        .sort(
          (a: any, b: any) =>
            new Date(a.scheduledStartDate).getTime() -
            new Date(b.scheduledStartDate).getTime()
        )
        .slice(0, 5);

      setActiveDispatches(active.slice(0, 3));
      setUpcomingDispatches(upcoming);
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: "1400px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="page-title">🏠 Dashboard Principal</h1>
          <p className="page-subtitle">
            Resumen ejecutivo de operaciones - {new Date().toLocaleDateString("es-CL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>

        {/* KPIs PRINCIPALES */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Viajes Activos</p>
              <p style={{ fontSize: "48px", fontWeight: "700", margin: "8px 0" }}>
                {stats.dispatches.active}
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>En ruta ahora</p>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", border: "none" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Programados</p>
              <p style={{ fontSize: "48px", fontWeight: "700", margin: "8px 0" }}>
                {stats.dispatches.scheduled}
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>Próximos viajes</p>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", border: "none" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Completados Hoy</p>
              <p style={{ fontSize: "48px", fontWeight: "700", margin: "8px 0" }}>
                {stats.dispatches.completed_today}
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>Viajes finalizados</p>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white", border: "none" }}>
              <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Ingresos Hoy</p>
              <p style={{ fontSize: "48px", fontWeight: "700", margin: "8px 0" }}>
                ${stats.financials.today_income.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>
                Total mes: ${stats.financials.month_income.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}

        {/* VIAJES ACTIVOS */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>🚚 Viajes Activos (En Ruta)</h2>
            <Link href="/dispatches" style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>
              Ver todos →
            </Link>
          </div>

          {activeDispatches.length === 0 ? (
            <div className="empty-state">No hay viajes activos en este momento</div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {activeDispatches.map((dispatch) => {
                const totalDeliveries = dispatch.pickups.reduce(
                  (sum, p) => sum + p.deliveries.length,
                  0
                );
                const completedDeliveries = dispatch.pickups.reduce(
                  (sum, p) => sum + p.deliveries.filter((d: any) => d.status === "delivered").length,
                  0
                );

                return (
                  <Link
                    key={dispatch.id}
                    href={`/dispatches/${dispatch.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{ background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                            🚚 {dispatch.dispatchNumber}
                          </h3>
                          <p style={{ fontSize: "14px", color: "#6b7280" }}>
                            {dispatch.vehicle
                              ? `${dispatch.vehicle.patent} - ${dispatch.vehicle.brand} ${dispatch.vehicle.model}`
                              : "Sin vehículo"}{" "}
                            | {dispatch.driver ? dispatch.driver.name : "Sin conductor"}
                          </p>
                        </div>
                        <div style={{ padding: "6px 12px", background: "#8b5cf6", color: "white", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                          En Ruta
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
                        <span>🏢 {dispatch.pickups.length} laboratorios</span>
                        <span>📦 Progreso: {completedDeliveries}/{totalDeliveries} entregas</span>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>
                          💰 ${dispatch.totalIncome.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div style={{ background: "white", borderRadius: "8px", padding: "12px" }}>
                        <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px", textAlign: "center" }}>
                          {totalDeliveries > 0
                            ? `${Math.round((completedDeliveries / totalDeliveries) * 100)}% completado`
                            : "Sin entregas"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* PRÓXIMOS VIAJES */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>📅 Próximos Viajes Programados</h2>
            <Link href="/dispatches/new" className="btn btn-success">
              ➕ Crear Nuevo Viaje
            </Link>
          </div>

          {upcomingDispatches.length === 0 ? (
            <div className="empty-state">No hay viajes programados próximamente</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {upcomingDispatches.map((dispatch) => {
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
                    <div
                      style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef3c7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fffbeb";
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                          🚚 {dispatch.dispatchNumber}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#6b7280" }}>
                          📅 {formatDate(dispatch.scheduledStartDate)} | 🏢 {dispatch.pickups.length} labs | 📦{" "}
                          {totalDeliveries} entregas
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "12px", color: "#92400e", marginBottom: "4px" }}>Ingreso Estimado</p>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
                          ${dispatch.totalIncome.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* RECURSOS DISPONIBLES */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div className="card">
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#374151" }}>
                🚚 Vehículos
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#6b7280" }}>Disponibles</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                  {stats.resources.vehicles_available}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ color: "#6b7280" }}>En uso</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                  {stats.resources.vehicles_in_use}
                </span>
              </div>
              <Link href="/vehicles" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
                Gestionar Vehículos
              </Link>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#374151" }}>
                👥 Conductores
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#6b7280" }}>Disponibles</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                  {stats.resources.drivers_available}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ color: "#6b7280" }}>Ocupados</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                  {stats.resources.drivers_busy}
                </span>
              </div>
              <Link href="/drivers" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
                Gestionar Conductores
              </Link>
            </div>
          </div>
        )}

        {/* ACCIONES RÁPIDAS */}
        <div className="card">
          <h2 className="card-title">⚡ Acciones Rápidas</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <Link href="/dispatches/new" className="btn btn-success" style={{ padding: "16px", fontSize: "15px" }}>
              ➕ Crear Nuevo Viaje
            </Link>
            <Link href="/vehicles/new" className="btn btn-primary" style={{ padding: "16px", fontSize: "15px" }}>
              🚚 Nuevo Vehículo
            </Link>
            <Link href="/drivers/new" className="btn btn-primary" style={{ padding: "16px", fontSize: "15px" }}>
              👤 Nuevo Conductor
            </Link>
            <Link href="/laboratories/new" className="btn btn-primary" style={{ padding: "16px", fontSize: "15px" }}>
              🏢 Nuevo Laboratorio
            </Link>
            <Link href="/pharmacies/new" className="btn btn-primary" style={{ padding: "16px", fontSize: "15px" }}>
              🏪 Nueva Farmacia
            </Link>
            <Link href="/dispatches" className="btn btn-secondary" style={{ padding: "16px", fontSize: "15px" }}>
              📊 Ver Todos los Viajes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
