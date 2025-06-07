import { useState } from "react";
import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { mutate } from "swr";

export function useEliminarReceta() {
  const [loading, setLoading] = useState(false);

  const eliminarReceta = async (id_receta: number, onSuccess?: () => void) => {
    const startTime = performance.now(); // ⏱️ Inicio
    setLoading(true);

    try {
      const res = await fetch(SERVICIOS_RECETAS.eliminar(id_receta), {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar receta");
      }

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      ToastSuccess({
        message: `Receta eliminada con éxito en ${duration} segundos.`,
      });

      mutate(SERVICIOS_RECETAS.listar);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      ToastError({ message: error.message || "Error inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return { eliminarReceta, loading };
}
