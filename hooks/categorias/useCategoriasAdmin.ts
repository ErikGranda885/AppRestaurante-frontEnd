// hooks/categorias/useCategoriasAdmin.ts
import useSWR from "swr";
import { useSocket } from "../useSocket";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { ICategory } from "@/lib/types";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS } from "@/services/categorias.service";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategoriasAdmin() {
  const { data, error, isLoading, mutate } = useSWR(
    SERVICIOS_PRODUCTOS.categorias,
    fetcher,
  );

  useSocket("categorias-actualizadas", mutate);

  const categorias: ICategory[] = data?.categorias ?? [];

  const activarCategoria = async (id: number, nombre: string) => {
    try {
      const res = await fetch(SERVICIOS.activarCategoria(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Error al activar la categoría");
      ToastSuccess({ message: `La categoría "${nombre}" ha sido activada.` });
      mutate();
    } catch (err: any) {
      ToastError({ message: err.message });
    }
  };

  const inactivarCategoria = async (id: number, nombre: string) => {
    try {
      const res = await fetch(SERVICIOS.inactivarCategoria(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Error al inactivar la categoría");
      ToastSuccess({ message: `La categoría "${nombre}" ha sido inactivada.` });
      mutate();
    } catch (err: any) {
      ToastError({ message: err.message });
    }
  };

  return {
    categorias,
    isLoading,
    isError: error,
    refetch: mutate,
    activarCategoria,
    inactivarCategoria,
  };
}
