import { useMemo } from "react";
import { ICierreDiario } from "@/lib/types";

export function useListaCierres(
  cierres: ICierreDiario[],
  resumenPendiente: any,
  fechaActual: string,
  estadoSeleccionado: string,
) {
  return useMemo(() => {
    const base = [...cierres];
    const fechaLocal = fechaActual.replace(/-/g, "/");

    const existePendienteHoy = cierres.some((cierre) => {
      const fechaCierre = String(cierre.fech_cier)
        .slice(0, 10)
        .replace(/-/g, "/");
      const estado = String(cierre.esta_cier).toLowerCase();
      return fechaCierre === fechaLocal && estado === "pendiente";
    });

    return base;
  }, [cierres, resumenPendiente, fechaActual, estadoSeleccionado]);
}
