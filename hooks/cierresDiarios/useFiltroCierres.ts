"use client";

import { ICierreDiario } from "@/lib/types";

interface FiltroCierresOptions {
  cierres: (ICierreDiario & { pendiente?: boolean })[];
  estadoSeleccionado: string;
}

export function useFiltroCierres({
  cierres,
  estadoSeleccionado,
}: FiltroCierresOptions) {
  if (estadoSeleccionado === "pendientes") {
    return cierres.filter((cierre) => cierre.esta_cier === "pendiente");
  } else if (estadoSeleccionado === "cerrados") {
    return cierres.filter((cierre) => cierre.esta_cier === "cerrado");
  } else if (estadoSeleccionado === "diferencia") {
    return cierres.filter((cierre) => cierre.dif_cier !== 0);
  }

  return cierres; // Todos si no hay filtro
}
