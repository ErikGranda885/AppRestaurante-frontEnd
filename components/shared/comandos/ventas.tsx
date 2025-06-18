import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
export type FlowVenta = {
  step:
    | "categoria"
    | "producto"
    | "cantidad"
    | "agregarOtro"
    | "pago"
    | "montoEfectivo"
    | "comprobante"
    | "confirmacion";
  data: {
    categoriaId?: number;
    categoriaNombre?: string;
    productoId?: number;
    productoNombre?: string;
    cantidad?: number;
    metodoPago?: "efectivo" | "transferencia";
    comprobanteNumero?: string;
    precioUnitario?: number;
    totalVenta?: number;
    productos?: {
      productoId: number;
      productoNombre: string;
      cantidad: number;
      precioUnitario: number;
    }[];
  };
};

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
      ctx.agregarMensajeBot("⏳ Consultando ventas de hoy...");

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
            const sinVentasVisual = (
              <div className="space-y-2">
                <p>
                  📅 <strong>Ventas de hoy:</strong>
                </p>
                <p>❌ No se realizaron ventas el día de hoy.</p>
              </div>
            );
            ctx.agregarMensajeBot(sinVentasVisual);

            const u = new SpeechSynthesisUtterance(
              "No se realizaron ventas el día de hoy.",
            );
            u.lang = "es-ES";
            window.speechSynthesis.speak(u);
          } else {
            const ventasVisual = (
              <div className="space-y-2">
                <p>
                  📅 <strong>Ventas de hoy:</strong>
                </p>
                <ul className="list-inside list-disc">
                  <li>
                    Fecha: <strong>{fechaFormateada}</strong>
                  </li>
                  <li>
                    Total vendido: <strong>${totalFormateado}</strong>
                  </li>
                </ul>
              </div>
            );

            ctx.agregarMensajeBot(ventasVisual);

            const u = new SpeechSynthesisUtterance(
              `El total vendido hoy es ${totalFormateado} dólares.`,
            );
            u.lang = "es-ES";
            window.speechSynthesis.speak(u);
          }
        } else {
          ctx.agregarMensajeBot(
            "❌ No se pudo obtener el total de ventas de hoy.",
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al consultar ventas: ${e.message}`);
      }
    },
  },
  {
    nombre: "iniciarVenta",
    patron: /\b(registrar venta|nueva venta|hacer una venta|iniciar venta)\b/i,
    handler: async (_m: any, ctx: any) => {
      ctx.agregarMensajeBot("🚀 Iniciando el proceso de registro de venta...");
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
        ctx.setFlow({ step: "categoria", data: {} });

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

  switch (step) {
    case "categoria": {
      try {
        const res = await fetch(SERVICIOS_PRODUCTOS.categorias);
        const catData = await res.json();
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
            <div className="space-y-2">
              <p>❌ Categoría no válida.</p>
              <p>Opciones válidas:</p>
              <ul className="list-inside list-disc">
                {opciones.map((s: any, i: any) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>,
          );
          ctx.establecerSugerenciasPendientes(opciones);
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
          ctx.setFlow({ step: "categoria", data });
          return;
        }

        const sugerencias = productos.map(
          (p: any) => `${p.id_prod}:${p.nom_prod}`,
        );

        ctx.establecerSugerenciasPendientes(sugerencias);
        ctx.setFlow({ step: "producto", data });

        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>
              🍽️ <strong>Productos disponibles:</strong>
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

        const match = productos.find(
          (p: any) =>
            p.id_prod.toString() === entrada ||
            p.nom_prod.toLowerCase() === entrada,
        );

        if (!match) {
          const sugerencias = productos.map(
            (p: any) => `${p.id_prod}:${p.nom_prod}`,
          );
          ctx.agregarMensajeBot("❌ Producto no encontrado.");
          ctx.establecerSugerenciasPendientes(sugerencias);
          return;
        }

        data.productoId = match.id_prod;
        data.productoNombre = match.nom_prod;
        data.precioUnitario = match.prec_vent_prod;

        ctx.setFlow({ step: "cantidad", data });
        ctx.agregarMensajeBot(
          `🧮 ¿Cuántas unidades de "${match.nom_prod}" deseas vender?`,
        );
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al buscar producto: ${e.message}`);
        ctx.setFlow(null);
      }
      break;
    }

    case "cantidad": {
      const palabrasANumero: Record<string, number> = {
        uno: 1,
        una: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
        seis: 6,
        siete: 7,
        ocho: 8,
        nueve: 9,
        diez: 10,
      };

      let cantidad = parseInt(entrada);
      if (isNaN(cantidad)) {
        const desdePalabra = palabrasANumero[entrada];
        if (desdePalabra !== undefined) {
          cantidad = desdePalabra;
        }
      }

      if (isNaN(cantidad) || cantidad <= 0) {
        ctx.agregarMensajeBot(
          "❌ Cantidad inválida. Ingresa un número mayor a cero.",
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
        precioUnitario: data.precioUnitario!,
      });

      ctx.setFlow({ step: "agregarOtro" as FlowVenta["step"], data });
      ctx.establecerSugerenciasPendientes(["sí", "no"]);
      ctx.agregarMensajeBot(
        "➕ ¿Deseas agregar otro producto a la venta? (sí o no)",
      );
      break;
    }

    case "agregarOtro": {
      if (/^(sí|si)$/i.test(entrada)) {
        try {
          const res = await fetch(SERVICIOS_PRODUCTOS.categorias);
          const catData = await res.json();
          const categorias = catData.categorias;

          if (!Array.isArray(categorias) || categorias.length === 0) {
            ctx.agregarMensajeBot("❌ No hay categorías disponibles.");
            ctx.setFlow(null);
            return;
          }

          const sugerencias = categorias.map(
            (c: any) => `${c.id_cate}:${c.nom_cate}`,
          );

          ctx.establecerSugerenciasPendientes(sugerencias);
          ctx.setFlow({ step: "categoria", data });

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
        }
      } else if (/^(no|n)$/i.test(entrada)) {
        ctx.setFlow({ step: "pago", data });
        ctx.establecerSugerenciasPendientes(["efectivo", "transferencia"]);
        ctx.agregarMensajeBot(
          <div className="space-y-2">
            <p>💰 ¿Cuál es el método de pago?</p>
            <div className="flex gap-2">
  <button className="btn-opciones" onClick={() => ctx.procesarEntradaDirecta?.("efectivo")}>
    efectivo
  </button>
  <button className="btn-opciones" onClick={() => ctx.procesarEntradaDirecta?.("transferencia")}>
    transferencia
  </button>
</div>

          </div>,
        );
      } else {
        ctx.agregarMensajeBot(
          "❓ ¿Quieres agregar otro producto? Responde 'sí' o 'no'.",
        );
      }
      break;
    }

    case "pago": {
      if (entrada !== "efectivo" && entrada !== "transferencia") {
        ctx.agregarMensajeBot(
          "❌ Método no válido. Elige entre 'efectivo' o 'transferencia'.",
        );
        return;
      }

      data.metodoPago = entrada as "efectivo" | "transferencia";

      if (entrada === "transferencia") {
        ctx.setFlow({ step: "comprobante", data });
        ctx.agregarMensajeBot(
          "🔢 Indica el número del comprobante de transferencia.",
        );
      } else {
        // 🧮 Calcular total aquí
        const subtotal =
          data.productos?.reduce(
            (acc, p) => acc + p.precioUnitario * p.cantidad,
            0,
          ) ?? 0;
        const iva = 0.12;
        const ivaTotal = parseFloat((subtotal * iva).toFixed(2));
        const totalFinal = parseFloat((subtotal + ivaTotal).toFixed(2));
        ctx.setFlow({ step: "montoEfectivo", data });
        ctx.agregarMensajeBot(
          `💵 El total de la venta es $${totalFinal.toFixed(2)}.\n¿Con cuánto efectivo pagó el cliente? (ej: 5.00)`,
        );
      }

      break;
    }

    case "montoEfectivo": {
      const monto = parseFloat(entrada.replace(",", "."));
      if (isNaN(monto) || monto <= 0) {
        ctx.agregarMensajeBot("❌ Monto inválido. Ingresa un número válido.");
        return;
      }

      data.totalVenta = monto;
      ctx.setFlow({ step: "confirmacion", data });
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

    case "comprobante": {
      if (!entrada || entrada.length < 3) {
        ctx.agregarMensajeBot(
          "❌ Número de comprobante inválido. Intenta nuevamente.",
        );
        return;
      }

      data.comprobanteNumero = entrada;
      ctx.setFlow({ step: "confirmacion", data });
      ctx.agregarMensajeBot(
        "✅ ¿Confirmas registrar esta venta? Di 'sí' o 'cancelar'.",
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
            return;
          }

          // ✅ Mostrar resumen previo a guardar
          if (data.metodoPago === "efectivo") {
            ctx.agregarMensajeBot(
              `💵 Monto recibido: $${montoRecibido?.toFixed(
                2,
              )}\n🪙 Cambio: $${cambio?.toFixed(2)}`,
            );
          }

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

          const fin = Date.now();
          const inicio = ctx.obtenerInicioFlujo?.() ?? fin;
          const duracionMs = fin - inicio;
          const tiempoFormateado = formatearDuracion(duracionMs);

          ctx.agregarMensajeBot(
            `⏱️ Tiempo total del flujo: ${tiempoFormateado}`,
          );
          ctx.setFlow(null);
        } catch (e: any) {
          ctx.agregarMensajeBot(`❌ Error al registrar venta: ${e.message}`);
          ctx.setFlow(null);
        }
      } else if (/^(cancelar|salir|no)$/i.test(entrada)) {
        ctx.agregarMensajeBot("🚫 Venta cancelada.");
        ctx.setFlow(null);
      } else {
        ctx.agregarMensajeBot("❓ ¿Confirmas la venta? Di 'sí' o 'cancelar'.");
      }
      break;
    }

    default:
      ctx.agregarMensajeBot("❌ Paso no reconocido en el flujo de venta.");
      ctx.setFlow(null);
      break;
  }
}
