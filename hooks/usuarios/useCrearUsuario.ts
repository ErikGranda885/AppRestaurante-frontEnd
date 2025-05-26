// hooks/useCrearUsuario.ts
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { uploadImage } from "@/firebase/subirImage";
import { DEFAULT_USER_URL } from "@/lib/constants";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";

export interface CrearUsuarioPayload {
  values: {
    usuario: string;
    correo: string;
    password: string;
    rol: string;
  };
  imagenNueva?: File | null;
  onSuccess: (data: any) => void;
}

export function useCrearUsuario() {
  const crearUsuario = async ({
    values,
    imagenNueva,
    onSuccess,
  }: CrearUsuarioPayload) => {
    let imageUrl = "";

    try {
      if (imagenNueva) {
        imageUrl = await uploadImage(
          imagenNueva,
          "usuarios",
          `usuario_${values.usuario.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else {
        imageUrl = DEFAULT_USER_URL;
      }

      const payload = {
        nom_usu: values.usuario,
        email_usu: values.correo,
        clave_usu: values.password,
        rol_usu: parseInt(values.rol, 10),
        img_usu: imageUrl,
      };

      const res = await fetch(SERVICIOS_USUARIOS.usuarios, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      onSuccess(data);

      ToastSuccess({ message: "Usuario creado correctamente" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      ToastError({ message: "Error al crear el usuario: " + errorMessage });
    }
  };

  return { crearUsuario };
}
