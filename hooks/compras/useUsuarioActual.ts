import { useEffect, useState } from "react";
import { IUsuario } from "@/lib/types";

export function useUsuarioActual() {
  const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuarioActual");
    if (storedUser) {
      setUsuarioActual(JSON.parse(storedUser));
    }
  }, []);

  return usuarioActual;
}
