"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";

interface FormattedMetrics {
  totalGanado: number;
  comprasRealizadas: {
    valor: number;
    cantidad: number;
  };
  gastosTotales: {
    valor: number;
    cantidad: number;
  };
  diferenciaCaja: number;
}

export function useDashboardMetrics(fecha: string) {
  const [metrics, setMetrics] = useState<FormattedMetrics>({
    totalGanado: 0,
    comprasRealizadas: { valor: 0, cantidad: 0 },
    gastosTotales: { valor: 0, cantidad: 0 },
    diferenciaCaja: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(SERVICIOS_DASHBOARD.metricas(fecha));
      if (!res.ok) throw new Error("Error al obtener métricas del dashboard");
      const data = await res.json();
      setMetrics({
        totalGanado: data.totalGanado,
        comprasRealizadas: {
          valor: data.compras.total,
          cantidad: data.compras.cantidad,
        },
        gastosTotales: {
          valor: data.gastos.total,
          cantidad: data.gastos.cantidad,
        },
        diferenciaCaja: data.diferenciaCaja,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");

      // Reintentar después de 10 segundos si hay error
      setTimeout(() => {
        fetchMetrics();
      }, 10000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fecha) fetchMetrics();
  }, [fecha]);

  return {
    ...metrics,
    loading,
    error,
    refreshDashboard: fetchMetrics, // ✅ aquí se expone la función
  };
}
