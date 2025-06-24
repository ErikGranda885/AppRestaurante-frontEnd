import { allCommands } from "@/components/shared/comandos";
import { handleFlowProducto } from "@/components/shared/comandos/productos";
import { handleFlowReporte } from "@/components/shared/comandos/reportes";
import { handleFlowVenta } from "@/components/shared/comandos/ventas";
import React from "react";

export function useProcesadorComandos({
  agregarMensaje,
  pendingSuggestions,
  setPendingSuggestions,
  contexto,
  mensajes,
  setMensajes,
}: {
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

    const manejarFlujoPorTipo = async (): Promise<boolean> => {
      const flow = contexto.flow();

      console.log("🎯 manejarFlujoPorTipo: flow=", flow);
      if (!flow?.type) return false;

      switch (flow.type) {
        case "producto":
          await handleFlowProducto(texto, flow, contexto);
          return true;
        case "venta":
          await handleFlowVenta(texto, flow, contexto);
          return true;
        case "reporte":
          await handleFlowReporte(texto, flow, contexto);
          return true;
        default:
          return false;
      }
    };

    const manejarSugerencia = async (): Promise<boolean> => {
      const flow = contexto.flow?.();

      // Permitir sugerencias solo si hay un paso compatible
      if (
        flow &&
        !["sugerenciaInventario", "categoria", "unidad", "tipo"].includes(
          flow.step,
        )
      ) {
        return false;
      }

      if (!Array.isArray(pendingSuggestions)) return false;

      // Normalizador robusto para comparación
      const normalizar = (txt: string) =>
        (txt || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[.,!?¡¿]/g, "")
          .trim();

      // Coincidencia flexible: nombre o id o ambos
      const esCoincidencia = (s: string, valor: string) => {
        if (s.includes(":")) {
          const [id, ...resto] = s.split(":");
          const nombre = resto.join(":");
          return (
            normalizar(s) === valor ||
            normalizar(id) === valor ||
            normalizar(nombre) === valor
          );
        }
        return normalizar(s) === valor;
      };

      const match = pendingSuggestions.find((s: string) =>
        esCoincidencia(s, textoNormalizado),
      );

      if (match) {
        setPendingSuggestions(null);
        contexto.setFlow(null);

        // Si es sugerencia de inventario, procesar como comando
        if (flow?.step === "sugerenciaInventario" && flow.data?.nom_prod) {
          const simuladoMatch = Object.assign(
            [`inventario de ${match}`, match],
            {
              index: 0,
              input: `inventario de ${match}`,
              groups: undefined,
            },
          ) as RegExpMatchArray;

          allCommands[0].handler(simuladoMatch, contexto);
          return true;
        }

        await procesarComando(match);
        return true;
      }

      // Mostrar sugerencias como lista UL LI, clicables y accesibles
      agregarMensaje(
        "asistente",
        <div className="space-y-2">
          <p>
            <span style={{ color: "#e53e3e" }}>
              ❌ No reconozco esa opción.
            </span>{" "}
            Elige una de las siguientes:
          </p>
          <ul className="list-inside list-disc">
            {pendingSuggestions.map((s, i) => (
              <li
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // Bloquear todas después de hacer click
                  document.querySelectorAll("li[style]").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => procesarComando(s), 120);
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") procesarComando(s);
                }}
                className="hover:underline"
              >
                {s}
              </li>
            ))}
          </ul>
          <p>O di el nombre exacto por voz.</p>
        </div>,
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
      () => manejarFlujoPorTipo(),
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
