import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
import { FlowVenta } from "../asistente/flujos/flujos";
import {
  convertirCantidad,
  normalizarEntrada,
} from "@/utils/conversorCantidad";
import { BotonAccion } from "../asistente/botonAccion";

function formatearDuracion(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const horas = Math.floor(totalSeconds / 3600);
  const minutos = Math.floor((totalSeconds % 3600) / 60);
  const segundos = totalSeconds % 60;

  const hh = horas.toString().padStart(2, "0");
  const mm = minutos.toString().padStart(2, "0");
  const ss = segundos.toString().padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

export const comandosDeVentas = [
  {
    nombre: "ventasHoy",
    patron:
      /\b(cu[aá]nt[oó] (se )?vendi[oó]( hoy)?|ventas( de)? hoy|mostrar ventas( del d[ií]a)?)\b/i,
    handler: async (_m: RegExpMatchArray, ctx: any) => {
      try {
        const hoy = new Date();
        const fechaHoy = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${hoy.getDate().toString().padStart(2, "0")}`;

        const resp = await fetch(SERVICIOS_VENTAS.totalPorFecha(fechaHoy));
        const datos = await resp.json();

        console.log("📦 Datos recibidos de ventas:", datos);

        if (resp.ok && typeof datos.total === "number") {
          const totalFormateado = datos.total.toFixed(2);
          const fechaFormateada = fechaHoy.split("-").reverse().join("/");

          if (Number(totalFormateado) === 0) {
            // Visual (con emoji, no leer)
            ctx.agregarMensajeBot(
              `🤖 No se han realizado ventas el dia de hoy.`,
              true,
            );
          } else {
            const total = Number(totalFormateado);
            const esPlural =
              total === 1 ? "dólar" : total < 1 ? "centavos" : "dólares";
            ctx.agregarMensajeBot(
              `🤖 El total vendido hoy es ${totalFormateado} ${esPlural}`,
              true,
            );
          }
        } else {
          ctx.agregarMensajeBot(
            "No se pudo obtener el total de ventas de hoy.",
            true,
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`Error al consultar ventas: ${e.message}`, true);
      }
    },
  },

  {
    nombre: "iniciarVenta",
    patron: /\b(registrar venta|nueva venta|hacer una venta|iniciar venta)\b/i,
    handler: async (_m: any, ctx: any) => {
      try {
        const res = await fetch(SERVICIOS_PRODUCTOS.categorias);
        const catData = await res.json();
        const categorias = catData.categorias;

        if (!Array.isArray(categorias) || categorias.length === 0) {
          ctx.agregarMensajeBot("❌ No hay categorías disponibles.");
          return;
        }

        const sugerencias = categorias.map(
          (c: any) => `${c.id_cate}:${c.nom_cate}`,
        );
        ctx.establecerSugerenciasPendientes(sugerencias);
        const data: FlowVenta["data"] = {};
        ctx.setFlow({ type: "venta", step: "categoria", data });
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              📦 <strong>Categorías disponibles:</strong>
            </p>
            <ul className="list-inside list-disc">
              {sugerencias.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <p>Indica el ID o nombre de la categoría para continuar.</p>
          </div>,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al obtener categorías: ${e.message}`);
      }
    },
  },
];

export async function handleFlowVenta(
  texto: string,
  flow: FlowVenta,
  ctx: any,
) {
  const { step, data } = flow;
  const entrada = texto.trim().toLowerCase();

  // Permitir cancelar en cualquier paso
  if (/^(cancelar|salir)$/i.test(entrada)) {
    ctx.agregarMensajeBot("🚫 Proceso cancelado.");
    ctx.setFlow(null);
    ctx.estadoInterno = {};
    return;
  }

  switch (step) {
    case "categoria": {
      try {
        const res = await fetch(SERVICIOS_PRODUCTOS.categorias);
        const catData = await res.json();

        // Validación de entrada
        if (/^(sí|si|no|cancelar|sf)$/i.test(entrada)) {
          ctx.agregarMensajeBot(
            "⚠️ Por favor, elige una categoría válida de la lista mostrada.",
          );
          return;
        }

        const entradaNormalizada = normalizarEntrada(texto);
        const match = catData.categorias.find(
          (c: any) =>
            c.id_cate.toString() === entradaNormalizada ||
            normalizarEntrada(c.nom_cate) === entradaNormalizada,
        );

        if (!match) {
          const opciones = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                🤖 No te he entendido. Por favor elige una categoría valida:
              </p>
              <ul className="list-inside list-disc">
                {opciones.map((s: any, i: any) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p>Indica el ID o nombre de la categoría para continuar.</p>
            </div>,
          );
          ctx.establecerSugerenciasPendientes(opciones);
          ctx.setFlow({ type: "venta", step: "categoria", data });
          ctx.estadoInterno = {};
          return;
        }

        data.categoriaId = match.id_cate;
        data.categoriaNombre = match.nom_cate;

        const resp = await fetch(
          SERVICIOS_PRODUCTOS.productosPorCategoria(match.id_cate),
        );
        const prodData = await resp.json();
        const productos = prodData.productos || [];

        if (!Array.isArray(productos) || productos.length === 0) {
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>❌ No hay productos en esta categoría.</p>
              <p>📦 Elige otra categoría:</p>
              <ul className="list-inside list-disc">
                {catData.categorias.map((c: any, i: number) => (
                  <li key={i}>
                    {c.id_cate}:{c.nom_cate}
                  </li>
                ))}
              </ul>
            </div>,
          );
          const sugerencias = catData.categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );
          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ type: "venta", step: "categoria", data });
          ctx.estadoInterno = {};
          return;
        }

        const sugerencias = productos.map(
          (p: any) => `${p.id_prod}:${p.nom_prod}`,
        );

        ctx.establecerSugerenciasPendientes(sugerencias);
        ctx.setFlow({ type: "venta", step: "producto", data });
        ctx.estadoInterno = {};
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              📦{" "}
              <strong>
                Productos disponibles en categoría "{match.nom_cate}":
              </strong>
            </p>
            <ul className="list-inside list-disc">
              {sugerencias.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <p>Indica el ID o nombre del producto.</p>
          </div>,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error: ${e.message}`);
        ctx.setFlow(null);
        ctx.estadoInterno = {};
      }
      break;
    }

    case "producto": {
      try {
        const resp = await fetch(
          SERVICIOS_PRODUCTOS.productosPorCategoria(data.categoriaId!),
        );
        const prodData = await resp.json();
        const productos = prodData.productos || [];

        const entradaNormalizada = normalizarEntrada(texto);
        const match = productos.find(
          (p: any) =>
            p.id_prod.toString() === entradaNormalizada ||
            normalizarEntrada(p.nom_prod) === entradaNormalizada,
        );

        if (!match) {
          const sugerencias = productos.map(
            (p: any) => `${p.id_prod}:${p.nom_prod}`,
          );
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                🤖 Producto no encontrado. Por favor, elige uno de la lista:
              </p>
              <ul className="list-inside list-disc">
                {sugerencias.map((s: any, i: any) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p>Indica el ID o nombre del producto.</p>
            </div>,
          );
          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ type: "venta", step: "producto", data });
          ctx.estadoInterno = {};
          return;
        }

        // 🚩 Consulta stock antes de continuar
        try {
          const respStock = await fetch(
            SERVICIOS_INVENTARIO.stockPorNombre(match.nom_prod),
          );
          const datosStock = await respStock.json();

          if (!respStock.ok || datosStock.stock == null) {
            ctx.agregarMensajeBot(
              `❌ No se pudo obtener el stock del producto seleccionado.`,
            );
            ctx.setFlow(null);
            ctx.estadoInterno = {};
            return;
          }

          if (datosStock.stock <= 0) {
            // Volver a categorías si no hay stock
            const resCategorias = await fetch(SERVICIOS_PRODUCTOS.categorias);
            const catData = await resCategorias.json();
            const categorias = catData.categorias || [];
            const sugerenciasCat = categorias.map(
              (c: any) => `${c.id_cate}:${c.nom_cate}`,
            );

            // Mensaje leído por el asistente
            ctx.agregarMensajeBot(
              `❌ El producto "${match.nom_prod}" no tiene stock disponible.`,
              true,
            );

            // Mensaje visual complementario, no leído
            ctx.agregarMensajeBot(
              <div className="space-y-2">
                <p>📦 Elige otra categoría:</p>
                <ul className="list-inside list-disc">
                  {sugerenciasCat.map((s: any, i: any) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <p>Indica el ID o nombre de la categoría para continuar.</p>
              </div>,
              false,
            );

            ctx.establecerSugerenciasPendientes(sugerenciasCat);
            ctx.setFlow({ type: "venta", step: "categoria", data });
            ctx.estadoInterno = {};
            return;
          }

          // ✅ Si hay stock, guarda el stock y continua
          data.productoId = match.id_prod;
          data.productoNombre = match.nom_prod;
          data.precioUnitario = Number(match.prec_vent_prod);
          data.stockDisponible = datosStock.stock; // <-- guarda el stock disponible

          ctx.setFlow({ type: "venta", step: "cantidad", data });
          ctx.estadoInterno = {};
          ctx.agregarMensajeBot(
            <div>
              🧮 ¿Cuántas unidades de "{match.nom_prod}" deseas vender?{" "}
              <span style={{ color: "#888" }}>
                Stock disponible: <strong>{datosStock.stock}</strong>
              </span>
            </div>,
          );
        } catch (eStock: any) {
          ctx.agregarMensajeBot(
            `❌ Error al consultar el stock: ${eStock.message}`,
          );
          ctx.setFlow(null);
          ctx.estadoInterno = {};
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al buscar producto: ${e.message}`);
        ctx.setFlow(null);
        ctx.estadoInterno = {};
      }
      break;
    }

    case "cantidad": {
      // 👇 Bloquea todos los botones de opciones al inicio del handler
      document.querySelectorAll(".btn-opciones").forEach((el) => {
        el.classList.add("pointer-events-none", "opacity-50");
      });

      console.log("[VENTA][cantidad] Entrada recibida:", entrada);

      if (/^(cancelar|salir)$/i.test(entrada)) {
        ctx.agregarMensajeBot("🚫 Proceso cancelado.");
        ctx.setFlow(null);
        ctx.estadoInterno = {};
        return;
      }
      const cantidad = convertirCantidad(entrada);
      console.log("[VENTA][cantidad] Cantidad convertida:", cantidad);

      // Validación de cantidad válida
      if (!cantidad || cantidad <= 0 || !Number.isInteger(cantidad)) {
        ctx.agregarMensajeBot(
          `🤖 No te he entendido . Por favor, ingresa la cantidad del producto a vender.`,
          false,
        );
        return;
      }

      // Validación contra el stock disponible
      if (
        typeof data.stockDisponible === "number" &&
        cantidad > data.stockDisponible
      ) {
        ctx.agregarMensajeBot(
          `🤖 No puedes vender más del stock disponible. Stock actual: ${data.stockDisponible}. Ingresa una cantidad válida.`,
          false,
        );
        return;
      }

      data.cantidad = cantidad;
      data.totalVenta = cantidad * (data.precioUnitario || 0);

      if (!Array.isArray(data.productos)) {
        data.productos = [];
      }

      data.productos.push({
        productoId: data.productoId!,
        productoNombre: data.productoNombre!,
        cantidad,
        precioUnitario: Number(data.precioUnitario!), // <-- asegurado como number
      });

      console.log("[VENTA][cantidad] Data después de push:", data);

      ctx.setFlow({
        type: "venta",
        step: "agregarOtro",
        data,
      });

      setTimeout(() => {
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>➕ ¿Deseas agregar otro producto a la venta?</p>
            <div className="flex gap-2">
              <BotonAccion
                paso="agregarOtro"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("si"), 150);
                }}
              >
                si
              </BotonAccion>
              <BotonAccion
                paso="agregarOtro"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("no"), 150);
                }}
              >
                no
              </BotonAccion>
            </div>
          </div>,
        );
      }, 0);

      break;
    }

    case "agregarOtro": {
      console.log("[VENTA][agregarOtro] Entrada recibida:", entrada);
      console.log("[VENTA][agregarOtro] Paso actual:", ctx.flow()?.step);
      if (/^(sí|si)$/i.test(normalizarEntrada(entrada))) {
        if (ctx.estadoInterno?.mostrandoCategorias) return;
        ctx.estadoInterno = { ...ctx.estadoInterno, mostrandoCategorias: true };

        try {
          const res = await fetch(SERVICIOS_PRODUCTOS.categorias);
          const catData = await res.json();
          const categorias = catData.categorias;

          if (!Array.isArray(categorias) || categorias.length === 0) {
            ctx.agregarMensajeBot("❌ No hay categorías disponibles.");
            ctx.setFlow(null);
            ctx.estadoInterno = {};
            return;
          }

          const sugerencias = categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );

          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ type: "venta", step: "categoria", data });
          // NO limpiar estado aquí porque mostramos categorías
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                📦 <strong>Categorías disponibles:</strong>
              </p>
              <ul className="list-inside list-disc">
                {sugerencias.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p>Indica el ID o nombre de la categoría para continuar.</p>
            </div>,
          );
        } catch (e: any) {
          ctx.agregarMensajeBot(`❌ Error al obtener categorías: ${e.message}`);
          ctx.setFlow(null);
          ctx.estadoInterno = {};
        }
        return;
      }

      if (/^(no|n)$/i.test(entrada)) {
        console.log("[VENTA][agregarOtro] Se eligió NO. Avanzando a pago.");
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              📝 <strong>Productos agregados a la venta:</strong>
            </p>
            <ul className="list-inside list-disc">
              {data.productos!.map((p: any, i: number) => (
                <li key={i}>
                  {p.cantidad} x {p.productoNombre} ($
                  {p.precioUnitario.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>,
        );
        ctx.setFlow({ type: "venta", step: "pago", data });

        setTimeout(() => {
          console.log(
            "[VENTA][agregarOtro] Renderizando botones de pago. Paso actual:",
            ctx.flow()?.step,
          );
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>💰 ¿Cuál es el método de pago?</p>
              <div className="flex gap-2">
                <BotonAccion
                  paso="pago"
                  pasoActual={ctx.flow()?.step}
                  onClick={() => {
                    document.querySelectorAll(".btn-opciones").forEach((el) => {
                      el.classList.add("pointer-events-none", "opacity-50");
                    });
                    setTimeout(
                      () => ctx.procesarEntradaDirecta?.("efectivo"),
                      150,
                    );
                  }}
                >
                  efectivo
                </BotonAccion>
              </div>
            </div>,
          );
        }, 0);

        return;
      } else {
        ctx.establecerSugerenciasPendientes(["sí", "no"]);
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p> 🤖 No te he entendido. ¿Quieres agregar otro producto?</p>
            <div className="flex gap-2">
              <BotonAccion
                paso="agregarOtro"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("sí"), 120);
                }}
              >
                sí
              </BotonAccion>
              <BotonAccion
                paso="agregarOtro"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("no"), 120);
                }}
              >
                no
              </BotonAccion>
            </div>
          </div>,
        );
      }
      break;
    }

    case "pago": {
      console.log("[VENTA][pago] Entrada recibida:", entrada);
      console.log("[VENTA][pago] Paso actual:", ctx.flow()?.step);

      // Solo acepta "efectivo"
      if (entrada !== "efectivo") {
        console.log("[VENTA][pago] Método NO válido recibido:", entrada);
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              🤖 No te he entendido. Selecciona el método de pago disponible:
            </p>
            <div className="flex gap-2">
              <BotonAccion
                paso="pago"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(
                    () => ctx.procesarEntradaDirecta?.("efectivo"),
                    150,
                  );
                }}
              >
                efectivo
              </BotonAccion>
            </div>
          </div>,
        );
        return;
      }

      data.metodoPago = "efectivo";

      // Mostrar resumen visual antes de avanzar
      const subtotal =
        data.productos?.reduce(
          (acc, p) => acc + p.precioUnitario * p.cantidad,
          0,
        ) ?? 0;
      const iva = 0.12;
      const ivaTotal = parseFloat((subtotal * iva).toFixed(2));
      const totalFinal = parseFloat((subtotal + ivaTotal).toFixed(2));

      ctx.agregarMensajeBot(
        <div className="space-y-2">
          <p>
            🧾 <strong>Resumen de la venta:</strong>
          </p>
          <ul className="list-inside list-disc">
            {data.productos!.map((p: any, i: number) => (
              <li key={i}>
                {p.cantidad} x {p.productoNombre} ($
                {p.precioUnitario.toFixed(2)})
              </li>
            ))}
            <li>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong>
            </li>
            <li>
              IVA (12%): <strong>${ivaTotal.toFixed(2)}</strong>
            </li>
            <li>
              Total: <strong>${totalFinal.toFixed(2)}</strong>
            </li>
            <li>
              Método de pago: <strong>{data.metodoPago}</strong>
            </li>
          </ul>
        </div>,
      );

      ctx.setFlow({ type: "venta", step: "montoEfectivo", data });
      ctx.estadoInterno = {};
      setTimeout(() => {
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>💵 El total de la venta es ${totalFinal.toFixed(2)}.</p>
            <p>¿Con cuánto efectivo pagó el cliente? (ej: 5.00)</p>
          </div>,
        );
      }, 0);
      break;
    }

    case "montoEfectivo": {
      if (entrada === "efectivo") {
        ctx.agregarMensajeBot(
          "⚠️ Ya indicaste el método de pago. Ahora ingresa el monto recibido. Ejemplo: 5.00",
        );
        return;
      }

      const monto = parseFloat(entrada.replace(",", "."));
      if (isNaN(monto) || monto <= 0) {
        ctx.agregarMensajeBot(
          "🤖 No te he entendido. Ingresa el monto recibido:",
          false,
        );
        return;
      }

      // Calcular total real de la venta
      const subtotal = data.productos!.reduce(
        (acc, p) => acc + p.precioUnitario * p.cantidad,
        0,
      );
      const iva = 0.12;
      const ivaTotal = parseFloat((subtotal * iva).toFixed(2));
      const totalFinal = parseFloat((subtotal + ivaTotal).toFixed(2));

      // Validar que el monto recibido sea suficiente
      if (monto < totalFinal) {
        ctx.agregarMensajeBot(
          `🤖 El monto recibido ($${monto.toFixed(
            2,
          )}) no puede ser menor al total de la venta ($${totalFinal.toFixed(2)}). Ingresa un monto válido.`,
          false,
        );
        return;
      }

      data.totalVenta = monto;

      // Mostrar resumen visual antes de confirmar
      ctx.agregarMensajeBot(
        <div className="space-y-2">
          <p>
            🧾 <strong>Resumen de la venta:</strong>
          </p>
          <ul className="list-inside list-disc">
            {data.productos!.map((p: any, i: number) => (
              <li key={i}>
                {p.cantidad} x {p.productoNombre} ($
                {p.precioUnitario.toFixed(2)})
              </li>
            ))}
            <li>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong>
            </li>
            <li>
              IVA (12%): <strong>${ivaTotal.toFixed(2)}</strong>
            </li>
            <li>
              Total: <strong>${totalFinal.toFixed(2)}</strong>
            </li>
            <li>
              Método de pago: <strong>{data.metodoPago}</strong>
            </li>
            <li>
              Monto recibido: <strong>${monto.toFixed(2)}</strong>
            </li>
          </ul>
        </div>,
      );

      ctx.setFlow({ type: "venta", step: "confirmacion", data });
      setTimeout(() => {
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>✅ ¿Confirmas registrar esta venta?</p>
            <div className="flex gap-2">
              <BotonAccion
                paso="confirmacion"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("sí"), 120);
                }}
              >
                sí
              </BotonAccion>
              <BotonAccion
                paso="confirmacion"
                pasoActual={ctx.flow()?.step}
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
              </BotonAccion>
            </div>
          </div>,
        );
      }, 0);
      break;
    }

    case "comprobante": {
      if (entrada === "efectivo" || entrada === "transferencia") {
        ctx.agregarMensajeBot(
          "⚠️ Ya se seleccionó transferencia como método. Ahora ingresa el número del comprobante.",
        );
        return;
      }

      if (!entrada || entrada.length < 3) {
        ctx.agregarMensajeBot(
          "❌ Número de comprobante inválido. Intenta nuevamente.",
        );
        return;
      }

      data.comprobanteNumero = entrada;

      // Resumen visual antes de confirmar
      const subtotal = data.productos!.reduce(
        (acc, p) => acc + p.precioUnitario * p.cantidad,
        0,
      );
      const iva = 0.12;
      const ivaTotal = parseFloat((subtotal * iva).toFixed(2));
      const totalFinal = parseFloat((subtotal + ivaTotal).toFixed(2));

      ctx.agregarMensajeBot(
        <div className="space-y-2">
          <p>
            🧾 <strong>Resumen de la venta:</strong>
          </p>
          <ul className="list-inside list-disc">
            {data.productos!.map((p: any, i: number) => (
              <li key={i}>
                {p.cantidad} x {p.productoNombre} ($
                {p.precioUnitario.toFixed(2)})
              </li>
            ))}
            <li>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong>
            </li>
            <li>
              IVA (12%): <strong>${ivaTotal.toFixed(2)}</strong>
            </li>
            <li>
              Total: <strong>${totalFinal.toFixed(2)}</strong>
            </li>
            <li>
              Método de pago: <strong>{data.metodoPago}</strong>
            </li>
            <li>
              Nro. Comprobante: <strong>{data.comprobanteNumero}</strong>
            </li>
          </ul>
        </div>,
      );

      ctx.setFlow({ type: "venta", step: "confirmacion", data });
      ctx.estadoInterno = {};
      ctx.establecerSugerenciasPendientes(["sí", "cancelar"]);
      ctx.agregarMensajeBot(
        <div className="space-y-2">
          <p>✅ ¿Confirmas registrar esta venta?</p>
          <div className="flex gap-2">
            <span className="btn-opciones">sí</span>
            <span className="btn-opciones">cancelar</span>
          </div>
        </div>,
      );
      break;
    }

    case "confirmacion": {
      if (/^(sí|si|confirmar|ok|dale|aceptar)$/i.test(entrada)) {
        ctx.agregarMensajeBot("⏳ Registrando venta...");

        try {
          const iva = 0.12;
          const productos = data.productos ?? [];

          if (productos.length === 0) {
            ctx.agregarMensajeBot("❌ No hay productos para registrar.");
            ctx.setFlow(null);
            ctx.estadoInterno = {};
            return;
          }

          const subtotal = productos.reduce(
            (acc, p) => acc + p.precioUnitario * p.cantidad,
            0,
          );

          const ivaTotal = parseFloat((subtotal * iva).toFixed(2));
          const totalFinal = parseFloat((subtotal + ivaTotal).toFixed(2));

          const montoRecibido =
            data.metodoPago === "efectivo" ? (data.totalVenta ?? 0) : null;

          const cambio =
            montoRecibido !== null
              ? parseFloat((montoRecibido - totalFinal).toFixed(2))
              : null;

          if (
            data.metodoPago === "efectivo" &&
            (montoRecibido ?? 0) < totalFinal
          ) {
            ctx.agregarMensajeBot(
              `❌ El monto recibido ($${montoRecibido?.toFixed(
                2,
              )}) no puede ser menor al total de la venta ($${totalFinal.toFixed(2)}).`,
            );
            ctx.setFlow(null);
            ctx.estadoInterno = {};
            return;
          }

          // Resumen previo a guardar
          ctx.agregarMensajeBot(
            <div className="space-y-2">
              <p>
                🧾 <strong>Venta a registrar:</strong>
              </p>
              <ul className="list-inside list-disc">
                {productos.map((p: any, i: number) => (
                  <li key={i}>
                    {p.cantidad} x {p.productoNombre} ($
                    {p.precioUnitario.toFixed(2)})
                  </li>
                ))}
                <li>
                  Subtotal: <strong>${subtotal.toFixed(2)}</strong>
                </li>
                <li>
                  IVA (12%): <strong>${ivaTotal.toFixed(2)}</strong>
                </li>
                <li>
                  Total: <strong>${totalFinal.toFixed(2)}</strong>
                </li>
                <li>
                  Método de pago: <strong>{data.metodoPago}</strong>
                </li>
                {data.metodoPago === "transferencia" && (
                  <li>
                    Nro. Comprobante: <strong>{data.comprobanteNumero}</strong>
                  </li>
                )}
                {data.metodoPago === "efectivo" && (
                  <li>
                    Monto recibido:{" "}
                    <strong>${montoRecibido?.toFixed(2)}</strong>
                  </li>
                )}
              </ul>
              {data.metodoPago === "efectivo" && (
                <p>
                  🪙 Cambio: <strong>${cambio?.toFixed(2)}</strong>
                </p>
              )}
            </div>,
          );

          const payloadVenta = {
            tot_vent: totalFinal,
            fech_vent: new Date().toISOString(),
            est_vent:
              data.metodoPago === "transferencia"
                ? "Por validar"
                : "Sin cerrar",
            tip_pag_vent: data.metodoPago,
            usu_vent: ctx.obtenerIdUsuario?.() ?? 1,
            comprobante_num_vent:
              data.metodoPago === "transferencia"
                ? data.comprobanteNumero
                : null,
            comprobante_img_vent: null,
            efe_recibido_vent:
              data.metodoPago === "efectivo" ? montoRecibido : null,
            efe_cambio_vent: data.metodoPago === "efectivo" ? cambio : null,
          };

          const ventaRes = await fetch(SERVICIOS_VENTAS.crearVenta, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadVenta),
          });

          const ventaData = await ventaRes.json();

          if (!ventaRes.ok || !ventaData.venta?.id_vent) {
            ctx.agregarMensajeBot(
              `❌ No se pudo registrar la venta: ${
                ventaData.message || "Error desconocido"
              }`,
            );
            ctx.setFlow(null);
            ctx.estadoInterno = {};
            return;
          }

          const id_vent = ventaData.venta.id_vent;

          for (const producto of productos) {
            const sub = producto.precioUnitario * producto.cantidad;

            const detallePayload = {
              vent_dventa: id_vent,
              prod_dventa: producto.productoId,
              cant_dventa: producto.cantidad,
              pre_uni_dventa: producto.precioUnitario,
              sub_tot_dventa: sub,
            };

            const detRes = await fetch("http://localhost:5000/dets-ventas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(detallePayload),
            });

            if (!detRes.ok) {
              ctx.agregarMensajeBot(
                `⚠️ Producto ${producto.productoNombre} no se pudo guardar en el detalle.`,
              );
              continue;
            }

            await fetch(SERVICIOS_INVENTARIO.consumirPorLote, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_prod: producto.productoId,
                cantidad: producto.cantidad,
              }),
            });
          }

          ctx.agregarMensajeBot(
            `✅ Venta registrada exitosamente con ID ${id_vent}.`,
          );

          ctx.setFlow(null);
          ctx.estadoInterno = {};
        } catch (e: any) {
          ctx.agregarMensajeBot(`❌ Error al registrar venta: ${e.message}`);
          ctx.setFlow(null);
          ctx.estadoInterno = {};
        }
      } else if (/^(cancelar|salir|no)$/i.test(entrada)) {
        ctx.agregarMensajeBot("🚫 Venta cancelada.");
        ctx.setFlow(null);
        ctx.estadoInterno = {};
      } else {
        document.querySelectorAll(".btn-opciones").forEach((el) => {
          el.classList.add("pointer-events-none", "opacity-50");
        });
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>🤖 No te he entendido. ¿Quieres registrar esta venta?</p>
            <div className="flex gap-2">
              <BotonAccion
                paso="confirmacion"
                pasoActual={ctx.flow()?.step}
                onClick={() => {
                  document.querySelectorAll(".btn-opciones").forEach((el) => {
                    el.classList.add("pointer-events-none", "opacity-50");
                  });
                  setTimeout(() => ctx.procesarEntradaDirecta?.("sí"), 120);
                }}
              >
                sí
              </BotonAccion>
              <BotonAccion
                paso="confirmacion"
                pasoActual={ctx.flow()?.step}
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
              </BotonAccion>
            </div>
          </div>,
        );
      }
      break;
    }

    default:
      ctx.agregarMensajeBot("❌ Paso no reconocido en el flujo de venta.");
      ctx.setFlow(null);
      ctx.estadoInterno = {};
      break;
  }
}
