import {
  DEFAULT_PRODUCT_IMAGE_URL,
  TIP_PROD_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { FlowProducto } from "../asistente/flujos/flujos";

export const comandosDeProductos = [
  {
    nombre: "inventario",
    patron: /^inventario de (.+)$/i,
    handler: async (m: RegExpMatchArray, ctx: any) => {
      const prod = m[1].trim();
      /* ctx.agregarMensajeBot(`⏳ Consultando inventario de ${prod}...`); */
      try {
        const resp = await fetch(SERVICIOS_INVENTARIO.stockPorNombre(prod));
        const datos = await resp.json();

        if (resp.ok && datos.stock != null) {
          ctx.setFlow(null);

          const stockDisplay = datos.interpretacion_stock
            ? datos.interpretacion_stock
            : `${datos.stock}`;

          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                📦 <strong>Información del producto:</strong>
              </p>
              <ul className="list-inside list-disc">
                <li>
                  Producto: <strong>{prod}</strong>
                </li>
                <li>
                  Stock disponible: <strong>{stockDisplay}</strong>
                </li>
              </ul>
            </div>,
          );
        } else if (
          Array.isArray(datos.suggestions) &&
          datos.suggestions.length > 0
        ) {
          ctx.establecerSugerenciasPendientes(datos.suggestions);

          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                ❌ El producto <strong>"{prod}"</strong> no se encuentra
                registrado.
              </p>
              <p>¿Quizás quisiste?:</p>
              <ul className="list-inside list-disc">
                {datos.suggestions.map((s: any, i: any) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      // Bloquea las demás sugerencias al hacer clic
                      document
                        .querySelectorAll("li.cursor-pointer")
                        .forEach((el) => {
                          el.classList.add("pointer-events-none", "opacity-50");
                        });
                      setTimeout(() => ctx.procesarEntradaDirecta?.(s), 120);
                    }}
                    tabIndex={0}
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <p>
                Di el nombre correcto o haz clic en una sugerencia para
                continuar.
              </p>
            </div>,
          );
          ctx.setFlow({
            step: "sugerenciaInventario",
            data: { nom_prod: prod, sugerencias: datos.suggestions },
          });
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
    handler: async (m: RegExpMatchArray, ctx: any) => {
      const nombre = m[1].trim();

      // 🔍 Verifica si ya existe
      try {
        const verifResp = await fetch(
          SERVICIOS_PRODUCTOS.verificarNombre(nombre),
        );
        const verifData = await verifResp.json();
        if (verifData.exists) {
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                ⚠️ <strong>Producto ya existente:</strong>
              </p>
              <ul className="list-inside list-disc">
                <li>
                  Nombre: <strong>{nombre}</strong>
                </li>
              </ul>
              <p>Por favor intenta con otro nombre.</p>
            </div>,
          );
          ctx.setFlow(null); // ⛔ Detén el flujo
          return;
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(
          `❌ Error al verificar nombre del producto: ${e.message}`,
        );
        ctx.setFlow(null);
        return;
      }

      // Si NO existe, continúa como siempre:
      document.querySelectorAll(".btn-opciones").forEach((el) => {
        el.classList.add("pointer-events-none", "opacity-50");
      });

      const nuevoFlujo: FlowProducto = {
        type: "producto",
        step: "confirmacion",
        data: { nom_prod: nombre },
      };
      ctx.setFlow(nuevoFlujo);

      ctx.agregarMensajeBot(
        <div className="space-y-2">
          <p>
            🤖 ¿Quieres crear el siguiente producto? <strong>"{nombre}"</strong>
            ?
          </p>
          <p>Haz clic o responde por voz:</p>
          <div className="flex flex-wrap gap-2">
            <span
              className="btn-opciones"
              onClick={() => {
                document.querySelectorAll(".btn-opciones").forEach((el) => {
                  el.classList.add("pointer-events-none", "opacity-50");
                });
                setTimeout(() => ctx.procesarEntradaDirecta?.("sí"), 120);
              }}
            >
              sí
            </span>
            <span
              className="btn-opciones"
              onClick={() => {
                document.querySelectorAll(".btn-opciones").forEach((el) => {
                  el.classList.add("pointer-events-none", "opacity-50");
                });
                setTimeout(() => ctx.procesarEntradaDirecta?.("cancelar"), 120);
              }}
            >
              cancelar
            </span>
          </div>
        </div>,
      );
    },
  },
];

export async function handleFlowProducto(
  texto: string,
  flow: FlowProducto & { type: "producto" },
  ctx: any,
) {
  console.log(
    "🧪 handleFlowProducto:: step=",
    flow.step,
    "type=",
    flow.type,
    "texto=",
    texto,
  );
  const { step, data } = flow;
  console.log("✅ Flow recibido:", flow);
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
  const normalizarEntrada = (txt: string) =>
    txt
      .toLowerCase()
      .replace(/[.,!?¡¿]+$/g, "")
      .trim();

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
      const normalizar = (txt: string) =>
        txt
          .toLowerCase()
          .replace(/[.,!?¡¿]/g, "")
          .trim();
      const resp = normalizar(texto);

      if (/(^si$|^sí$|^confirmar$|^correcto$)/.test(resp)) {
        // ⚠️ Bloquea todos los botones previos antes de avanzar
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });

        const tipos = TIP_PROD_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(tipos);
        ctx.setFlow({ type: "producto", step: "tipo", data });

        const tiposVisual = (
          <div className="space-y-2">
            <p>
              📂 <strong>¿Cuál es el tipo de producto?</strong>
            </p>
            <ul className="list-inside list-disc">
              {tipos.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <p>
              Di el nombre exacto o <strong>'cancelar'</strong> para salir.
            </p>
          </div>
        );

        ctx.agregarMensajeBot(tiposVisual);
      } else if (/(^no$|^cancelar$|^salir$)/.test(resp)) {
        // ⚠️ Bloquea todos los botones previos antes de cancelar
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });
        ctx.agregarMensajeBot(`🚫 Creación de producto cancelada.`);
        ctx.setFlow(null);
      } else {
        // ⚠️ Bloquea todos los botones previos antes de mostrar nuevos
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              🤖 No te he entendido. ¿Deseas crear el producto{" "}
              <strong>"{data.nom_prod}"</strong>?
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className="btn-opciones"
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("sí"), 120);
                }}
              >
                sí
              </span>
              <span
                className="btn-opciones"
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(
                    () => ctx.procesarEntradaDirecta?.("cancelar"),
                    120,
                  );
                }}
              >
                cancelar
              </span>
            </div>
          </div>,
        );
      }
      break;
    }

    case "tipo": {
      const entrada = texto.trim().toLowerCase();
      const opciones = TIP_PROD_OPTIONS.map((o: any) => o.value);

      if (!opciones.map((o) => o.toLowerCase()).includes(entrada)) {
        // 🔒 Bloquea botones viejos
        document
          .querySelectorAll("li[style], li.cursor-pointer")
          .forEach((el) => {
            el.classList.add("pointer-events-none", "opacity-50");
          });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>🤖 No te he entendido. ¿Qué tipo de producto deseas crear?</p>
            <ul className="list-inside list-disc">
              {opciones.map((op, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    document
                      .querySelectorAll("li.cursor-pointer")
                      .forEach((el) => {
                        el.classList.add("pointer-events-none", "opacity-50");
                      });
                    setTimeout(() => ctx.procesarEntradaDirecta?.(op), 120);
                  }}
                  tabIndex={0}
                >
                  {op}
                </li>
              ))}
            </ul>
            <p>O di el nombre exacto por voz.</p>
          </div>,
        );
        ctx.establecerSugerenciasPendientes(opciones);
        return;
      }

      const tipoEncontrado = TIP_PROD_OPTIONS.find(
        (o) => o.value.toLowerCase() === entrada,
      );
      data.tip_prod = tipoEncontrado!.value;

      if (entrada === "insumo") {
        const unds = UNIT_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(unds);
        ctx.setFlow({ type: "producto", step: "unidad", data });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              📏 <strong>Unidades de medida disponibles:</strong>
            </p>
            <ul className="list-inside list-disc">
              {UNIT_OPTIONS.map((u, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    document
                      .querySelectorAll("li.cursor-pointer")
                      .forEach((el) => {
                        el.classList.add("pointer-events-none", "opacity-50");
                      });
                    setTimeout(
                      () => ctx.procesarEntradaDirecta?.(u.value),
                      120,
                    );
                  }}
                  tabIndex={0}
                >
                  {u.label}
                </li>
              ))}
            </ul>
            <p>
              Di el nombre exacto o <strong>'cancelar'</strong> para salir.
            </p>
          </div>,
        );
      } else {
        try {
          const resCat = await fetch(SERVICIOS_PRODUCTOS.categorias);
          const catData = await resCat.json();

          if (
            !Array.isArray(catData.categorias) ||
            catData.categorias.length === 0
          ) {
            ctx.agregarMensajeBot(
              <div className="space-y-2">
                <p>
                  ❌ <strong>No hay categorías registradas.</strong>
                </p>
                <p>Por favor crea al menos una categoría antes de continuar.</p>
              </div>,
            );
            ctx.setFlow(null);
            return;
          }

          const sugerencias = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );
          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ type: "producto", step: "categoria", data });

          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                📦 <strong>Categorías disponibles:</strong>
              </p>
              <ul className="list-inside list-disc">
                {catData.categorias.map((c: any, i: number) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      document
                        .querySelectorAll("li.cursor-pointer")
                        .forEach((el) => {
                          el.classList.add("pointer-events-none", "opacity-50");
                        });
                      setTimeout(
                        () =>
                          ctx.procesarEntradaDirecta?.(
                            `${c.id_cate}:${c.nom_cate}`,
                          ),
                        120,
                      );
                    }}
                    tabIndex={0}
                  >
                    {c.id_cate}:{c.nom_cate}
                  </li>
                ))}
              </ul>
              <p>
                Elige una opción o di el ID/nombre por voz.{" "}
                <strong>‘cancelar’</strong> para salir.
              </p>
            </div>,
          );
        } catch (e: any) {
          ctx.agregarMensajeBot(`❌ Error al cargar categorías: ${e.message}`);
          ctx.setFlow(null);
        }
      }
      break;
    }

    case "categoria": {
      const normalizar = (txt: string) =>
        txt
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[.,!?¡¿]/g, "")
          .trim();

      const entrada = normalizar(texto);

      try {
        const resCat = await fetch(SERVICIOS_PRODUCTOS.categorias);
        const catData = await resCat.json();

        // Permite comparar tanto ID (como string) como nombre (normalizado)
        const match = catData.categorias.find((c: any) => {
          const nombreNormalizado = normalizar(c.nom_cate);
          const idCoincide = c.id_cate.toString() === entrada;
          const nombreCoincide = nombreNormalizado === entrada;
          return idCoincide || nombreCoincide;
        });

        if (!match) {
          // 🔒 Bloquea los botones viejos antes de renderizar los nuevos
          document.querySelectorAll("li.cursor-pointer").forEach((el) => {
            el.classList.add("pointer-events-none", "opacity-50");
          });

          const opciones = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );
          ctx.establecerSugerenciasPendientes(opciones);

          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                🤖 No te he entendido . Por favor elige una categoría válida:
              </p>
              <ul className="list-inside list-disc">
                {catData.categorias.map((c: any, i: number) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      // Al hacer click, puedes enviar ID o nombre, ambos funcionan por tu lógica de arriba.
                      document
                        .querySelectorAll("li.cursor-pointer")
                        .forEach((el) => {
                          el.classList.add("pointer-events-none", "opacity-50");
                        });
                      // Envía solo el ID (como string)
                      setTimeout(
                        () =>
                          ctx.procesarEntradaDirecta?.(c.id_cate.toString()),
                        120,
                      );
                    }}
                    tabIndex={0}
                  >
                    {c.id_cate}:{c.nom_cate}
                  </li>
                ))}
              </ul>
              <p>Opciones válidas arriba. Elige una o di el nombre/ID.</p>
            </div>,
          );
          return;
        }

        data.cate_prod = match.id_cate;

        const unds = UNIT_OPTIONS.map((o: any) => o.value);
        ctx.establecerSugerenciasPendientes(unds);
        ctx.setFlow({ type: "producto", step: "unidad", data });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              📏 <strong>Unidades de medida disponibles:</strong>
            </p>
            <ul className="list-inside list-disc">
              {UNIT_OPTIONS.map((u, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    document
                      .querySelectorAll("li.cursor-pointer")
                      .forEach((el) => {
                        el.classList.add("pointer-events-none", "opacity-50");
                      });
                    setTimeout(
                      () => ctx.procesarEntradaDirecta?.(u.value),
                      120,
                    );
                  }}
                  tabIndex={0}
                >
                  {u.label}
                </li>
              ))}
            </ul>
            <p>
              Di el nombre exacto o <strong>'cancelar'</strong> para salir.
            </p>
          </div>,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al validar categoría: ${e.message}`);
        ctx.setFlow(null);
      }
      break;
    }

    case "unidad": {
      const entrada = normalizarEntrada(texto);
      const match = UNIT_OPTIONS.find((o) => {
        const valueMatch = o.value.toLowerCase() === entrada;
        const labelMatch = o.label.toLowerCase() === entrada;
        const labelWordsMatch = o.label.toLowerCase().split(" ")[0] === entrada;
        return valueMatch || labelMatch || labelWordsMatch;
      });

      if (!match) {
        document.querySelectorAll("li.cursor-pointer").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              🤖 No te he entendido. Por favor elige una unidad de medida
              válida:
            </p>
            <ul className="list-inside list-disc">
              {UNIT_OPTIONS.map((u, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    document
                      .querySelectorAll("li.cursor-pointer")
                      .forEach((el) => {
                        el.classList.add("pointer-events-none", "opacity-50");
                      });
                    setTimeout(
                      () => ctx.procesarEntradaDirecta?.(u.value),
                      120,
                    );
                  }}
                  tabIndex={0}
                >
                  {u.label}
                </li>
              ))}
            </ul>
            <p>Elige una de las opciones arriba.</p>
          </div>,
        );
        ctx.establecerSugerenciasPendientes(UNIT_OPTIONS.map((o) => o.label));
        return;
      }

      data.und_prod = match.value;
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
            `✅ Producto "${resData.producto.nom_prod}" creado exitosamente con ID ${resData.producto.id_prod}.`,
            true,
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
