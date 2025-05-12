// hooks/useAplicacionConfiguracion.ts
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionAplicacion() {
  const { setTheme } = useTheme();
  const [modoMantenimiento, setModoMantenimiento] = useState(false);
  const [versionApp, setVersionApp] = useState("1.0.0");
  const [colorTema, setColorTema] = useState("system");
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchConfiguraciones = async () => {
    if (!token) return;
    try {
      const response = await fetch(SERVICIOS_CONFIGURACIONES.listar, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const configuraciones = data.configuraciones ?? [];

      const mantenimiento = configuraciones.find(
        (item: any) => item.clave_conf === "modo_mantenimiento",
      );
      const version = configuraciones.find(
        (item: any) => item.clave_conf === "version_app",
      );
      const tema = configuraciones.find(
        (item: any) => item.clave_conf === "color_tema",
      );

      setModoMantenimiento(mantenimiento?.valor_conf === "true");
      setVersionApp(version?.valor_conf ?? "1.0.0");
      setColorTema(tema?.valor_conf ?? "system");

      // ✅ Aplica el tema en next-themes
      setTheme(tema?.valor_conf ?? "system");
    } catch (error) {
      console.error("Error al obtener configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (clave: string, valor: string) => {
    if (!token) return;
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor_conf: valor }),
      });

      if (clave === "modo_mantenimiento")
        setModoMantenimiento(valor === "true");
      if (clave === "version_app") setVersionApp(valor);
      if (clave === "color_tema") {
        setColorTema(valor);
        setTheme(valor); // ✅ Cambia el tema global
      }
    } catch (error) {
      console.error(`Error al actualizar ${clave}:`, error);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    modoMantenimiento,
    setModoMantenimiento: (val: boolean) =>
      updateConfiguracion("modo_mantenimiento", val ? "true" : "false"),
    versionApp,
    setVersionApp: (val: string) => updateConfiguracion("version_app", val),
    colorTema,
    setColorTema: (val: string) => updateConfiguracion("color_tema", val),
    loading,
  };
}
