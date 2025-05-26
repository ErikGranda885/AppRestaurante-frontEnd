import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import useSWR from "swr";
import { useSocket } from "../useSocket";

// ✅ Agrega el fetcher que faltaba
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategorias() {
  const { data, error, isLoading, mutate } = useSWR(
    SERVICIOS_PRODUCTOS.categorias,
    fetcher,
  );

  useSocket("categorias-actualizadas", mutate);

  const categoriasActivas =
    data?.categorias
      ?.filter((cat: any) => cat.est_cate === "Activo")
      .map((cat: any) => ({
        value: cat.id_cate.toString(),
        label: cat.nom_cate,
      })) || [];

  return {
    categorias: categoriasActivas,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
