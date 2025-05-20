import { useEffect, useState } from "react";
import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";

interface VentaPeriodo {
  periodo: string;
  ventas: number;
}

interface DatosPeriodo {
  mensual: VentaPeriodo[];
  semanal: VentaPeriodo[];
  diario: VentaPeriodo[];
}

export function useVentasPorPeriodo() {
  const [datos, setDatos] = useState<DatosPeriodo>({
    mensual: [],
    semanal: [],
    diario: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(false);

        const [mensualRes, semanalRes, diarioRes] = await Promise.all([
          fetch(`${SERVICIOS_DASHBOARD.ventasPorPeriodo}?tipo=mensual`),
          fetch(`${SERVICIOS_DASHBOARD.ventasPorPeriodo}?tipo=semanal`),
          fetch(`${SERVICIOS_DASHBOARD.ventasPorPeriodo}?tipo=diario`),
        ]);

        if (!mensualRes.ok || !semanalRes.ok || !diarioRes.ok) {
          throw new Error("Error en la obtención de datos");
        }

        const [mensual, semanal, diario] = await Promise.all([
          mensualRes.json(),
          semanalRes.json(),
          diarioRes.json(),
        ]);

        setDatos({ mensual, semanal, diario });
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return { datos, loading, error };
}
