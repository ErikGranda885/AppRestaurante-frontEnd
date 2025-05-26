import React from "react";
import { comandosDeGastos } from "./gastos";
import { comandosDeProductos } from "./productos";
import { comandosDeVentas } from "./ventas";
import { comandosDeTransformaciones } from "./transformaciones";

export const allCommands = [
  ...comandosDeProductos,
  ...comandosDeVentas,
  ...comandosDeGastos,
  ...comandosDeTransformaciones,
  {
    nombre: "verComandos",
    patron: /\b(ver comandos|mostrar comandos|ayuda|qué puedo decir)\b/i,
    handler: async (_m: RegExpMatchArray, ctx: any) => {
      const ejemplos = generarEjemplosDeComandos();

      const ayuda = (
        <div className="space-y-1">
          <p>📂 Comandos disponibles:</p>
          <ul className="list-inside list-disc pl-2">
            {ejemplos.map((ej, idx) => (
              <li key={idx}>{ej}</li>
            ))}
          </ul>
          <p>🚀 Estoy listo para ayudarte.</p>
        </div>
      );

      ctx.agregarMensajeBot(ayuda);
    },
  },
];

const ejemplos: Record<string, string> = {
  // 🗃️ Inventario y productos
  inventario: "Inventario de Coca Cola",
  agregarProducto: "Agregar producto Dorito azul",

  // 💵 Ventas
  ventasHoy: "¿Cuánto se vendió hoy?",

  // 💸 Gastos
  registrarGasto: "Registrar gasto 5.75 por pan",
  gastosHoy: "¿Cuánto gasté hoy?",

  // 🍳 Transformaciones
  realizarTransformacion: "Transformar 4 de shawarma",
  transformacionesHoy: "¿Qué transformaciones se hicieron hoy?",

  // 🧠 Ayuda
  verComandos: "Ver comandos",
};

export const generarEjemplosDeComandos = (): string[] =>
  allCommands
    .map((cmd) => ejemplos[cmd.nombre])
    .filter((ej): ej is string => Boolean(ej));
