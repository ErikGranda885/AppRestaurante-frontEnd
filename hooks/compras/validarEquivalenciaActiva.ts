import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";

export const validarEquivalenciaActiva = async (
  productoId: number,
  tipo: string | undefined, // ✅ Ajustado aquí
  setBloquear: (valor: boolean) => void,
  setEquivalencia?: (unidad: string) => void,
) => {
  if (tipo !== "Insumo") {
    setBloquear(false);
    return;
  }

  try {
    const res = await fetch(SERVICIOS_EQUIVALENCIAS.activa(productoId));
    if (!res.ok) {
      setBloquear(true);
      ToastError({ message: "Este insumo no tiene una equivalencia activa" });
      return;
    }

    const data = await res.json();
    if (data && setEquivalencia) {
      setEquivalencia(data.und_prod_equiv);
    }

    setBloquear(false);
  } catch (error) {
    setBloquear(true);
    console.error("Error al validar equivalencia:", error);
  }
};
