import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";
import { useEffect, useState } from "react";


export const useTransformaciones = () => {
  const [transformaciones, setTransformaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransformaciones = async () => {
      try {
        const res = await fetch(SERVICIOS_TRANSFORMACIONES.listar);
        if (!res.ok) {
          throw new Error("Error al obtener transformaciones");
        }
        const data = await res.json();
        setTransformaciones(data.transformaciones);
      } catch (err) {
        console.error("Error al cargar transformaciones:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformaciones();
  }, []);

  return { data: transformaciones, isLoading: loading, error };
};
