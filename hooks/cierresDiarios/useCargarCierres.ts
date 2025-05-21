// hooks/cierresDiarios/useCargarCierres.ts
import { useEffect } from "react";
import { ICierreDiario } from "@/lib/types";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface Props {
  estadoSeleccionado: string;
  setCierres: (cierres: ICierreDiario[]) => void;
  dateRange?: DateRange;
}

export function useCargarCierres({
  estadoSeleccionado,
  setCierres,
  dateRange,
}: Props) {
  useEffect(() => {
    const cargar = async () => {
      try {
        let datos: ICierreDiario[] = [];

        const estado = estadoSeleccionado?.toLowerCase().trim(); // normalizado
        const queryParams = new URLSearchParams();

        // Solo incluir fechas si el estado es 'cerrado'
        if (estado === "cerrado" && dateRange?.from && dateRange?.to) {
          const desde = format(dateRange.from, "yyyy-MM-dd");
          const hasta = format(dateRange.to, "yyyy-MM-dd");
          queryParams.append("desde", desde);
          queryParams.append("hasta", hasta);
        }

        if (!estado) {
          // Sin filtro
          const res = await fetch(
            `${SERVICIOS_CIERRES.listarCierres}?${queryParams.toString()}`,
          );
          datos = await res.json();
        } else if (estado === "por cerrar") {
          const res = await fetch(
            `${SERVICIOS_CIERRES.listarPorCerrar}?${queryParams.toString()}`,
          );
          datos = await res.json();
        } else {
          // pendientes o cerrado
          queryParams.append(
            "estado",
            estado === "pendientes" ? "pendiente" : estado,
          );
          const res = await fetch(
            `${SERVICIOS_CIERRES.listarCierres}?${queryParams.toString()}`,
          );
          datos = await res.json();
        }

        setCierres(datos);
      } catch (err) {
        console.error("❌ Error cargando cierres:", err);
        setCierres([]);
      }
    };

    cargar();
  }, [estadoSeleccionado, setCierres, dateRange]);
}
