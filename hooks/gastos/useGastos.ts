"use client";

import { IGasto } from "@/lib/types";
import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import useSWR from "swr";

// Utilidad para obtener la fecha y hora actual en formato ISO
function obtenerFechaHoraActualISO() {
  const now = new Date();
  return now.toISOString().split(".")[0]; // formato "YYYY-MM-DDTHH:mm:ss"
}

// Fetcher genérico
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGastos() {
  const { data, error, isLoading, mutate } = useSWR<IGasto[]>(
    SERVICIOS_GASTOS.listar,
    fetcher,
  );

  // Crear gasto
  const crearGasto = async (
    nuevoGasto: Omit<IGasto, "id_gas" | "fech_gas">,
  ) => {
    const payload = {
      ...nuevoGasto,
      fech_gas: obtenerFechaHoraActualISO(),
    };

    const res = await fetch(SERVICIOS_GASTOS.crear, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al crear gasto");

    await mutate(); // actualiza datos
    return data;
  };

  // Actualizar gasto
  const actualizarGasto = async (id: number, datos: Partial<IGasto>) => {
    const res = await fetch(SERVICIOS_GASTOS.actualizar(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!res.ok) throw new Error("Error al actualizar gasto");

    const actualizado = await res.json();
    await mutate();
    return actualizado;
  };

  // Eliminar gasto
  const eliminarGasto = async (id: number) => {
    const res = await fetch(SERVICIOS_GASTOS.eliminar(id), {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar gasto");

    await mutate();
  };

  return {
    gastos: data ?? [],
    loading: isLoading,
    error,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    mutate,
  };
}
