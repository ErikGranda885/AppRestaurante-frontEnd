"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionesBranding() {
  const [logoReportes, setLogoReportes] = useState(false);
  const [logoFacturas, setLogoFacturas] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfiguraciones = async () => {
    try {
      const response = await fetch(SERVICIOS_CONFIGURACIONES.listar, {
        credentials: "include", // ✅ Usa la cookie de sesión
      });

      const data = await response.json();
      const configuraciones = data.configuraciones ?? [];

      const reportes = configuraciones.find(
        (item: any) => item.clave_conf === "incluir_logo_reportes",
      );
      const facturas = configuraciones.find(
        (item: any) => item.clave_conf === "incluir_logo_facturas",
      );

      setLogoReportes(reportes?.valor_conf === "true");
      setLogoFacturas(facturas?.valor_conf === "true");
    } catch (error) {
      console.error("Error al obtener configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (clave: string, valor: boolean) => {
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        credentials: "include", // ✅ Autenticación con cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valor_conf: valor ? "true" : "false" }),
      });

      if (clave === "incluir_logo_reportes") setLogoReportes(valor);
      if (clave === "incluir_logo_facturas") setLogoFacturas(valor);
    } catch (error) {
      console.error(`Error al actualizar ${clave}:`, error);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    logoReportes,
    setLogoReportes: (val: boolean) =>
      updateConfiguracion("incluir_logo_reportes", val),
    logoFacturas,
    setLogoFacturas: (val: boolean) =>
      updateConfiguracion("incluir_logo_facturas", val),
    loading,
  };
}
