"use client";

import { IGasto } from "@/lib/types";
import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import { useState, useEffect } from "react";

// 🚀 Utilidad para obtener fecha y hora actual
function obtenerFechaHoraActual() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  const hours = String(ahora.getHours()).padStart(2, "0");
  const minutes = String(ahora.getMinutes()).padStart(2, "0");
  const seconds = String(ahora.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function useGastos() {
  const [gastos, setGastos] = useState<IGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 Listar gastos
  const listarGastos = async () => {
    setLoading(true);
    try {
      const res = await fetch(SERVICIOS_GASTOS.listar);
      if (!res.ok) throw new Error("Error al listar gastos");
      const data = await res.json();
      setGastos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Crear gasto
  const crearGasto = async (
    nuevoGasto: Omit<IGasto, "id_gas" | "fech_gas">,
  ) => {
    try {
      const payload = {
        ...nuevoGasto,
        fech_gas: obtenerFechaHoraActual(),
      };
      const res = await fetch(SERVICIOS_GASTOS.crear, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al crear gasto");

      setGastos((prev) => [...prev, data]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // 🚀 Actualizar gasto
  const actualizarGasto = async (id: number, datos: Partial<IGasto>) => {
    try {
      const res = await fetch(SERVICIOS_GASTOS.actualizar(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error("Error al actualizar gasto");

      const gastoActualizado = await res.json();
      setGastos((prev) =>
        prev.map((gasto) => (gasto.id_gas === id ? gastoActualizado : gasto)),
      );
      return gastoActualizado;
    } catch (err) {
      throw err;
    }
  };

  // 🚀 Eliminar gasto
  const eliminarGasto = async (id: number) => {
    try {
      const res = await fetch(SERVICIOS_GASTOS.eliminar(id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar gasto");

      setGastos((prev) => prev.filter((gasto) => gasto.id_gas !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    listarGastos();
  }, []);

  return {
    gastos,
    loading,
    error,
    listarGastos,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
  };
}
