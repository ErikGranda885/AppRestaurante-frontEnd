// useVentasPorCategoria.ts
import { useEffect, useState } from "react";
import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";

interface VentaPorCategoria {
  categoria: string;
  total: string;
}

export function useVentasPorCategoria() {
  const [datos, setDatos] = useState<VentaPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SERVICIOS_DASHBOARD.ventasPorCategoria)
      .then((res) => res.json())
      .then((data) => {
        setDatos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener ventas por categoría:", err);
        setLoading(false);
      });
  }, []);

  return { datos, loading };
}
