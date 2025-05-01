import { useEffect } from "react";
import { ICierreDiario } from "@/lib/types";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";

interface Props {
  estadoSeleccionado: string;
  setCierres: (cierres: ICierreDiario[]) => void;
}

export function useCargarCierres({ estadoSeleccionado, setCierres }: Props) {
  useEffect(() => {
    const cargar = async () => {
      try {
        let datos: ICierreDiario[] = [];

        if (estadoSeleccionado === "cerrado") {
          const res = await fetch(SERVICIOS_CIERRES.listarCerrados);
          datos = await res.json();
        } else if (estadoSeleccionado === "pendientes") {
          const res = await fetch(SERVICIOS_CIERRES.listarPendientes);
          datos = await res.json();
        } else if (estadoSeleccionado === "por cerrar") {
          const res = await fetch(SERVICIOS_CIERRES.listarPorCerrar);
          datos = await res.json();
        }

        setCierres(datos);
      } catch (err) {
        console.error("Error cargando cierres:", err);
      }
    };

    cargar();
  }, [estadoSeleccionado, setCierres]);
}
