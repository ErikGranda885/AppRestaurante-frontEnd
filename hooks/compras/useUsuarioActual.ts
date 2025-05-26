import { useEffect, useState } from "react";
import useSWR from "swr";
import { IUsuario } from "@/lib/types";
import { SERVICIOS_AUTH } from "@/services/auth.service";

const fetcherConCookie = async (url: string): Promise<IUsuario> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("No autorizado");

  return res.json();
};

export function useUsuarioActual() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading } = useSWR<IUsuario>(
    isClient ? SERVICIOS_AUTH.me : null,
    fetcherConCookie,
  );

  return {
    usuario: data ?? null,
    isLoading,
    isError: !!error,
  };
}
