import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";
import { useCallback } from "react";
import { DataUsers } from "@/app/(site)/usuarios/page";

export function useAccionesUsuario(
  setUsuarios: React.Dispatch<React.SetStateAction<DataUsers[]>>,
) {
  const inactivarUsuario = useCallback(
    async (usuario: DataUsers) => {
      try {
        const res = await fetch(
          SERVICIOS_USUARIOS.inactivarUsuario(usuario.id),
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          },
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id ? { ...u, estado: "Inactivo" } : u,
          ),
        );

        ToastSuccess({
          message: "Se ha inactivado el usuario exitosamente.",
        });
      } catch (err: any) {
        ToastError({
          message: `Error al inactivar el usuario: ${err.message}`,
        });
      }
    },
    [setUsuarios],
  );

  const activarUsuario = useCallback(
    async (usuario: DataUsers) => {
      try {
        const res = await fetch(SERVICIOS_USUARIOS.activarUsuario(usuario.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id ? { ...u, estado: "Activo" } : u,
          ),
        );

        ToastSuccess({
          message: "Se ha activado el usuario exitosamente.",
        });
      } catch (err: any) {
        ToastError({
          message: `Error al activar el usuario: ${err.message}`,
        });
      }
    },
    [setUsuarios],
  );

  return { activarUsuario, inactivarUsuario };
}
