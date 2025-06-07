import { useEffect, useState, useRef } from "react";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";
import { parse } from "date-fns";
import { IRol } from "@/lib/types";
import { useSocket } from "@/hooks/useSocket";
import { ToastError } from "@/components/shared/toast/toastError";
import { DataUsers } from "@/app/(site)/usuarios/page";

export function useUsuariosAndRoles() {
  const [usuarios, setUsuarios] = useState<DataUsers[]>([]);
  const [roles, setRoles] = useState<IRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hasShownError = useRef(false); // ✅ Referencia para controlar el toast

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(SERVICIOS_USUARIOS.usuarios);
      if (!res.ok) throw new Error("Error al cargar los usuarios");
      const data = await res.json();

      const transformados = data.map((item: any) => ({
        id: item.id_usu.toString(),
        usuario: item.nom_usu,
        correo: item.email_usu,
        estado: item.esta_usu,
        rol: item.rol_usu.id_rol.toString(),
        rolNombre: item.rol_usu.nom_rol,
        img_usu: item.img_usu || "",
        fechaCreacion: parse(
          item.crea_en_usu,
          "dd-MM-yyyy HH:mm:ss",
          new Date(),
        ),
        fechaActualizacion: parse(
          item.act_en_usu,
          "dd-MM-yyyy HH:mm:ss",
          new Date(),
        ),
      }));

      setUsuarios(transformados);
      setError(false);
      hasShownError.current = false; // 🔄 Resetear si todo va bien
    } catch (error: any) {
      setError(true);
      if (!hasShownError.current) {
        ToastError({ message: "Error al cargar los usuarios" });
        hasShownError.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(SERVICIOS_USUARIOS.roles);
      if (!res.ok) throw new Error("Error al cargar roles");
      const data = await res.json();
      const rolesData = Array.isArray(data) ? data : data.roles;
      const activos = rolesData.filter((rol: any) => rol.est_rol === "Activo");
      setRoles(activos);
    } catch (error: any) {
      ToastError({ message: error.message });
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  useSocket("usuarios-actualizados", fetchUsuarios);
  useSocket("roles-actualizados", fetchRoles);

  return {
    usuarios,
    setUsuarios,
    roles,
    setRoles,
    loading,
    error,
    refetchUsuarios: fetchUsuarios,
    refetchRoles: fetchRoles,
  };
}
