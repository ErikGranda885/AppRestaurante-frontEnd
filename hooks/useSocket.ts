import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"],
});

export function useSocket(event: string, callback: () => void) {
  useEffect(() => {
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
