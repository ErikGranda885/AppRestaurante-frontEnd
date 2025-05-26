"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionesVentas() {
  const [ventasConfig, setVentasConfig] = useState({
    porcentaje_iva: 12,
    moneda: "USD",
    minimo_stock_alerta: 5,
  });
  const [loading, setLoading] = useState(true);

  const fetchVentasConfig = async () => {
    try {
      const response = await fetch(SERVICIOS_CONFIGURACIONES.listar, {
        credentials: "include", // ✅ Usa cookie HttpOnly
      });

      const res = await response.json();
      const data = res.configuraciones ?? [];

      const getValor = (clave: string, defaultValue: any) => {
        const found = data.find((c: any) => c.clave_conf === clave);
        if (!found) return defaultValue;
        if (found.valor_conf === "true") return true;
        if (found.valor_conf === "false") return false;
        if (!isNaN(found.valor_conf)) return Number(found.valor_conf);
        return found.valor_conf;
      };

      setVentasConfig({
        porcentaje_iva: getValor("porcentaje_iva", 12),
        moneda: getValor("moneda", "USD"),
        minimo_stock_alerta: getValor("minimo_stock_alerta", 5),
      });
    } catch (err) {
      console.error("Error al obtener configuración de ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (clave: string, valor: any) => {
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        credentials: "include", // ✅ Usa cookie HttpOnly
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor_conf:
            typeof valor === "boolean"
              ? valor
                ? "true"
                : "false"
              : valor.toString(),
        }),
      });
    } catch (error) {
      console.error(`Error al actualizar ${clave}:`, error);
    }
  };

  useEffect(() => {
    fetchVentasConfig();
  }, []);

  return {
    ventasConfig,
    setVentasConfig,
    updateConfiguracion,
    loading,
  };
}
