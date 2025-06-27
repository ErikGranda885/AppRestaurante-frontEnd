import React from "react";
import { comandosDeGastos } from "./gastos";
import { comandosDeProductos } from "./productos";
import { comandosDeVentas } from "./ventas";
import { comandosDeTransformaciones } from "./transformaciones";
import { comandoGenerarReporte } from "./reportes";
import { generarEjemplosDeComandos } from "./ejemplos";

export const comandoVerComandos = {
  nombre: "verComandos",
  patron: /\b(ver comandos|mostrar comandos|ayuda|qué puedo decir)\b/i,
  handler: async (_m: RegExpMatchArray, ctx: any) => {
    console.log("🧩 Contexto recibido en comandoVerComandos:", ctx);
    const ejemplosGenerados = generarEjemplosDeComandos(ctx.rol ?? "sin_rol");
    console.log("📋 Comandos mostrados al usuario:", ejemplosGenerados);
    ctx.agregarMensajeBot(
      <div className="space-y-1">
        <p>📂 Comandos disponibles:</p>
        <ul className="list-inside list-disc pl-2">
          {ejemplosGenerados.map((ej, idx) => (
            <li
              key={idx}
              className="comando-opcion cursor-pointer hover:underline"
              onClick={() => {
                // Bloquea todos los comandos al hacer clic
                document.querySelectorAll(".comando-opcion").forEach((el) => {
                  el.classList.add("pointer-events-none", "opacity-50");
                });
                setTimeout(() => ctx.procesarEntradaDirecta?.(ej), 120);
              }}
              tabIndex={0}
            >
              {ej}
            </li>
          ))}
        </ul>
        <p>🚀 Estoy listo para ayudarte.</p>
      </div>,
    );
  },
};

export const allCommands = [
  ...comandosDeProductos,
  ...comandosDeVentas,
  ...comandosDeGastos,
  ...comandosDeTransformaciones,
  comandoGenerarReporte,
  comandoVerComandos,
];
