// src/hooks/cierresDiarios/useResumenPendiente.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SERVICIOS_CIERRES = {
  resumenDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/resumen/${fecha}`,
};

export function useResumenPendiente(fecha: string, estado: string) {
  const shouldFetch = estado === "pendientes"; // Solo cuando esté en pendientes
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? SERVICIOS_CIERRES.resumenDelDia(fecha) : null,
    fetcher,
    {
      refreshInterval: 10_000, // cada 10 segundos refresca automáticamente (opcional)
      dedupingInterval: 5_000, // evita muchas peticiones iguales seguidas
      revalidateOnFocus: true, // refresca si el usuario vuelve a la pestaña
    },
  );

  return {
    resumenPendiente: data ?? {
      totalVentas: 0,
      totalGastos: 0,
      totalComprasPagadas: 0,
    },
    isLoading,
    isError: !!error,
    refetchResumen: mutate, // puedes usarlo manualmente si quieres forzar actualización
  };
}
