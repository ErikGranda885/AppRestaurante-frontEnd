import { ICierreDiario } from "@/lib/types";
import { useMemo } from "react";

export function useResumenCierres(cierres: ICierreDiario[]) {
  return useMemo(() => {
    let disponible = 0;
    let depositado = 0;
    let diferencia = 0;
    let cantidad = 0;

    for (const cierre of cierres) {
      const ventas = Number(cierre.tot_vent_cier ?? 0);
      const gastos = Number(cierre.tot_gas_cier ?? 0);
      const comprasPagadas = Number(cierre.tot_compras_pag_cier ?? 0);
      const depositos = Number(cierre.tot_dep_cier ?? 0);
      const dif = Number(cierre.dif_cier ?? 0);

      disponible += ventas - gastos - comprasPagadas;
      depositado += depositos;
      diferencia += dif;
      cantidad += 1;
    }

    return {
      totalDisponible: disponible,
      totalDepositado: depositado,
      diferenciaTotal: diferencia,
      numeroCierres: cantidad,
    };
  }, [cierres]);
}
