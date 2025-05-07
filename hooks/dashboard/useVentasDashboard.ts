import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";
import { useCallback, useEffect, useState } from "react";

interface Venta {
  id_vent: number;
  usuario: string;
  total: number;
  fecha: string;
  metodo_pago?: string;
  estado?: string;
}

interface VentaTransferencia extends Venta {
  comprobante: string;
  imagen: string;
}

export const useVentasDashboard = () => {
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);
  const [ventasPendientes, setVentasPendientes] = useState<
    VentaTransferencia[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // <-- estado de error

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(false); // <-- reset de error antes de intentar fetch

    try {
      const [resUltimas, resPendientes] = await Promise.all([
        fetch(SERVICIOS_DASHBOARD.ultimasVentasRealizadas()).then((res) => {
          if (!res.ok) throw new Error("Error en ultimas ventas");
          return res.json();
        }),
        fetch(SERVICIOS_DASHBOARD.ventasPorTransferenciaPendientes).then(
          (res) => {
            if (!res.ok) throw new Error("Error en ventas pendientes");
            return res.json();
          },
        ),
      ]);

      setUltimasVentas(resUltimas);
      setVentasPendientes(resPendientes);
    } catch (error) {
      setError(true); // <-- marcar error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  return {
    ultimasVentas,
    ventasPendientes,
    loading,
    error,
    refresh: fetchVentas,
  };
};
