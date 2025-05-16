"use client";

import { IDetReceta } from "@/lib/types";
import { SERVICIOS_DET_RECETAS } from "@/services/dets_recetas.service";
import { useEffect, useState } from "react";

export function useDetalleReceta(idReceta: number | null) {
  const [ingredientes, setIngredientes] = useState<IDetReceta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idReceta === null) {
      setIngredientes([]);
      return;
    }

    const fetchIngredientes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          SERVICIOS_DET_RECETAS.listarPorReceta(idReceta),
        );
        if (!res.ok) throw new Error("No se pudo cargar los ingredientes");
        const data = await res.json();
        setIngredientes(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredientes();
  }, [idReceta]);

  return { ingredientes, isLoading, error };
}
