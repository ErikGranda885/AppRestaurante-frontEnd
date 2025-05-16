// hooks/equivalencias/useEquivalencias.ts
import useSWR from "swr";
import { IEquivalencia } from "@/lib/types";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al cargar equivalencias");
  }
  return res.json();
};

export const useEquivalencias = () => {
  const { data, error, isLoading, mutate } = useSWR<IEquivalencia[]>(
    SERVICIOS_EQUIVALENCIAS.listar,
    fetcher,
  );

  if (error) toast.error(error.message);

  return {
    equivalencias: data ?? [],
    loading: isLoading,
    error,
    mutate,
  };
};
