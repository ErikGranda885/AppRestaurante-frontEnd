import { SERVICIOS_DASHBOARD } from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import { ToastError } from "@/components/shared/toast/toastError";

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
  const [errorPopulares, setErrorPopulares] = useState(false);

  const [loadingCaducar, setLoadingCaducar] = useState(true);
  const [errorCaducar, setErrorCaducar] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingPopulares(true);
      setLoadingCaducar(true);
      setErrorPopulares(false);
      setErrorCaducar(false);

      try {
        const [resPopulares, resCaducar] = await Promise.all([
          fetch(SERVICIOS_DASHBOARD.populares),
          fetch(SERVICIOS_DASHBOARD.porCaducar),
        ]);

        if (!resPopulares.ok || !resCaducar.ok) {
          throw new Error("Fallo en una de las peticiones");
        }

        const dataPopulares = await resPopulares.json();
        const dataCaducar = await resCaducar.json();

        setPopulares(
          dataPopulares.map((item: any, index: number) => ({
            id: item.id ?? index,
            name: item.name,
            img: item.img,
            orders: Number(item.orders),
          })),
        );

        setCaducar(
          dataCaducar.map((prod: any, index: number) => ({
            id: prod.id ?? index,
            name: prod.name,
            img: prod.img,
            expiresIn: prod.expiresIn,
          })),
        );
      } catch (error) {
        ToastError({
          message: "No se pudieron cargar los datos del dashboard",
        });
        setErrorPopulares(true);
        setErrorCaducar(true);
      } finally {
        setLoadingPopulares(false);
        setLoadingCaducar(false);
      }
    };

    cargarDatos();
  }, []);

  return {
    populares,
    caducar,
    loadingPopulares,
    loadingCaducar,
    errorPopulares,
    errorCaducar,
  };
}
