// hooks/useProtectedRoute.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useProtectedRoute() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
}
