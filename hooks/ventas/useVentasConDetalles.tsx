import { useEffect, useState, useCallback } from "react";
import { IVentaDetalle } from "@/lib/types";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
import { useSocket } from "@/hooks/useSocket";

export const useVentasConDetalles = () => {
  const [ventas, setVentas] = useState<IVentaDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVentas = useCallback(async () => {
    try {
      const res = await fetch(SERVICIOS_VENTAS.ventasConDetalles);
      if (!res.ok) {
        throw new Error("Error al obtener ventas");
      }
      const data = await res.json();
      setVentas(data);
    } catch (err: any) {
      console.error("Error al cargar ventas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  // 🔌 Actualización en tiempo real por socket
  useSocket("ventas-actualizadas", () => {
    console.log("🔁 Revalidando ventas desde socket");
    fetchVentas();
  });

  return { ventas, loading, error };
};
