import { useEffect, useState } from "react";
import { IVentaDetalle } from "@/lib/types";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";

export const useVentasConDetalles = () => {
  const [ventas, setVentas] = useState<IVentaDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await fetch(SERVICIOS_VENTAS.ventasConDetalles);
        if (!res.ok) {
          throw new Error("Error al obtener ventas");
        }
        const data = await res.json();
        setVentas(data);
      } catch (err: any) {
        console.error("Error al cargar ventas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  return { ventas, loading, error };
};
