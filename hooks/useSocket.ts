import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useSocket(event: string, callback: () => void) {
  useEffect(() => {
    console.log("📡 useSocket montado para evento:", event);
    socket.on("connect", () => {
      console.log("🔌 Conectado a WebSocket");
    });

    socket.on(event, () => {
      console.log(`📡 Evento recibido: ${event}`);
      callback();
    });

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}
