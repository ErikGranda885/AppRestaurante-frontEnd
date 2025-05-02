// hooks/cierresDiarios/useMovimientosDelDia.ts
import { useEffect, useState } from "react";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";

export const useMovimientosDelDia = (fecha: string) => {
  const [movimientos, setMovimientos] = useState({
    ventas: [],
    gastos: [],
    compras: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fecha) return;

    const cargarMovimientos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(SERVICIOS_CIERRES.movimientosDelDia(fecha));

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        setMovimientos(data);
      } catch (err) {
        console.error("Error al cargar movimientos del día:", err);
        setMovimientos({ ventas: [], gastos: [], compras: [] });
      } finally {
        setIsLoading(false);
      }
    };

    cargarMovimientos();
  }, [fecha]);

  return { movimientos, isLoading };
};
