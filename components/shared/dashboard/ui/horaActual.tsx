"use client";
import { useEffect, useState } from "react";

export function HoraActual() {
  const [horaActual, setHoraActual] = useState<Date | null>(null);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    setHoraActual(new Date());

    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // No renderizar nada en el servidor
  if (!horaActual) return null;

  return (
    <div className="text-right text-sm text-muted-foreground">
      <p className="text-2xl font-semibold text-white">
        {horaActual.toLocaleTimeString("es-EC", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
      <p>
        {horaActual.toLocaleDateString("es-EC", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
