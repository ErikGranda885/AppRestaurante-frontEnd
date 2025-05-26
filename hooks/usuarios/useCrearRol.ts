// hooks/useCrearRol.ts
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { IRol } from "@/lib/types";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";

export interface CrearRolPayload {
  values: { nom_rol: string; desc_rol: string };
  onSuccess?: (rol: IRol) => void;
  onClose?: () => void;
  resetForm?: () => void;
}

export function useCrearRol() {
  const crearRol = async ({
    values,
    onSuccess,
    onClose,
    resetForm,
  }: CrearRolPayload) => {
    try {
      const res = await fetch(SERVICIOS_USUARIOS.roles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      const response = await res.json();
      const createdRole = response.rol;

      ToastSuccess({ message: "Rol creado correctamente" });

      onSuccess?.(createdRole);
      resetForm?.();
      onClose?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      ToastError({ message: "Error al crear el rol: " + errorMessage });
    }
  };

  return { crearRol };
}
