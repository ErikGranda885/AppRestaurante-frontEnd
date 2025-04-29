"use client";

import { useMemo } from "react";

export function useFechaLocal() {
  const fechaLocal = useMemo(() => {
    const hoy = new Date();
    const offsetMs = hoy.getTimezoneOffset() * 60000;
    const localDate = new Date(hoy.getTime() - offsetMs);
    return localDate.toISOString().split("T")[0];
  }, []);

  return fechaLocal;
}
