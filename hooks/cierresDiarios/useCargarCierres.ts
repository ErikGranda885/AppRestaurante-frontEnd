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

        if (estadoSeleccionado === "por cerrar") {
          const res = await fetch(SERVICIOS_CIERRES.listarPorCerrar);
          datos = await res.json();
        } else {
          const estadoBackend =
            estadoSeleccionado === "pendientes"
              ? "pendiente"
              : estadoSeleccionado;
          const res = await fetch(
            `${SERVICIOS_CIERRES.listarCierres}?estado=${estadoBackend}`,
          );
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
