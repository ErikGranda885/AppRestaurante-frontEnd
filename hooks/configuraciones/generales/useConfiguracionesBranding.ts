"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionesBranding() {
  const [logoReportes, setLogoReportes] = useState(false);
  const [logoFacturas, setLogoFacturas] = useState(false);
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
      const configuraciones = data.configuraciones ?? []; // 👈 CORREGIDO

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
    if (!token) return;
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT", // 👈 tu backend espera PUT
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor_conf: valor ? "true" : "false" }), // 👈 tu backend espera 'valor_conf'
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
