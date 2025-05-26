"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsuarioAutenticado } from "@/hooks/usuarios/useUsuarioAutenticado";

export function useProtectedRoute() {
  const router = useRouter();
  const { isLoading, isError } = useUsuarioAutenticado();

  useEffect(() => {
    if (!isLoading && isError) {
      router.push("/login");
    }
  }, [isLoading, isError, router]);
}
