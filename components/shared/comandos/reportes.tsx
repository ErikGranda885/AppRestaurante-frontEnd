import React from "react";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { FlowReporte } from "../asistente/flujos/flujos";
import { SERVICIOS_REPORTES } from "@/services/reportes.service";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";
import { SERVICIOS_PROVEEDORES } from "@/services/proveedores.service";
import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";

function getRangoCompletoISOHoy() {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const hasta = new Date();
  hasta.setHours(23, 59, 59, 999);
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
  };
}

const subreportesPorModulo: Record<string, string[]> = {
  ventas: ["reporte de ventas"],
  productos: ["inventario de insumos", "inventario de productos"],
  compras: ["reporte de compras", "proveedores registrados"],
  gastos: ["reporte de gastos"],
  cierres: ["reporte de cierres diarios"],
};

// ---------- NUEVO: Mapa generador de endpoints ----------
const generadoresPorModulo: Record<
  string,
  Record<
    string,
    (formato: "excel" | "pdf", desde: string, hasta: string) => string
  >
> = {
  productos: {
    "inventario de insumos": (formato, desde, hasta) =>
      formato === "excel"
        ? SERVICIOS_PRODUCTOS.exportarReporteInsumos(desde, hasta)
        : SERVICIOS_PRODUCTOS.exportarReporteInsumosPDF(desde, hasta),
    "inventario de productos": (formato, desde, hasta) =>
      formato === "excel"
        ? SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformados(desde, hasta)
        : SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformadosPDF(
            desde,
            hasta,
          ),
  },
  ventas: {
    "reporte de ventas": (formato, desde, hasta) =>
      formato === "excel"
        ? SERVICIOS_REPORTES.ventasPorPeriodoExcel("diario", desde, hasta)
        : SERVICIOS_REPORTES.ventasPorPeriodoPDF("diario", desde, hasta),
    // Puedes agregar "cierres diarios" aquí si tienes endpoint
  },
  compras: {
    "reporte de compras": (formato) =>
      formato === "excel"
        ? SERVICIOS_COMPRAS.exportarComprasExcel
        : SERVICIOS_COMPRAS.exportarComprasPDF,
    "proveedores registrados": (formato) =>
      formato === "excel"
        ? SERVICIOS_PROVEEDORES.exportarProveedoresExcel
        : SERVICIOS_PROVEEDORES.exportarProveedoresPDF,
  },
  gastos: {
    "reporte de gastos": (formato) =>
      formato === "excel"
        ? SERVICIOS_GASTOS.exportarGastosExcel
        : SERVICIOS_GASTOS.exportarGastosPDF,
  },
  cierres: {
    "reporte de cierres diarios": (formato) =>
      formato === "excel"
        ? SERVICIOS_CIERRES.exportarCierresExcel
        : SERVICIOS_CIERRES.exportarCierresPDF,
  },
};

export async function handleFlowReporte(
  texto: string,
  flow: FlowReporte & { type: "reporte" },
  ctx: any,
) {
  const t = texto.toLowerCase();
  const normalizar = (txt: string) =>
    txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // ---- Paso: MÓDULO ----
  if (flow.step === "modulo") {
    const modulos = ["ventas", "productos", "compras", "gastos", "cierres"];
    const mod = modulos.find((m) => t.includes(m));
    if (!mod) {
      document.querySelectorAll("li.cursor-pointer").forEach((el) => {
        el.classList.add("pointer-events-none", "opacity-50");
      });

      ctx.agregarMensajeBot(
        <div>
          <p>🤖 No te he entendido. Elige uno de los módulos disponibles:</p>
          <ul className="list-inside list-disc pl-2">
            {modulos.map((m, i) => (
              <li
                key={i}
                className="cursor-pointer hover:underline"
                onClick={() => {
                  document
                    .querySelectorAll("li.cursor-pointer")
                    .forEach((el) => {
                      el.classList.add("pointer-events-none", "opacity-50");
                    });
                  setTimeout(() => ctx.procesarEntradaDirecta?.(m), 120);
                }}
                tabIndex={0}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </li>
            ))}
          </ul>
        </div>,
      );
      return;
    }

    flow.data.modulo = mod as FlowReporte["data"]["modulo"];
    flow.data.inicioFlujo = Date.now();

    const opciones = subreportesPorModulo[mod];
    ctx.setFlow({ ...flow, step: "subreporte", type: "reporte" });
    ctx.agregarMensajeBot(
      <div>
        <p>
          📂 ¿Qué tipo de reporte de <strong>{mod}</strong> deseas?
        </p>
        <ul className="list-inside list-disc pl-2">
          {opciones.map((s, i) => (
            <li
              key={i}
              className="cursor-pointer hover:underline"
              onClick={() => {
                document.querySelectorAll("li.cursor-pointer").forEach((el) => {
                  el.classList.add("pointer-events-none", "opacity-50");
                });
                setTimeout(() => ctx.procesarEntradaDirecta?.(s), 120);
              }}
              tabIndex={0}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </li>
          ))}
        </ul>
      </div>,
    );
    return;
  }

  // ---- Paso: SUBREPORTE ----
  if (flow.step === "subreporte") {
    const posibles = subreportesPorModulo[flow.data.modulo!];
    const match = posibles.find((s) => normalizar(s) === normalizar(t));
    if (!match) {
      document.querySelectorAll("li.cursor-pointer").forEach((el) => {
        el.classList.add("pointer-events-none", "opacity-50");
      });

      ctx.agregarMensajeBot(
        <div>
          <p>
            🤖 No te he entendido. Elige uno de los siguientes reportes
            disponibles:{" "}
          </p>
          <ul className="list-inside list-disc pl-2">
            {posibles.map((s, i) => (
              <li
                key={i}
                className="cursor-pointer hover:underline"
                onClick={() => {
                  document
                    .querySelectorAll("li.cursor-pointer")
                    .forEach((el) => {
                      el.classList.add("pointer-events-none", "opacity-50");
                    });
                  setTimeout(() => ctx.procesarEntradaDirecta?.(s), 120);
                }}
                tabIndex={0}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </li>
            ))}
          </ul>
        </div>,
      );
      return;
    }
    flow.data.subreporte = match;
    ctx.setFlow({ ...flow, step: "formato", type: "reporte" });
    ctx.agregarMensajeBot(
      <div>
        <p>📄 ¿En qué formato deseas el reporte?</p>
        <ul className="list-inside list-disc pl-2">
          {["Excel", "PDF"].map((formato, i) => (
            <li
              key={i}
              className="cursor-pointer hover:underline"
              onClick={() => {
                document.querySelectorAll("li.cursor-pointer").forEach((el) => {
                  el.classList.add("pointer-events-none", "opacity-50");
                });
                setTimeout(
                  () => ctx.procesarEntradaDirecta?.(formato.toLowerCase()),
                  120,
                );
              }}
              tabIndex={0}
            >
              {formato}
            </li>
          ))}
        </ul>
      </div>,
    );
    return;
  }

  // ---- Paso: FORMATO ----
  if (flow.step === "formato") {
    if (t.includes("excel")) flow.data.formato = "excel";
    else if (t.includes("pdf")) flow.data.formato = "pdf";
    else {
      document.querySelectorAll("li.cursor-pointer").forEach((el) => {
        el.classList.add("pointer-events-none", "opacity-50");
      });

      ctx.agregarMensajeBot(
        <div>
          <p>🤖 No te he entendido. Elige uno de los formatos disponibles: </p>
          <ul className="list-inside list-disc pl-2">
            {["Excel", "PDF"].map((formato, i) => (
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
                    () => ctx.procesarEntradaDirecta?.(formato.toLowerCase()),
                    120,
                  );
                }}
                tabIndex={0}
              >
                {formato}
              </li>
            ))}
          </ul>
        </div>,
      );
      return;
    }
    ctx.setFlow({ ...flow, step: "confirmacion", type: "reporte" });
    return await generarReporte(flow.data, ctx);
  }
}

// ---- Cambiada la lógica aquí ----
async function generarReporte(
  data: {
    modulo?: string;
    subreporte?: string;
    formato?: "excel" | "pdf";
    inicioFlujo?: number;
  },
  ctx: any,
) {
  try {
    const { modulo, subreporte, formato, inicioFlujo } = data;
    let url = "";
    const subreporteNorm = subreporte
      ? subreporte
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";

    let desde = new Date().toISOString().split("T")[0];
    let hasta = desde;

    // SOLO para reporte de ventas, usa rango ISO con hora
    if (modulo === "ventas" && subreporteNorm === "reporte de ventas") {
      const rango = getRangoCompletoISOHoy();
      desde = rango.desde;
      hasta = rango.hasta;
    }

    // Si existe generador
    if (
      generadoresPorModulo[modulo || ""] &&
      generadoresPorModulo[modulo || ""][subreporteNorm]
    ) {
      url = generadoresPorModulo[modulo || ""][subreporteNorm](
        formato!,
        desde,
        hasta,
      );
    } else {
      ctx.agregarMensajeBot(
        "🔧 Este tipo de reporte aún no está implementado.",
      );
      ctx.setFlow(null);
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      const mensaje = errorData?.message || "Error al generar el archivo.";
      ctx.agregarMensajeBot(`❌ ${mensaje}`);
      ctx.setFlow(null);
      return;
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${modulo}_${desde}.${formato === "excel" ? "xlsx" : "pdf"}`;
    link.click();

    const duracion = inicioFlujo
      ? Math.floor((Date.now() - inicioFlujo) / 1000)
      : null;

    // Un solo mensaje, visual + lectura, incluyendo el subreporte y la duración
    ctx.agregarMensajeBot(
      <div>
        <p>
          📥 Documento de <strong>{subreporte}</strong> generado exitosamente.
        </p>
        {duracion !== null && (
          <p className="text-xs text-muted-foreground">
            ⏱️ Tiempo total: {duracion} segundos
          </p>
        )}
      </div>,
      true,
    );

    ctx.setFlow(null);
  } catch (e: any) {
    ctx.agregarMensajeBot(`❌ Error al generar el reporte: ${e.message}`);
    ctx.setFlow(null);
  }
}

export const comandoGenerarReporte = {
  nombre: "generarReporte",
  patron: /\b(generar|exportar)\s+(reporte|informe)\b/i,
  handler: async (_m: RegExpMatchArray, ctx: any) => {
    ctx.setFlow({
      type: "reporte",
      step: "modulo",
      data: {},
    } satisfies FlowReporte);
    ctx.agregarMensajeBot(
      <div>
        <p>🧾 ¿De qué módulo deseas generar el reporte?</p>
        <ul className="list-inside list-disc pl-2">
          {["Ventas", "Productos", "Compras", "Gastos", "Cierres"].map(
            (m, i) => (
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
                    () => ctx.procesarEntradaDirecta?.(m.toLowerCase()),
                    120,
                  );
                }}
                tabIndex={0}
              >
                {m}
              </li>
            ),
          )}
        </ul>
      </div>,
    );
  },
};
