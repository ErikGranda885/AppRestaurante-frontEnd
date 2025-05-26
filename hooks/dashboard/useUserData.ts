"use client";
import { useEffect, useState } from "react";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { SERVICIOS_AUTH } from "@/services/auth.service";
import { ToastError } from "@/components/shared/toast/toastError";

export function useUserData() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(SERVICIOS_AUTH.me, {
          credentials: "include", // 🔐 envía la cookie automáticamente
        });

        if (!res.ok) {
          ToastError({
            message: "No autorizado, por favor inicia sesión nuevamente",
          });
          return;
        }

        const data = await res.json();

        // ✅ AJUSTE: usar 'nom_usu' que viene desde el backend
        setUserName(data.nom_usu || "");

        const showToast = localStorage.getItem("showWelcomeToast");
        if (showToast === "true") {
          ToastSuccess({
            message: `Bienvenido de nuevo ${data.nom_usu}`,
          });
          localStorage.removeItem("showWelcomeToast");
        }
      } catch (error) {
        console.error("❌ Error al obtener datos del usuario:", error);
      }
    };

    fetchUser();
  }, []);

  return { userName };
}
