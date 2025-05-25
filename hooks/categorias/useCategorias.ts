// hooks/categorias/useCategorias.ts
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategorias() {
  const { data, error, isLoading, mutate } = useSWR(
    SERVICIOS_PRODUCTOS.categorias,
    fetcher,
  );

  const categoriasActivas =
    data?.categorias?.filter((cat: any) => cat.est_cate === "Activo") || [];

  return {
    categorias: categoriasActivas,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
