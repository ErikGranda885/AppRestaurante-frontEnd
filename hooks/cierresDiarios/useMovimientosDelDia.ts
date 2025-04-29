import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";
import useSWR from "swr";

// Definir el fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMovimientosDelDia(fecha: string) {
  const { data, error, isLoading, mutate } = useSWR(
    fecha ? SERVICIOS_CIERRES.movimientosDelDia(fecha) : null,
    fetcher,
    {
      refreshInterval: 10_000, // refrescar cada 10s (opcional)
      dedupingInterval: 5_000, // evita múltiples peticiones iguales en poco tiempo
      revalidateOnFocus: true, // refresca si regresa la pestaña
    },
  );

  return {
    movimientos: data ?? { ventas: [], gastos: [], compras: [] },
    isLoading,
    isError: !!error,
    refetchMovimientos: mutate,
  };
}
