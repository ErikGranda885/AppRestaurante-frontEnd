import { useEffect, useState, useCallback } from "react";
import { IVentaDetalle } from "@/lib/types";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
import { useSocket } from "@/hooks/useSocket";
import { ToastError } from "@/components/shared/toast/toastError";

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
      setError(null); // limpia error si la siguiente carga es exitosa
    } catch (err: any) {
      setError(err.message);
      ToastError({
        message: "No se puede conectar con el servidor, intentalo mas tarde",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  // ✅ Revalidación automática por socket
  const handleVentasActualizadas = useCallback(() => {
    console.log("🔁 Revalidando ventas desde socket");
    fetchVentas();
  }, [fetchVentas]);

  useSocket("ventas-actualizadas", handleVentasActualizadas);

  return {
    ventas,
    loading,
    error,
    refetchVentas: fetchVentas, // ← lo expones así
  };
};
