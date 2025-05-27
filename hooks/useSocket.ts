import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useSocket(event: string, callback: () => void) {
  useEffect(() => {
    console.log("📡 useSocket montado para evento:", event);

    // Handler dedicado por hook (importante para evitar fugas)
    const handleConnect = () => {
      console.log("🔌 Conectado a WebSocket");
    };

    const handleEvent = () => {
      console.log(`📡 Evento recibido: ${event}`);
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
