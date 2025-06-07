import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { uploadImage } from "@/firebase/subirImage";
import { eliminarImagen } from "@/firebase/eliminarImage";
import { DEFAULT_USER_URL } from "@/lib/constants";
import { useUsuarioAutenticado } from "@/hooks/usuarios/useUsuarioAutenticado";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";

export interface EditarUsuarioPayload {
  id: string;
  values: {
    usuario: string;
    correo: string;
    password: string;
    rol: number;
  };
  imagenActual?: string;
  imagenNueva?: File | null;
  onSuccess: (data: any) => void;
}

export function useEditarUsuario() {
  const { usuario, actualizar } = useUsuarioAutenticado();

  const editarUsuario = async ({
    id,
    values,
    imagenActual,
    imagenNueva,
    onSuccess,
  }: EditarUsuarioPayload) => {
    const startTime = performance.now(); // ⏱️ Inicio
    let imageUrl = imagenActual || DEFAULT_USER_URL;

    try {
      if (imagenNueva) {
        if (imagenActual && !imagenActual.includes("user-default")) {
          await eliminarImagen(imagenActual);
        }

        imageUrl = await uploadImage(
          imagenNueva,
          "usuarios",
          `usuario_${values.usuario.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else if (!imagenActual) {
        imageUrl = DEFAULT_USER_URL;
      }

      const payload: any = {
        nom_usu: values.usuario,
        email_usu: values.correo,
        rol_usu: values.rol,
        img_usu: imageUrl,
      };

      if (values.password.trim() !== "") {
        payload.clave_usu = values.password;
      }

      const res = await fetch(SERVICIOS_USUARIOS.actualizarUsuario(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data);

      ToastSuccess({
        message: `El usuario ha sido actualizado correctamente en ${duration} segundos.`,
      });

      if (usuario?.id === id) {
        actualizar();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      ToastError({
        message: "Error al actualizar el usuario: " + errorMessage,
      });
    }
  };

  return { editarUsuario };
}
