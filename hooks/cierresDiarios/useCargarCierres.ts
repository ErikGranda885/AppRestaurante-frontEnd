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

export function useCargarCierres({ estadoSeleccionado, setCierres, dateRange }: Props) {
  useEffect(() => {
    const cargar = async () => {
      try {
        let datos: ICierreDiario[] = [];

        const desde = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
        const hasta = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

        const queryParams = new URLSearchParams();
        if (desde && hasta) {
          queryParams.append("desde", desde);
          queryParams.append("hasta", hasta);
        }

        if (estadoSeleccionado === "por cerrar") {
          const res = await fetch(`${SERVICIOS_CIERRES.listarPorCerrar}?${queryParams.toString()}`);
          datos = await res.json();
        } else {
          const estadoBackend = estadoSeleccionado === "pendientes" ? "pendiente" : estadoSeleccionado;
          queryParams.append("estado", estadoBackend);
          const res = await fetch(`${SERVICIOS_CIERRES.listarCierres}?${queryParams.toString()}`);
          datos = await res.json();
        }

        setCierres(datos);
      } catch (err) {
        console.error("Error cargando cierres:", err);
      }
    };

    cargar();
  }, [estadoSeleccionado, setCierres, dateRange]);
}
