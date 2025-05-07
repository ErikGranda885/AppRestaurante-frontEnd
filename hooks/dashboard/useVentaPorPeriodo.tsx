import { useEffect, useState } from "react";
import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";
import { ToastError } from "@/components/shared/toast/toastError";

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

        const res = await fetch(SERVICIOS_DASHBOARD.ventasPorPeriodo);
        if (!res.ok) throw new Error("Error en fetch");

        const data = await res.json();
        setDatos(data);
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
