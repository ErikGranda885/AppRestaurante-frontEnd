import useSWR from "swr";
import { useSocket } from "@/hooks/useSocket";
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductosConStock() {
  const { data, error, isLoading, mutate } = useSWR(
    SERVICIOS_INVENTARIO.productosConStock,
    fetcher,
  );

  // 🔁 Revalidar automáticamente cuando se actualicen productos
  useSocket("productos-actualizados", mutate);

  return {
    todosLosProductos: data ?? [],
    cargando: isLoading,
    error: error?.message ?? null,
    refetch: mutate,
  };
}
