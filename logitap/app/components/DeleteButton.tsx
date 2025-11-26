"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  itemId: string;
  itemName: string;
  itemType: "dispatch" | "vehicle" | "driver" | "laboratory" | "pharmacy";
  redirectTo?: string;
  onSuccess?: () => void;
}

export default function DeleteButton({
  itemId,
  itemName,
  itemType,
  redirectTo,
  onSuccess,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const typeLabels: any = {
    dispatch: "viaje",
    vehicle: "vehículo",
    driver: "conductor",
    laboratory: "laboratorio",
    pharmacy: "farmacia",
  };

  const typeApis: any = {
    dispatch: "dispatches",
    vehicle: "vehicles",
    driver: "drivers",
    laboratory: "laboratories",
    pharmacy: "pharmacies",
  };

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar ${typeLabels[itemType]} "${itemName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/${typeApis[itemType]}/${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar");
      }

      alert(data.message || "Eliminado correctamente");

      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(`/${typeApis[itemType]}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn"
      style={{ fontSize: "14px", background: "#ef4444", color: "white" }}
    >
      {loading ? "Eliminando..." : "🗑️ Eliminar"}
    </button>
  );
}
