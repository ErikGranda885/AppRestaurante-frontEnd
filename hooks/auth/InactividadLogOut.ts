"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useInactividadLogOut({
  minutosInactividad = 2,
  minutosAdvertencia = 1,
}: {
  minutosInactividad?: number;
  minutosAdvertencia?: number;
}) {
  const router = useRouter();
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [contador, setContador] = useState(minutosAdvertencia * 60);
  const [timeoutCerrar, setTimeoutCerrar] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [intervaloContador, setIntervaloContador] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const reiniciarTemporizadores = () => {
      if (timeoutCerrar) clearTimeout(timeoutCerrar);
      if (intervaloContador) clearInterval(intervaloContador);
      setMostrarAlerta(false);
      setContador(minutosAdvertencia * 60);

      const timeoutMs = (minutosInactividad - minutosAdvertencia) * 60 * 1000;
      const nuevoTimeout = setTimeout(() => {
        setMostrarAlerta(true);

        const intervalo = setInterval(() => {
          setContador((prev) => {
            if (prev <= 1) {
              clearInterval(intervalo);
              localStorage.clear();
              router.push("/login");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setIntervaloContador(intervalo);
      }, timeoutMs);

      setTimeoutCerrar(nuevoTimeout);
    };

    const eventos = ["mousemove", "mousedown", "keypress", "touchstart"];
    eventos.forEach((evento) =>
      window.addEventListener(evento, reiniciarTemporizadores),
    );
    reiniciarTemporizadores();

    return () => {
      eventos.forEach((evento) =>
        window.removeEventListener(evento, reiniciarTemporizadores),
      );
      if (timeoutCerrar) clearTimeout(timeoutCerrar);
      if (intervaloContador) clearInterval(intervaloContador);
    };
  }, [router]);

  const cancelarAlerta = () => {
    setMostrarAlerta(false);
    setContador(minutosAdvertencia * 60);
  };

  return { mostrarAlerta, contador, cancelarAlerta };
}
