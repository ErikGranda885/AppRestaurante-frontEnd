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

  const fetchConfiguraciones = async () => {
    try {
      const response = await fetch(SERVICIOS_CONFIGURACIONES.listar, {
        credentials: "include",
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
    try {
      await fetch(SERVICIOS_CONFIGURACIONES.actualizarPorClave(clave), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

  // Setters locales (sin backend)
  const setActivarCierreAutomaticoStateOnly = (val: boolean) =>
    setActivarCierreAutomaticoState(val);

  const setCierreCreacionHoraStateOnly = (val: string) =>
    setCierreCreacionHoraState(val);

  const setCierreVerificacionHoraStateOnly = (val: string) =>
    setCierreVerificacionHoraState(val);

  const setMostrarDiferenciasCierreStateOnly = (val: boolean) =>
    setMostrarDiferenciasCierreState(val);

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    activarCierreAutomatico,
    setActivarCierreAutomaticoStateOnly,
    cierreCreacionHora,
    setCierreCreacionHoraStateOnly,
    cierreVerificacionHora,
    setCierreVerificacionHoraStateOnly,
    mostrarDiferenciasCierre,
    setMostrarDiferenciasCierreStateOnly,
    updateConfiguracion,
    loading,
  };
}
