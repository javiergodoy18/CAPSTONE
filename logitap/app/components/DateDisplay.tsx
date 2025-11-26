"use client";

import { useState, useEffect } from "react";

interface DateDisplayProps {
  dateString: string;
  format?: "short" | "long" | "time";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component to safely display dates without hydration errors
 * Uses mounted state pattern to ensure client-side rendering
 */
export default function DateDisplay({
  dateString,
  format = "long",
  className,
  style,
}: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return <span className={className} style={style}>Cargando...</span>;
  }

  // Format date on client side only
  const date = new Date(dateString);

  let formattedDate = "";

  switch (format) {
    case "short":
      // Format: 15 Ene 2024
      formattedDate = date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      break;

    case "long":
      // Format: 15 Ene 2024, 14:30
      formattedDate = date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      break;

    case "time":
      // Format: 14:30
      formattedDate = date.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
      break;

    default:
      formattedDate = date.toLocaleDateString("es-CL");
  }

  return (
    <span className={className} style={style}>
      {formattedDate}
    </span>
  );
}
