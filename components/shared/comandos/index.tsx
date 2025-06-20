import React from "react";
import { comandosDeGastos } from "./gastos";
import { comandosDeProductos } from "./productos";
import { comandosDeVentas } from "./ventas";
import { comandosDeTransformaciones } from "./transformaciones";
import { comandoGenerarReporte } from "./reportes";
import ejemplos, { generarEjemplosDeComandos } from "./ejemplos";

export const comandoVerComandos = {
  nombre: "verComandos",
  patron: /\b(ver comandos|mostrar comandos|ayuda|qué puedo decir)\b/i,
  handler: async (_m: RegExpMatchArray, ctx: any) => {
    const ejemplosGenerados = generarEjemplosDeComandos();

    ctx.agregarMensajeBot(
      <div className="space-y-1">
        <p>📂 Comandos disponibles:</p>
        <ul className="list-inside list-disc pl-2">
          {ejemplosGenerados.map((ej, idx) => (
            <li key={idx}>{ej}</li>
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
