import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { IRol } from "@/lib/types";
import { DEFAULT_USER_URL } from "@/lib/constants";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";

export function useCargaMasivaUsuarios(
  roleOptions: IRol[],
  onSuccess: (newUsers: any[]) => void,
  onClose: () => void,
) {
  const cargarUsuarios = async (
    previewData: any[],
    setLoading: (v: boolean) => void,
  ) => {
    if (previewData.length === 0) {
      ToastError({ message: "No hay datos para enviar." });
      return;
    }

    setLoading(true);
    try {
      const defaultImageUrl = DEFAULT_USER_URL;
      const roles = roleOptions.map((rol) => ({
        value: rol.id_rol.toString(),
        label: rol.nom_rol,
      }));

      const processed = previewData.map((row) => {
        let rol = row["rol_usu"];
        const byValue = roles.find(
          (r) => r.value.toLowerCase() === String(rol).toLowerCase(),
        );
        if (byValue) rol = byValue.value;
        else {
          const byLabel = roles.find(
            (r) => r.label.toLowerCase() === String(rol).toLowerCase(),
          );
          if (byLabel) rol = byLabel.value;
          else throw new Error(`Rol ${rol} no encontrado`);
        }
        return { ...row, rol_usu: rol, img_usu: defaultImageUrl };
      });

      const res = await fetch(SERVICIOS_USUARIOS.cargarMasivo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processed),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error de carga.");

      onSuccess(data.usuarios);
      ToastSuccess({
        message: `Se cargaron ${data.usuarios.length} usuarios.`,
      });
      onClose();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al cargar usuarios." });
    } finally {
      setLoading(false);
    }
  };

  return { cargarUsuarios };
}
