import {
  DEFAULT_PRODUCT_IMAGE_URL,
  TIP_PROD_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

export type FlowProducto = {
  step:
    | "confirmacion"
    | "tipo"
    | "categoria"
    | "unidad"
    | "sugerenciaInventario";
  data: {
    nom_prod: string;
    cate_prod?: number;
    tip_prod?: string;
    und_prod?: string;
    sugerencias?: string[];
  };
};

type Contexto = {
  agregarMensajeBot: (texto: string) => void;
  establecerSugerenciasPendientes: (sugs: string[]) => void;
  setFlow: (flow: FlowProducto | null) => void;
};

export const comandosDeProductos = [
  {
    nombre: "inventario",
    patron: /^inventario de (.+)$/i,
    handler: async (m: RegExpMatchArray, ctx: Contexto) => {
      const prod = m[1].trim();
      ctx.agregarMensajeBot(`\u23F3 Consultando inventario de ${prod}...`);
      try {
        const resp = await fetch(SERVICIOS_INVENTARIO.stockPorNombre(prod));
        const datos = await resp.json();

        if (resp.ok && datos.stock != null) {
          ctx.setFlow(null);
          ctx.agregarMensajeBot(
            `\u2705 Hay ${datos.stock} unidades de ${prod}.`,
          );
        } else if (
          Array.isArray(datos.suggestions) &&
          datos.suggestions.length > 0
        ) {
          ctx.establecerSugerenciasPendientes(datos.suggestions);
          ctx.agregarMensajeBot(
            `\u274C No existe "${prod}". \u00BfQuiz\u00E1s quisiste: ${datos.suggestions.join(", ")}?`,
          );
          ctx.setFlow({
            step: "sugerenciaInventario",
            data: { nom_prod: prod, sugerencias: datos.suggestions },
          });
        } else {
          ctx.agregarMensajeBot(`\u274C No existe "${prod}" en el inventario.`);
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`\u274C ${e.message}`);
      }
    },
  },
  {
    nombre: "agregarProducto",
    patron: /^agregar producto[,:]?\s*(.+)$/i,
    handler: (m: RegExpMatchArray, ctx: Contexto) => {
      const nombre = m[1].trim();
      ctx.setFlow({ step: "confirmacion", data: { nom_prod: nombre } });
      ctx.agregarMensajeBot(
        `\u00BFConfirmas que quieres crear el producto "${nombre}"? Di 'cancelar' si deseas salir.`,
      );
    },
  },
];

export async function handleFlowProducto(
  texto: string,
  flow: FlowProducto,
  ctx: Contexto,
) {
  const { step, data } = flow;

  // Si es un comando de inventario, ejecutarlo directamente
  const match = texto.match(/^inventario de (.+)$/i);
  if (match) {
    ctx.setFlow(null); // Limpiar el flujo actual
    await comandosDeProductos[0].handler(match, ctx);
    return;
  }

  // Detectar si el texto actual es un nuevo comando
  for (const comando of comandosDeProductos) {
    const match = texto.match(comando.patron);
    if (match) {
      ctx.setFlow(null); // Limpiar cualquier flujo activo
      await comando.handler(match, ctx);
      return;
    }
  }

  switch (step) {
    case "sugerenciaInventario": {
      const input = texto.trim().toLowerCase();
      const match = flow.data.sugerencias?.find(
        (sug) => sug.toLowerCase() === input,
      );

      if (!match) {
        ctx.agregarMensajeBot(
          "\u274C Opción no válida. Intenta con una de las sugerencias.",
        );
        return;
      }

      ctx.agregarMensajeBot(`\u23F3 Consultando inventario de "${match}"...`);
      try {
        const resp = await fetch(SERVICIOS_INVENTARIO.stockPorNombre(match));
        const datos = await resp.json();

        if (resp.ok && datos.stock != null) {
          ctx.agregarMensajeBot(
            `\u2705 Hay ${datos.stock} unidades de ${match}.`,
          );
        } else {
          ctx.agregarMensajeBot(
            `\u274C No se pudo obtener el inventario de "${match}".`,
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(
          `\u274C Error al consultar inventario: ${e.message}`,
        );
      }

      ctx.setFlow(null); // 🧹 IMPORTANTE: limpiar el flujo después
      return;
    }

    case "confirmacion": {
      const resp = texto.toLowerCase();
      if (/(^si$|^sí$|^confirmar$|^correcto$)/.test(resp)) {
        const tipos = TIP_PROD_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(tipos);
        ctx.setFlow({ step: "tipo", data });
        ctx.agregarMensajeBot(
          `¿Cuál es el tipo de producto? Opciones: ${tipos.join(", ")}. Di 'cancelar' si deseas salir.`,
        );
      } else if (/(^no$|^cancelar$|^salir$)/.test(resp)) {
        ctx.agregarMensajeBot(`🚫 Creación de producto cancelada.`);
        ctx.setFlow(null);
      } else {
        ctx.agregarMensajeBot(
          `❓ No entendí. ¿Deseas crear el producto "${data.nom_prod}"? Di 'sí' para confirmar o 'cancelar' para salir.`,
        );
      }
      break;
    }

    case "tipo": {
      if (
        !TIP_PROD_OPTIONS.map((o: any) => o.value.toLowerCase()).includes(
          texto.toLowerCase(),
        )
      ) {
        ctx.agregarMensajeBot(
          `❌ Tipo no válido. Elige uno de: ${TIP_PROD_OPTIONS.map((o: any) => o.value).join(", ")}`,
        );
        return;
      }
      data.tip_prod = texto;

      if (texto.toLowerCase() === "insumo") {
        const unds = UNIT_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(unds);
        ctx.setFlow({ step: "unidad", data });
        ctx.agregarMensajeBot(
          `¿Cuál es la unidad de medida? Opciones:\n` +
            UNIT_OPTIONS.map((o) => `🔹 ${o.label}`).join("\n") +
            `\nDi 'cancelar' si deseas salir.`,
        );
      } else {
        try {
          const resCat = await fetch(SERVICIOS_PRODUCTOS.categorias);
          const catData = await resCat.json();
          const sugerencias = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );

          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ step: "categoria", data });

          ctx.agregarMensajeBot(
            `📦 Categorías disponibles:\n` +
              sugerencias.map((s: any) => `🔹 ${s}`).join("\n") +
              `\n\nElige una diciendo el ID o nombre. Di 'cancelar' si deseas salir.`,
          );
        } catch (e: any) {
          ctx.agregarMensajeBot(`❌ Error al cargar categorías: ${e.message}`);
          ctx.setFlow(null);
        }
      }
      break;
    }

    case "categoria": {
      const entrada = texto.trim().toLowerCase();
      try {
        const resCat = await fetch(SERVICIOS_PRODUCTOS.categorias);
        const catData = await resCat.json();

        const match = catData.categorias.find(
          (c: any) =>
            c.id_cate.toString() === entrada ||
            c.nom_cate.toLowerCase() === entrada,
        );

        if (!match) {
          const opciones = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );
          ctx.agregarMensajeBot(
            `❌ Categoría no reconocida. Opciones válidas:\n` +
              opciones.map((s: any) => `🔹 ${s}`).join("\n") +
              `\nIntenta nuevamente con el ID o nombre.`,
          );
          ctx.establecerSugerenciasPendientes(opciones);
          return;
        }

        data.cate_prod = match.id_cate;

        const unds = UNIT_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(unds);
        ctx.setFlow({ step: "unidad", data });
        ctx.agregarMensajeBot(
          `¿Cuál es la unidad de medida? Opciones:\n` +
            UNIT_OPTIONS.map((o) => `🔹 ${o.label}`).join("\n") +
            `\nDi 'cancelar' si deseas salir.`,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al validar categoría: ${e.message}`);
        ctx.setFlow(null);
      }
      break;
    }

    case "unidad": {
      const entrada = texto.trim().toLowerCase();

      const match = UNIT_OPTIONS.find((o) => {
        const valueMatch = o.value.toLowerCase() === entrada;
        const labelMatch = o.label.toLowerCase() === entrada;
        const labelWordsMatch = o.label.toLowerCase().split(" ")[0] === entrada;
        return valueMatch || labelMatch || labelWordsMatch;
      });

      if (!match) {
        ctx.agregarMensajeBot(
          `❌ Unidad no válida. Elige una de:\n${UNIT_OPTIONS.map(
            (o) => `🔹 ${o.label}`,
          ).join("\n")}`,
        );
        ctx.establecerSugerenciasPendientes(UNIT_OPTIONS.map((o) => o.label));
        return;
      }

      data.und_prod = match.value;

      try {
        const verifResp = await fetch(
          SERVICIOS_PRODUCTOS.verificarNombre(data.nom_prod),
        );
        const verifData = await verifResp.json();
        if (verifData.exists) {
          ctx.agregarMensajeBot(
            `⚠️ El producto "${data.nom_prod}" ya está registrado. Intenta con otro nombre.`,
          );
          ctx.setFlow(null);
          return;
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(
          `❌ Error al verificar nombre del producto: ${e.message}`,
        );
        ctx.setFlow(null);
        return;
      }

      const payload = {
        nom_prod: data.nom_prod,
        cate_prod:
          data.tip_prod?.toLowerCase() === "insumo" ? null : data.cate_prod,
        tip_prod: data.tip_prod,
        und_prod: data.und_prod,
        img_prod: DEFAULT_PRODUCT_IMAGE_URL,
      };

      ctx.agregarMensajeBot(`⏳ Creando producto "${data.nom_prod}"...`);

      try {
        const resp = await fetch(SERVICIOS_PRODUCTOS.productos, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await resp.json();
        if (
          resp.ok &&
          resData.producto?.nom_prod &&
          resData.producto?.id_prod
        ) {
          ctx.agregarMensajeBot(
            `✅ Producto "${resData.producto.nom_prod}" creado con ID ${resData.producto.id_prod}.`,
          );
        } else {
          ctx.agregarMensajeBot(
            `❌ No se pudo crear: ${resData.message || resp.status}`,
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al crear producto: ${e.message}`);
      }

      ctx.setFlow(null);
      break;
    }

    default:
      ctx.agregarMensajeBot("\u274C Paso no reconocido en el flujo actual.");
      ctx.setFlow(null);
      break;
  }
}
