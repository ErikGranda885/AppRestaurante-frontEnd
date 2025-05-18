"use client";

import useSWR from "swr";
import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al obtener transformaciones");
  }
  const data = await res.json();
  return data.transformaciones; // Asegúrate de que el backend responde así
};

export const useTransformaciones = () => {
  const { data, error, isLoading, mutate } = useSWR(
    SERVICIOS_TRANSFORMACIONES.listar,
    fetcher,
  );

  return {
    data,
    isLoading,
    error,
    mutate, // por si lo necesitas en algún lugar
  };
};
