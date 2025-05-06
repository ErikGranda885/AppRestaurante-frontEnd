import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";
import { useEffect, useState } from "react";

interface PeriodoVenta {
  periodo: string;
  ventas: number;
}

interface VentasPeriodoResponse {
  mensual: PeriodoVenta[];
  semanal: PeriodoVenta[];
  diario: PeriodoVenta[];
}

export function useVentasPorPeriodo() {
  const [datos, setDatos] = useState<VentasPeriodoResponse>({
    mensual: [],
    semanal: [],
    diario: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SERVICIOS_DASHBOARD.ventasPorPeriodo)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los datos");
        return res.json();
      })
      .then((data) => {
        setDatos(data);
      })
      .catch((err) => {
        console.error("Error al cargar ventas por período:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { datos, loading };
}
