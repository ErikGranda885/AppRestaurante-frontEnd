"use client";
import { useEffect, useState } from "react";

export function useHoraActual() {
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { horaActual };
}
