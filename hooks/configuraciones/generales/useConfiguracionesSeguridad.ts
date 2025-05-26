"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionesSeguridad() {
  const [activarGoogleLogin, setActivarGoogleLogin] = useState(false);
  const [longitudMinimaPassword, setLongitudMinimaPassword] = useState(8);
  const [bloquearUsuarioPorIntentos, setBloquearUsuarioPorIntentos] =
    useState(false);
  const [maxIntentosLogin, setMaxIntentosLogin] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchConfiguraciones = async () => {
    try {
      const response = await fetch(SERVICIOS_CONFIGURACIONES.listar, {
        credentials: "include", // ✅ Usa la cookie HttpOnly automáticamente
      });

      const data = await response.json();
      const configuraciones = data.configuraciones ?? [];

      const googleLogin = configuraciones.find(
        (item: any) => item.clave_conf === "activar_google_login",
      );
      const longitud = configuraciones.find(
        (item: any) => item.clave_conf === "longitud_minima_password",
      );
      const bloquear = configuraciones.find(
        (item: any) => item.clave_conf === "bloquear_usuario_por_intentos",
      );
      const intentos = configuraciones.find(
        (item: any) => item.clave_conf === "max_intentos_login",
      );

      setActivarGoogleLogin(googleLogin?.valor_conf === "true");
      setLongitudMinimaPassword(parseInt(longitud?.valor_conf ?? "8"));
      setBloquearUsuarioPorIntentos(bloquear?.valor_conf === "true");
      setMaxIntentosLogin(parseInt(intentos?.valor_conf ?? "5"));
    } catch (error) {
      console.error("Error al obtener configuraciones de seguridad:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (clave: string, valor: string) => {
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        credentials: "include", // ✅ Usa cookie HttpOnly
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valor_conf: valor }),
      });
    } catch (error) {
      console.error(`Error al actualizar ${clave}:`, error);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    activarGoogleLogin,
    setActivarGoogleLogin: async (val: boolean) => {
      setActivarGoogleLogin(val);
      await updateConfiguracion("activar_google_login", val ? "true" : "false");
    },
    longitudMinimaPassword,
    setLongitudMinimaPassword: async (val: number) => {
      setLongitudMinimaPassword(val);
      await updateConfiguracion("longitud_minima_password", val.toString());
    },
    bloquearUsuarioPorIntentos,
    setBloquearUsuarioPorIntentos: async (val: boolean) => {
      setBloquearUsuarioPorIntentos(val);
      await updateConfiguracion(
        "bloquear_usuario_por_intentos",
        val ? "true" : "false",
      );
    },
    maxIntentosLogin,
    setMaxIntentosLogin: async (val: number) => {
      setMaxIntentosLogin(val);
      await updateConfiguracion("max_intentos_login", val.toString());
    },
    loading,
  };
}
