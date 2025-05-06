import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";
import { useEffect, useState } from "react";

interface ProductoPopular {
  id: number;
  name: string;
  img: string;
  orders: number;
}

interface ProductoCaducar {
  id: number;
  name: string;
  img: string;
  expiresIn: string;
}

export function useProductosDashboard() {
  const [populares, setPopulares] = useState<ProductoPopular[]>([]);
  const [caducar, setCaducar] = useState<ProductoCaducar[]>([]);

  useEffect(() => {
    // Cargar productos populares
    fetch(SERVICIOS_DASHBOARD.populares)
      .then((res) => res.json())
      .then((data) => {
        const formateados = data.map((item: any, index: number) => ({
          id: item.id ?? index,
          name: item.name,
          img: item.img,
          orders: Number(item.orders),
        }));
        setPopulares(formateados);
      })
      .catch((err) =>
        console.error("Error al cargar productos populares:", err)
      );

    // Cargar productos por caducar
    fetch(SERVICIOS_DASHBOARD.porCaducar)
      .then((res) => res.json())
      .then((data) => {
        const formateados = data.map((prod: any, index: number) => ({
          id: prod.id ?? index,
          name: prod.name,
          img: prod.img,
          expiresIn: prod.expiresIn,
        }));
        setCaducar(formateados);
      })
      .catch((err) =>
        console.error("Error al cargar productos por caducar:", err)
      );
  }, []);

  return { populares, caducar };
}
