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
  const [loadingPopulares, setLoadingPopulares] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Productos populares
        const resPopulares = await fetch(SERVICIOS_DASHBOARD.populares);
        const dataPopulares = await resPopulares.json();
        const formateadosPopulares = dataPopulares.map(
          (item: any, index: number) => ({
            id: item.id ?? index,
            name: item.name,
            img: item.img,
            orders: Number(item.orders),
          }),
        );
        setPopulares(formateadosPopulares);

        // Productos por caducar
        const resCaducar = await fetch(SERVICIOS_DASHBOARD.porCaducar);
        const dataCaducar = await resCaducar.json();
        const formateadosCaducar = dataCaducar.map(
          (prod: any, index: number) => ({
            id: prod.id ?? index,
            name: prod.name,
            img: prod.img,
            expiresIn: prod.expiresIn,
          }),
        );
        setCaducar(formateadosCaducar);
      } catch (error) {
        console.error("Error al cargar productos del dashboard:", error);
      } finally {
        setLoadingPopulares(false);
      }
    };

    cargarDatos();
  }, []);

  return { populares, caducar, loadingPopulares };
}
