"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const linkStyle = (path: string) => ({
    padding: "12px 20px",
    color: isActive(path) ? "#3b82f6" : "#374151",
    textDecoration: "none",
    fontWeight: isActive(path) ? "600" : "500",
    fontSize: "14px",
    borderBottom: isActive(path) ? "2px solid #3b82f6" : "2px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ padding: "16px 0", textDecoration: "none", fontSize: "20px", fontWeight: "700", color: "#111827" }}>
          🚚 LOGITAP
        </Link>

        <div style={{ display: "flex", gap: "4px" }}>
          <Link href="/dispatches" style={linkStyle("/dispatches")}>
            Viajes
          </Link>
          <Link href="/vehicles" style={linkStyle("/vehicles")}>
            Vehículos
          </Link>
          <Link href="/drivers" style={linkStyle("/drivers")}>
            Conductores
          </Link>
          <Link href="/laboratories" style={linkStyle("/laboratories")}>
            Laboratorios
          </Link>
          <Link href="/pharmacies" style={linkStyle("/pharmacies")}>
            Farmacias
          </Link>
        </div>
      </div>
    </nav>
  );
}
