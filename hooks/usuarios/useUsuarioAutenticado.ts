import { useEffect, useState } from "react";
import useSWR from "swr";
import { SERVICIOS_AUTH } from "@/services/auth.service";

// 🔐 Fetcher con cookies
const fetcherConCookie = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include", // ✅ para enviar cookie HttpOnly
  });

  console.log("📡 Respuesta:", res.status);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "No autorizado");
  }

  const json = await res.json();
  console.log("✅ Datos recibidos:", json);
  return json;
};

export function useUsuarioAutenticado() {
  const [isClient, setIsClient] = useState(false);

  // 🧠 Solo activa el fetcher en cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    isClient ? SERVICIOS_AUTH.me : null,
    fetcherConCookie,
  );

  return {
    usuario: data ?? null,
    nombre: data?.nom_usu ?? null,
    email: data?.email_usu ?? null,
    avatar: data?.img_usu ?? null,
    rol: data?.rol_usu?.nom_rol ?? null,
    isLoading,
    isError: !!error,
    actualizar: mutate,
  };
}
