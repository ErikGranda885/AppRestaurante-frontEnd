import { useEffect, useState } from "react";
import { ICierreDiario, IResumenDelDia } from "@/lib/types";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";

export function useResumenPendiente(
  fechaActual: string,
  estadoSeleccionado: string,
  lista: ICierreDiario[],
) {
  const [resumenPendiente, setResumenPendiente] =
    useState<IResumenDelDia | null>(null);

  // No aplicar ajuste de zona horaria nuevamente
  const fechaLocal = fechaActual; // Ya viene normalizada desde el componente

  useEffect(() => {
    const yaExisteHoy = lista.some((cierre) => {
      const fechaCierre = new Date(cierre.fech_cier)
        .toLocaleDateString("en-CA")
        .replace(/-/g, "/");
      return fechaCierre === fechaLocal && cierre.id_cier !== 0;
    });

    if (estadoSeleccionado !== "por cerrar" || yaExisteHoy) {
      setResumenPendiente(null);
      return;
    }

    const obtenerResumen = async () => {
      try {
        const res = await fetch(SERVICIOS_CIERRES.movimientosDelDia(fechaLocal));
        const data = await res.json();
        setResumenPendiente(data);
      } catch (error) {
        console.error("Error al obtener movimientos del día:", error);
        setResumenPendiente(null);
      }
    };

    obtenerResumen();
  }, [fechaActual, estadoSeleccionado, lista]);

  return { resumenPendiente };
}
