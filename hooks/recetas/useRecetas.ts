import { IReceta } from "@/lib/types";
import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar recetas");
  return res.json();
};

export const useRecetas = () => {
  const { data, error, isLoading } = useSWR<IReceta[]>(
    SERVICIOS_RECETAS.listar,
    fetcher,
  );

  return {
    recetas: data ?? [],
    isLoading,
    isError: !!error,
  };
};
