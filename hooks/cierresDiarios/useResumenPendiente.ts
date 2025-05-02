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

  // Ya viene en formato "yyyy-MM-dd"
  const fechaLocal = fechaActual;

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
        const res = await fetch(
          SERVICIOS_CIERRES.movimientosDelDia(fechaLocal),
        );
        const data = await res.json();

        console.log("Resumen del día:", data); // 👈 Revisa esto en consola

        // Validar que los campos existan y sean numéricos
        if (
          data &&
          typeof data.totalVentas === "number" &&
          typeof data.totalGastos === "number" &&
          typeof data.totalComprasPagadas === "number" &&
          typeof data.totalDepositado === "number"
        ) {
          setResumenPendiente(data as IResumenDelDia);
        } else {
          setResumenPendiente(null);
          console.warn("Datos de resumen no válidos:", data);
        }
      } catch (error) {
        console.error("Error al obtener movimientos del día:", error);
        setResumenPendiente(null);
      }
    };

    obtenerResumen();
  }, [fechaActual, estadoSeleccionado, lista]);

  return { resumenPendiente };
}
