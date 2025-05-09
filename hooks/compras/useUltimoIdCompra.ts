import { useEffect, useState } from "react";
import { ICompra } from "@/lib/types";

export function useUltimoIdCompra() {
  const [ultimoIdCompra, setUltimoIdCompra] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:5000/compras")
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
