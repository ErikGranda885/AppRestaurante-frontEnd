"use client";
import { useEffect, useState } from "react";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";

export function useUserData() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const showToast = localStorage.getItem("showWelcomeToast");
    const storedUserName = localStorage.getItem("user_name");

    if (storedUserName) {
      setUserName(storedUserName);
    }

    if (showToast === "true" && storedUserName) {
      ToastSuccess({
        message: `Bienvenido de nuevo ${storedUserName}`,
      });
      localStorage.removeItem("showWelcomeToast");
    }
  }, []);

  return { userName };
}
