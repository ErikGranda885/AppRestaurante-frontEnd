"use client";

import { useEffect, useState } from "react";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";

export function useEquivalenciaActiva(id_prod: string | number | null) {
  const [equivalencia, setEquivalencia] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id_prod) return;

    const fetchEquivalencia = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          SERVICIOS_EQUIVALENCIAS.activa(Number(id_prod)),
        );
        if (!res.ok) throw new Error("No se encontró equivalencia activa");

        const data = await res.json();
        setEquivalencia(data);
      } catch (err: any) {
        setEquivalencia(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquivalencia();
  }, [id_prod]);

  return { equivalencia, loading, error };
}
