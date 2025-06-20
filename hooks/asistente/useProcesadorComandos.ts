
import { allCommands } from "@/components/shared/comandos";
import { handleFlowProducto } from "@/components/shared/comandos/productos";
import { handleFlowReporte } from "@/components/shared/comandos/reportes";
import { handleFlowVenta } from "@/components/shared/comandos/ventas";
import React from "react";

export function useProcesadorComandos({
  flowProducto,
  flowVenta,
  flowReporte,
  agregarMensaje,
  pendingSuggestions,
  setPendingSuggestions,
  contexto,
  mensajes,
  setMensajes,
}: {
  flowProducto: any;
  flowVenta: any;
  flowReporte: any;
  agregarMensaje: (
    tipo: "usuario" | "asistente",
    texto: string | React.ReactNode,
    leer?: boolean,
    duracionMs?: number,
  ) => void;
  pendingSuggestions: string[] | null;
  setPendingSuggestions: (sugs: string[] | null) => void;
  contexto: any;
  mensajes: any[];
  setMensajes: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .replace(/[-.,!?¡¿]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const procesarComando = async (texto: string) => {
    const textoNormalizado = normalizar(texto);
    const inicio = Date.now();

    const manejarCancelacion = (txt: string): boolean => {
      if (!/cancelar|detener|salir/i.test(txt)) return false;
      agregarMensaje("asistente", "🚫 Flujo cancelado por el usuario.");
      contexto.setFlow(null);
      setPendingSuggestions(null);
      return true;
    };

    const manejarFlujo = async (flow: any, handler: any): Promise<boolean> => {
      if (!flow) return false;
      await handler(texto, flow, contexto);
      if (!flow) setPendingSuggestions(null);
      return true;
    };

    const manejarSugerencia = async (): Promise<boolean> => {
      if (!Array.isArray(pendingSuggestions)) return false;

      const match = pendingSuggestions.find(
        (s: string) => normalizar(s) === textoNormalizado,
      );
      if (match) {
        setPendingSuggestions(null);
        await procesarComando(`inventario de ${match}`);
        return true;
      }

      const encontrado = await manejarComando();
      if (encontrado) return true;

      agregarMensaje(
        "asistente",
        `❌ No reconozco esa opción. Di una de: ${pendingSuggestions.join(", ")}`,
      );
      return true;
    };

    const manejarComando = async (): Promise<boolean> => {
      for (const comando of allCommands) {
        const match = texto.match(comando.patron);
        if (match) {
          await comando.handler(match, contexto);
          return true;
        }
      }
      return false;
    };

    const manejarCierre = (txt: string): boolean => {
      if (!txt.includes("cerrar asistente")) return false;
      agregarMensaje("asistente", "👋 Hasta luego.");
      return true;
    };

    const handlers = [
      () => manejarCancelacion(texto),
      () => manejarFlujo(flowProducto, handleFlowProducto),
      () => manejarFlujo(flowVenta, handleFlowVenta),
      () => manejarFlujo(flowReporte, handleFlowReporte),
      () => manejarSugerencia(),
      () => manejarComando(),
      () => manejarCierre(texto),
    ];

    const indexAntes = mensajes.length;

    for (const ejecutar of handlers) {
      const resultado = await ejecutar();
      if (resultado) {
        const fin = Date.now();
        const duracion = fin - inicio;

        setMensajes((prev) => {
          const copia = [...prev];
          for (let i = copia.length - 1; i >= indexAntes; i--) {
            if (
              copia[i].tipo === "asistente" &&
              copia[i].duracionMs === undefined
            ) {
              copia[i] = { ...copia[i], duracionMs: duracion };
              break;
            }
          }
          return copia;
        });
        return;
      }
    }

    agregarMensaje("asistente", "❌ No entendí ese comando.");
  };

  return { procesarComando };
}
