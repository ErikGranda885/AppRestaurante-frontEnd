// src/hooks/configuraciones/generales/useConfiguracionesCierreDiario.ts

"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

export function useConfiguracionesCierreDiario() {
  const [activarCierreAutomatico, setActivarCierreAutomaticoState] =
    useState(false);
  const [cierreCreacionHora, setCierreCreacionHoraState] = useState("07:00");
  const [cierreVerificacionHora, setCierreVerificacionHoraState] =
    useState("23:59");
  const [mostrarDiferenciasCierre, setMostrarDiferenciasCierreState] =
    useState(false);
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

      const activar = configuraciones.find(
        (item: any) => item.clave_conf === "activar_cierre_automatico",
      );
      const creacion = configuraciones.find(
        (item: any) => item.clave_conf === "cierre_creacion_hora",
      );
      const verificacion = configuraciones.find(
        (item: any) => item.clave_conf === "cierre_verificacion_hora",
      );
      const mostrar = configuraciones.find(
        (item: any) => item.clave_conf === "mostrar_diferencias_cierre",
      );

      setActivarCierreAutomaticoState(activar?.valor_conf === "true");
      setCierreCreacionHoraState(creacion?.valor_conf ?? "07:00");
      setCierreVerificacionHoraState(verificacion?.valor_conf ?? "23:59");
      setMostrarDiferenciasCierreState(mostrar?.valor_conf === "true");
    } catch (error) {
      console.error("Error al obtener configuraciones de cierres:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (
    clave: string,
    valor: string | boolean,
  ) => {
    if (!token) return;
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor_conf:
            typeof valor === "boolean" ? (valor ? "true" : "false") : valor,
        }),
      });
    } catch (error) {
      console.error(`Error al actualizar ${clave}:`, error);
    }
  };

  // Setters que actualizan backend + estado
  const setActivarCierreAutomatico = async (val: boolean) => {
    await updateConfiguracion("activar_cierre_automatico", val);
    setActivarCierreAutomaticoState(val);
  };

  const setCierreCreacionHora = async (val: string) => {
    await updateConfiguracion("cierre_creacion_hora", val);
    setCierreCreacionHoraState(val);
  };

  const setCierreVerificacionHora = async (val: string) => {
    await updateConfiguracion("cierre_verificacion_hora", val);
    setCierreVerificacionHoraState(val);
  };

  const setMostrarDiferenciasCierre = async (val: boolean) => {
    await updateConfiguracion("mostrar_diferencias_cierre", val);
    setMostrarDiferenciasCierreState(val);
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    activarCierreAutomatico,
    setActivarCierreAutomatico,
    cierreCreacionHora,
    setCierreCreacionHora,
    cierreVerificacionHora,
    setCierreVerificacionHora,
    mostrarDiferenciasCierre,
    setMostrarDiferenciasCierre,
    loading,
  };
}
