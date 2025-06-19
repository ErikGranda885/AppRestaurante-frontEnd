import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useSocket(event: string, callback: () => void) {
  useEffect(() => {
    // Handler dedicado por hook (importante para evitar fugas)
    const handleConnect = () => {};

    const handleEvent = () => {
      callback();
    };

    // Eliminar posibles duplicados antes de agregar
    socket.off("connect", handleConnect);
    socket.off(event, handleEvent);

    // Agregar listeners
    socket.on("connect", handleConnect);
    socket.on(event, handleEvent);

    // Limpiar al desmontar
    return () => {
      socket.off("connect", handleConnect);
      socket.off(event, handleEvent);
    };
  }, [event, callback]);
}
