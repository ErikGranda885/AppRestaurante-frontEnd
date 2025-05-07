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

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    try {
      const [resUltimas, resPendientes] = await Promise.all([
        fetch(SERVICIOS_DASHBOARD.ultimasVentasRealizadas()).then((res) =>
          res.json(),
        ),
        fetch(SERVICIOS_DASHBOARD.ventasPorTransferenciaPendientes).then(
          (res) => res.json(),
        ),
      ]);

      setUltimasVentas(resUltimas);
      setVentasPendientes(resPendientes);
    } catch (error) {
      console.error("Error al obtener ventas del dashboard:", error);
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
    refresh: fetchVentas,
  };
};
