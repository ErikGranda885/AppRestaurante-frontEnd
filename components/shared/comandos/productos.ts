import {
  DEFAULT_PRODUCT_IMAGE_URL,
  TIP_PROD_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

export type FlowProducto = {
  step: "confirmacion" | "tipo" | "categoria" | "unidad";
  data: {
    nom_prod: string;
    cate_prod?: number;
    tip_prod?: string;
    und_prod?: string;
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
      ctx.agregarMensajeBot(`⏳ Consultando inventario de ${prod}...`);
      try {
        const resp = await fetch(SERVICIOS_INVENTARIO.stockPorNombre(prod));
        const datos = await resp.json();

        if (resp.ok && datos.stock != null) {
          ctx.agregarMensajeBot(`✅ Hay ${datos.stock} unidades de ${prod}.`);
        } else if (
          Array.isArray(datos.suggestions) &&
          datos.suggestions.length > 0
        ) {
          ctx.establecerSugerenciasPendientes(datos.suggestions);
          ctx.agregarMensajeBot(
            `❌ No existe "${prod}". ¿Quizás quisiste: ${datos.suggestions.join(", ")}?`,
          );
        } else {
          ctx.agregarMensajeBot(`❌ No existe "${prod}" en el inventario.`);
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ ${e.message}`);
      }
    },
  },
  {
    nombre: "agregarProducto",
    patron: /^agregar producto[,:]?\s*(.+)$/i,
    handler: (m: RegExpMatchArray, ctx: Contexto) => {
      const nombre = m[1].trim();
      ctx.setFlow({
        step: "confirmacion",
        data: { nom_prod: nombre },
      });
      ctx.agregarMensajeBot(
        `¿Confirmas que quieres crear el producto "${nombre}"? Di 'cancelar' si deseas salir.`,
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

  if (/cancelar|detener|salir/i.test(texto)) {
    ctx.agregarMensajeBot("🚫 Creación de producto cancelada.");
    ctx.setFlow(null);
    return;
  }

  if (step === "confirmacion") {
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
    return;
  }

  if (step === "tipo") {
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
          `📦 Categorías disponibles:
` +
            sugerencias.map((s: any) => `🔹 ${s}`).join("\n") +
            `\n\nElige una diciendo el ID o nombre. Di 'cancelar' si deseas salir.`,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al cargar categorías: ${e.message}`);
        ctx.setFlow(null);
      }
    }
    return;
  }

  if (step === "categoria") {
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
    return;
  }

  if (step === "unidad") {
    const entrada = texto.trim().toLowerCase();

    const match = UNIT_OPTIONS.find((o) => {
      const valueMatch = o.value.toLowerCase() === entrada;
      const labelMatch = o.label.toLowerCase() === entrada;
      const labelWordsMatch = o.label.toLowerCase().split(" ")[0] === entrada; // permite que escriban "Unidad" en lugar de "Unidad (und)"
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

    // Verificación del nombre
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
      if (resp.ok && resData.producto?.nom_prod && resData.producto?.id_prod) {
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
  }
}
