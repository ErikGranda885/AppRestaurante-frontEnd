// src/hooks/recetas/useInsumos.ts
import { useEffect, useState } from "react";
import { IProduct } from "@/lib/types";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { ProductoOption } from "@/components/shared/compras/ui/campoProducto";
import { ToastError } from "@/components/shared/toast/toastError";

export function useInsumos() {
  const [productosOptions, setProductosOptions] = useState<ProductoOption[]>(
    [],
  );

  useEffect(() => {
    fetch(SERVICIOS_PRODUCTOS.productos)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data: IProduct[]) => {
        const insumosActivos = data.filter(
          (prod) =>
            prod.est_prod?.toLowerCase() === "activo" &&
            prod.tip_prod?.toLowerCase() === "insumo",
        );

        const opciones: ProductoOption[] = insumosActivos.map((prod) => ({
          value: prod.id_prod.toString(),
          nombre: prod.nom_prod,
          cod_prod: prod.id_prod,
          img_prod: prod.img_prod || "/default.png",
        }));

        setProductosOptions(opciones);
      })
      .catch((err) => {
        console.error("Error al cargar insumos:", err);
        ToastError({ message: "Error al cargar insumos: " + err.message });
      });
  }, []);

  return {
    productosOptions,
    setProductosOptions,
  };
}
