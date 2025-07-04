import { useEffect, useState } from "react";
import { ICompra } from "@/lib/types";
import { SERVICIOS } from "@/services/categorias.service";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";

export function useUltimoIdCompra() {
  const [ultimoIdCompra, setUltimoIdCompra] = useState<number>(0);

  useEffect(() => {
    fetch(SERVICIOS_COMPRAS.compras)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar compras");
        return res.json();
      })
      .then((data: ICompra[]) => {
        if (data.length > 0) {
          const maxId = Math.max(...data.map((c) => c.id_comp));
          setUltimoIdCompra(maxId);
        } else {
          setUltimoIdCompra(0);
        }
      })
      .catch((err) => {
        console.error("Error al obtener el último ID de compra:", err);
      });
  }, []);

  return ultimoIdCompra;
}
